import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';
import { CrossChainMessenger, MessageDirection } from '@eth-optimism/sdk';
import { Withdrawal, ExecuteWithdrawalRequest, ApiResponse } from './types';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Load withdrawal data
let withdrawals: Record<string, Withdrawal> = {};
try {
  const withdrawalsRaw = fs.readFileSync(
    path.join(__dirname, '../data/withdrawals_parsed.json'),
    'utf8'
  );
  withdrawals = JSON.parse(withdrawalsRaw);
} catch (error) {
  console.error('Failed to load withdrawal data:', (error as Error).message);
}

// Helper function to create typed responses
const createResponse = <T>(
  success: boolean,
  data?: T,
  error?: string
): ApiResponse<T> => ({
  success,
  data,
  error,
});

// API Routes
app.get('/api/withdrawals', (req: Request, res: Response) => {
  const withdrawalList = Object.entries(withdrawals).map(([hash, data]) => ({
    ...data,
    hash,
  }));
  res.json(withdrawalList.slice(0, 100)); // Limit to first 100 for performance
});

app.get('/api/withdrawal/:hash', (req: Request, res: Response) => {
  const { hash } = req.params;
  const withdrawal = withdrawals[hash];

  if (!withdrawal) {
    return res
      .status(404)
      .json(createResponse(false, undefined, 'Withdrawal not found'));
  }

  res.json(createResponse(true, { ...withdrawal, hash }));
});

app.get('/api/search/:query', (req: Request, res: Response) => {
  const { query } = req.params;
  const searchQuery = query.toLowerCase().trim();

  // First try to find by hash (exact match)
  if (withdrawals[query]) {
    return res.json([{ ...withdrawals[query], hash: query }]);
  }

  // Then search by address (from, to, sender, target fields)
  const matchingWithdrawals: (Withdrawal & { hash: string })[] = [];

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
      matchingWithdrawals.push({ ...withdrawal, hash });
    }
  }

  if (matchingWithdrawals.length === 0) {
    return res
      .status(404)
      .json(
        createResponse(
          false,
          undefined,
          'No withdrawals found for this address or hash'
        )
      );
  }

  // Sort by timestamp (newest first)
  matchingWithdrawals.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  res.json(matchingWithdrawals);
});

app.post('/api/execute-withdrawal', async (req: Request, res: Response) => {
  try {
    const requestBody: ExecuteWithdrawalRequest = req.body;
    const { hash, privateKey, walletAddress, authMethod, l1RpcUrl, l2RpcUrl } =
      requestBody;

    // Validate required fields
    if (!hash || !l1RpcUrl || !l2RpcUrl) {
      return res
        .status(400)
        .json(
          createResponse(
            false,
            undefined,
            'Missing required fields: hash, l1RpcUrl, l2RpcUrl'
          )
        );
    }

    // Validate authentication method
    if (authMethod === 'privateKey' && !privateKey) {
      return res
        .status(400)
        .json(
          createResponse(
            false,
            undefined,
            'Private key is required when using privateKey authentication'
          )
        );
    }

    if (authMethod === 'wallet' && !walletAddress) {
      return res
        .status(400)
        .json(
          createResponse(
            false,
            undefined,
            'Wallet address is required when using wallet authentication'
          )
        );
    }

    // For now, only support private key authentication
    if (authMethod === 'wallet') {
      return res
        .status(400)
        .json(
          createResponse(
            false,
            undefined,
            'Wallet authentication not yet implemented. Please use private key for now.'
          )
        );
    }

    if (!privateKey) {
      return res
        .status(400)
        .json(createResponse(false, undefined, 'Private key is required'));
    }

    // Look up withdrawal by hash
    const withdrawal = withdrawals[hash];
    if (!withdrawal) {
      return res
        .status(404)
        .json(
          createResponse(
            false,
            undefined,
            `Withdrawal with hash ${hash} not found`
          )
        );
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

    let message: any;

    // Handle ERC20/ETH transfers
    if (
      (withdrawal as any).l1Token !== undefined &&
      (withdrawal as any).l2Token !== undefined
    ) {
      const withdrawalWithTokens = withdrawal as any;
      let data: string;

      if (
        withdrawalWithTokens.l1Token ===
          '0x0000000000000000000000000000000000000000' &&
        withdrawalWithTokens.l2Token ===
          '0x4200000000000000000000000000000000000006'
      ) {
        // ETH withdrawal
        data = xdm.contracts.l1.L1StandardBridge.interface.encodeFunctionData(
          'finalizeETHWithdrawal',
          [
            withdrawalWithTokens.from,
            withdrawalWithTokens.to,
            withdrawalWithTokens.amount,
            withdrawalWithTokens.extraData || '0x',
          ]
        );
      } else {
        // ERC20 withdrawal
        data = xdm.contracts.l1.L1StandardBridge.interface.encodeFunctionData(
          'finalizeERC20Withdrawal',
          [
            withdrawalWithTokens.l1Token,
            withdrawalWithTokens.l2Token,
            withdrawalWithTokens.from,
            withdrawalWithTokens.to,
            withdrawalWithTokens.amount,
            withdrawalWithTokens.extraData || '0x',
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
        messageNonce: ethers.BigNumber.from(
          (withdrawalWithTokens as any).messageNonce
        ),
        value: ethers.BigNumber.from(0),
        minGasLimit: ethers.BigNumber.from(0),
        message: data,
      };
    } else {
      // Handle other message types using target/sender/message/messageNonce
      const withdrawalWithMessage = withdrawal as any;
      message = {
        direction: MessageDirection.L2_TO_L1,
        logIndex: 0,
        blockNumber: 0,
        transactionHash: ethers.constants.HashZero,
        sender: withdrawalWithMessage.sender,
        target: withdrawalWithMessage.target,
        messageNonce: ethers.BigNumber.from(withdrawalWithMessage.messageNonce),
        value: ethers.BigNumber.from(0),
        minGasLimit: ethers.BigNumber.from(0),
        message: withdrawalWithMessage.message,
      };
    }

    console.log('Proving withdrawal...');
    const receipt = await xdm.proveMessage(message);
    console.log('Transaction hash:', receipt.hash);

    await receipt.wait();
    console.log('Withdrawal proven successfully');

    res.json(
      createResponse(true, {
        transactionHash: receipt.hash,
        message: 'Withdrawal proven successfully',
      })
    );
  } catch (error) {
    console.error('Error executing withdrawal:', error);
    res
      .status(500)
      .json(
        createResponse(
          false,
          undefined,
          `Failed to execute withdrawal: ${(error as Error).message}`
        )
      );
  }
});

// Serve the main page
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 OVM Withdrawer server running on http://localhost:${PORT}`);
  console.log(`📊 Loaded ${Object.keys(withdrawals).length} withdrawals`);
});
