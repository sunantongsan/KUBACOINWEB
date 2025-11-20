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
  
  // --- EVM (BNB) ---
  if (network.startsWith('bnb')) {
    if (!window.ethereum) throw new Error('MetaMask/Web3 Wallet not found.');
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      await switchNetworkBNB(network as 'bnb-mainnet' | 'bnb-testnet');
      return { address: accounts[0], walletType: 'metamask' };
    } catch (error: any) {
      console.error("BNB Connect Error:", error);
      throw new Error(error.message || 'Failed to connect EVM wallet.');
    }
  }

  // --- SOLANA ---
  if (network.startsWith('solana')) {
    if (!window.solana) throw new Error('Phantom Wallet not found.');
    try {
      // 'onlyIfTrusted' is useful for auto-connect, but for explicit connect we leave it false
      const resp = await window.solana.connect();
      return { address: resp.publicKey.toString(), walletType: 'phantom' };
    } catch (error: any) {
      console.error("Solana Connect Error:", error);
      throw new Error('User rejected Solana connection.');
    }
  }

  // --- TON ---
  if (network.startsWith('ton')) {
    const tonProvider = window.ton || (window as any).tonkeeper;
    
    if (!tonProvider) throw new Error('Tonkeeper not found.');
    
    try {
      const response = await tonProvider.send('ton_requestWallets');
      if (response && response.length > 0) {
        return { address: response[0].address, walletType: 'tonkeeper' };
      }
      throw new Error('No TON account found.');
    } catch (error: any) {
       console.error("TON Connect Error:", error);
       throw new Error('TON connection failed. Please unlock Tonkeeper.');
    }
  }

  throw new Error('Unsupported network type');
};

/**
 * Helper: Switch EVM Network
 */
const switchNetworkBNB = async (targetNetwork: 'bnb-mainnet' | 'bnb-testnet') => {
  if (!window.ethereum) return;
  const config = NETWORKS[targetNetwork];
  
  try {
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
      // On mobile, sometimes switch fails silently or with generic error, so we just log it
      // and allow the user to proceed (they might be on the right chain anyway)
    }
  }
};

/**
 * Get Balance Helper
 */
export const getBalance = async (address: string, network: NetworkId): Promise<string> => {
    if (!address) return '0';

    try {
        // BNB
        if (network.startsWith('bnb') && window.ethereum) {
            const balanceHex = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [address, 'latest'],
            });
            const balanceWei = parseInt(balanceHex, 16);
            return (balanceWei / 1e18).toFixed(4);
        }
        
        // Solana (Mock balance as direct RPC requires connection object)
        if (network.startsWith('solana')) {
            return '12.50'; // Mock for demo
        }

        // TON
        if (network.startsWith('ton')) {
            return '150.00'; // Mock for demo
        }

        return '0.00';
    } catch (e) {
        console.error(e);
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
 * Calculates dynamic fee based on network type
 */
export const estimateCreationFee = async (network: NetworkId): Promise<string> => {
  // Simulate network request latency
  await new Promise(resolve => setTimeout(resolve, 600));

  // Base fees + random fluctuation to simulate live gas prices
  const random = Math.random() * 0.0005;
  
  if (network.startsWith('bnb')) {
    // BSC usually ~0.003 - 0.005 BNB for contract deployment
    const fee = 0.0035 + random; 
    return fee.toFixed(5);
  }
  if (network.startsWith('solana')) {
    // Solana rent exemption + tx fee ~ 0.002 SOL
    const fee = 0.0024 + random;
    return fee.toFixed(5);
  }
  if (network.startsWith('ton')) {
    // TON storage + deployment ~ 0.06 TON
    const fee = 0.065 + random;
    return fee.toFixed(4);
  }
  return '0.00';
};