
export interface CoinData {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: string;
  volume: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isLoading?: boolean;
  sources?: Array<{ uri: string; title: string }>;
}

export enum ProcessingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  MARKET_ANALYSIS = 'MARKET_ANALYSIS',
  CHAT = 'CHAT',
  EXCHANGE = 'EXCHANGE',
  TOKEN_FACTORY = 'TOKEN_FACTORY',
  LAUNCHPAD = 'LAUNCHPAD',
}
