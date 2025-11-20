
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { ChatInterface } from './components/ChatInterface';
import { MarketAnalysis } from './components/MarketAnalysis';
import { Sidebar } from './components/Sidebar';
import { TokenFactory } from './components/TokenFactory';
import { Exchange } from './components/Exchange';
import { Launchpad } from './components/Launchpad';
import { View, PLATFORM_FEES } from './types';
import { Wallet, Globe, ShieldCheck, AlertTriangle, X, Percent, Sparkles } from 'lucide-react';
import { BlockchainService } from './services/blockchain';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isTestnet, setIsTestnet] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [blockchainService] = useState(new BlockchainService());
  const [showPromo, setShowPromo] = useState(true);

  const handleConnect = async () => {
    const data = await blockchainService.connectWallet();
    if (data) {
      setWalletAddress(data.address);
    }
  };

  const toggleNetwork = async () => {
    const newState = !isTestnet;
    const success = await blockchainService.switchNetwork(newState);
    if (success) {
      setIsTestnet(newState);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard />;
      case View.MARKET_ANALYSIS:
        return <MarketAnalysis />;
      case View.CHAT:
        return <ChatInterface />;
      case View.EXCHANGE:
        return <Exchange />;
      case View.TOKEN_FACTORY:
        return <TokenFactory isTestnet={isTestnet} walletAddress={walletAddress} blockchainService={blockchainService} />;
      case View.LAUNCHPAD:
        return <Launchpad />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-900 text-slate-200">
      {/* Promotional Modal */}
      {showPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900/20 border-2 border-yellow-500/50 rounded-2xl max-w-md w-full p-8 relative shadow-2xl shadow-yellow-500/10 transform animate-in fade-in scale-95 duration-300">
            <button 
              onClick={() => setShowPromo(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full p-1 transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="flex justify-center mb-6 relative">
              <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full"></div>
              <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/40 animate-bounce relative z-10">
                <Sparkles size={40} className="text-slate-900 font-bold" />
              </div>
            </div>
            
            <h2 className="text-4xl font-black text-center text-white mb-3 leading-tight">
              You've Arrived.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 text-2xl mt-1">The World's Lowest Fees Are Here.</span>
            </h2>
            
            <p className="text-center text-slate-300 mb-8 leading-relaxed">
              Stop searching. You have found the <span className="text-white font-bold">absolute best rates</span> in the global market. Why pay more elsewhere?
            </p>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between bg-slate-800/80 p-4 rounded-xl border border-yellow-500/20 shadow-lg relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500"></div>
                <span className="text-slate-300 font-medium">Trading Fee</span>
                <div className="flex items-baseline gap-2">
                   <span className="text-xs text-slate-500 line-through decoration-red-500">0.25%</span>
                   <span className="text-yellow-400 font-black text-2xl">{PLATFORM_FEES.SWAP_PERCENT}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <span className="text-slate-400">Launchpad Fee</span>
                <div className="flex items-baseline gap-2">
                   <span className="text-xs text-slate-500 line-through decoration-red-500">5.0%</span>
                   <span className="text-green-400 font-bold text-lg">{PLATFORM_FEES.LAUNCHPAD_PERCENT}%</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => { setShowPromo(false); setCurrentView(View.EXCHANGE); }}
              className="w-full py-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 hover:from-yellow-400 hover:via-orange-400 hover:to-yellow-400 text-slate-900 font-black text-xl rounded-xl transition-all shadow-lg shadow-orange-500/20 transform hover:scale-[1.02] active:scale-95"
            >
              Start Trading with Best Rates
            </button>
            
            <p className="text-center text-xs text-slate-500 mt-4">
              *Lowest fees guaranteed compared to major DEX standards.
            </p>
          </div>
        </div>
      )}

      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 relative">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-20 bg-slate-900/90 backdrop-blur-sm py-4 border-b border-slate-800/50">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-green-500 to-emerald-500">
                Kubacoin Web
              </h1>
              <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                Multi-Chain DeFi Ecosystem 
                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-yellow-400 flex items-center gap-1">
                  {isTestnet ? <AlertTriangle size={10} /> : <ShieldCheck size={10} />}
                  {isTestnet ? 'Testnet Mode' : 'Mainnet Mode'}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button 
                onClick={toggleNetwork}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                  isTestnet 
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20' 
                  : 'bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20'
                }`}
              >
                <Globe size={14} />
                {isTestnet ? 'Switch to Mainnet' : 'Switch to Testnet'}
              </button>
              
              <button 
                onClick={handleConnect}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors shadow-lg border ${
                  walletAddress 
                  ? 'bg-slate-800 border-green-500/50 text-green-400 shadow-green-900/10'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-900/20 border-green-500/20'
                }`}
              >
                <Wallet size={18} />
                <span className="hidden sm:inline">
                  {walletAddress 
                    ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`
                    : 'Connect Wallet'}
                </span>
              </button>
            </div>
          </header>
          <div className="pt-2">
            {renderView()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
