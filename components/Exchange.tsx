
import React, { useState, useEffect } from 'react';
import { ArrowDownUp, Droplets, Settings, Wallet, ArrowDown, Copy, Check, Info, Plus, Flame, CheckCircle, X, ExternalLink, Loader2, AlertCircle, Lock, Zap } from 'lucide-react';
import { KUBA_LOGO_URL, PLATFORM_FEES } from '../types';
import { BlockchainService } from '../services/blockchain';

interface ExchangeProps {
  walletAddress?: string | null;
}

export const Exchange: React.FC<ExchangeProps> = ({ walletAddress }) => {
  const [activeTab, setActiveTab] = useState<'swap' | 'liquidity'>('swap');
  const [inputAmount, setInputAmount] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [swapSuccess, setSwapSuccess] = useState<{
    sent: string;
    received: string;
    fee: string;
    hash: string;
  } | null>(null);

  // Balances
  const [bnbBalance, setBnbBalance] = useState('0.00');
  const [kubaBalance, setKubaBalance] = useState('0.00');
  const [liquidityTokenBalance, setLiquidityTokenBalance] = useState('0.00');

  // Liquidity State
  const [liquidityBnB, setLiquidityBnB] = useState('');
  const [liquidityTokenAmount, setLiquidityTokenAmount] = useState('');
  const [liquidityTokenAddress, setLiquidityTokenAddress] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isAddingLiquidity, setIsAddingLiquidity] = useState(false);
  const [isApproved, setIsApproved] = useState(false); // Track if token is approved
  
  const [blockchainService] = useState(new BlockchainService());

  const kubaTonAddress = "EQDCCMpdq2lab20fVNcXTx44TrGfAnNDvWiFWt9wDfDUY5YT";
  const TARGET_TOKEN_ADDRESS = "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7"; 

  const fetchBalances = async () => {
    if (!walletAddress) {
        setBnbBalance('0.00');
        setKubaBalance('0.00');
        setLiquidityTokenBalance('0.00');
        return;
    }

    // Fetch BNB
    const bnb = await blockchainService.getBNBBalance(walletAddress);
    setBnbBalance(parseFloat(bnb).toFixed(4));

    // Fetch Target Token (KUBA)
    const kuba = await blockchainService.getTokenBalance(TARGET_TOKEN_ADDRESS, walletAddress);
    setKubaBalance(parseFloat(kuba).toFixed(2));

    // Fetch Liquidity Token if address provided
    if (liquidityTokenAddress && liquidityTokenAddress.length > 10) {
        const liq = await blockchainService.getTokenBalance(liquidityTokenAddress, walletAddress);
        setLiquidityTokenBalance(parseFloat(liq).toFixed(2));
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [walletAddress, liquidityTokenAddress]);

  const handleCopy = () => {
    navigator.clipboard.writeText(kubaTonAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickBuy = () => {
    setActiveTab('swap');
    setInputAmount('1');
    // Smooth scroll to the swap card area
    const swapCard = document.getElementById('swap-interface');
    if (swapCard) {
      swapCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 200, behavior: 'smooth' });
    }
  };

  const outputAmount = inputAmount ? (parseFloat(inputAmount) * 850.5).toFixed(2) : '';
  const feeAmount = inputAmount ? (parseFloat(inputAmount) * (PLATFORM_FEES.SWAP_PERCENT / 100)).toFixed(5) : '0.00';

  const handleSwap = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }
    if (!inputAmount || parseFloat(inputAmount) <= 0) return;
    
    setError(null);
    setIsSwapping(true);
    setSwapSuccess(null);

    try {
      const isTestnet = true; 
      const txHash = await blockchainService.swapBNBForTokens(
        inputAmount, 
        TARGET_TOKEN_ADDRESS, 
        isTestnet
      );

      if (txHash) {
         const currentOutput = (parseFloat(inputAmount) * 850.5).toFixed(2); 
         setSwapSuccess({
          sent: inputAmount,
          received: currentOutput,
          fee: feeAmount,
          hash: txHash
        });
        setInputAmount('');
        await fetchBalances(); // Update balances after swap
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 4001 || (err.info && err.info.error && err.info.error.code === 4001)) {
         setError("Transaction rejected by user.");
      } else {
         setError("Swap failed. Insufficient funds or network error.");
      }
    } finally {
      setIsSwapping(false);
    }
  };

  const handleApprove = async () => {
    if(!liquidityTokenAddress || !liquidityTokenAmount) return;
    setIsApproving(true);
    try {
      // Assuming testnet for demo
      await blockchainService.approveToken(liquidityTokenAddress, liquidityTokenAmount, true);
      setIsApproved(true);
      alert("Approval Successful! You can now add liquidity.");
    } catch(err) {
      console.error(err);
      alert("Approval Failed");
    } finally {
      setIsApproving(false);
    }
  }

  const handleAddLiquidity = async () => {
    if (!walletAddress) {
      alert("Please connect your wallet first.");
      return;
    }
    if (!liquidityBnB || !liquidityTokenAmount || !liquidityTokenAddress) return;
    
    setIsAddingLiquidity(true);
    try {
      const txHash = await blockchainService.addLiquidity(liquidityTokenAddress, liquidityTokenAmount, liquidityBnB, true);
      if(txHash) {
         alert(`Liquidity Added! Transaction: ${txHash}`);
         setLiquidityBnB('');
         setLiquidityTokenAmount('');
         setIsApproved(false); // Reset approval state roughly
         await fetchBalances(); // Update balances after liquidity add
      }
    } catch(err) {
      console.error(err);
      alert("Failed to add liquidity.");
    } finally {
      setIsAddingLiquidity(false);
    }
  };
  
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
          <div className="flex flex-col items-end gap-2">
             <div className="text-sm text-slate-400 hidden md:block">Official Contract</div>
             <button 
                onClick={handleQuickBuy}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-green-900/20 transition-all flex items-center gap-2 animate-pulse hover:scale-105"
             >
               <Zap size={18} fill="currentColor" />
               Buy KUBA (1 BNB)
             </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 inline-flex shadow-md">
          <button
            onClick={() => { setActiveTab('swap'); setSwapSuccess(null); setError(null); }}
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

      <div className="max-w-md mx-auto" id="swap-interface">
        {activeTab === 'swap' ? (
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
            
            {swapSuccess ? (
              <div className="text-center py-6 px-2 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                  <CheckCircle size={40} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">Swap Successful!</h3>
                <p className="text-slate-400 text-sm mb-6">Your transaction has been processed.</p>

                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 space-y-3 mb-6 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Sent</span>
                    <span className="text-white font-bold">{swapSuccess.sent} BNB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Received</span>
                    <span className="text-green-400 font-bold">{swapSuccess.received} KUBA</span>
                  </div>
                  <div className="h-px bg-slate-700/50"></div>
                   <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Total Fee ({PLATFORM_FEES.SWAP_PERCENT}%)</span>
                    <span className="text-slate-400">{swapSuccess.fee} BNB</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Transaction Hash</span>
                    <a href={`https://testnet.bscscan.com/tx/${swapSuccess.hash}`} target="_blank" rel="noreferrer" className="text-blue-400 flex items-center gap-1 hover:underline">
                      {swapSuccess.hash.substring(0, 8)}...
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                <button 
                  onClick={() => setSwapSuccess(null)}
                  className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
                >
                  Trade Again
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4 px-2">
                  <h3 className="text-white font-bold flex items-center gap-2">
                     Swap <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded border border-yellow-500/20 flex items-center gap-1"><Flame size={10}/> Real Blockchain</span>
                  </h3>
                  <button className="text-slate-400 hover:text-white"><Settings size={18} /></button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                {/* From Input */}
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors">
                  <div className="flex justify-between text-sm text-slate-400 mb-2">
                    <span>You Pay</span>
                    <span className="flex items-center gap-1 text-xs">
                      <Wallet size={10} /> 
                      Balance: {walletAddress ? bnbBalance : '--'}
                    </span>
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
                      <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-[10px] text-white font-bold">$</div>
                      BNB
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
                    <span className="flex items-center gap-1 text-xs">
                      <Wallet size={10} /> 
                      Balance: {walletAddress ? kubaBalance : '--'}
                    </span>
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
                      <span>1 BNB ≈ 850.5 KUBA</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Route</span>
                      <span className="text-blue-400">BNB &gt; PancakeSwap &gt; KUBA</span>
                    </div>
                    <div className="h-px bg-slate-700/50 my-2"></div>
                    <div className="flex justify-between text-emerald-400">
                      <span className="flex items-center gap-1"><Info size={10} /> Trading Fee ({PLATFORM_FEES.SWAP_PERCENT}%)</span>
                      <span>Free (0% Platform Fee)</span>
                    </div>
                  </div>
                )}

                <button 
                  onClick={handleSwap}
                  disabled={isSwapping || !inputAmount || !walletAddress}
                  className="w-full mt-4 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-colors text-lg shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {!walletAddress ? 'Connect Wallet to Swap' : isSwapping ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Processing...
                    </>
                  ) : 'Swap Now'}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
             {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Droplets className="text-blue-400" size={20}/>
                Create Market / Add Liquidity
              </h3>
            </div>

            <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg text-xs text-blue-300">
              <Info size={14} className="inline mr-1"/>
              Create a trading pool for your new token instantly. You (the website owner) pay <strong>0 fees</strong>. The user pays gas fees only.
            </div>

             {/* Token Address Input */}
             <div className="mb-4">
               <label className="text-xs text-slate-400 mb-1 block">Token Contract Address</label>
               <input 
                 type="text" 
                 placeholder="0x..." 
                 value={liquidityTokenAddress}
                 onChange={(e) => setLiquidityTokenAddress(e.target.value)}
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 transition-colors"
               />
             </div>

            {/* Input 1: BNB */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 mb-2 hover:border-blue-500/30 transition-colors">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Amount (BNB)</span>
                <span className="flex items-center gap-1 text-xs">
                    <Wallet size={10} /> 
                    Balance: {walletAddress ? bnbBalance : '--'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="number" 
                  placeholder="0.0" 
                  value={liquidityBnB}
                  onChange={(e) => setLiquidityBnB(e.target.value)}
                  className="bg-transparent text-xl font-bold text-white w-full outline-none placeholder:text-slate-600"
                  disabled={!walletAddress}
                />
                <div className="flex items-center gap-2 bg-slate-700 px-3 py-1.5 rounded-lg font-bold shrink-0">
                   <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center text-[10px] text-white font-bold">$</div>
                   BNB
                </div>
              </div>
            </div>

            {/* Plus Icon */}
            <div className="flex justify-center -my-3 relative z-10">
              <div className="bg-slate-800 border-2 border-slate-700 rounded-full p-1 text-slate-400">
                <Plus size={16} />
              </div>
            </div>

            {/* Input 2: TOKEN */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 mt-2 hover:border-green-500/30 transition-colors">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Amount (Tokens)</span>
                <span className="flex items-center gap-1 text-xs">
                  <Wallet size={10} />
                  Balance: {walletAddress ? liquidityTokenBalance : '--'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="number" 
                  placeholder="0.0" 
                  value={liquidityTokenAmount}
                  onChange={(e) => setLiquidityTokenAmount(e.target.value)}
                  className="bg-transparent text-xl font-bold text-white w-full outline-none placeholder:text-slate-600"
                  disabled={!walletAddress}
                />
                <div className="flex items-center gap-2 bg-slate-700 px-3 py-1.5 rounded-lg font-bold shrink-0 border border-green-500/30">
                   TOKEN
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button 
                onClick={handleApprove}
                disabled={isApproving || isApproved || !liquidityTokenAddress || !liquidityTokenAmount}
                className={`py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  isApproved 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                 {isApproving ? <Loader2 className="animate-spin" size={16}/> : isApproved ? <CheckCircle size={16}/> : <Lock size={16}/>}
                 {isApproved ? 'Approved' : '1. Approve'}
              </button>

              <button 
                onClick={handleAddLiquidity}
                disabled={!isApproved || isAddingLiquidity || !liquidityBnB || !liquidityTokenAmount}
                className="py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAddingLiquidity ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    2. Add Liquidity
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
