import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroStats } from './components/HeroStats';
import { ChartArea } from './components/ChartArea';
import { Transactions } from './components/Transactions';
import { TokenForge } from './components/TokenForge';
import { Launchpad } from './components/Launchpad';
import { SwapInterface } from './components/SwapInterface';
import { WalletState, Transaction, TokenData, NetworkId } from './types';
import { connectWalletAPI, checkWalletInstalled, getBalance, isMobileDevice, getWalletDeepLink } from './services/walletService';
import { AlertCircle, ShieldCheck, BrainCircuit, ExternalLink } from 'lucide-react';

const MOCK_TOKEN_DATA: TokenData = {
  price: 0.5824,
  marketCap: 12500000,
  volume24h: 450200,
  change24h: 5.24,
  supply: 100000000,
  liquidity: 850000,
  qualityScore: 92
};

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'Buy', amount: 500, date: '2023-10-24 14:30', status: 'Completed', hash: '0x7a9f3b21c8d2e4f5a6b7c8d9e0f1a2b3c4d5e6f7' },
  { id: '2', type: 'Stake', amount: 2000, date: '2023-10-24 10:00', status: 'Completed', hash: '0x4c112233445566778899aabbccddeeff00112233' },
  { id: '3', type: 'Sell', amount: 120, date: '2023-10-23 09:15', status: 'Completed', hash: '0x3c9a12b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    network: 'bnb-mainnet',
    isConnected: false,
    isConnecting: false,
    error: null,
    balance: '0',
    walletType: null
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Handle Wallet Connection
  const handleConnect = async () => {
    setWallet(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
        const isInstalled = checkWalletInstalled(wallet.network);
        
        if (!isInstalled) {
            // Check if mobile to attempt deep link
            if (isMobileDevice()) {
                const deepLink = getWalletDeepLink(wallet.network);
                if (deepLink) {
                    // Redirect to wallet app
                    window.location.href = deepLink;
                    // Stop loading state after a brief moment as user leaves app
                    setTimeout(() => {
                         setWallet(prev => ({ 
                             ...prev, 
                             isConnecting: false, 
                             error: "Redirecting to wallet app..." 
                         }));
                    }, 3000);
                    return;
                }
            }

            let msg = "Wallet not found.";
            if (wallet.network.includes('bnb')) msg = "MetaMask not found. Please install the extension.";
            if (wallet.network.includes('solana')) msg = "Phantom Wallet not found. Please install the extension.";
            if (wallet.network.includes('ton')) msg = "Tonkeeper not found. Please install the extension.";
            throw new Error(msg);
        }

        const { address, walletType } = await connectWalletAPI(wallet.network);
        const balance = await getBalance(address, wallet.network);

        setWallet(prev => ({
            ...prev,
            address,
            isConnected: true,
            isConnecting: false,
            walletType,
            balance,
            error: null
        }));
        setTransactions(MOCK_TRANSACTIONS);

    } catch (err: any) {
        setWallet(prev => ({
            ...prev,
            isConnecting: false,
            error: err.message || 'Connection Failed'
        }));
    }
  };

  const handleDisconnect = () => {
    setWallet(prev => ({
        ...prev,
        address: null,
        isConnected: false,
        walletType: null,
        balance: '0'
    }));
    setTransactions([]);
  };

  const handleNetworkChange = async (newNetwork: NetworkId) => {
      if (wallet.isConnected) handleDisconnect();
      setWallet(prev => ({ ...prev, network: newNetwork, error: null }));
  };

  useEffect(() => {
      // Auto-detect environment logic (simplified)
      if (window.ethereum) {
          window.ethereum.on('accountsChanged', (accounts: string[]) => {
              if (accounts.length === 0) handleDisconnect();
              else if (wallet.isConnected && wallet.network.includes('bnb')) {
                   setWallet(prev => ({...prev, address: accounts[0]}));
              }
          });
          window.ethereum.on('chainChanged', () => window.location.reload());
      }
  }, [wallet.isConnected, wallet.network]);

  // Render Active Tab
  const renderContent = () => {
      switch(activeTab) {
          case 'forge':
              return <TokenForge network={wallet.network} isConnected={wallet.isConnected} />;
          case 'launchpad':
              return <Launchpad wallet={wallet} />;
          case 'trade':
              return <SwapInterface wallet={wallet} onConnect={handleConnect} />;
          default:
              return (
                <div className="animate-slideUp space-y-6">
                    {/* Account Overview */}
                    {wallet.isConnected && (
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                <div>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2">
                                        <ShieldCheck size={16} className="text-green-500" />
                                        Connected via {wallet.walletType}
                                    </div>
                                    <div className="flex items-baseline gap-3">
                                        <h2 className="text-4xl font-bold text-white">{wallet.balance}</h2>
                                        <span className="text-xl font-semibold text-yellow-500">
                                            {wallet.network.includes('bnb') ? 'BNB' : wallet.network.includes('solana') ? 'SOL' : 'TON'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setActiveTab('trade')}
                                        className="flex-1 md:flex-none px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 rounded-xl font-bold transition-colors shadow-lg shadow-yellow-500/10"
                                    >
                                        Trade / Swap
                                    </button>
                                    <button className="flex-1 md:flex-none px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors border border-slate-700">
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <HeroStats data={MOCK_TOKEN_DATA} />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <ChartArea />
                        </div>
                        <div className="lg:col-span-1">
                            <Transactions 
                                transactions={transactions} 
                                isConnected={wallet.isConnected} 
                                network={wallet.network}
                            />
                        </div>
                    </div>
                </div>
              );
      }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200 font-sans selection:bg-yellow-500/30">
      
      <Navbar 
        address={wallet.address} 
        network={wallet.network}
        isConnecting={wallet.isConnecting} 
        activeTab={activeTab}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onNetworkChange={handleNetworkChange}
        onTabChange={setActiveTab}
      />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        
        {/* Error Banner */}
        {wallet.error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 animate-slideUp shadow-lg shadow-red-900/10">
            <AlertCircle size={20} />
            <span className="font-medium">{wallet.error}</span>
             {wallet.error.includes('not found') && !isMobileDevice() && (
                <a 
                    href={wallet.network.includes('bnb') ? "https://metamask.io/download/" : wallet.network.includes('solana') ? "https://phantom.app/download" : "https://tonkeeper.com/"} 
                    target="_blank" 
                    rel="noreferrer"
                    className="ml-auto text-sm underline hover:text-white flex items-center gap-1"
                >
                    Install <ExternalLink size={12} />
                </a>
            )}
            <button onClick={() => setWallet(prev => ({...prev, error: null}))} className="ml-auto hover:text-white p-1">✕</button>
          </div>
        )}

        {/* Landing Hero (Disconnected) */}
        {!wallet.isConnected && activeTab === 'dashboard' ? (
          <div className="text-center py-16 md:py-24 animate-slideUp relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-3xl pointer-events-none"></div>
             
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wide mb-6 animate-bounce">
                <BrainCircuit size={12} /> Powered by Local AI
             </div>
             
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white tracking-tight relative z-10">
              Forge the Future of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Web3 Assets</span>
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl mb-10 leading-relaxed relative z-10">
              The all-in-one platform to mint tokens, audit contracts, and launch presales on BNB, Solana, and TON.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <button 
                    onClick={handleConnect}
                    className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-600 text-slate-900 px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-orange-500/20 transition-all hover:-translate-y-1 hover:shadow-orange-500/40"
                >
                    Launch App
                </button>
                <button 
                    onClick={() => setActiveTab('forge')}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white border border-slate-700 hover:bg-slate-800 transition-all"
                >
                    Explore Forge
                </button>
            </div>
            
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t border-slate-800 pt-8 opacity-70">
                <div>
                    <div className="text-3xl font-bold text-white">BNB</div>
                    <div className="text-xs text-slate-500 mt-1">Smart Chain</div>
                </div>
                <div>
                    <div className="text-3xl font-bold text-white">SOL</div>
                    <div className="text-xs text-slate-500 mt-1">Solana</div>
                </div>
                <div>
                    <div className="text-3xl font-bold text-white">TON</div>
                    <div className="text-xs text-slate-500 mt-1">The Open Network</div>
                </div>
                 <div>
                    <div className="text-3xl font-bold text-white">Safe</div>
                    <div className="text-xs text-slate-500 mt-1">AI Validator</div>
                </div>
            </div>
          </div>
        ) : (
            renderContent()
        )}

      </main>

      <footer className="border-t border-slate-900/50 bg-black/20 py-8 mt-auto backdrop-blur-sm">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
          <p>&copy; 2024 KUBA Forge Ai. All rights reserved.</p>
          <div className="flex gap-6">
             <a href="#" className="hover:text-yellow-400 transition-colors">Documentation</a>
             <a href="#" className="hover:text-yellow-400 transition-colors">Audits</a>
             <a href="#" className="hover:text-yellow-400 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;