
import React from 'react';
import { LayoutDashboard, TrendingUp, MessageSquare, Factory, Repeat, Rocket } from 'lucide-react';
import { View, KUBA_LOGO_URL } from '../types';

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
    <aside className="hidden md:flex flex-col w-64 bg-slate-800 border-r border-slate-700 h-full shadow-xl z-30">
      <div className="p-6 flex items-center gap-3 border-b border-slate-700/50">
        <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg shadow-green-500/20 border-2 border-slate-800 ring-2 ring-green-500/30 bg-slate-900">
          <img 
            src={KUBA_LOGO_URL} 
            alt="Kubacoin Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">Kubacoin</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => 
          item.type === 'divider' ? (
            <div key={`divider-${index}`} className="h-px bg-slate-700/50 my-4 mx-2" />
          ) : (
            <button
              key={item.id}
              onClick={() => item.id && setCurrentView(item.id as View)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                currentView === item.id
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
              }`}
            >
              <span className={currentView === item.id ? 'text-green-400' : 'text-slate-500 group-hover:text-slate-300'}>
                {item.icon}
              </span>
              <span className="font-medium">{item.label}</span>
            </button>
          )
        )}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <div className="flex justify-center space-x-4 text-xs text-slate-500">
          <span className="hover:text-yellow-400 transition-colors cursor-default">BNB</span>
          <span className="text-slate-700">•</span>
          <span className="hover:text-purple-400 transition-colors cursor-default">SOL</span>
          <span className="text-slate-700">•</span>
          <span className="hover:text-blue-400 transition-colors cursor-default font-bold text-blue-400">TON</span>
        </div>
        <p className="text-[10px] text-slate-600 text-center mt-2">
          v2.0.3 YellowGreen
        </p>
      </div>
    </aside>
  );
};
