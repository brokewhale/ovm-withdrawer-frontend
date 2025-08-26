// Enhanced OVM Withdrawer Console
// Modern, step-by-step user interface

// Global State Management
const appState = {
  currentStep: 1,
  maxStep: 1,
  selectedWithdrawal: null,
  isWalletConnected: false,
  authMethod: null, // 'wallet' or 'privateKey'
  theme: localStorage.getItem('theme') || 'light',
};

// DOM Elements
const elements = {
  // Navigation
  themeToggle: document.getElementById('themeToggle'),
  themeIcon: document.getElementById('themeIcon'),
  totalWithdrawals: document.getElementById('totalWithdrawals'),

  // Steps
  step1: document.getElementById('step1'),
  step2: document.getElementById('step2'),
  step3: document.getElementById('step3'),
  step4: document.getElementById('step4'),
  step5: document.getElementById('step5'),

  // Search
  transactionHash: document.getElementById('transactionHash'),
  searchBtn: document.getElementById('searchBtn'),
  searchResults: document.getElementById('searchResults'),
  searchResultsList: document.getElementById('searchResultsList'),
  recentWithdrawals: document.getElementById('recentWithdrawals'),
  withdrawalsList: document.getElementById('withdrawalsList'),

  // Auth
  connectWalletBtn: document.getElementById('connectWalletBtn'),
  walletBtnText: document.getElementById('walletBtnText'),
  walletStatus: document.getElementById('walletStatus'),
  walletAddress: document.getElementById('walletAddress'),
  disconnectWalletBtn: document.getElementById('disconnectWalletBtn'),
  togglePrivateKey: document.getElementById('togglePrivateKey'),
  privateKeyInput: document.getElementById('privateKeyInput'),
  privateKey: document.getElementById('privateKey'),
  hidePrivateKey: document.getElementById('hidePrivateKey'),

  // RPC
  l1RpcUrl: document.getElementById('l1RpcUrl'),
  l2RpcUrl: document.getElementById('l2RpcUrl'),

  // Withdrawal details
  withdrawalDetails: document.getElementById('withdrawalDetails'),
  detailFrom: document.getElementById('detailFrom'),
  detailTo: document.getElementById('detailTo'),
  detailAmount: document.getElementById('detailAmount'),
  detailTokenType: document.getElementById('detailTokenType'),
  detailNonce: document.getElementById('detailNonce'),
  detailTimestamp: document.getElementById('detailTimestamp'),

  // Execute
  withdrawalForm: document.getElementById('withdrawalForm'),
  executeBtn: document.getElementById('executeBtn'),
  statusMessages: document.getElementById('statusMessages'),
};

// Theme Management
function initializeTheme() {
  applyTheme(appState.theme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  elements.themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
  appState.theme = theme;
}

function toggleTheme() {
  const newTheme = appState.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
}

// Step Management
function activateStep(stepNumber) {
  // Update all steps
  for (let i = 1; i <= 5; i++) {
    const step = elements[`step${i}`];
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
  const currentStep = elements[`step${stepNumber}`];
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

function completeStep(stepNumber) {
  const step = elements[`step${stepNumber}`];
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
function showStatus(message, type = 'info', duration = 5000) {
  const statusEl = document.createElement('div');
  statusEl.className = `status-message status-${type} fade-in`;

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  };

  statusEl.innerHTML = `
    <span class="status-icon">${icons[type]}</span>
    <span class="status-text">${message}</span>
  `;

  elements.statusMessages.appendChild(statusEl);

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

function clearStatus() {
  elements.statusMessages.innerHTML = '';
}

// Wallet Management
async function connectWallet() {
  // Wallet authentication is not implemented yet
  showStatus(
    'Wallet authentication is coming soon! Please use private key for now.',
    'info'
  );
  return null;
}

function disconnectWallet() {
  appState.isWalletConnected = false;
  appState.authMethod = null;

  updateWalletUI();
  showStatus('Wallet disconnected', 'info');

  activateStep(3);
}

function updateWalletUI(address = null) {
  if (appState.isWalletConnected && address) {
    elements.walletBtnText.textContent = 'Connected';
    elements.walletStatus.classList.remove('hidden');
    elements.walletAddress.textContent = formatAddress(address);
    elements.disconnectWalletBtn.classList.remove('hidden');
  } else {
    elements.walletBtnText.textContent = 'Connect MetaMask';
    elements.walletStatus.classList.add('hidden');
    elements.disconnectWalletBtn.classList.add('hidden');
  }

  updateExecuteButton();
}

function formatAddress(address) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Private Key Management
function togglePrivateKeyInput() {
  elements.privateKeyInput.classList.remove('hidden');
  elements.togglePrivateKey.style.display = 'none';
  appState.authMethod = 'privateKey';
  updateExecuteButton();
}

function hidePrivateKeyInput() {
  elements.privateKeyInput.classList.add('hidden');
  elements.togglePrivateKey.style.display = 'block';
  elements.privateKey.value = '';
  appState.authMethod = null;
  updateExecuteButton();
  activateStep(3);
}

function handlePrivateKeyInput() {
  const hasKey = elements.privateKey.value.trim().length > 0;
  if (hasKey && appState.authMethod === 'privateKey') {
    completeStep(3);
  }
  updateExecuteButton();
}

// API Functions
async function fetchWithdrawals() {
  try {
    const response = await fetch('/api/withdrawals');
    if (!response.ok) throw new Error('Failed to fetch withdrawals');
    return await response.json();
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    throw error;
  }
}

async function searchWithdrawal(query) {
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

async function executeWithdrawal(data) {
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
async function handleSearch() {
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
    showStatus(`Search failed: ${error.message}`, 'error');
  } finally {
    elements.searchBtn.disabled = false;
  }
}

// Clear search and show recent withdrawals
function clearSearch() {
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

// Results Display
function displaySearchResults(results) {
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
  elements.searchResultsList.appendChild(resultsHeader);

  // Add withdrawal items
  results.forEach((withdrawal) => {
    const item = createWithdrawalItem(withdrawal);
    elements.searchResultsList.appendChild(item);
  });

  elements.searchResults.style.display = 'block';
  elements.searchResults.classList.add('fade-in');
  elements.recentWithdrawals.style.display = 'none';
}

function createWithdrawalItem(withdrawal) {
  const item = document.createElement('div');
  item.className = 'withdrawal-item';
  item.addEventListener('click', () => selectWithdrawal(withdrawal));

  const tokenType =
    withdrawal.l1Token &&
    withdrawal.l1Token !== '0x0000000000000000000000000000000000000000'
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
          withdrawal.from || withdrawal.sender
        )}</span>
        <span>To: ${formatAddress(withdrawal.to || withdrawal.target)}</span>
        <span>${new Date(withdrawal.timestamp).toLocaleDateString()}</span>
      </div>
    </div>
    <div class="withdrawal-amount">${amount}</div>
  `;

  return item;
}

// Withdrawal Selection
function selectWithdrawal(withdrawal) {
  appState.selectedWithdrawal = withdrawal;

  displayWithdrawalDetails(withdrawal);

  // Keep search results visible if we have an active search
  // Only show recent withdrawals if no search is active
  const hasActiveSearch = elements.transactionHash.value.trim() !== '';
  if (!hasActiveSearch) {
    elements.searchResults.style.display = 'none';
    elements.recentWithdrawals.style.display = 'block';
  }

  showStatus('Withdrawal selected successfully!', 'success');
  completeStep(2);
}

function displayWithdrawalDetails(withdrawal) {
  const tokenType =
    withdrawal.l1Token &&
    withdrawal.l1Token !== '0x0000000000000000000000000000000000000000'
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
  elements.detailNonce.textContent = withdrawal.messageNonce || 'Unknown';
  elements.detailTimestamp.textContent = withdrawal.timestamp
    ? new Date(withdrawal.timestamp).toLocaleString()
    : 'Unknown';

  elements.withdrawalDetails.style.display = 'block';
  elements.withdrawalDetails.classList.add('slide-up');
}

// Execute Button Management
function updateExecuteButton() {
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
    const btnText = elements.executeBtn.querySelector('.btn-text');
    if (btnText) {
      btnText.textContent = 'Execute Withdrawal';
    }
  } else {
    elements.executeBtn.classList.remove('ready');
    const btnText = elements.executeBtn.querySelector('.btn-text');
    if (btnText) {
      btnText.textContent = 'Complete Required Fields';
    }
  }
}

// Execute Handler
async function handleExecuteWithdrawal(e) {
  e.preventDefault();

  if (!appState.selectedWithdrawal) {
    showStatus('Please select a withdrawal first', 'warning');
    return;
  }

  const executeBtn = elements.executeBtn;
  const btnContent = executeBtn.querySelector('.btn-content');
  const btnLoading = executeBtn.querySelector('.btn-loading');

  try {
    executeBtn.disabled = true;
    executeBtn.classList.remove('ready');
    btnContent.classList.add('hidden');
    btnLoading.classList.remove('hidden');

    showStatus('Executing withdrawal...', 'info', 0);

    const executionData = {
      hash: appState.selectedWithdrawal.hash,
      authMethod: appState.authMethod,
      l1RpcUrl: elements.l1RpcUrl.value,
      l2RpcUrl: elements.l2RpcUrl.value,
    };

    if (appState.authMethod === 'privateKey') {
      executionData.privateKey = elements.privateKey.value;
    } else if (appState.authMethod === 'wallet') {
      executionData.walletAddress = elements.walletAddress.textContent;
    }

    const result = await executeWithdrawal(executionData);

    clearStatus();
    showStatus('Withdrawal executed successfully! 🎉', 'success');
    completeStep(5);
  } catch (error) {
    clearStatus();
    showStatus(`Execution failed: ${error.message}`, 'error');
  } finally {
    btnContent.classList.remove('hidden');
    btnLoading.classList.add('hidden');
    updateExecuteButton(); // Restore proper button state
  }
}

// Load Recent Withdrawals
async function loadRecentWithdrawals() {
  try {
    const withdrawals = await fetchWithdrawals();
    const total = Object.keys(withdrawals).length;

    elements.totalWithdrawals.textContent = total.toLocaleString();

    const recent = Object.entries(withdrawals)
      .map(([hash, data]) => ({ hash, ...data }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    elements.withdrawalsList.innerHTML = '';

    recent.forEach((withdrawal) => {
      const item = createWithdrawalItem(withdrawal);
      elements.withdrawalsList.appendChild(item);
    });
  } catch (error) {
    console.error('Error loading withdrawals:', error);
    elements.withdrawalsList.innerHTML =
      '<div class="loading-state">Failed to load withdrawals</div>';
  }
}

// Event Listeners
function setupEventListeners() {
  elements.themeToggle?.addEventListener('click', toggleTheme);
  elements.searchBtn?.addEventListener('click', handleSearch);
  elements.transactionHash?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  elements.transactionHash?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') clearSearch();
  });
  elements.transactionHash?.addEventListener('input', (e) => {
    // If input is cleared, automatically show recent withdrawals
    if (e.target.value.trim() === '') {
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
async function initializeApp() {
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
