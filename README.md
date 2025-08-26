# 🚀 OVM Withdrawer Console

**IMPORTANT SECURITY DISCLAIMER**: This application is designed for local use only. Don't use a deployed version. Never share your private keys.

A modern, TypeScript-powered web interface for proving and executing withdrawals from Optimism Legacy (OVM 1.0) to Ethereum mainnet. Originally a CLI tool, now enhanced with a beautiful step-by-step web interface.

## ✨ Features

- 🎨 **Optimism-styled UI** - Clean, modern interface matching the official Optimism console
- 🌙 **Light/Dark Mode** - Toggle between light and dark themes (light mode default)
- 🔍 **Smart Search** - Look up withdrawals by transaction hash or wallet address
- 📊 **Withdrawal Details** - View comprehensive withdrawal information
- 🚀 **One-click Execution** - Execute withdrawals directly from the web interface
- 🔒 **Authentication Options** - Private key authentication (wallet connection coming soon)
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 📋 **Recent Withdrawals** - Browse and select from available withdrawals
- ⚡ **TypeScript** - Full type safety and modern development experience
- 🔥 **Bright Red Execute Button** - Visual feedback when ready to execute (#ff0420)

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Frontend**: Vanilla TypeScript, CSS with custom properties
- **Blockchain**: Ethers.js, Optimism SDK
- **Build**: TypeScript compiler with separate configs
- **Styling**: CSS Grid, Flexbox, smooth animations

## Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd ovm-withdrawer

# Install dependencies
npm install

# Build TypeScript code
npm run build

# Start the server
npm start

# Open your browser to http://localhost:3000
```

## Usage Guide

### 1. **Find Your Withdrawal**

- **By Transaction Hash**: Enter the specific transaction hash (e.g., `0x123...`)
- **By Wallet Address**: Enter any wallet address to find all withdrawals from/to that address
- Click "Search" to fetch withdrawal details
- If multiple withdrawals are found for an address, select from the results list
- Or browse and select from the "Recent Withdrawals" list

### 2. **Configure Authentication**

- **Option A (Recommended)**: Click "Use Private Key" to authenticate directly
- **Option B (Coming Soon)**: Wallet connection with MetaMask integration
- Set L1 RPC URL (Ethereum mainnet)
- Set L2 RPC URL (Optimism mainnet)

### 3. **Execute Withdrawal**

- Click "Execute Withdrawal" to prove and relay
- The button turns bright red (#ff0420) when all requirements are met
- Monitor the status messages for progress updates

## 🔧 Development

### Build Commands

```bash
# Build both backend and frontend
npm run build

# Build only backend
npm run build:backend

# Build only frontend
npm run build:frontend

# Watch mode for development
npm run watch
```

### Project Structure

```
ovm-withdrawer/
├── src/
│   ├── server.ts           # Express backend
│   ├── types.ts           # Shared type definitions
│   └── frontend/
│       ├── script.ts      # Frontend TypeScript
│       └── types.ts       # Frontend type definitions
├── public/
│   ├── index.html         # Main HTML file
│   ├── style.css          # Styling
│   └── dist/              # Compiled frontend JS
├── dist/                  # Compiled backend JS
├── data/                  # Withdrawal data
└── index.js               # Original CLI tool
```

## ⚠️ Security Warning

**❌ NEVER:**

- Deploy this application to a public server
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

## TypeScript Benefits

- **Type Safety**: Catch errors at compile time
- **Better IDE Support**: Enhanced autocomplete and refactoring
- **Maintainability**: Self-documenting code with interfaces
- **Modern Features**: Latest JavaScript features with compatibility
- **Debugging**: Better error messages and debugging experience

## Attribution

This project is based on the original [OVM Withdrawer](https://github.com/smartcontracts/ovm-withdrawer/tree/main) CLI tool, enhanced with a modern TypeScript web interface.

## License

MIT
