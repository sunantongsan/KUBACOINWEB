import { createConfig, http } from 'wagmi';
import { bsc, bscTestnet, mainnet } from 'viem/chains';
import { QueryClient } from '@tanstack/react-query';

// 1. Create a QueryClient for React Query (required by Wagmi)
export const queryClient = new QueryClient();

// 2. Create the Wagmi Configuration
export const config = createConfig({
  chains: [bsc, bscTestnet, mainnet],
  // connectors: Defaults to [injected()] when not specified
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
    [mainnet.id]: http(),
  },
});