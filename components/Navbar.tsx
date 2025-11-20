import React from 'react';
import { Wallet, Menu, X, LogOut, ChevronDown, Hammer, Rocket, LayoutDashboard } from 'lucide-react';
import { formatAddress } from '../services/walletService';
import { NetworkId } from '../types';

interface NavbarProps {
  address: string | null;
  network: NetworkId;
  isConnecting: boolean;
  activeTab: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onNetworkChange: (net: NetworkId) => void;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  address, 
  network,
  isConnecting, 
  activeTab,
  onConnect,
  onDisconnect,
  onNetworkChange,
  onTabChange
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isNetworkMenuOpen, setIsNetworkMenuOpen] = React.useState(false);

  const getNetworkLabel = (n: NetworkId) => {
    switch(n) {
        case 'bnb-mainnet': return 'BNB Chain';
        case 'bnb-testnet': return 'BNB Testnet';
        case 'solana': return 'Solana';
        case 'solana-devnet': return 'Solana Devnet';
        case 'ton': return 'TON';
        case 'ton-testnet': return 'TON Testnet';
        default: return 'Select Chain';
    }
  };

  const NetworkIcon = ({ n }: { n: NetworkId }) => {
     let color = 'bg-slate-600';
     if (n.includes('bnb')) color = 'bg-yellow-500';
     if (n.includes('solana')) color = 'bg-purple-500';
     if (n.includes('ton')) color = 'bg-blue-500';
     return <div className={`w-2 h-2 rounded-full ${color}`} />;
  }

  const NavItem = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
    <button 
        onClick={() => onTabChange(id)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === id 
            ? 'text-yellow-400 bg-yellow-500/10' 
            : 'text-slate-300 hover:text-yellow-400 hover:bg-slate-800/50'
        }`}
    >
        <Icon size={16} />
        {label}
    </button>
  );

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('dashboard')}>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center text-slate-900 font-bold shadow-lg shadow-orange-500/20">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight">
                KUBA<span className="text-yellow-500">Forge</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Ai Powered</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <NavItem id="dashboard" label="DEX Dashboard" icon={LayoutDashboard} />
            <NavItem id="forge" label="Token Forge" icon={Hammer} />
            <NavItem id="launchpad" label="Launchpad" icon={Rocket} />
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Network Selector */}
            <div className="relative">
                <button 
                    onClick={() => setIsNetworkMenuOpen(!isNetworkMenuOpen)}
                    className="flex items-center gap-2 bg-slate-900 border border-slate-700 text-slate-300 px-3 py-2 rounded-lg text-sm hover:border-slate-600 transition-colors"
                >
                    <NetworkIcon n={network} />
                    {getNetworkLabel(network)}
                    <ChevronDown size={14} />
                </button>
                
                {isNetworkMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
                        <div className="p-1">
                            {(['bnb-mainnet', 'bnb-testnet', 'solana', 'solana-devnet', 'ton', 'ton-testnet'] as NetworkId[]).map((net) => (
                                <button
                                    key={net}
                                    onClick={() => {
                                        onNetworkChange(net);
                                        setIsNetworkMenuOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${network === net ? 'bg-slate-800 text-yellow-400' : 'text-slate-300 hover:bg-slate-800'}`}
                                >
                                    <NetworkIcon n={net} />
                                    {getNetworkLabel(net)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {address ? (
                <div className="flex items-center gap-2">
                    <div className="bg-slate-900 border border-yellow-500/30 rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium text-slate-200 shadow-lg shadow-yellow-900/10">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        {formatAddress(address)}
                    </div>
                    <button 
                        onClick={onDisconnect}
                        className="p-2.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            ) : (
              <button
                onClick={onConnect}
                disabled={isConnecting}
                className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-slate-900 px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wallet size={18} />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="bg-slate-900 p-2 rounded-lg text-slate-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800">
          <div className="px-4 pt-4 pb-6 space-y-3">
             <div className="flex flex-col gap-2">
                <button onClick={() => onTabChange('dashboard')} className="text-left text-slate-300 p-2">Dashboard</button>
                <button onClick={() => onTabChange('forge')} className="text-left text-slate-300 p-2">Token Forge</button>
                <button onClick={() => onTabChange('launchpad')} className="text-left text-slate-300 p-2">Launchpad</button>
             </div>
             <div className="grid grid-cols-2 gap-2 mb-4 mt-4 border-t border-slate-800 pt-4">
                {(['bnb-mainnet', 'bnb-testnet', 'solana', 'solana-devnet', 'ton', 'ton-testnet'] as NetworkId[]).map((net) => (
                    <button
                        key={net}
                        onClick={() => {
                            onNetworkChange(net);
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border ${network === net ? 'bg-yellow-500/10 border-yellow-500 text-yellow-400' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
                    >
                        {getNetworkLabel(net)}
                    </button>
                ))}
             </div>

            {address ? (
                <button onClick={onDisconnect} className="w-full py-3 bg-red-500/10 text-red-400 rounded-xl font-medium">
                    Disconnect {formatAddress(address)}
                </button>
            ) : (
                <button onClick={onConnect} className="w-full py-3 bg-yellow-500 text-slate-900 rounded-xl font-bold">
                    Connect Wallet
                </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};