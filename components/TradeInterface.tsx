
import React, { useState } from 'react';
import { ArrowRightLeft, TrendingUp, ChevronDown, Search, Star } from 'lucide-react';
import { CHAIN_CONFIG } from '../constants';
import { ChainType } from '../types';

export const TradeInterface: React.FC = () => {
  const [selectedChain, setSelectedChain] = useState<ChainType>(ChainType.BNB);
  const [amountIn, setAmountIn] = useState('');
  const [isBuy, setIsBuy] = useState(true);

  // Mock Order Book Data
  const asks = Array.from({length: 8}, (_, i) => ({ price: (320.5 + (i * 0.1)).toFixed(2), amount: (Math.random() * 5).toFixed(4) })).reverse();
  const bids = Array.from({length: 8}, (_, i) => ({ price: (320.4 - (i * 0.1)).toFixed(2), amount: (Math.random() * 5).toFixed(4) }));

  const currentCurrency = CHAIN_CONFIG[selectedChain].currency;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-4 pb-4">
       {/* Left Column: Chart & Info */}
       <div className="flex-1 flex flex-col gap-4">
          {/* Token Header */}
          <div className="bg-card border border-gray-700 rounded-xl p-4 flex items-center justify-between">
             <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-800 px-2 py-1 rounded transition-colors">
                     <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black font-bold">K</div>
                     <div>
                         <h3 className="font-bold text-white flex items-center gap-1">KUBA / {currentCurrency} <ChevronDown className="w-4 h-4"/></h3>
                         <span className="text-xs text-gray-400">KUBA Token</span>
                     </div>
                 </div>
                 <div className="h-8 w-px bg-gray-700"></div>
                 <div className="flex flex-col">
                     <span className="text-2xl font-bold text-green-400">320.45</span>
                     <span className="text-xs text-gray-400">≈ $320.45</span>
                 </div>
                 <div className="hidden md:flex flex-col">
                     <span className="text-xs text-gray-400">24h Change</span>
                     <span className="text-sm text-green-400">+5.23%</span>
                 </div>
                 <div className="hidden md:flex flex-col">
                     <span className="text-xs text-gray-400">24h Volume</span>
                     <span className="text-sm text-white">1.2M {currentCurrency}</span>
                 </div>
             </div>
             <div className="flex gap-2">
                {[ChainType.BNB, ChainType.SOL, ChainType.TON].map(chain => (
                    <button 
                        key={chain}
                        onClick={() => setSelectedChain(chain)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border ${selectedChain === chain ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400' : 'border-gray-700 text-gray-500'}`}
                    >
                        {CHAIN_CONFIG[chain].currency}
                    </button>
                ))}
             </div>
          </div>

          {/* Chart Area (Mock) */}
          <div className="flex-1 bg-card border border-gray-700 rounded-xl p-4 relative overflow-hidden flex flex-col">
             <div className="flex gap-4 mb-4 text-xs font-bold text-gray-500 border-b border-gray-800 pb-2">
                 <span className="text-yellow-500 cursor-pointer">TradingView</span>
                 <span className="hover:text-white cursor-pointer">Depth</span>
                 <div className="ml-auto flex gap-2">
                     {['15m', '1H', '4H', '1D', '1W'].map(tf => (
                         <span key={tf} className="hover:text-white cursor-pointer">{tf}</span>
                     ))}
                 </div>
             </div>
             <div className="flex-1 flex items-center justify-center bg-slate-900/50 rounded border border-dashed border-gray-800 relative">
                 {/* Simulated Candlesticks Visual */}
                 <div className="absolute inset-0 flex items-end justify-around px-10 py-10 opacity-50">
                     {Array.from({length: 20}).map((_, i) => {
                         const height = Math.random() * 60 + 20;
                         const isGreen = Math.random() > 0.5;
                         return (
                             <div key={i} className="flex flex-col items-center gap-1">
                                 <div className={`w-0.5 h-full ${isGreen ? 'bg-green-500/30' : 'bg-red-500/30'}`}></div>
                                 <div 
                                    className={`w-3 ${isGreen ? 'bg-green-500' : 'bg-red-500'}`} 
                                    style={{height: `${height}%`}}
                                 ></div>
                             </div>
                         )
                     })}
                 </div>
                 <div className="z-10 text-center">
                     <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                     <p className="text-gray-500 text-sm">Chart Data Unavailable (Simulation Mode)</p>
                 </div>
             </div>
          </div>
       </div>

       {/* Right Column: Order Book & Trade */}
       <div className="w-full lg:w-80 flex flex-col gap-4">
           {/* Order Book */}
           <div className="h-1/2 bg-card border border-gray-700 rounded-xl p-4 flex flex-col text-xs">
               <div className="flex justify-between text-gray-500 mb-2">
                   <span>Price ({currentCurrency})</span>
                   <span>Amount</span>
                   <span>Total</span>
               </div>
               <div className="flex-1 overflow-hidden space-y-1">
                   {asks.map((ask, i) => (
                       <div key={`ask-${i}`} className="flex justify-between text-red-400 relative group cursor-pointer hover:bg-slate-800">
                           <span className="relative z-10">{ask.price}</span>
                           <span className="text-gray-400 relative z-10">{ask.amount}</span>
                           <span className="text-gray-500 relative z-10">{(parseFloat(ask.price) * parseFloat(ask.amount)).toFixed(1)}</span>
                           <div className="absolute top-0 right-0 h-full bg-red-500/10 transition-all" style={{width: `${Math.random() * 100}%`}}></div>
                       </div>
                   ))}
               </div>
               <div className="py-3 border-y border-gray-800 my-2 text-center">
                   <span className="text-lg font-bold text-green-400">320.45</span>
                   <span className="text-xs text-gray-500 ml-2">≈ $320.45</span>
               </div>
               <div className="flex-1 overflow-hidden space-y-1">
                   {bids.map((bid, i) => (
                       <div key={`bid-${i}`} className="flex justify-between text-green-400 relative group cursor-pointer hover:bg-slate-800">
                           <span className="relative z-10">{bid.price}</span>
                           <span className="text-gray-400 relative z-10">{bid.amount}</span>
                           <span className="text-gray-500 relative z-10">{(parseFloat(bid.price) * parseFloat(bid.amount)).toFixed(1)}</span>
                           <div className="absolute top-0 right-0 h-full bg-green-500/10 transition-all" style={{width: `${Math.random() * 100}%`}}></div>
                       </div>
                   ))}
               </div>
           </div>

           {/* Swap Box */}
           <div className="bg-card border border-gray-700 rounded-xl p-4 flex-1 flex flex-col">
               <div className="flex bg-slate-900 p-1 rounded-lg mb-4">
                   <button 
                    onClick={() => setIsBuy(true)}
                    className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${isBuy ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-white'}`}
                   >
                       Buy
                   </button>
                   <button 
                    onClick={() => setIsBuy(false)}
                    className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${!isBuy ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white'}`}
                   >
                       Sell
                   </button>
               </div>

               <div className="space-y-4">
                   <div>
                       <label className="text-xs text-gray-400 flex justify-between mb-1">
                           <span>Available</span>
                           <span>0.00 {isBuy ? currentCurrency : 'KUBA'}</span>
                       </label>
                       <div className="bg-dark border border-gray-600 rounded-lg flex items-center px-3 py-2 focus-within:border-yellow-500 transition-colors">
                           <input 
                             type="number" 
                             value={amountIn}
                             onChange={(e) => setAmountIn(e.target.value)}
                             className="bg-transparent w-full text-white font-mono focus:outline-none"
                             placeholder="0.0"
                           />
                           <span className="text-sm font-bold text-gray-400 ml-2">{isBuy ? currentCurrency : 'KUBA'}</span>
                       </div>
                   </div>
                   
                   <div className="space-y-2">
                       <div className="flex justify-between text-xs">
                           <span className="text-gray-500">Est. Fee (3% + Gas)</span>
                           <span className="text-gray-300">0.002 {currentCurrency}</span>
                       </div>
                       <div className="flex justify-between text-xs">
                           <span className="text-gray-500">Total Received</span>
                           <span className="text-yellow-500 font-bold">0.00</span>
                       </div>
                   </div>

                   <button className={`w-full py-3 rounded-xl font-bold text-white mt-auto ${isBuy ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'} transition-all shadow-lg`}>
                       {isBuy ? 'Buy KUBA' : 'Sell KUBA'}
                   </button>
               </div>
           </div>
       </div>
    </div>
  );
};
