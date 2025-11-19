
import { ChainType, NetworkMode } from './types';

export const PLATFORM_FEE_PERCENT = 0.03; // 3%

export const CHAIN_CONFIG = {
  [ChainType.BNB]: {
    currency: 'BNB',
    color: 'text-bnb',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50',
    icon: '🔶',
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
    explorer: {
      [NetworkMode.MAINNET]: 'https://tonscan.org',
      [NetworkMode.TESTNET]: 'https://testnet.tonscan.org'
    }
  }
};

export const INITIAL_TOKENS = []; // Start empty
