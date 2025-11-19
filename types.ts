

export enum ChainType {
  BNB = 'BNB Smart Chain',
  SOL = 'Solana',
  TON = 'TON Network'
}

export enum NetworkMode {
  MAINNET = 'Mainnet',
  TESTNET = 'Testnet'
}

export interface Transaction {
  id: string;
  type: 'MINT' | 'BURN' | 'SWAP' | 'LIQUIDITY' | 'BRIDGE' | 'VERIFY' | 'RENOUNCE' | 'LOCK' | 'FAUCET' | 'LAUNCHPAD_CREATE' | 'LAUNCHPAD_JOIN';
  description: string;
  amount: string;
  date: Date;
  status: 'Success' | 'Failed' | 'Pending';
  txHash: string;
}

export interface TokenData {
  id: string;
  name: string;
  symbol: string;
  supply: number;
  chain: ChainType;
  networkMode: NetworkMode;
  logoUrl: string | null;
  createdAt: Date;
  status: 'active' | 'deploying' | 'error';
  liquidityLocked: boolean;
  contractAddress?: string;
  ownershipRenounced?: boolean;
  lockedAmount?: number;
  unlockDate?: Date;
  transactions: Transaction[];
  
  // Market Data
  currentPrice?: number;
  liquidityUSD?: number;
}

export interface LaunchpadProject {
  id: string;
  tokenId: string;
  tokenName: string;
  tokenSymbol: string;
  logoUrl: string | null;
  chain: ChainType;
  softCap: number;
  hardCap: number;
  rate: number; // 1 Native = X Tokens
  raisedAmount: number;
  startTime: Date;
  endTime: Date;
  status: 'UPCOMING' | 'LIVE' | 'ENDED';
  participants: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isErrorExplanation?: boolean;
}

export interface TransactionFee {
  networkFee: number;
  platformFee: number; // 3%
  total: number;
  currency: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CREATE_TOKEN = 'CREATE_TOKEN',
  MANAGE_TOKEN = 'MANAGE_TOKEN',
  SWAP_BRIDGE = 'SWAP_BRIDGE',
  LAUNCHPAD = 'LAUNCHPAD',
  TRADE = 'TRADE'
}