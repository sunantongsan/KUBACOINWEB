
import React from 'react';
import { LayoutDashboard, TrendingUp, MessageSquare, Wallet, Factory, Repeat, Rocket } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const menuItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: View.MARKET_ANALYSIS, label: 'Market Insights', icon: <TrendingUp size={20} /> },
    { id: View.CHAT, label: 'AI Assistant', icon: <MessageSquare size={20} /> },
    { type: 'divider' },
    { id: View.EXCHANGE, label: 'Swap & Liquidity', icon: <Repeat size={20} /> },
    { id: View.TOKEN_FACTORY, label: 'Token Factory', icon: <Factory size={20} /> },
    { id: View.LAUNCHPAD, label: 'Launchpad', icon: <Rocket size={20} /> },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-800 border-r border-slate-700 h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-lg flex items-center justify-center text-white font-bold">
          K
        </div>
        <span className="text-xl font-bold text-white tracking-tight">Kubacoin</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item, index) => 
          item.type === 'divider' ? (
            <div key={`divider-${index}`} className="h-px bg-slate-700 my-4 mx-2" />
          ) : (
            <button
              key={item.id}
              onClick={() => item.id && setCurrentView(item.id as View)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentView === item.id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          )
        )}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-700">
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600">
          <h3 className="text-white font-semibold mb-1">Multi-Chain Ready</h3>
          <p className="text-xs text-slate-400 mb-3">BNB • SOL • TON</p>
          <button className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-2">
            <Wallet size={14} />
            Connect Wallet
          </button>
        </div>
      </div>
    </aside>
  );
};
