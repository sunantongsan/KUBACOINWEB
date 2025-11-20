
export interface CoinData {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: string;
  volume: string;
  logo?: string;
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

// ADMIN WALLETS FOR FEE COLLECTION
export const FEE_WALLETS = {
  BNB: "0x3C19Ba6fcdf48bf10Aa78771bFd3913b33F133C9",
  TON: "UQA1pHRQOC65_yqTH-VId3T6sEDtaBGccJsfk1iETs4zLUue",
  SOL: "6VDvBrfsKPxrJvLbNwsKT5jcraEY66xSmcJ5v4qrFCbG"
};

// PLATFORM CONFIGURATION
export const PLATFORM_FEES = {
  SWAP_PERCENT: 0.15, // Adjusted to 0.15% (Competitive sweet spot)
  TOKEN_CREATION_BNB: "0.01", // 0.01 BNB
  LAUNCHPAD_PERCENT: 1.0, // 1% on raised funds (Others usually 5%)
};

// PLACEHOLDER: Please replace this URL with the actual direct link to your uploaded KUBA Coin image.
export const KUBA_LOGO_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZmQ3MDA7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZmYTUwMDtzdG9wLW9wYWNpdHk6MSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iOTUiIGZpbGw9InVybCgjZ3JhZCkiIHN0cm9rZT0iIzM4OGU1MyIgc3Ryb2tlLXdpZHRoPSI0IiAvPgogIDxjaXJjbGUgY3g9IjY1IiBjeT0iODAiIHI9IjIwIiBmaWxsPSJ3aGl0ZSIgLz4KICA8Y2lyY2xlIGN4PSI2NSIgY3k9IjgwIiByPSI4IiBmaWxsPSIjM2UyMDU1IiAvPgogIDxjaXJjbGUgY3g9IjEzNSIgY3k9IjgwIiByPSIyMCIgZmlsbD0id2hpdGUiIC8+CiAgPGNpcmNsZSBjeD0iMTM1IiBjeT0iODAiIHI9IjgiIGZpbGw9IiMzZTIwNTUiIC8+CiAgPHBhdGggZD0iTSA2MCAxNDAgUSAxMDAgMTgwIDE0MCAxNDAiIHN0cm9rZT0iIzNlMjA1NSIgc3Ryb2tlLXdpZHRoPSI2IiBmaWxsPSJub25lIiBzdHJva2UtbGluZWNhcD0icm91bmQiIC8+CiAgPGVsbGlXBzZSBjeD0iMTAwIiBjeT0iMTE1IiByeD0iMTUiIHJ5PSIxMCIgZmlsbD0iI2ZmYzA4MCIgLz4KICA8cGF0aCBkPSJNIDU1IDUwIFEgNzAgMzAgODUgNTAiIHN0cm9rZT0iIzNlMjA1NSIgc3Ryb2tlLXdpZHRoPSI1IiBmaWxsPSJub25lIiAvPgogIDxwYXRoIGQ9Ik0gMTE1IDUwIFEgMTMwIDMwIDE0NSA1MCIgc3Ryb2tlPSIjM2UyMDU1IiBzdHJva2Utd2lkdGg9IjUiIGZpbGw9Im5vbmUiIC8+Cjwvc3ZnPg==";

export interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export const BNB_MAINNET: NetworkConfig = {
  chainId: '0x38', // 56
  chainName: 'BNB Smart Chain Mainnet',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrls: ['https://bsc-dataseed.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/'],
};

export const BNB_TESTNET: NetworkConfig = {
  chainId: '0x61', // 97
  chainName: 'BNB Smart Chain Testnet',
  nativeCurrency: { name: 'BNB', symbol: 'tBNB', decimals: 18 },
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  blockExplorerUrls: ['https://testnet.bscscan.com/'],
};

// Minimal Standard ERC20 ABI
export const ERC20_ABI = [
  "constructor(string memory name_, string memory symbol_, uint256 initialSupply_)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

export const STANDARD_TOKEN_BYTECODE = "0x608060405234801561001057600080fd5b506040516105e53803806105e58339810160405281019061003291906100fe565b82805461003e9061045e565b906000526020600020906002020160005b7c010000...";
