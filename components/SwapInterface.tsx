import React, { useState } from 'react';
import { ArrowDown, Settings, Wallet, AlertTriangle, CheckCircle2, RefreshCcw } from 'lucide-react';
import { NetworkId, WalletState } from '../types';
import { ethers } from 'ethers';
import { TREASURY_WALLETS } from '../services/walletService';

interface SwapInterfaceProps {
  wallet: WalletState;
  onConnect: () => void;
}

export const SwapInterface: React.FC<SwapInterfaceProps> = ({ wallet, onConnect }) => {
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  
  // Mock Price Logic (1 Native = 1000 KUBA)
  const PRICE_RATE = 1000;

  const getNativeSymbol = () => {
    if (wallet.network.includes('bnb')) return 'BNB';
    if (wallet.network.includes('solana')) return 'SOL';
    if (wallet.network.includes('ton')) return 'TON';
    return 'ETH';
  };

  const handleAmountInChange = (val: string) => {
      setAmountIn(val);
      if (!val) {
          setAmountOut('');
          return;
      }
      const num = parseFloat(val);
      if (!isNaN(num)) {
          // Fee is 1%, so user gets 99% of value swapped
          const netInput = num * 0.99;
          setAmountOut((netInput * PRICE_RATE).toFixed(4));
      }
  };

  const handleSwap = async () => {
      if (!wallet.isConnected) {
          onConnect();
          return;
      }

      const numIn = parseFloat(amountIn);
      if (isNaN(numIn) || numIn <= 0) {
          setStatus({ type: 'error', msg: 'Enter a valid amount' });
          return;
      }

      setIsProcessing(true);
      setStatus(null);

      try {
          // 1. Calculate 1% Fee
          const feeAmount = numIn * 0.01;
          const feeString = feeAmount.toFixed(18); // Avoid scientific notation

          if (wallet.network.includes('bnb')) {
              if (!window.ethereum) throw new Error("MetaMask not found");
              const provider = new ethers.BrowserProvider(window.ethereum);
              const signer = await provider.getSigner();

              // Real Transaction: Send Fee to Treasury
              const tx = await signer.sendTransaction({
                  to: TREASURY_WALLETS.BNB,
                  value: ethers.parseEther(feeString)
              });
              await tx.wait(1);

              // Simulate the Swap (In real app, interaction with Router Contract)
              setStatus({ 
                  type: 'success', 
                  msg: `Swapped ${amountIn} ${getNativeSymbol()} for ${amountOut} KUBA! (Fee: ${feeAmount} ${getNativeSymbol()} paid to platform)` 
              });
          } else {
              // Simulate for SOL/TON
              await new Promise(resolve => setTimeout(resolve, 2000));
              setStatus({ 
                  type: 'success', 
                  msg: `Swapped ${amountIn} ${getNativeSymbol()} for ${amountOut} KUBA! (Fee: ${feeAmount} ${getNativeSymbol()} deducted)` 
              });
          }
          
          setAmountIn('');
          setAmountOut('');

      } catch (err: any) {
          console.error(err);
          setStatus({ type: 'error', msg: err.message || 'Swap failed' });
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <div className="max-w-md mx-auto mt-10 animate-slideUp">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-2 shadow-2xl">
            <div className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <h2 className="text-white font-bold text-lg">Swap</h2>
                   <span className="bg-yellow-500/10 text-yellow-500 text-xs font-bold px-2 py-1 rounded-full">1% Fee</span>
                </div>
                <button className="text-slate-400 hover:text-white transition-colors">
                    <Settings size={20} />
                </button>
            </div>

            <div className="relative">
                {/* Input Token */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors mb-2">
                    <div className="flex justify-between mb-2">
                        <label className="text-slate-400 text-xs font-medium">You Pay</label>
                        <span className="text-slate-400 text-xs">Balance: {wallet.balance}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <input 
                            type="number" 
                            value={amountIn}
                            onChange={(e) => handleAmountInChange(e.target.value)}
                            placeholder="0.0"
                            className="bg-transparent text-3xl font-bold text-white placeholder-slate-600 outline-none w-full"
                        />
                        <div className="bg-slate-800 flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0">
                             <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${wallet.network.includes('bnb') ? 'bg-[#F0B90B] text-white' : wallet.network.includes('solana') ? 'bg-black border border-slate-700 text-white' : 'bg-blue-500 text-white'}`}>
                                 {getNativeSymbol()[0]}
                             </div>
                             <span className="text-white font-bold">{getNativeSymbol()}</span>
                        </div>
                    </div>
                </div>

                {/* Swap Arrow */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="bg-slate-800 border-4 border-slate-900 p-2 rounded-xl text-slate-400">
                        <ArrowDown size={20} />
                    </div>
                </div>

                {/* Output Token */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex justify-between mb-2">
                        <label className="text-slate-400 text-xs font-medium">You Receive</label>
                    </div>
                    <div className="flex items-center gap-4">
                         <input 
                            type="text" 
                            value={amountOut}
                            readOnly
                            placeholder="0.0"
                            className="bg-transparent text-3xl font-bold text-white placeholder-slate-600 outline-none w-full"
                        />
                        <div className="bg-slate-800 flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0">
                             <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-[8px] font-bold text-black">
                                 K
                             </div>
                             <span className="text-white font-bold">KUBA</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Price Info */}
            {amountIn && (
                <div className="px-4 py-3 flex justify-between items-center text-xs text-slate-400">
                    <span>Price</span>
                    <div className="flex items-center gap-1">
                        <span>1 {getNativeSymbol()} = {PRICE_RATE} KUBA</span>
                        <RefreshCcw size={12} />
                    </div>
                </div>
            )}

            {/* Status Messages */}
            {status && (
                 <div className={`m-4 p-3 rounded-xl flex items-center gap-3 text-sm ${status.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                    {status.msg}
                 </div>
            )}

            {/* Action Button */}
            <div className="p-2">
                <button 
                    onClick={handleSwap}
                    disabled={isProcessing}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all shadow-lg ${
                        !wallet.isConnected 
                        ? 'bg-slate-800 text-blue-400 hover:bg-slate-700'
                        : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-slate-900 hover:scale-[1.02]'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {!wallet.isConnected ? (
                        <span className="flex items-center justify-center gap-2">Connect Wallet</span>
                    ) : isProcessing ? (
                        'Swapping...'
                    ) : (
                        'Swap'
                    )}
                </button>
            </div>
        </div>
        
        <div className="mt-6 text-center">
            <p className="text-slate-500 text-sm">
                Trade safely. <span className="text-yellow-500">1% Fee</span> applies to all trades to support the ecosystem.
            </p>
        </div>
    </div>
  );
};