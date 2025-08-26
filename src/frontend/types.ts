// Type definitions for OVM Withdrawer - Frontend

export interface Withdrawal {
  hash: string;
  from: string;
  to: string;
  amount: string;
  nonce: number;
  timestamp: number;
  tokenType: string;
  sender?: string;
  target?: string;
}

export interface ExecuteWithdrawalRequest {
  hash: string;
  l1RpcUrl: string;
  l2RpcUrl: string;
  privateKey?: string;
  walletAddress?: string;
  authMethod: 'privateKey' | 'wallet';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AppState {
  theme: 'light' | 'dark';
  isWalletConnected: boolean;
  selectedWithdrawal: Withdrawal | null;
  authMethod: 'privateKey' | 'wallet' | null;
  currentStep: number;
  maxStep: number;
}

export interface DOMElements {
  themeToggle: HTMLButtonElement | null;
  themeIcon: HTMLSpanElement | null;
  statusMessages: HTMLDivElement | null;
  transactionHash: HTMLInputElement | null;
  searchBtn: HTMLButtonElement | null;
  searchResults: HTMLDivElement | null;
  searchResultsList: HTMLDivElement | null;
  recentWithdrawals: HTMLDivElement | null;
  withdrawalsList: HTMLDivElement | null;
  connectWalletBtn: HTMLButtonElement | null;
  disconnectWalletBtn: HTMLButtonElement | null;
  walletBtnText: HTMLSpanElement | null;
  walletStatus: HTMLDivElement | null;
  walletAddress: HTMLSpanElement | null;
  togglePrivateKey: HTMLButtonElement | null;
  hidePrivateKey: HTMLButtonElement | null;
  privateKeyInput: HTMLDivElement | null;
  privateKey: HTMLInputElement | null;
  l1RpcUrl: HTMLInputElement | null;
  l2RpcUrl: HTMLInputElement | null;
  withdrawalDetails: HTMLDivElement | null;
  detailFrom: HTMLSpanElement | null;
  detailTo: HTMLSpanElement | null;
  detailAmount: HTMLSpanElement | null;
  detailTokenType: HTMLSpanElement | null;
  detailNonce: HTMLSpanElement | null;
  detailTimestamp: HTMLSpanElement | null;
  executeBtn: HTMLButtonElement | null;
  withdrawalForm: HTMLFormElement | null;
  totalWithdrawals: HTMLSpanElement | null;
  step1: HTMLDivElement | null;
  step2: HTMLDivElement | null;
  step3: HTMLDivElement | null;
  step4: HTMLDivElement | null;
  step5: HTMLDivElement | null;
}

export type StatusType = 'success' | 'error' | 'info' | 'warning';

export interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  selectedAddress: string | null;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}
