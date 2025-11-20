import React, { useState } from 'react';
import { ArrowDownUp, Droplets, Settings, Wallet, ArrowDown } from 'lucide-react';

export const Exchange: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'swap' | 'liquidity'>('swap');
  const [inputAmount, setInputAmount] = useState('');
  
  return (
    <div className="max-w-lg mx-auto">
      <div className="flex justify-center mb-6">
        <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 inline-flex">
          <button
            onClick={() => setActiveTab('swap')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'swap' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Swap
          </button>
          <button
            onClick={() => setActiveTab('liquidity')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'liquidity' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Liquidity
          </button>
        </div>
      </div>

      {activeTab === 'swap' ? (
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-white font-bold">Swap</h3>
            <button className="text-slate-400 hover:text-white"><Settings size={18} /></button>
          </div>

          {/* From Input */}
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>You Pay</span>
              <span>Balance: 0.00</span>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="number" 
                placeholder="0.0" 
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                className="bg-transparent text-2xl font-bold text-white w-full outline-none placeholder:text-slate-600"
              />
              <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0">
                <div className="w-5 h-5 rounded-full bg-yellow-500"></div>
                BNB
                <ArrowDown size={14} />
              </button>
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center -my-3 relative z-10">
            <button className="bg-slate-700 border-4 border-slate-800 rounded-xl p-2 text-white hover:scale-110 transition-transform">
              <ArrowDownUp size={18} />
            </button>
          </div>

          {/* To Input */}
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>You Receive</span>
              <span>Balance: 0.00</span>
            </div>
            <div className="flex items-center gap-4">
              <input 
                type="number" 
                placeholder="0.0" 
                value={inputAmount ? (parseFloat(inputAmount) * 1240.5).toFixed(2) : ''}
                readOnly
                className="bg-transparent text-2xl font-bold text-emerald-400 w-full outline-none placeholder:text-slate-600"
              />
              <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px]">K</div>
                KUB
                <ArrowDown size={14} />
              </button>
            </div>
          </div>

          {/* Details */}
          {inputAmount && (
            <div className="mt-4 p-3 bg-slate-700/30 rounded-lg text-xs text-slate-400 space-y-2">
              <div className="flex justify-between">
                <span>Rate</span>
                <span>1 BNB ≈ 1,240.5 KUB</span>
              </div>
              <div className="flex justify-between">
                <span>Network Fee</span>
                <span>~$0.45</span>
              </div>
            </div>
          )}

          <button className="w-full mt-4 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors text-lg shadow-lg shadow-emerald-900/20">
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-2xl">
          <div className="text-center py-8">
            <div className="bg-slate-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
              <Droplets size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Your Liquidity</h3>
            <p className="text-slate-400 text-sm mb-6">
              Connect wallet to view your liquidity positions or add new liquidity to earn fees.
            </p>
            <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
              <Wallet size={18} />
              Connect Wallet
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700">
             <h4 className="text-sm font-semibold text-slate-300 mb-4">Popular Pools</h4>
             <div className="space-y-3">
               {['BNB/KUB', 'USDT/KUB', 'SOL/KUB'].map(pool => (
                 <div key={pool} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-700/50 hover:border-emerald-500/30 transition-colors cursor-pointer">
                   <div className="flex items-center gap-2">
                     <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-slate-600 border border-slate-800"></div>
                        <div className="w-6 h-6 rounded-full bg-emerald-600 border border-slate-800"></div>
                     </div>
                     <span className="text-white font-medium text-sm">{pool}</span>
                   </div>
                   <span className="text-emerald-400 text-xs font-bold">APR 45%</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};