import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3, Coins, Droplets } from 'lucide-react';
import { TokenData } from '../types';

interface HeroStatsProps {
  data: TokenData;
}

export const HeroStats: React.FC<HeroStatsProps> = ({ data }) => {
  const isPositive = data.change24h >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      
      {/* Price Card */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-all"></div>
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
            <DollarSign size={20} />
          </div>
          <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {isPositive ? '+' : ''}{data.change24h}%
          </span>
        </div>
        <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider">Price (KUBA)</h3>
        <p className="text-2xl font-bold text-white mt-1">${data.price.toFixed(4)}</p>
      </div>

      {/* Market Cap */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
            <Activity size={20} />
          </div>
        </div>
        <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider">Market Cap</h3>
        <p className="text-2xl font-bold text-white mt-1">${(data.marketCap / 1000000).toFixed(2)}M</p>
      </div>

      {/* Volume */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
            <BarChart3 size={20} />
          </div>
        </div>
        <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider">Volume (24h)</h3>
        <p className="text-2xl font-bold text-white mt-1">${(data.volume24h / 1000).toFixed(2)}K</p>
      </div>

      {/* Supply */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
            <Coins size={20} />
          </div>
        </div>
        <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider">Total Supply</h3>
        <p className="text-2xl font-bold text-white mt-1">{(data.supply / 1000000).toFixed(1)}M</p>
      </div>

      {/* Liquidity */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-500">
            <Droplets size={20} />
          </div>
        </div>
        <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider">Liquidity Pool Size</h3>
        <p className="text-2xl font-bold text-white mt-1">${(data.liquidity / 1000).toFixed(2)}K</p>
      </div>
    </div>
  );
};