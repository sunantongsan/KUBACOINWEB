export type NetworkId = 'bnb-mainnet' | 'bnb-testnet' | 'solana' | 'solana-devnet' | 'ton' | 'ton-testnet';

export interface WalletState {
  address: string | null;
  network: NetworkId;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  balance: string;
  walletType: 'metamask' | 'phantom' | 'tonkeeper' | null;
}

export interface Transaction {
  id: string;
  type: 'Buy' | 'Sell' | 'Transfer' | 'Stake' | 'Mint' | 'Burn';
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  hash: string;
}

export interface TokenData {
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  supply: number;
  liquidity: number; // New field
  qualityScore: number; // AI Analysis score
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
  isErrorAnalysis?: boolean;
}

export interface LaunchpadProject {
  id: string;
  name: string;
  symbol: string;
  raised: number;
  hardcap: number;
  status: 'Live' | 'Upcoming' | 'Ended';
  chain: NetworkId;
  address?: string; // Added address field
}

// Extend Window interface for various providers
declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
    ton?: any;
  }
}