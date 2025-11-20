
import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { ChatInterface } from './components/ChatInterface';
import { MarketAnalysis } from './components/MarketAnalysis';
import { Sidebar } from './components/Sidebar';
import { TokenFactory } from './components/TokenFactory';
import { Exchange } from './components/Exchange';
import { Launchpad } from './components/Launchpad';
import { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);

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
        return <TokenFactory />;
      case View.LAUNCHPAD:
        return <Launchpad />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-900 text-slate-200">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 relative">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500">
                Kubacoin Web
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Multi-Chain DeFi Ecosystem & AI Intelligence
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full border border-slate-700">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-medium text-green-400">System Operational</span>
            </div>
          </header>
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
