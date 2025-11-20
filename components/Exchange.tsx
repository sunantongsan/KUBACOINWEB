
import React, { useState } from 'react';
import { ArrowDownUp, Droplets, Settings, Wallet, ArrowDown, Copy, Check, Info, Plus, Flame } from 'lucide-react';
import { KUBA_LOGO_URL, PLATFORM_FEES } from '../types';

export const Exchange: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'swap' | 'liquidity'>('swap');
  const [inputAmount, setInputAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  // Liquidity State
  const [liquidityTon, setLiquidityTon] = useState('');
  const [liquidityKuba, setLiquidityKuba] = useState('');
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);

  const kubaTonAddress = "EQDCCMpdq2lab20fVNcXTx44TrGfAnNDvWiFWt9wDfDUY5YT";
  
  // Fees - UPDATED FROM CONSTANT
  const TRADING_FEE_PERCENT = PLATFORM_FEES.SWAP_PERCENT; 

  const handleCopy = () => {
    navigator.clipboard.writeText(kubaTonAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    if (!inputAmount) return;
    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);
      setInputAmount('');
      const calculatedFee = (parseFloat(inputAmount) * (TRADING_FEE_PERCENT / 100)).toFixed(5);
      alert(`Swap simulated successfully!\n\nSent: ${inputAmount} TON\nReceived: ${(parseFloat(inputAmount) * 850.5).toFixed(2)} KUBA\nFee (${TRADING_FEE_PERCENT}%): ${calculatedFee} TON collected.`);
    }, 2000);
  };

  const handleAddLiquidity = () => {
    if (!liquidityTon || !liquidityKuba) return;
    setIsAddingLiquidity(true);
    setTimeout(() => {
      setIsAddingLiquidity(false);
      setLiquidityTon('');
      setLiquidityKuba('');
      alert("Liquidity added successfully to TON/KUBA pool!");
    }, 2000);
  };
  
  const outputAmount = inputAmount ? (parseFloat(inputAmount) * 850.5).toFixed(2) : '';
  const feeAmount = inputAmount ? (parseFloat(inputAmount) * (TRADING_FEE_PERCENT / 100)).toFixed(5) : '0.00';
  
  return (
    <div className="max-w-3xl mx-auto">
      {/* Featured Token Banner */}
      <div className="mb-8 bg-gradient-to-r from-blue-900/40 to-slate-800 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center overflow-hidden shadow-lg shrink-0">
              <img src={KUBA_LOGO_URL} alt="KUBA" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Trade KUBA on TON
                <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] rounded-full font-bold">NEW</span>
              </h3>
              <div className="flex items-center gap-2 mt-1 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                <code className="text-xs sm:text-sm text-blue-200 font-mono">{kubaTonAddress.substring(0, 6)}...{kubaTonAddress.substring(kubaTonAddress.length - 6)}</code>
                <button onClick={handleCopy} className="text-slate-400 hover:text-white transition-colors">
                  {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
          <div className="text-right">
             <div className="text-sm text-slate-400">Official Contract</div>
             <div className="text-xs text-slate-500 break-all font-mono mt-1 max-w-[200px] hidden md:block">
               {kubaTonAddress}
             </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 inline-flex shadow-md">
          <button
            onClick={() => setActiveTab('swap')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'swap' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Swap
          </button>
          <button
            onClick={() => setActiveTab('liquidity')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'liquidity' ? 'bg-green-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Liquidity
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {activeTab === 'swap' ? (
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="text-white font-bold flex items-center gap-2">
                 Swap <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20 flex items-center gap-1"><Flame size={10}/> Lowest Fees {TRADING_FEE_PERCENT}%</span>
              </h3>
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
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px]">T</div>
                  TON
                  <ArrowDown size={14} />
                </button>
              </div>
            </div>

            {/* Swap Arrow */}
            <div className="flex justify-center -my-3 relative z-10">
              <button className="bg-slate-700 border-4 border-slate-800 rounded-xl p-2 text-white hover:scale-110 hover:bg-green-600 transition-all shadow-lg">
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
                  value={outputAmount}
                  readOnly
                  className="bg-transparent text-2xl font-bold text-green-400 w-full outline-none placeholder:text-slate-600"
                />
                <button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg font-bold transition-colors shrink-0 border border-green-500/30">
                  <div className="w-5 h-5 rounded-full bg-slate-900 overflow-hidden flex items-center justify-center text-[10px] text-white">
                    <img src={KUBA_LOGO_URL} alt="K" className="w-full h-full object-cover" />
                  </div>
                  KUBA
                  <ArrowDown size={14} />
                </button>
              </div>
            </div>

            {/* Details */}
            {inputAmount && (
              <div className="mt-4 p-3 bg-slate-700/30 rounded-lg text-xs text-slate-400 space-y-2">
                <div className="flex justify-between">
                  <span>Rate</span>
                  <span>1 TON ≈ 850.5 KUBA</span>
                </div>
                <div className="flex justify-between">
                  <span>Route</span>
                  <span className="text-blue-400">TON &gt; KUBA</span>
                </div>
                <div className="h-px bg-slate-700/50 my-2"></div>
                <div className="flex justify-between text-emerald-400">
                  <span className="flex items-center gap-1"><Info size={10} /> Trading Fee ({TRADING_FEE_PERCENT}%)</span>
                  <span>{feeAmount} TON</span>
                </div>
              </div>
            )}

            <button 
              onClick={handleSwap}
              disabled={isSwapping || !inputAmount}
              className="w-full mt-4 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-colors text-lg shadow-lg shadow-green-900/20 disabled:opacity-50"
            >
              {isSwapping ? 'Swapping...' : 'Swap Now'}
            </button>
          </div>
        ) : (
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
             {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Droplets className="text-blue-400" size={20}/>
                Add Liquidity
              </h3>
              <div className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                Pool: TON / KUBA
              </div>
            </div>

            {/* Input 1: TON */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 mb-2 hover:border-blue-500/30 transition-colors">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Input Amount</span>
                <span>Balance: 0.00</span>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="number" 
                  placeholder="0.0" 
                  value={liquidityTon}
                  onChange={(e) => setLiquidityTon(e.target.value)}
                  className="bg-transparent text-xl font-bold text-white w-full outline-none placeholder:text-slate-600"
                />
                <div className="flex items-center gap-2 bg-slate-700 px-3 py-1.5 rounded-lg font-bold shrink-0">
                   <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white">T</div>
                   TON
                </div>
              </div>
            </div>

            {/* Plus Icon */}
            <div className="flex justify-center -my-3 relative z-10">
              <div className="bg-slate-800 border-2 border-slate-700 rounded-full p-1 text-slate-400">
                <Plus size={16} />
              </div>
            </div>

            {/* Input 2: KUBA */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 mt-2 hover:border-green-500/30 transition-colors">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Input Amount</span>
                <span>Balance: 0.00</span>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="number" 
                  placeholder="0.0" 
                  value={liquidityKuba}
                  onChange={(e) => setLiquidityKuba(e.target.value)}
                  className="bg-transparent text-xl font-bold text-white w-full outline-none placeholder:text-slate-600"
                />
                <div className="flex items-center gap-2 bg-slate-700 px-3 py-1.5 rounded-lg font-bold shrink-0 border border-green-500/30">
                   <div className="w-5 h-5 rounded-full bg-slate-900 overflow-hidden flex items-center justify-center text-[10px] text-white">
                    <img src={KUBA_LOGO_URL} alt="K" className="w-full h-full object-cover" />
                  </div>
                   KUBA
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-700/30 rounded-lg text-xs text-slate-400 flex justify-between items-center">
               <div className="flex items-center gap-1">
                 <Info size={12} />
                 <span>Estimated Share</span>
               </div>
               <span className="text-white font-bold">&lt; 0.01%</span>
            </div>

            <button 
              onClick={handleAddLiquidity}
              disabled={isAddingLiquidity || !liquidityTon || !liquidityKuba}
              className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isAddingLiquidity ? 'Providing Liquidity...' : (
                <>
                  <Plus size={18} />
                  Add Liquidity
                </>
              )}
            </button>

            <div className="mt-6 pt-6 border-t border-slate-700">
               <h4 className="text-sm font-semibold text-slate-300 mb-4">Your Active Pools</h4>
               <div className="text-center text-sm text-slate-500 py-4">
                 No active liquidity positions found.
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
