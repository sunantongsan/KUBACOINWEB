
import { ChainType, NetworkMode } from './types';

export const PLATFORM_FEE_PERCENT = 0.03; // 3%

// ---------------------------------------------------------
// 💰 TEAM WALLET CONFIGURATION
// ---------------------------------------------------------
export const TEAM_WALLET_ADDRESS = {
  [ChainType.BNB]: "0x3C19Ba6fcdf48bf10Aa78771bFd3913b33F133C9",
  [ChainType.SOL]: "6VDvBrfsKPxrJvLbNwsKT5jcraEY66xSmcJ5v4qrFCbG",
  [ChainType.TON]: "UQA1pHRQOC65_yqTH-VId3T6sEDtaBGccJsfk1iETs4zLUue"
};

export const CHAIN_CONFIG = {
  [ChainType.BNB]: {
    currency: 'BNB',
    color: 'text-bnb',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50',
    icon: '🔶',
    walletName: 'MetaMask / Trust',
    explorer: {
      [NetworkMode.MAINNET]: 'https://bscscan.com',
      [NetworkMode.TESTNET]: 'https://testnet.bscscan.com'
    }
  },
  [ChainType.SOL]: {
    currency: 'SOL',
    color: 'text-sol',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50',
    icon: '◎',
    walletName: 'Phantom / Solflare',
    explorer: {
      [NetworkMode.MAINNET]: 'https://solscan.io',
      [NetworkMode.TESTNET]: 'https://solscan.io/?cluster=devnet'
    }
  },
  [ChainType.TON]: {
    currency: 'TON',
    color: 'text-ton',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/50',
    icon: '💎',
    walletName: 'TonKeeper',
    explorer: {
      [NetworkMode.MAINNET]: 'https://tonscan.org',
      [NetworkMode.TESTNET]: 'https://testnet.tonscan.org'
    }
  }
};

export const INITIAL_TOKENS = []; // Start empty
