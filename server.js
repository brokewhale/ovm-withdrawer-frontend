import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ethers } from 'ethers';
import { CrossChainMessenger, MessageDirection } from '@eth-optimism/sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load withdrawal data
let withdrawals = {};
try {
  const withdrawalsRaw = fs.readFileSync(
    './data/withdrawals_parsed.json',
    'utf8'
  );
  withdrawals = JSON.parse(withdrawalsRaw);
} catch (error) {
  console.error('Failed to load withdrawal data:', error.message);
}

// API Routes
app.get('/api/withdrawals', (req, res) => {
  const withdrawalList = Object.entries(withdrawals).map(([hash, data]) => ({
    hash,
    ...data,
  }));
  res.json(withdrawalList.slice(0, 100)); // Limit to first 100 for performance
});

app.get('/api/withdrawal/:hash', (req, res) => {
  const { hash } = req.params;
  const withdrawal = withdrawals[hash];

  if (!withdrawal) {
    return res.status(404).json({ error: 'Withdrawal not found' });
  }

  res.json({ hash, ...withdrawal });
});

app.get('/api/search/:query', (req, res) => {
  const { query } = req.params;
  const searchQuery = query.toLowerCase().trim();

  // First try to find by hash (exact match)
  if (withdrawals[query]) {
    return res.json([{ hash: query, ...withdrawals[query] }]);
  }

  // Then search by address (from, to, sender, target fields)
  const matchingWithdrawals = [];

  for (const [hash, withdrawal] of Object.entries(withdrawals)) {
    // Check if query matches any address field
    const addressFields = [
      withdrawal.from,
      withdrawal.to,
      withdrawal.sender,
      withdrawal.target,
    ].filter(Boolean); // Remove undefined/null values

    const hasMatchingAddress = addressFields.some(
      (address) => address && address.toLowerCase() === searchQuery
    );

    if (hasMatchingAddress) {
      matchingWithdrawals.push({ hash, ...withdrawal });
    }
  }

  if (matchingWithdrawals.length === 0) {
    return res
      .status(404)
      .json({ error: 'No withdrawals found for this address or hash' });
  }

  // Sort by timestamp (newest first)
  matchingWithdrawals.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  res.json(matchingWithdrawals);
});

app.post('/api/execute-withdrawal', async (req, res) => {
  try {
    const { hash, privateKey, walletAddress, authMethod, l1RpcUrl, l2RpcUrl } =
      req.body;

    // Validate required fields
    if (!hash || !l1RpcUrl || !l2RpcUrl) {
      return res.status(400).json({
        error: 'Missing required fields: hash, l1RpcUrl, l2RpcUrl',
      });
    }

    // Validate authentication method
    if (authMethod === 'privateKey' && !privateKey) {
      return res.status(400).json({
        error: 'Private key is required when using privateKey authentication',
      });
    }

    if (authMethod === 'wallet' && !walletAddress) {
      return res.status(400).json({
        error: 'Wallet address is required when using wallet authentication',
      });
    }

    // For now, only support private key authentication
    if (authMethod === 'wallet') {
      return res.status(400).json({
        error:
          'Wallet authentication not yet implemented. Please use private key for now.',
      });
    }

    if (!privateKey) {
      return res.status(400).json({
        error: 'Private key is required',
      });
    }

    // Look up withdrawal by hash
    const withdrawal = withdrawals[hash];
    if (!withdrawal) {
      return res
        .status(404)
        .json({ error: `Withdrawal with hash ${hash} not found` });
    }

    console.log(`Executing withdrawal for hash: ${hash}`);

    const l1Provider = new ethers.providers.StaticJsonRpcProvider(l1RpcUrl);
    const l2Provider = new ethers.providers.StaticJsonRpcProvider(l2RpcUrl);
    const l1Wallet = new ethers.Wallet(privateKey, l1Provider);

    const xdm = new CrossChainMessenger({
      l1SignerOrProvider: l1Wallet,
      l2SignerOrProvider: l2Provider,
      l1ChainId: 1,
      l2ChainId: 10,
      bedrock: true,
    });

    let message;

    // Handle ERC20/ETH transfers
    if (withdrawal.l1Token !== undefined && withdrawal.l2Token !== undefined) {
      let data;
      if (
        withdrawal.l1Token === '0x0000000000000000000000000000000000000000' &&
        withdrawal.l2Token === '0x4200000000000000000000000000000000000006'
      ) {
        // ETH withdrawal
        data = xdm.contracts.l1.L1StandardBridge.interface.encodeFunctionData(
          'finalizeETHWithdrawal',
          [
            withdrawal.from,
            withdrawal.to,
            withdrawal.amount,
            withdrawal.extraData || '0x',
          ]
        );
      } else {
        // ERC20 withdrawal
        data = xdm.contracts.l1.L1StandardBridge.interface.encodeFunctionData(
          'finalizeERC20Withdrawal',
          [
            withdrawal.l1Token,
            withdrawal.l2Token,
            withdrawal.from,
            withdrawal.to,
            withdrawal.amount,
            withdrawal.extraData || '0x',
          ]
        );
      }

      message = {
        direction: MessageDirection.L2_TO_L1,
        logIndex: 0,
        blockNumber: 0,
        transactionHash: ethers.constants.HashZero,
        sender: xdm.contracts.l2.L2StandardBridge.address,
        target: xdm.contracts.l1.L1StandardBridge.address,
        messageNonce: ethers.BigNumber.from(withdrawal.messageNonce),
        value: ethers.BigNumber.from(0),
        minGasLimit: ethers.BigNumber.from(0),
        message: data,
      };
    } else {
      // Handle other message types using target/sender/message/messageNonce
      message = {
        direction: MessageDirection.L2_TO_L1,
        logIndex: 0,
        blockNumber: 0,
        transactionHash: ethers.constants.HashZero,
        sender: withdrawal.sender,
        target: withdrawal.target,
        messageNonce: ethers.BigNumber.from(withdrawal.messageNonce),
        value: ethers.BigNumber.from(0),
        minGasLimit: ethers.BigNumber.from(0),
        message: withdrawal.message,
      };
    }

    console.log('Proving withdrawal...');
    const receipt = await xdm.proveMessage(message);
    console.log('Transaction hash:', receipt.transactionHash);

    await receipt.wait();
    console.log('Withdrawal proven successfully');

    res.json({
      success: true,
      transactionHash: receipt.transactionHash,
      message: 'Withdrawal proven successfully',
    });
  } catch (error) {
    console.error('Error executing withdrawal:', error);
    res.status(500).json({
      error: 'Failed to execute withdrawal',
      details: error.message,
    });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 OVM Withdrawer server running on http://localhost:${PORT}`);
  console.log(`📊 Loaded ${Object.keys(withdrawals).length} withdrawals`);
});
