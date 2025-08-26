# OVM Withdrawer Console

> ⚠️ **SECURITY WARNING**: This tool is for local development use only. Never deploy publicly or share private keys.

A web-based frontend for executing OVM1 (Optimism Legacy) withdrawals to Ethereum mainnet, styled to match the [Optimism Console](https://console.optimism.io/).

## Features

- 🎨 **Optimism-styled UI** - Clean, modern interface matching the official Optimism console
- 🌙 **Light/Dark Mode** - Toggle between light and dark themes (light mode default)
- 🔍 **Smart Search** - Look up withdrawals by transaction hash or wallet address
- 📊 **Withdrawal Details** - View comprehensive withdrawal information
- 🚀 **One-click Execution** - Execute withdrawals directly from the web interface
- 🔒 **Authentication Options** - Private key authentication (wallet connection coming soon)
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 📋 **Recent Withdrawals** - Browse and select from available withdrawals

## Quick Start

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start the Server**

   ```bash
   npm run dev
   # or
   npm start
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

## Usage

### Web Interface

1. **Search for a Withdrawal**

   - **By Transaction Hash**: Enter the specific transaction hash (e.g., `0x123...`)
   - **By Wallet Address**: Enter any wallet address to find all withdrawals from/to that address
   - Click "Search" to fetch withdrawal details
   - If multiple withdrawals are found for an address, select from the results list
   - Or browse and select from the "Recent Withdrawals" list

2. **Configure Authentication**

   - **Option A (Recommended)**: Click "Use Private Key" to authenticate directly
   - **Option B (Coming Soon)**: Wallet connection with MetaMask integration
   - Set L1 RPC URL (Ethereum mainnet)
   - Set L2 RPC URL (Optimism mainnet)

3. **Execute Withdrawal**
   - Click "Execute Withdrawal" to prove and relay
   - Monitor the status messages for progress
   - Transaction hash will be displayed upon success

### Command Line Interface

The original CLI is still available:

```bash
node index.js exec --hash <hash> --pk <private-key> --l1-rpc <url> --l2-rpc <url>
```

## API Endpoints

- `GET /api/withdrawals` - List recent withdrawals (limited to 100)
- `GET /api/withdrawal/:hash` - Get specific withdrawal details by hash
- `GET /api/search/:query` - Search withdrawals by hash or wallet address
- `POST /api/execute-withdrawal` - Execute a withdrawal

## Architecture

- **Frontend**: Vanilla HTML/CSS/JavaScript with Optimism-inspired design
- **Backend**: Express.js server with CORS support
- **Data**: Pre-parsed withdrawal data from `data/withdrawals_parsed.json`
- **Blockchain**: Ethers.js and Optimism SDK for withdrawal execution

## ⚠️ IMPORTANT SECURITY DISCLAIMER

**🔒 LOCAL USE ONLY**: This application is designed for local development and personal use only.

**❌ DO NOT:**

- Use a deployed version of this application
- Share your private keys with anyone
- Use this application on shared or public computers
- Enter private keys on untrusted systems

**✅ RECOMMENDED:**

- Private key authentication is currently the only available option (wallet connection coming soon)
- Run this application only on your personal, secure computer
- Always verify transaction details before signing

## Security Notes

- **Private Key Authentication**: Keys are handled client-side only and never stored or transmitted
- **Wallet Connection (Coming Soon)**: Will use MetaMask or other Web3 wallets for secure signing
- Private keys are cleared from memory after use
- HTTPS recommended for production use
- RPC URLs should use authenticated endpoints for production
- Always verify transaction details before signing

## Development

The project uses ES modules and requires Node.js v14+.

### Project Structure

```
ovm-withdrawer/
├── public/           # Frontend static files
│   ├── index.html   # Main web interface
│   ├── style.css    # Optimism-styled CSS
│   └── script.js    # Frontend JavaScript
├── data/            # Withdrawal data
├── server.js        # Express server
├── index.js         # Original CLI tool
└── package.json     # Dependencies
```

### Styling

The UI closely follows Optimism's design language:

- **Light/Dark themes** with automatic preference saving
- Light mode: Clean white backgrounds with subtle shadows
- Dark mode: Deep blacks with red accent colors (#ff0420)
- Inter font family
- Modern card-based layout
- Responsive grid system
- Smooth animations and transitions
- CSS custom properties for seamless theme switching

## RPC Configuration

For production use, replace the default RPC URLs with your own:

**Ethereum Mainnet:**

- Alchemy: `https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY`
- Infura: `https://mainnet.infura.io/v3/YOUR-PROJECT-ID`

**Optimism Mainnet:**

- Alchemy: `https://opt-mainnet.g.alchemy.com/v2/YOUR-API-KEY`
- Infura: `https://optimism-mainnet.infura.io/v3/YOUR-PROJECT-ID`

## Attribution

This project is based on the original [OVM Withdrawer](https://github.com/smartcontracts/ovm-withdrawer) by SmartContracts. This web interface extends the original command-line tool with a user-friendly frontend while maintaining the core withdrawal execution functionality.

## License

MIT License - see LICENSE file for details.
