import { NetworkId } from '../types';

/**
 * Chain Configuration for EVM (BNB)
 */
const NETWORKS = {
  'bnb-mainnet': {
    chainId: '0x38', // 56
    chainName: 'BNB Smart Chain',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com/'],
  },
  'bnb-testnet': {
    chainId: '0x61', // 97
    chainName: 'BNB Smart Chain Testnet',
    nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
    blockExplorerUrls: ['https://testnet.bscscan.com/'],
  },
};

/**
 * Treasury Wallets for Platform Fees
 */
export const TREASURY_WALLETS = {
  BNB: '0x3C19Ba6fcdf48bf10Aa78771bFd3913b33F133C9', // LUNC Holder Wallet
  TON: 'UQA1pHRQOC65_yqTH-VId3T6sEDtaBGccJsfk1iETs4zLUue', // Tonkeeper
  SOL: '6VDvBrfsKPxrJvLbNwsKT5jcraEY66xSmcJ5v4qrFCbG' // Phantom
};

/**
 * Platform Fees (in Native Currency)
 */
export const ACTION_FEES = {
  MINT: "0.005",
  RENOUNCE: "0.001",
  BURN: "0.001",
  LOCK: "0.01",
  LAUNCHPAD: "0.25"
};

/**
 * Check if the user is on a mobile device
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Get Deep Link for Mobile Apps
 * Allows users on mobile Chrome/Safari to open the dApp directly in the Wallet App.
 */
export const getWalletDeepLink = (network: NetworkId): string | null => {
  const currentUrl = window.location.href.replace('https://', '').replace('http://', '');
  
  if (network.startsWith('bnb')) {
    // MetaMask Deep Link
    return `https://metamask.app.link/dapp/${currentUrl}`;
  }
  if (network.startsWith('solana')) {
    // Phantom Deep Link
    return `https://phantom.app/ul/browse/${currentUrl}?ref=${currentUrl}`;
  }
  if (network.startsWith('ton')) {
    // Tonkeeper Deep Link
    return `https://app.tonkeeper.com/ton-connect`; 
  }
  return null;
};

/**
 * Check installed wallets
 */
export const checkWalletInstalled = (network: NetworkId): boolean => {
  if (typeof window === 'undefined') return false;
  
  if (network.startsWith('bnb')) {
    return !!window.ethereum;
  }
  if (network.startsWith('solana')) {
    // Check for Phantom or generic Solana provider
    return !!(window.solana && (window.solana.isPhantom || window.solana.isConnected));
  }
  if (network.startsWith('ton')) {
    // Check for Tonkeeper or generic TON provider
    return !!(window.ton || (window as any).tonkeeper);
  }
  return false;
};

/**
 * Main Connect Function
 */
export const connectWalletAPI = async (network: NetworkId): Promise<{ address: string; walletType: 'metamask' | 'phantom' | 'tonkeeper' }> => {
  
  // ---------------------------------------------------------
  // 1. BNB Smart Chain (EVM)
  // ---------------------------------------------------------
  if (network === 'bnb-mainnet' || network === 'bnb-testnet') {
    if (!window.ethereum) throw new Error('MetaMask/Web3 Wallet not found.');
    
    try {
      // Request Accounts first
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Check & Switch Network (Force correct chain)
      // We handle this carefully to avoid errors if already connected
      await switchNetworkBNB(network);
      
      return { address: accounts[0], walletType: 'metamask' };
    } catch (error: any) {
      console.error("BNB Connect Error:", error);
      throw new Error(error.message || 'Failed to connect EVM wallet.');
    }
  }

  // ---------------------------------------------------------
  // 2. Solana (Phantom)
  // ---------------------------------------------------------
  if (network === 'solana' || network === 'solana-devnet') {
    const provider = window.solana;
    if (!provider) throw new Error('Phantom Wallet not found.');
    
    try {
      // Check if Phantom
      if (!provider.isPhantom) {
          console.warn("Non-Phantom Solana provider detected");
      }
      
      // Alert user for Devnet if needed (Simulated switch prompt)
      if (network === 'solana-devnet') {
        console.log("Please ensure your Phantom wallet is set to Devnet for testing.");
      }

      const resp = await provider.connect();
      const address = resp.publicKey.toString();
      
      return { address, walletType: 'phantom' };
    } catch (error: any) {
      console.error("Solana Connect Error:", error);
      throw new Error('User rejected Solana connection.');
    }
  }

  // ---------------------------------------------------------
  // 3. TON (Tonkeeper)
  // ---------------------------------------------------------
  if (network === 'ton' || network === 'ton-testnet') {
    const tonProvider = window.ton || (window as any).tonkeeper;
    
    if (!tonProvider) throw new Error('Tonkeeper not found.');
    
    try {
      if (network === 'ton-testnet') {
          await new Promise(resolve => setTimeout(resolve, 500));
      }

      const response = await tonProvider.send('ton_requestWallets');
      
      if (response && response.length > 0) {
        const address = response[0].address;
        return { address, walletType: 'tonkeeper' };
      }
      throw new Error('No TON account found.');
    } catch (error: any) {
       console.error("TON Connect Error:", error);
       throw new Error('TON connection failed. Please check Tonkeeper.');
    }
  }

  throw new Error(`Unsupported network type: ${network}`);
};

/**
 * Helper: Switch EVM Network with Check
 */
const switchNetworkBNB = async (targetNetwork: 'bnb-mainnet' | 'bnb-testnet') => {
  if (!window.ethereum) return;
  const config = NETWORKS[targetNetwork];
  
  try {
    // 1. Check current chain ID first to avoid unnecessary switch prompts
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    
    // Compare chain IDs (normalize to lowercase for safety)
    if (currentChainId.toLowerCase() === config.chainId.toLowerCase()) {
        return; // Already on the correct network
    }

    // 2. Attempt to switch
    await window.ethereum.request({
      method: 'eth_switchEthereumChain',
      params: [{ chainId: config.chainId }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902 || switchError.toString().includes('Unrecognized chain ID')) {
      try {
        await window.ethereum.request({
          method: 'eth_addEthereumChain',
          params: [config],
        });
      } catch (addError) {
        throw new Error('Failed to add BNB network.');
      }
    } else {
      console.error("Switch Network Error:", switchError);
      // Don't throw if user rejected switch, just let them know
      if (switchError.code === 4001) {
         throw new Error("Network switch rejected by user.");
      }
      throw new Error(`Please switch to ${config.chainName} in your wallet.`);
    }
  }
};

/**
 * Get Balance Helper
 * Fetches REAL balances using public RPC nodes for Solana/TON
 */
export const getBalance = async (address: string, network: NetworkId): Promise<string> => {
    if (!address) return '0';

    try {
        // -----------------------
        // BNB (EVM)
        // -----------------------
        if (network.startsWith('bnb') && window.ethereum) {
            const balanceHex = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [address, 'latest'],
            });
            const balanceWei = parseInt(balanceHex, 16);
            return (balanceWei / 1e18).toFixed(4);
        }
        
        // -----------------------
        // Solana (JSON-RPC)
        // -----------------------
        if (network.startsWith('solana')) {
            const rpcUrl = network === 'solana-devnet' 
                ? 'https://api.devnet.solana.com' 
                : 'https://api.mainnet-beta.solana.com';

            const response = await fetch(rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getBalance',
                    params: [address]
                })
            });
            
            const data = await response.json();
            if (data.result?.value !== undefined) {
                return (data.result.value / 1000000000).toFixed(4); // Lamports to SOL
            }
            return '0.0000'; // Fallback if fetch fails but no error thrown
        }

        // -----------------------
        // TON (HTTP API)
        // -----------------------
        if (network.startsWith('ton')) {
            // Using Toncenter public API (Rate limited, but works for basic checks)
            const rpcUrl = network === 'ton-testnet'
                ? 'https://testnet.toncenter.com/api/v2/jsonRPC'
                : 'https://toncenter.com/api/v2/jsonRPC';

            const response = await fetch(rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getAddressBalance',
                    params: { address: address }
                })
            });

            const data = await response.json();
            if (data.result) {
                return (parseInt(data.result) / 1000000000).toFixed(4); // Nanoton to TON
            }
            return '0.0000';
        }

        return '0.00';
    } catch (e) {
        console.error("Failed to fetch balance:", e);
        return '0.00';
    }
}

export const formatAddress = (address: string | null): string => {
  if (!address) return '';
  if (address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

/**
 * Get Explorer Base URL based on network
 */
export const getExplorerBaseUrl = (network: NetworkId): string => {
  switch (network) {
    case 'bnb-mainnet':
      return 'https://bscscan.com/tx/';
    case 'bnb-testnet':
      return 'https://testnet.bscscan.com/tx/';
    case 'solana':
      return 'https://solscan.io/tx/';
    case 'solana-devnet':
      return 'https://solscan.io/tx/?cluster=devnet';
    case 'ton':
      return 'https://tonviewer.com/transaction/';
    case 'ton-testnet':
      return 'https://testnet.tonviewer.com/transaction/';
    default:
      return '#';
  }
};

/**
 * Estimate Creation Fee
 * Fetches real-time gas prices for EVM and estimates accurate storage/rent for others.
 * INCLUDES 5% PLATFORM FEE (Hidden from user)
 */
export const estimateCreationFee = async (network: NetworkId): Promise<string> => {
  let rawEstimatedFee = 0;

  // ---------------------------------------------------------
  // 1. BNB Smart Chain (Dynamic Gas Price)
  // ---------------------------------------------------------
  if (network.startsWith('bnb')) {
    try {
      let gasPrice = BigInt(3000000000); // Default 3 Gwei
      
      // Attempt to fetch real gas price
      if (window.ethereum) {
        try {
          const priceHex = await window.ethereum.request({ method: 'eth_gasPrice' });
          if(priceHex) gasPrice = BigInt(priceHex);
        } catch (rpcError) {
          console.warn("BNB Gas Fetch Failed (using default):", rpcError);
          // We don't throw here to allow the user to proceed with default estimates
        }
      }
      
      // Standard BEP20 Contract Deployment Gas Limit (~2.2M)
      const estimatedGasLimit = BigInt(2200000);
      const totalWei = gasPrice * estimatedGasLimit;
      
      // Convert Wei to BNB (1e18)
      const gasCostBNB = Number(totalWei) / 1e18;
      
      rawEstimatedFee = gasCostBNB + parseFloat(ACTION_FEES.MINT);
      
    } catch (error: any) {
      console.error("Critical BNB Fee Error:", error);
      rawEstimatedFee = 0.015; // Safe fallback
    }
  } 
  
  // ---------------------------------------------------------
  // 2. Solana (Rent Exemption + Transaction Fee)
  // ---------------------------------------------------------
  else if (network.startsWith('solana')) {
    try {
      // Rent constants for Token Program (Mint + Token Account + Metadata)
      const MINT_RENT = 0.0014616;
      const TOKEN_ACC_RENT = 0.00203928;
      const METADATA_RENT = 0.00561672;
      const TX_FEE = 0.00001; // 5000 Lamports
      
      rawEstimatedFee = MINT_RENT + TOKEN_ACC_RENT + METADATA_RENT + TX_FEE + parseFloat(ACTION_FEES.MINT);
    } catch (e) {
      console.error("Solana Fee Error:", e);
      rawEstimatedFee = 0.015;
    }
  }
  
  // ---------------------------------------------------------
  // 3. TON (Storage Reserve + Gas)
  // ---------------------------------------------------------
  else if (network.startsWith('ton')) {
    try {
       // TON requires strict storage fees
       const STORAGE_RESERVE = 0.05;
       const EXECUTION_GAS = network === 'ton-testnet' ? 0.1 : 0.15; 
       
       rawEstimatedFee = STORAGE_RESERVE + EXECUTION_GAS + parseFloat(ACTION_FEES.MINT);
    } catch (e) {
       console.error("TON Fee Error:", e);
       rawEstimatedFee = 0.25;
    }
  }
  
  else {
    // Unknown Network
    throw new Error(`Cannot calculate fee for unknown network: ${network}`);
  }

  // ---------------------------------------------------------
  // Final Calculation: Apply 5% Platform Fee (Treasury Markup)
  // ---------------------------------------------------------
  const totalFeeWithMarkup = rawEstimatedFee * 1.05;

  // Format Output based on precision needs
  if (network.startsWith('solana')) {
      return totalFeeWithMarkup.toFixed(5);
  } else if (network.startsWith('ton')) {
      return totalFeeWithMarkup.toFixed(4);
  } else {
      // BNB (Standard 5 decimals is usually enough)
      return totalFeeWithMarkup.toFixed(5);
  }
};