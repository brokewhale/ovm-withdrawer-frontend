// Enhanced OVM Withdrawer Console
// Modern, step-by-step user interface - TypeScript Edition

// Type definitions inlined to avoid module system
interface Withdrawal {
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

interface ExecuteWithdrawalRequest {
  hash: string;
  l1RpcUrl: string;
  l2RpcUrl: string;
  privateKey?: string;
  walletAddress?: string;
  authMethod: 'privateKey' | 'wallet';
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface AppState {
  theme: 'light' | 'dark';
  isWalletConnected: boolean;
  selectedWithdrawal: Withdrawal | null;
  authMethod: 'privateKey' | 'wallet' | null;
  currentStep: number;
  maxStep: number;
}

interface DOMElements {
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

type StatusType = 'success' | 'error' | 'info' | 'warning';

// Global State Management
const appState: AppState = {
  currentStep: 1,
  maxStep: 1,
  selectedWithdrawal: null,
  isWalletConnected: false,
  authMethod: null, // 'wallet' or 'privateKey'
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
};

// DOM Elements
const elements: DOMElements = {
  // Navigation
  themeToggle: document.getElementById('themeToggle') as HTMLButtonElement,
  themeIcon: document.getElementById('themeIcon') as HTMLSpanElement,
  totalWithdrawals: document.getElementById(
    'totalWithdrawals'
  ) as HTMLSpanElement,

  // Steps
  step1: document.getElementById('step1') as HTMLDivElement,
  step2: document.getElementById('step2') as HTMLDivElement,
  step3: document.getElementById('step3') as HTMLDivElement,
  step4: document.getElementById('step4') as HTMLDivElement,
  step5: document.getElementById('step5') as HTMLDivElement,

  // Search
  transactionHash: document.getElementById(
    'transactionHash'
  ) as HTMLInputElement,
  searchBtn: document.getElementById('searchBtn') as HTMLButtonElement,
  searchResults: document.getElementById('searchResults') as HTMLDivElement,
  searchResultsList: document.getElementById(
    'searchResultsList'
  ) as HTMLDivElement,
  recentWithdrawals: document.getElementById(
    'recentWithdrawals'
  ) as HTMLDivElement,
  withdrawalsList: document.getElementById('withdrawalsList') as HTMLDivElement,

  // Auth
  connectWalletBtn: document.getElementById(
    'connectWalletBtn'
  ) as HTMLButtonElement,
  walletBtnText: document.getElementById('walletBtnText') as HTMLSpanElement,
  walletStatus: document.getElementById('walletStatus') as HTMLDivElement,
  walletAddress: document.getElementById('walletAddress') as HTMLSpanElement,
  disconnectWalletBtn: document.getElementById(
    'disconnectWalletBtn'
  ) as HTMLButtonElement,
  togglePrivateKey: document.getElementById(
    'togglePrivateKey'
  ) as HTMLButtonElement,
  privateKeyInput: document.getElementById('privateKeyInput') as HTMLDivElement,
  privateKey: document.getElementById('privateKey') as HTMLInputElement,
  hidePrivateKey: document.getElementById(
    'hidePrivateKey'
  ) as HTMLButtonElement,

  // RPC
  l1RpcUrl: document.getElementById('l1RpcUrl') as HTMLInputElement,
  l2RpcUrl: document.getElementById('l2RpcUrl') as HTMLInputElement,

  // Withdrawal details
  withdrawalDetails: document.getElementById(
    'withdrawalDetails'
  ) as HTMLDivElement,
  detailFrom: document.getElementById('detailFrom') as HTMLSpanElement,
  detailTo: document.getElementById('detailTo') as HTMLSpanElement,
  detailAmount: document.getElementById('detailAmount') as HTMLSpanElement,
  detailTokenType: document.getElementById(
    'detailTokenType'
  ) as HTMLSpanElement,
  detailNonce: document.getElementById('detailNonce') as HTMLSpanElement,
  detailTimestamp: document.getElementById(
    'detailTimestamp'
  ) as HTMLSpanElement,

  // Execute
  withdrawalForm: document.getElementById('withdrawalForm') as HTMLFormElement,
  executeBtn: document.getElementById('executeBtn') as HTMLButtonElement,
  statusMessages: document.getElementById('statusMessages') as HTMLDivElement,
} as const;

// Theme Management
function initializeTheme(): void {
  applyTheme(appState.theme);
}

function applyTheme(theme: 'light' | 'dark'): void {
  document.documentElement.setAttribute('data-theme', theme);
  if (elements.themeIcon) {
    elements.themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
  }
  appState.theme = theme;
}

function toggleTheme(): void {
  const newTheme: 'light' | 'dark' =
    appState.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
}

// Step Management
function activateStep(stepNumber: number): void {
  // Update all steps
  for (let i = 1; i <= 5; i++) {
    const step = elements[`step${i}` as keyof DOMElements] as HTMLDivElement;
    if (step) {
      step.classList.remove('active');
      if (i < stepNumber) {
        step.classList.add('completed');
      } else {
        step.classList.remove('completed');
      }
    }
  }

  // Activate current step
  const currentStep = elements[
    `step${stepNumber}` as keyof DOMElements
  ] as HTMLDivElement;
  if (currentStep) {
    currentStep.classList.add('active');
    currentStep.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  appState.currentStep = stepNumber;
  appState.maxStep = Math.max(appState.maxStep, stepNumber);
  updateExecuteButton();
}

function completeStep(stepNumber: number): void {
  const step = elements[
    `step${stepNumber}` as keyof DOMElements
  ] as HTMLDivElement;
  if (step) {
    step.classList.add('completed');
    step.classList.remove('active');
  }

  // Auto-advance to next step
  if (stepNumber < 5) {
    setTimeout(() => {
      activateStep(stepNumber + 1);
    }, 500);
  }
}

// Status Management
function showStatus(
  message: string,
  type: StatusType = 'info',
  duration: number = 5000
): HTMLDivElement {
  const statusEl = document.createElement('div');
  statusEl.className = `status-message status-${type} fade-in`;

  const icons: Record<StatusType, string> = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  statusEl.innerHTML = `
    <span class="status-icon">${icons[type]}</span>
    <span class="status-text">${message}</span>
  `;

  elements.statusMessages?.appendChild(statusEl);

  if (duration > 0) {
    setTimeout(() => {
      statusEl.style.opacity = '0';
      setTimeout(() => {
        if (statusEl.parentNode) {
          statusEl.parentNode.removeChild(statusEl);
        }
      }, 300);
    }, duration);
  }

  return statusEl;
}

function clearStatus(): void {
  if (elements.statusMessages) {
    elements.statusMessages.innerHTML = '';
  }
}

// Wallet Management
async function connectWallet(): Promise<string | null> {
  // Wallet authentication is not implemented yet
  showStatus(
    'Wallet authentication is coming soon! Please use private key for now.',
    'info'
  );
  return null;
}

function disconnectWallet(): void {
  appState.isWalletConnected = false;
  appState.authMethod = null;

  updateWalletUI();
  showStatus('Wallet disconnected', 'info');

  activateStep(3);
}

function updateWalletUI(address: string | null = null): void {
  if (
    appState.isWalletConnected &&
    address &&
    elements.walletBtnText &&
    elements.walletStatus &&
    elements.walletAddress &&
    elements.disconnectWalletBtn
  ) {
    elements.walletBtnText.textContent = 'Connected';
    elements.walletStatus.classList.remove('hidden');
    elements.walletAddress.textContent = formatAddress(address);
    elements.disconnectWalletBtn.classList.remove('hidden');
  } else if (
    elements.walletBtnText &&
    elements.walletStatus &&
    elements.disconnectWalletBtn
  ) {
    elements.walletBtnText.textContent = 'Connect MetaMask';
    elements.walletStatus.classList.add('hidden');
    elements.disconnectWalletBtn.classList.add('hidden');
  }

  updateExecuteButton();
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Private Key Management
function togglePrivateKeyInput(): void {
  if (elements.privateKeyInput && elements.togglePrivateKey) {
    elements.privateKeyInput.classList.remove('hidden');
    elements.togglePrivateKey.style.display = 'none';
    appState.authMethod = 'privateKey';
    updateExecuteButton();
  }
}

function hidePrivateKeyInput(): void {
  if (
    elements.privateKeyInput &&
    elements.togglePrivateKey &&
    elements.privateKey
  ) {
    elements.privateKeyInput.classList.add('hidden');
    elements.togglePrivateKey.style.display = 'block';
    elements.privateKey.value = '';
    appState.authMethod = null;
    updateExecuteButton();
    activateStep(3);
  }
}

function handlePrivateKeyInput(): void {
  if (elements.privateKey) {
    const hasKey = elements.privateKey.value.trim().length > 0;
    if (hasKey && appState.authMethod === 'privateKey') {
      completeStep(3);
    }
    updateExecuteButton();
  }
}

// API Functions
async function fetchWithdrawals(): Promise<Withdrawal[]> {
  try {
    const response = await fetch('/api/withdrawals');
    if (!response.ok) throw new Error('Failed to fetch withdrawals');
    return await response.json();
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    throw error;
  }
}

async function searchWithdrawal(query: string): Promise<Withdrawal[]> {
  try {
    const response = await fetch(`/api/search/${encodeURIComponent(query)}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Search failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching withdrawal:', error);
    throw error;
  }
}

async function executeWithdrawal(
  data: ExecuteWithdrawalRequest
): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/execute-withdrawal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Execution failed');
    }

    return result;
  } catch (error) {
    console.error('Error executing withdrawal:', error);
    throw error;
  }
}

// Search Handler
async function handleSearch(): Promise<void> {
  if (!elements.transactionHash || !elements.searchBtn) return;

  const query = elements.transactionHash.value.trim();
  if (!query) {
    // If search is cleared, go back to recent withdrawals
    clearSearch();
    return;
  }

  try {
    showStatus('Searching...', 'info', 0);
    elements.searchBtn.disabled = true;

    const results = await searchWithdrawal(query);
    clearStatus();

    if (Array.isArray(results) && results.length > 1) {
      displaySearchResults(results);
    } else {
      const withdrawal = Array.isArray(results) ? results[0] : results;
      // For single result, still show search results container to maintain context
      displaySearchResults([withdrawal]);
    }

    completeStep(1);
  } catch (error) {
    clearStatus();
    showStatus(`Search failed: ${(error as Error).message}`, 'error');
  } finally {
    elements.searchBtn.disabled = false;
  }
}

// Clear search and show recent withdrawals
function clearSearch(): void {
  if (
    elements.transactionHash &&
    elements.searchResults &&
    elements.recentWithdrawals &&
    elements.withdrawalDetails
  ) {
    elements.transactionHash.value = '';
    elements.searchResults.style.display = 'none';
    elements.recentWithdrawals.style.display = 'block';

    // Clear selected withdrawal when clearing search
    appState.selectedWithdrawal = null;
    elements.withdrawalDetails.style.display = 'none';

    // Reset to step 1 if we're still on step 2 and have no selected withdrawal
    if (appState.currentStep === 2 && !appState.selectedWithdrawal) {
      activateStep(1);
    }

    showStatus('Search cleared', 'info', 2000);
  }
}

// Results Display
function displaySearchResults(results: Withdrawal[]): void {
  if (
    !elements.searchResultsList ||
    !elements.searchResults ||
    !elements.recentWithdrawals
  )
    return;

  elements.searchResultsList.innerHTML = '';

  // Create search results header
  const resultsHeader = document.createElement('div');
  resultsHeader.className = 'search-results-header';

  // Create search count with icon
  const resultCount = document.createElement('div');
  resultCount.className = 'search-results-count';
  resultCount.textContent = `Found ${results.length} withdrawal${
    results.length === 1 ? '' : 's'
  }`;

  // Create actions container
  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'search-results-actions';

  // Create beautiful clear search button
  const clearButton = document.createElement('button');
  clearButton.className = 'btn-clear-search';
  clearButton.textContent = 'Clear Search';
  clearButton.addEventListener('click', clearSearch);

  // Assemble header
  actionsContainer.appendChild(clearButton);
  resultsHeader.appendChild(resultCount);
  resultsHeader.appendChild(actionsContainer);
  elements.searchResultsList?.appendChild(resultsHeader);

  // Add withdrawal items
  results.forEach((withdrawal) => {
    const item = createWithdrawalItem(withdrawal);
    elements.searchResultsList?.appendChild(item);
  });

  elements.searchResults.style.display = 'block';
  elements.searchResults.classList.add('fade-in');
  elements.recentWithdrawals.style.display = 'none';
}

function createWithdrawalItem(withdrawal: Withdrawal): HTMLDivElement {
  const item = document.createElement('div');
  item.className = 'withdrawal-item';
  item.addEventListener('click', () => selectWithdrawal(withdrawal));

  const withdrawalWithTokens = withdrawal as any;
  const tokenType =
    withdrawalWithTokens.l1Token &&
    withdrawalWithTokens.l1Token !==
      '0x0000000000000000000000000000000000000000'
      ? 'ERC20'
      : 'ETH';

  const amount = withdrawal.amount
    ? `${parseFloat(withdrawal.amount).toFixed(6)} ${tokenType}`
    : 'Unknown amount';

  item.innerHTML = `
    <div class="withdrawal-info">
      <div class="withdrawal-hash">${withdrawal.hash}</div>
      <div class="withdrawal-meta">
        <span>From: ${formatAddress(
          withdrawal.from || withdrawal.sender || 'Unknown'
        )}</span>
        <span>To: ${formatAddress(
          withdrawal.to || withdrawal.target || 'Unknown'
        )}</span>
        <span>${new Date(withdrawal.timestamp).toLocaleDateString()}</span>
      </div>
    </div>
    <div class="withdrawal-amount">${amount}</div>
  `;

  return item;
}

// Withdrawal Selection
function selectWithdrawal(withdrawal: Withdrawal): void {
  appState.selectedWithdrawal = withdrawal;

  displayWithdrawalDetails(withdrawal);

  // Keep search results visible if we have an active search
  // Only show recent withdrawals if no search is active
  if (
    elements.transactionHash &&
    elements.searchResults &&
    elements.recentWithdrawals
  ) {
    const hasActiveSearch = elements.transactionHash.value.trim() !== '';
    if (!hasActiveSearch) {
      elements.searchResults.style.display = 'none';
      elements.recentWithdrawals.style.display = 'block';
    }
  }

  showStatus('Withdrawal selected successfully!', 'success');
  completeStep(2);
}

function displayWithdrawalDetails(withdrawal: Withdrawal): void {
  if (
    !elements.detailFrom ||
    !elements.detailTo ||
    !elements.detailAmount ||
    !elements.detailTokenType ||
    !elements.detailNonce ||
    !elements.detailTimestamp ||
    !elements.withdrawalDetails
  ) {
    return;
  }

  const withdrawalWithTokens = withdrawal as any;
  const tokenType =
    withdrawalWithTokens.l1Token &&
    withdrawalWithTokens.l1Token !==
      '0x0000000000000000000000000000000000000000'
      ? 'ERC20'
      : 'ETH';

  const amount = withdrawal.amount
    ? `${parseFloat(withdrawal.amount).toFixed(6)} ${tokenType}`
    : 'Unknown amount';

  elements.detailFrom.textContent =
    withdrawal.from || withdrawal.sender || 'Unknown';
  elements.detailTo.textContent =
    withdrawal.to || withdrawal.target || 'Unknown';
  elements.detailAmount.textContent = amount;
  elements.detailTokenType.textContent = tokenType;
  elements.detailNonce.textContent = String(
    (withdrawal as any).messageNonce || 'Unknown'
  );
  elements.detailTimestamp.textContent = withdrawal.timestamp
    ? new Date(withdrawal.timestamp).toLocaleString()
    : 'Unknown';

  elements.withdrawalDetails.style.display = 'block';
  elements.withdrawalDetails.classList.add('slide-up');
}

// Execute Button Management
function updateExecuteButton(): void {
  if (
    !elements.executeBtn ||
    !elements.privateKey ||
    !elements.l1RpcUrl ||
    !elements.l2RpcUrl
  ) {
    return;
  }

  const hasWithdrawal = appState.selectedWithdrawal !== null;
  const hasAuth =
    appState.isWalletConnected ||
    (appState.authMethod === 'privateKey' && elements.privateKey.value);
  const hasRpc = elements.l1RpcUrl.value && elements.l2RpcUrl.value;

  const allReady = hasWithdrawal && hasAuth && hasRpc;

  elements.executeBtn.disabled = !allReady;

  // Add/remove ready class for bright red styling
  if (allReady) {
    elements.executeBtn.classList.add('ready');
    const btnText = elements.executeBtn.querySelector(
      '.btn-text'
    ) as HTMLElement;
    if (btnText) {
      btnText.textContent = 'Execute Withdrawal';
    }
  } else {
    elements.executeBtn.classList.remove('ready');
    const btnText = elements.executeBtn.querySelector(
      '.btn-text'
    ) as HTMLElement;
    if (btnText) {
      btnText.textContent = 'Complete Required Fields';
    }
  }
}

// Execute Handler
async function handleExecuteWithdrawal(e: Event): Promise<void> {
  e.preventDefault();

  if (!appState.selectedWithdrawal) {
    showStatus('Please select a withdrawal first', 'warning');
    return;
  }

  if (!elements.executeBtn || !elements.l1RpcUrl || !elements.l2RpcUrl) {
    return;
  }

  const executeBtn = elements.executeBtn;
  const btnContent = executeBtn.querySelector('.btn-content') as HTMLElement;
  const btnLoading = executeBtn.querySelector('.btn-loading') as HTMLElement;

  try {
    executeBtn.disabled = true;
    executeBtn.classList.remove('ready');
    btnContent?.classList.add('hidden');
    btnLoading?.classList.remove('hidden');

    // Clear any previous status messages
    clearStatus();
    showStatus('Executing withdrawal...', 'info', 0);

    const executionData: ExecuteWithdrawalRequest = {
      hash: appState.selectedWithdrawal.hash,
      authMethod: appState.authMethod || 'privateKey',
      l1RpcUrl: elements.l1RpcUrl.value,
      l2RpcUrl: elements.l2RpcUrl.value,
    };

    if (appState.authMethod === 'privateKey' && elements.privateKey) {
      executionData.privateKey = elements.privateKey.value;
    } else if (appState.authMethod === 'wallet' && elements.walletAddress) {
      executionData.walletAddress = elements.walletAddress.textContent || '';
    }

    const result = await executeWithdrawal(executionData);

    clearStatus();

    // Display detailed success information
    if (result.success && result.data) {
      displayExecutionSuccess(result.data);
    } else {
      showStatus('Withdrawal executed successfully! 🎉', 'success', 0);
    }

    completeStep(5);
  } catch (error) {
    clearStatus();
    displayExecutionError(error as Error);
  } finally {
    btnContent?.classList.remove('hidden');
    btnLoading?.classList.add('hidden');
    updateExecuteButton(); // Restore proper button state
  }
}

// Execution Result Display Functions
function displayExecutionSuccess(data: any): void {
  const transactionHash = data.transactionHash || data.hash;
  const message = data.message || 'Withdrawal executed successfully!';

  // Create a detailed success message
  let successMessage = `✅ ${message}`;

  if (transactionHash) {
    successMessage += `<br><br><strong>Transaction Details:</strong><br>`;
    successMessage += `🔗 <strong>Transaction Hash:</strong><br>`;
    successMessage += `<code style="word-break: break-all; font-family: 'JetBrains Mono', monospace; background: rgba(0,0,0,0.1); padding: 4px 8px; border-radius: 4px; font-size: 12px;">${transactionHash}</code><br><br>`;
    successMessage += `📱 <strong>View on Etherscan:</strong><br>`;
    successMessage += `<a href="https://etherscan.io/tx/${transactionHash}" target="_blank" style="color: #10b981; text-decoration: none;">https://etherscan.io/tx/${transactionHash}</a>`;
  }

  if (data.gasUsed) {
    successMessage += `<br><br>⛽ <strong>Gas Used:</strong> ${data.gasUsed.toLocaleString()}`;
  }

  if (data.effectiveGasPrice) {
    successMessage += `<br>💰 <strong>Gas Price:</strong> ${data.effectiveGasPrice} gwei`;
  }

  // Create a persistent status message that doesn't auto-hide
  const statusEl = document.createElement('div');
  statusEl.className = 'status-message status-success execution-result fade-in';
  statusEl.innerHTML = `
    <div class="execution-result-header">
      <span class="status-icon">🎉</span>
      <span class="status-title">Execution Successful</span>
      <button class="status-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
    <div class="status-content">${successMessage}</div>
  `;

  elements.statusMessages?.appendChild(statusEl);

  // Scroll the status message into view
  statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function displayExecutionError(error: Error): void {
  let errorMessage = error.message;
  let errorDetails = '';

  // Try to parse structured error information
  try {
    // Check if error message contains JSON (some API errors do this)
    const jsonMatch = errorMessage.match(/\{.*\}/);
    if (jsonMatch) {
      const errorData = JSON.parse(jsonMatch[0]);
      if (errorData.error) {
        errorMessage = errorData.error;
      }
      if (errorData.details) {
        errorDetails = errorData.details;
      }
    }
  } catch (parseError) {
    // If parsing fails, use the original message
  }

  // Check for common error patterns and provide helpful context
  if (errorMessage.toLowerCase().includes('insufficient funds')) {
    errorDetails =
      'Make sure your wallet has enough ETH to cover gas fees for the transaction.';
  } else if (errorMessage.toLowerCase().includes('nonce')) {
    errorDetails =
      'There might be a transaction nonce issue. Try refreshing the page and trying again.';
  } else if (errorMessage.toLowerCase().includes('gas')) {
    errorDetails =
      'The transaction failed due to gas-related issues. This could be due to network congestion or insufficient gas limit.';
  } else if (
    errorMessage.toLowerCase().includes('network') ||
    errorMessage.toLowerCase().includes('rpc')
  ) {
    errorDetails =
      'Network connectivity issue. Please check your RPC URLs and internet connection.';
  } else if (
    errorMessage.toLowerCase().includes('private key') ||
    errorMessage.toLowerCase().includes('key')
  ) {
    errorDetails =
      'Invalid private key format. Please check that you have entered the correct private key.';
  }

  let fullErrorMessage = `❌ <strong>Execution Failed</strong><br><br>`;
  fullErrorMessage += `🔍 <strong>Error:</strong><br>${errorMessage}`;

  if (errorDetails) {
    fullErrorMessage += `<br><br>💡 <strong>Possible Solution:</strong><br>${errorDetails}`;
  }

  fullErrorMessage += `<br><br>📋 <strong>Troubleshooting:</strong><br>`;
  fullErrorMessage += `• Verify your RPC endpoints are correct and accessible<br>`;
  fullErrorMessage += `• Check that your private key is valid<br>`;
  fullErrorMessage += `• Ensure your wallet has sufficient ETH for gas fees<br>`;
  fullErrorMessage += `• Try again in a few minutes if it's a network issue`;

  // Create a persistent error message that doesn't auto-hide
  const statusEl = document.createElement('div');
  statusEl.className = 'status-message status-error execution-result fade-in';
  statusEl.innerHTML = `
    <div class="execution-result-header">
      <span class="status-icon">⚠️</span>
      <span class="status-title">Execution Failed</span>
      <button class="status-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
    <div class="status-content">${fullErrorMessage}</div>
  `;

  elements.statusMessages?.appendChild(statusEl);

  // Scroll the error message into view
  statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Load Recent Withdrawals
async function loadRecentWithdrawals(): Promise<void> {
  try {
    const withdrawals = await fetchWithdrawals();

    if (elements.totalWithdrawals) {
      elements.totalWithdrawals.textContent =
        withdrawals.length.toLocaleString();
    }

    const recent = withdrawals
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 10);

    if (elements.withdrawalsList) {
      elements.withdrawalsList.innerHTML = '';

      recent.forEach((withdrawal) => {
        const item = createWithdrawalItem(withdrawal);
        elements.withdrawalsList?.appendChild(item);
      });
    }
  } catch (error) {
    console.error('Error loading withdrawals:', error);
    if (elements.withdrawalsList) {
      elements.withdrawalsList.innerHTML =
        '<div class="loading-state">Failed to load withdrawals</div>';
    }
  }
}

// Event Listeners
function setupEventListeners(): void {
  elements.themeToggle?.addEventListener('click', toggleTheme);
  elements.searchBtn?.addEventListener('click', handleSearch);
  elements.transactionHash?.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  });
  elements.transactionHash?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') clearSearch();
  });
  elements.transactionHash?.addEventListener('input', (e: Event) => {
    // If input is cleared, automatically show recent withdrawals
    const target = e.target as HTMLInputElement;
    if (target.value.trim() === '') {
      clearSearch();
    }
  });
  // Wallet functionality disabled for now - coming soon
  // elements.connectWalletBtn?.addEventListener('click', connectWallet);
  // elements.disconnectWalletBtn?.addEventListener('click', disconnectWallet);
  elements.togglePrivateKey?.addEventListener('click', togglePrivateKeyInput);
  elements.hidePrivateKey?.addEventListener('click', hidePrivateKeyInput);
  elements.privateKey?.addEventListener('input', handlePrivateKeyInput);
  elements.l1RpcUrl?.addEventListener('input', updateExecuteButton);
  elements.l2RpcUrl?.addEventListener('input', updateExecuteButton);
  elements.withdrawalForm?.addEventListener('submit', handleExecuteWithdrawal);

  // Wallet event listeners disabled for now - coming soon
  // if (window.ethereum) {
  //   window.ethereum.on('accountsChanged', (accounts) => {
  //     if (accounts.length === 0) {
  //       disconnectWallet();
  //     }
  //   });
  // }
}

// Initialize Application
async function initializeApp(): Promise<void> {
  console.log('🚀 Initializing OVM Withdrawer Console...');

  initializeTheme();
  setupEventListeners();
  await loadRecentWithdrawals();

  // Wallet connection check disabled - coming soon
  // if (window.ethereum && window.ethereum.selectedAddress) {
  //   try {
  //     appState.isWalletConnected = true;
  //     appState.authMethod = 'wallet';
  //     updateWalletUI(window.ethereum.selectedAddress);
  //   } catch (error) {
  //     console.warn('Failed to initialize existing wallet connection:', error);
  //   }
  // }

  activateStep(1);
  console.log('✅ Application initialized successfully!');
}

// Start the application
document.addEventListener('DOMContentLoaded', initializeApp);
