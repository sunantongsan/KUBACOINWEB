import React, { useState, useEffect } from 'react';
import { ViewState, TokenData, NetworkMode, LaunchpadProject, ChainType } from './types';
import { TokenCreator } from './components/TokenCreator';
import { ManageToken } from './components/ManageToken';
import { AiAssistant } from './components/AiAssistant';
import { Launchpad } from './components/Launchpad';
import { TradeInterface } from './components/TradeInterface';
import { TokenQualityBadge } from './components/TokenQualityBadge';
import { LayoutGrid, PlusCircle, Wallet, Layers, Rocket, TrendingUp, LogOut, Loader2, Search, X, Zap, ToggleLeft, ToggleRight } from 'lucide-react';
import { CHAIN_CONFIG } from './constants';

// REAL WEB3 IMPORTS
import { useAccount, useConnect, useDisconnect } from 'wagmi';

// Helper to parse dates from JSON
const dateReviver = (key: string, value: any) => {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
        return new Date(value);
    }
    return value;
};

function App() {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  
  // Load initial state from LocalStorage if available
  const [myTokens, setMyTokens] = useState<TokenData[]>(() => {
      try {
          const saved = localStorage.getItem('kuba_my_tokens');
          return saved ? JSON.parse(saved, dateReviver) : [];
      } catch (e) {
          console.error("Failed to load tokens", e);
          return [];
      }
  });

  const [launchpads, setLaunchpads] = useState<LaunchpadProject[]>(() => {
      try {
          const saved = localStorage.getItem('kuba_launchpads');
          return saved ? JSON.parse(saved, dateReviver) : [];
      } catch (e) {
          console.error("Failed to load launchpads", e);
          return [];
      }
  });

  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock Data for "Live Market" Section
  const [marketTokens, setMarketTokens] = useState<TokenData[]>([]);

  // WALLET STATE
  const [isSimulationMode, setIsSimulationMode] = useState(true); // Default to Simulation
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletChain, setWalletChain] = useState<ChainType | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // REAL WEB3 HOOKS
  const { address: realAddress, isConnected: isRealConnected } = useAccount();
  const { connect: connectReal, connectors } = useConnect();
  const { disconnect: disconnectReal } = useDisconnect();

  // Effect to sync Real Wallet state
  useEffect(() => {
    if (!isSimulationMode && isRealConnected && realAddress) {
      setWalletAddress(realAddress);
      setWalletChain(ChainType.BNB); // Defaulting to BNB for initial integration
    } else if (!isSimulationMode && !isRealConnected) {
      setWalletAddress(null);
    }
  }, [isRealConnected, realAddress, isSimulationMode]);

  // Persist Data whenever it changes
  useEffect(() => {
      localStorage.setItem('kuba_my_tokens', JSON.stringify(myTokens));
  }, [myTokens]);

  useEffect(() => {
      localStorage.setItem('kuba_launchpads', JSON.stringify(launchpads));
  }, [launchpads]);

  useEffect(() => {
      // Generate mock data
      const chains = [ChainType.BNB, ChainType.SOL, ChainType.TON];
      const generated: TokenData[] = Array.from({length: 6}, (_, i) => ({
          id: `market-${i}`,
          name: ['DragonCoin', 'SolPepe', 'TonGem', 'KubaGold', 'SafeMoon2', 'RocketX'][i],
          symbol: ['DRG', 'SPEPE', 'TGEM', 'KGOLD', 'SFM2', 'RCKT'][i],
          supply: 1000000000,
          chain: chains[i % 3],
          networkMode: NetworkMode.MAINNET,
          logoUrl: null,
          createdAt: new Date(),
          status: 'active',
          liquidityLocked: i % 2 === 0,
          contractAddress: i % 3 !== 0 ? '0xMockAddress...' : undefined,
          ownershipRenounced: i === 0 || i === 3,
          currentPrice: Math.random() * 0.5,
          liquidityUSD: Math.random() * 50000 + 10000,
          transactions: []
      }));
      setMarketTokens(generated);

      // Mock Launchpads initial data (only if empty)
      if (launchpads.length === 0 && !localStorage.getItem('kuba_launchpads')) {
          const mockLp: LaunchpadProject = {
              id: 'lp-mock-1',
              tokenId: 'market-0',
              tokenName: 'DragonCoin',
              tokenSymbol: 'DRG',
              logoUrl: null,
              chain: ChainType.BNB,
              softCap: 50,
              hardCap: 200,
              rate: 5000,
              raisedAmount: 125,
              startTime: new Date(),
              endTime: new Date(Date.now() + 86400000 * 3),
              status: 'LIVE',
              participants: 450
          };
          setLaunchpads([mockLp]);
      }
  }, []);

  const handleTokenCreated = (newToken: TokenData) => {
    setMyTokens([newToken, ...myTokens]);
    setView(ViewState.DASHBOARD);
    
    if (newToken.status === 'deploying') {
      setTimeout(() => {
        setMyTokens(prev => prev.map(t => t.id === newToken.id ? { ...t, status: 'active' } : t));
      }, 3000);
    }
  };

  const handleManageToken = (token: TokenData) => {
    setSelectedToken(token);
    setView(ViewState.MANAGE_TOKEN);
  };

  const handleUpdateToken = (updatedToken: TokenData) => {
    const updatedList = myTokens.map(t => t.id === updatedToken.id ? updatedToken : t);
    setMyTokens(updatedList);
    localStorage.setItem('kuba_my_tokens', JSON.stringify(updatedList));
    
    if (selectedToken && selectedToken.id === updatedToken.id) {
      setSelectedToken(updatedToken);
    }
  };

  const handleCreateLaunchpad = (project: LaunchpadProject) => {
    setLaunchpads([project, ...launchpads]);
  };

  // Wallet Functions
  const handleConnect = async (chain: ChainType) => {
      setIsConnecting(true);

      if (!isSimulationMode) {
        // REAL WALLET CONNECTION
        const connector = connectors[0]; // Usually Injected (MetaMask)
        if (connector) {
            try {
                connectReal({ connector });
                // State update handled by useEffect
            } catch (error) {
                console.error("Real connection failed", error);
                alert("Failed to connect real wallet. Make sure you have MetaMask installed.");
            }
        } else {
            alert("No wallet found. Please install MetaMask.");
        }
        setIsConnecting(false);
        setIsConnectModalOpen(false);
        return;
      }
      
      // SIMULATION CONNECTION
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWalletChain(chain);
      let mockAddr = "";
      if(chain === ChainType.BNB) mockAddr = "0x71C...9A21";
      if(chain === ChainType.SOL) mockAddr = "AuX...9k2P";
      if(chain === ChainType.TON) mockAddr = "EQD...j82Z";
      setWalletAddress(mockAddr);
      setIsConnecting(false);
      setIsConnectModalOpen(false);
  };

  const handleDisconnect = () => {
      if (!isSimulationMode) {
          disconnectReal();
      }
      setWalletAddress(null);
      setWalletChain(null);
  };

  const getContextHint = () => {
    if (view === ViewState.CREATE_TOKEN) return "Creating a new token form";
    if (view === ViewState.MANAGE_TOKEN && selectedToken) return `Managing token ${selectedToken.symbol} on ${selectedToken.chain}`;
    if (view === ViewState.LAUNCHPAD) return "Viewing Launchpad Projects";
    if (view === ViewState.TRADE) return "Trading on DEX Interface";
    return "Dashboard overview";
  };

  const filteredMarketTokens = marketTokens.filter(token => 
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMyTokens = myTokens.filter(token => 
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-darker text-gray-200 font-sans selection:bg-yellow-500/30">
      {/* Navbar */}
      <nav className="bg-card/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView(ViewState.DASHBOARD)}>
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform">
                <Layers className="text-black w-5 h-5" />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 hidden md:block">
                KUBA Forge Ai
                </span>
            </div>

            {/* Main Nav Links */}
            <div className="hidden md:flex items-center gap-1">
                <button 
                    onClick={() => setView(ViewState.DASHBOARD)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === ViewState.DASHBOARD ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-400 hover:text-white'}`}
                >
                    Dashboard
                </button>
                <button 
                    onClick={() => setView(ViewState.TRADE)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${view === ViewState.TRADE ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-400 hover:text-white'}`}
                >
                    <TrendingUp className="w-4 h-4" /> Trade
                </button>
                <button 
                    onClick={() => setView(ViewState.LAUNCHPAD)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${view === ViewState.LAUNCHPAD ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-400 hover:text-white'}`}
                >
                    <Rocket className="w-4 h-4" /> Launchpad
                </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
                onClick={() => setView(ViewState.CREATE_TOKEN)}
                className="hidden sm:flex items-center gap-1 text-sm font-bold text-black bg-yellow-500 hover:bg-yellow-400 px-4 py-2 rounded-full transition-colors shadow-lg shadow-yellow-500/20"
            >
                <PlusCircle className="w-4 h-4" /> Create Token
            </button>

            {/* Wallet Button */}
            {walletAddress ? (
                 <button 
                    onClick={handleDisconnect}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-red-900/50 border border-green-500/50 hover:border-red-500/50 px-4 py-2 rounded-full transition-all group"
                 >
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-mono font-bold text-green-400 group-hover:text-red-400">
                        {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
                    </span>
                    <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-400 ml-1" />
                 </button>
            ) : (
                <button 
                    onClick={() => setIsConnectModalOpen(true)}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-yellow-500/50 px-4 py-2 rounded-full transition-all group"
                >
                    <Wallet className="w-4 h-4 text-yellow-400 group-hover:text-yellow-300" />
                    <span className="text-sm font-medium group-hover:text-yellow-100">Connect Wallet</span>
                </button>
            )}
          </div>
        </div>

        {/* Mobile Nav Strip */}
        <div className="md:hidden flex justify-around border-t border-gray-800 bg-dark/50 backdrop-blur">
            <button onClick={() => setView(ViewState.DASHBOARD)} className={`p-3 flex flex-col items-center text-[10px] ${view === ViewState.DASHBOARD ? 'text-yellow-500' : 'text-gray-500'}`}><LayoutGrid className="w-5 h-5 mb-1"/>Dash</button>
            <button onClick={() => setView(ViewState.TRADE)} className={`p-3 flex flex-col items-center text-[10px] ${view === ViewState.TRADE ? 'text-yellow-500' : 'text-gray-500'}`}><TrendingUp className="w-5 h-5 mb-1"/>Trade</button>
            <button onClick={() => setView(ViewState.LAUNCHPAD)} className={`p-3 flex flex-col items-center text-[10px] ${view === ViewState.LAUNCHPAD ? 'text-yellow-500' : 'text-gray-500'}`}><Rocket className="w-5 h-5 mb-1"/>Launch</button>
            <button onClick={() => setView(ViewState.CREATE_TOKEN)} className={`p-3 flex flex-col items-center text-[10px] ${view === ViewState.CREATE_TOKEN ? 'text-yellow-500' : 'text-gray-500'}`}><PlusCircle className="w-5 h-5 mb-1"/>Create</button>
        </div>
      </nav>

      {/* Wallet Modal */}
      {isConnectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
              <div className="bg-card border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
                  <button onClick={() => setIsConnectModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                      <X className="w-6 h-6" />
                  </button>
                  
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Wallet className="w-6 h-6 text-yellow-500" /> Connect Wallet
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Select connection mode and network.</p>
                  </div>

                  {/* SIMULATION TOGGLE SWITCH */}
                  <div className="bg-slate-900 p-3 rounded-xl border border-gray-800 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className={`w-5 h-5 ${isSimulationMode ? 'text-green-400' : 'text-gray-500'}`} />
                        <span className="text-sm font-bold text-gray-300">Simulation Mode</span>
                    </div>
                    <button 
                        onClick={() => setIsSimulationMode(!isSimulationMode)}
                        className="transition-colors"
                    >
                        {isSimulationMode ? (
                            <ToggleRight className="w-10 h-10 text-green-400" />
                        ) : (
                            <ToggleLeft className="w-10 h-10 text-gray-600" />
                        )}
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                      {!isSimulationMode && (
                        <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30 text-xs text-blue-200 mb-4 flex items-start gap-2">
                            <Wallet className="w-4 h-4 shrink-0 mt-0.5" />
                            This will attempt to connect to your real browser wallet (e.g. MetaMask) on BNB Chain.
                        </div>
                      )}

                      {isConnecting ? (
                        <div className="py-10 flex flex-col items-center justify-center text-gray-400">
                           <Loader2 className="w-10 h-10 animate-spin text-yellow-500 mb-3" />
                           <p>{isSimulationMode ? 'Simulating Connection...' : 'Waiting for Wallet...'}</p>
                        </div>
                      ) : (
                        Object.values(ChainType).map((chain) => (
                            <button
                                key={chain}
                                onClick={() => handleConnect(chain)}
                                disabled={!isSimulationMode && chain !== ChainType.BNB} // Only BNB implemented for Real Mode first
                                className={`w-full p-4 bg-dark hover:bg-slate-800 border border-gray-700 hover:border-yellow-500 rounded-xl flex items-center justify-between group transition-all ${(!isSimulationMode && chain !== ChainType.BNB) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{CHAIN_CONFIG[chain].icon}</span>
                                    <div className="text-left">
                                        <div className="font-bold text-white group-hover:text-yellow-400 transition-colors">{chain}</div>
                                        <div className="text-xs text-gray-500">{CHAIN_CONFIG[chain].walletName}</div>
                                    </div>
                                </div>
                                <div className="w-4 h-4 rounded-full border border-gray-600 group-hover:bg-yellow-500 group-hover:border-yellow-500 transition-colors"></div>
                            </button>
                        ))
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === ViewState.DASHBOARD && (
          <div className="space-y-12 animate-fade-in">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-yellow-500/10 hover:border-yellow-500/30 transition-colors relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl"></div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">Active Pairs</h3>
                <p className="text-3xl font-bold text-white relative z-10">{marketTokens.length + 124}</p>
              </div>
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-orange-500/10 hover:border-orange-500/30 transition-colors relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl"></div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">24h Volume</h3>
                <p className="text-3xl font-bold text-white relative z-10">$1.2M</p>
              </div>
              <button 
                onClick={() => setView(ViewState.CREATE_TOKEN)}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:shadow-xl hover:shadow-yellow-500/20 transition-all transform hover:scale-[1.02] group"
              >
                <PlusCircle className="w-10 h-10 text-black group-hover:rotate-90 transition-transform" />
                <span className="font-bold text-black text-lg">Create New Token</span>
              </button>
            </div>
            
            {/* Search Filter */}
            <div className="relative z-10">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-4 border border-gray-800 rounded-xl bg-card/50 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all shadow-lg"
                    placeholder="Search tokens by name or symbol..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* My Tokens Section */}
            <div className="pt-8 border-t border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-yellow-500" /> Your Assets
              </h2>
              
              {myTokens.length === 0 ? (
                <div className="bg-card border border-gray-800 rounded-2xl p-12 text-center">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Layers className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-300">No tokens created yet</h3>
                  <p className="text-gray-500 mt-2 mb-6">Start by creating your first token on BNB, Solana, or TON with AI assistance.</p>
                  <button 
                    onClick={() => setView(ViewState.CREATE_TOKEN)}
                    className="text-yellow-400 hover:text-yellow-300 font-medium"
                  >
                    Create First Token →
                  </button>
                </div>
              ) : (
                <>
                    {filteredMyTokens.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMyTokens.map((token) => (
                            <div key={token.id} className="bg-card border border-gray-700 rounded-xl p-6 hover:border-yellow-500/50 transition-colors group relative overflow-hidden shadow-lg">
                            <div className={`absolute top-0 right-0 px-2 py-1 text-[10px] font-bold rounded-bl-lg border-l border-b border-gray-700 ${
                                token.networkMode === NetworkMode.MAINNET 
                                ? 'bg-yellow-500/20 text-yellow-400' 
                                : 'bg-gray-700 text-gray-400'
                            }`}>
                                {token.networkMode}
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center border border-gray-700 group-hover:border-yellow-500/30 transition-colors">
                                {token.logoUrl ? <img src={token.logoUrl} className="w-full h-full object-cover" /> : token.symbol[0]}
                                </div>
                                <div>
                                <h4 className="font-bold text-white group-hover:text-yellow-400 transition-colors">{token.name}</h4>
                                <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-gray-300">{token.symbol}</span>
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <TokenQualityBadge token={token} />
                            </div>

                            <div className="space-y-2 text-sm text-gray-400 mb-6 border-t border-gray-800 pt-3">
                                <div className="flex justify-between">
                                <span>Chain</span>
                                <span className="text-gray-200">{token.chain}</span>
                                </div>
                                <div className="flex justify-between">
                                <span>Supply</span>
                                <span className="text-gray-200">{token.supply.toLocaleString()}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleManageToken(token)}
                                className="w-full py-2 bg-slate-800 hover:bg-yellow-500 hover:text-black rounded-lg transition-colors font-medium text-sm border border-slate-600 hover:border-yellow-500"
                            >
                                Manage Token
                            </button>
                            </div>
                        ))}
                        </div>
                    ) : (
                         <div className="text-center py-8 text-gray-500 border border-dashed border-gray-800 rounded-xl">
                            No created tokens found matching "{searchQuery}"
                        </div>
                    )}
                </>
              )}
            </div>
          </div>
        )}

        {view === ViewState.CREATE_TOKEN && (
          <div>
            <button onClick={() => setView(ViewState.DASHBOARD)} className="mb-6 text-gray-400 hover:text-yellow-400 flex items-center gap-1 transition-colors">
              ← Back to Dashboard
            </button>
            <TokenCreator onTokenCreated={handleTokenCreated} />
          </div>
        )}

        {view === ViewState.MANAGE_TOKEN && selectedToken && (
          <ManageToken 
            token={selectedToken} 
            onBack={() => setView(ViewState.DASHBOARD)} 
            onUpdateToken={handleUpdateToken}
            walletAddress={walletAddress}
          />
        )}

        {view === ViewState.LAUNCHPAD && (
            <Launchpad 
                myTokens={myTokens} 
                launchpads={launchpads} 
                onCreateLaunchpad={handleCreateLaunchpad} 
            />
        )}

        {view === ViewState.TRADE && (
            <TradeInterface />
        )}
      </main>

      <AiAssistant contextHint={getContextHint()} />
    </div>
  );
}

export default App;
