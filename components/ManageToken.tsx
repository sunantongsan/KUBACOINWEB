import React, { useState, useEffect } from 'react';
import { TokenData, NetworkMode, Transaction } from '../types';
import { CHAIN_CONFIG } from '../constants';
import { Flame, Lock, Droplets, ArrowRightLeft, ExternalLink, ShieldCheck, Info, Copy, RefreshCw, Plus, ArrowRight, Code, Check, ChevronRight, Layers, Coins, Wallet, UserX, AlertTriangle, History, Clock, CheckCircle2, Gift, Loader2, Globe, Beaker, Activity, DollarSign, BarChart3, TrendingUp, Sparkles, Bot, FileText } from 'lucide-react';
import { FeeDisplay } from './FeeDisplay';
import { analyzeContractCode } from '../services/geminiService';

interface ManageTokenProps {
  token: TokenData;
  onBack: () => void;
  onUpdateToken: (token: TokenData) => void;
}

type ActionType = 'LIQUIDITY' | 'BURN' | 'LOCK' | 'SWAP' | 'BRIDGE' | 'VERIFY' | 'MINT' | 'RENOUNCE' | 'HISTORY';

// Reusable Header Component for Tabs
const TabHeader: React.FC<{ icon: any; color: string; title: string; description: string }> = ({ icon: Icon, color, title, description }) => {
  // Map color names to tailwind classes for dynamic usage
  const colorMap: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    gray: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  };

  const styleClass = colorMap[color] || colorMap['yellow'];

  return (
    <div className={`p-6 rounded-2xl border mb-8 flex items-start gap-5 animate-fade-in relative overflow-hidden transition-all duration-300 hover:bg-opacity-80 ${styleClass}`}>
      <div className={`p-3.5 rounded-xl bg-dark/30 shadow-inner backdrop-blur-sm shrink-0`}>
        <Icon className="w-7 h-7" />
      </div>
      <div className="relative z-10">
        <h3 className="font-bold text-xl text-white">{title}</h3>
        <p className="text-gray-400 text-sm mt-1 leading-relaxed opacity-90">{description}</p>
      </div>
    </div>
  );
};

export const ManageToken: React.FC<ManageTokenProps> = ({ token, onBack, onUpdateToken }) => {
  const [activeTab, setActiveTab] = useState<ActionType>('LIQUIDITY');
  const [amount, setAmount] = useState('');
  const [secondaryAmount, setSecondaryAmount] = useState(''); // For Liquidity Pair (Token Amount)
  const [verifyAddress, setVerifyAddress] = useState(token.contractAddress || '');
  const [verifyAbi, setVerifyAbi] = useState('');
  const [isSwapBuy, setIsSwapBuy] = useState(true); // true = Native -> Token (Buy), false = Token -> Native (Sell)
  const [lockDuration, setLockDuration] = useState('365');
  
  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  // Renounce State
  const [isRenounced, setIsRenounced] = useState(token.ownershipRenounced || false);
  const [renounceConfirmText, setRenounceConfirmText] = useState('');

  // Balance States
  const [nativeBalance, setNativeBalance] = useState(token.networkMode === NetworkMode.TESTNET ? 100.00 : 12.54); // Higher balance for testnet
  const [userTokenBalance, setUserTokenBalance] = useState(token.supply); // Initially user owns all supply
  const [totalSupply, setTotalSupply] = useState(token.supply);

  const chainConfig = CHAIN_CONFIG[token.chain];

  // Mock Exchange Rate: 1 Native Coin = 5000 Tokens
  const MOCK_RATE = 5000;

  // Market Statistics Logic
  const marketPrice = token.currentPrice !== undefined ? token.currentPrice : 0; // Default to 0 if not set
  const marketLiq = token.liquidityUSD !== undefined ? token.liquidityUSD : 0;
  const marketCap = marketPrice * totalSupply;
  // Simulate a random change if price exists, else 0
  const priceChangePercent = marketPrice > 0 ? (Math.random() * 10 - 3) : 0; 
  const isPositiveChange = priceChangePercent >= 0;

  // Quality Score Calculation
  const qualityScore = React.useMemo(() => {
      let s = 0;
      if (token.contractAddress) s += 33;
      if (token.ownershipRenounced) s += 33;
      if (token.liquidityLocked) s += 34;
      return Math.min(s, 100);
  }, [token]);

  const getScoreColor = (score: number) => {
      if (score >= 100) return 'text-emerald-400';
      if (score > 60) return 'text-yellow-400';
      return 'text-red-400';
  };
  
  const getScoreRingColor = (score: number) => {
      if (score >= 100) return 'text-emerald-500';
      if (score > 60) return 'text-yellow-500';
      return 'text-red-500';
  };

  useEffect(() => {
    setAmount('');
    setSecondaryAmount('');
    setIsSwapBuy(true); // Reset swap direction on tab change
    setRenounceConfirmText('');
    setLockDuration('365');
    setAnalysisResult(null); // Reset analysis on tab change
  }, [activeTab]);

  const handleLiquidityChange = (val: string, type: 'NATIVE' | 'TOKEN') => {
    if (type === 'NATIVE') {
      setAmount(val);
      const num = parseFloat(val);
      if (!isNaN(num)) {
        setSecondaryAmount((num * MOCK_RATE).toFixed(2));
      } else {
        setSecondaryAmount('');
      }
    } else {
      setSecondaryAmount(val);
      const num = parseFloat(val);
      if (!isNaN(num)) {
        setAmount((num / MOCK_RATE).toFixed(6));
      } else {
        setAmount('');
      }
    }
  };

  const handleSwapChange = (val: string, inputType: 'TOP' | 'BOTTOM') => {
    const num = parseFloat(val);
    
    if (isSwapBuy) {
      // BUY MODE: Top is Native, Bottom is Token
      if (inputType === 'TOP') {
        setAmount(val);
        if (!isNaN(num)) setSecondaryAmount((num * MOCK_RATE).toFixed(2));
        else setSecondaryAmount('');
      } else {
        setSecondaryAmount(val);
        if (!isNaN(num)) setAmount((num / MOCK_RATE).toFixed(6));
        else setAmount('');
      }
    } else {
      // SELL MODE: Top is Token, Bottom is Native
      if (inputType === 'TOP') {
        setAmount(val); // Token Amount
        if (!isNaN(num)) setSecondaryAmount((num / MOCK_RATE).toFixed(6)); // Native Amount
        else setSecondaryAmount('');
      } else {
        setSecondaryAmount(val); // Native Amount
        if (!isNaN(num)) setAmount((num * MOCK_RATE).toFixed(2)); // Token Amount
        else setAmount('');
      }
    }
  };

  const recordTransaction = (type: Transaction['type'], description: string, amountStr: string) => {
      const newTx: Transaction = {
          id: Date.now().toString(),
          type: type,
          description: description,
          amount: amountStr,
          date: new Date(),
          status: 'Success',
          txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
      };
      
      const updatedTransactions = [newTx, ...(token.transactions || [])];
      
      onUpdateToken({
          ...token,
          transactions: updatedTransactions,
          supply: totalSupply, // ensure supply is synced
          ownershipRenounced: isRenounced // ensure status is synced
      });
  };

  const handleFaucet = () => {
    if (token.networkMode !== NetworkMode.TESTNET) return;
    
    const faucetAmount = 5.0;
    setNativeBalance(prev => prev + faucetAmount);
    
    const newTx: Transaction = {
        id: Date.now().toString(),
        type: 'FAUCET',
        description: `Claim Testnet Funds`,
        amount: `+${faucetAmount} ${chainConfig.currency}`,
        date: new Date(),
        status: 'Success',
        txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
    };
    
    onUpdateToken({
        ...token,
        transactions: [newTx, ...(token.transactions || [])]
    });
    
    alert(`Success! You received ${faucetAmount} ${chainConfig.currency} (Testnet)`);
  };

  const handleAnalyze = async () => {
    if (!verifyAbi) {
        alert("Please paste Source Code or ABI to analyze.");
        return;
    }
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
        // Pass verifyAddress for better context if available
        const result = await analyzeContractCode(verifyAbi, token.chain, verifyAddress);
        setAnalysisResult(result);
    } catch (error) {
        console.error(error);
        alert("AI Analysis failed. Please try again.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleAction = () => {
    if (activeTab === 'VERIFY') {
        if (!verifyAddress || !verifyAbi) {
            alert("Please fill in both Contract Address and ABI");
            return;
        }
        alert(`Verifying Contract: ${verifyAddress}\n(Simulation: Success)\nNetwork: ${token.networkMode}`);
        recordTransaction('VERIFY', 'Verify Smart Contract Source Code', '-');
        setVerifyAddress(token.contractAddress || '');
        setVerifyAbi('');
        return;
    }

    if (activeTab === 'RENOUNCE') {
        if (renounceConfirmText !== 'RENOUNCE') {
            alert("Please type 'RENOUNCE' to confirm.");
            return;
        }
        if (nativeBalance < 0.02) {
            alert("Insufficient balance for fees");
            return;
        }
        setNativeBalance(prev => prev - 0.02);
        setIsRenounced(true);
        
        const newTx: Transaction = {
            id: Date.now().toString(),
            type: 'RENOUNCE',
            description: 'Renounce Ownership of Contract',
            amount: '-',
            date: new Date(),
            status: 'Success',
            txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
        };
        onUpdateToken({
          ...token,
          ownershipRenounced: true,
          transactions: [newTx, ...(token.transactions || [])]
        });

        alert("Renounce Ownership Successful! You have permanently revoked ownership of this contract.");
        return;
    }
    
    if (activeTab === 'LIQUIDITY') {
        const nativeAmt = parseFloat(amount);
        const tokenAmt = parseFloat(secondaryAmount);
        if (!amount || !secondaryAmount || isNaN(nativeAmt) || isNaN(tokenAmt)) {
             alert("Please specify amounts for both sides");
             return;
        }
        if (nativeAmt > nativeBalance || tokenAmt > userTokenBalance) {
            alert("Insufficient balance to add liquidity");
            return;
        }

        setNativeBalance(prev => prev - nativeAmt);
        setUserTokenBalance(prev => prev - tokenAmt);
        recordTransaction('LIQUIDITY', `Add Liquidity to Pool`, `${nativeAmt} ${chainConfig.currency} + ${tokenAmt} ${token.symbol}`);
        alert(`Simulating Add Liquidity: Success! Fees deducted.`);
        setAmount('');
        setSecondaryAmount('');
        return;
    }

    if (activeTab === 'SWAP') {
        if (!amount || !secondaryAmount) {
          alert("Please specify swap amount");
          return;
        }
        const inputVal = parseFloat(amount);
        const outputVal = parseFloat(secondaryAmount);

        if (isSwapBuy) {
            if (inputVal > nativeBalance) { alert(`Insufficient ${chainConfig.currency} balance`); return; }
            setNativeBalance(prev => prev - inputVal);
            setUserTokenBalance(prev => prev + outputVal);
            recordTransaction('SWAP', `Swap Buy ${token.symbol}`, `${inputVal} ${chainConfig.currency} -> ${outputVal} ${token.symbol}`);
        } else {
            if (inputVal > userTokenBalance) { alert(`Insufficient ${token.symbol} balance`); return; }
            setUserTokenBalance(prev => prev - inputVal);
            setNativeBalance(prev => prev + outputVal);
             recordTransaction('SWAP', `Swap Sell ${token.symbol}`, `${inputVal} ${token.symbol} -> ${outputVal} ${chainConfig.currency}`);
        }
        alert(`Swap Successful!`);
        setAmount('');
        setSecondaryAmount('');
        return;
    }

    if (activeTab === 'MINT') {
      if (isRenounced) { alert("Cannot Mint: Ownership has been renounced."); return; }
      const mintAmt = parseFloat(amount);
      if (!amount || isNaN(mintAmt)) { alert("Please specify mint amount"); return; }
      
      setTotalSupply(prev => prev + mintAmt);
      setUserTokenBalance(prev => prev + mintAmt);
      
      const newTx: Transaction = {
          id: Date.now().toString(),
          type: 'MINT',
          description: 'Mint additional tokens',
          amount: `+${mintAmt} ${token.symbol}`,
          date: new Date(),
          status: 'Success',
          txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
      };
      onUpdateToken({
          ...token,
          supply: totalSupply + mintAmt,
          transactions: [newTx, ...(token.transactions || [])]
      });
      alert(`Minting Success: +${mintAmt} ${token.symbol}`);
      setAmount('');
      return;
    }

    if (activeTab === 'BURN') {
        const burnAmt = parseFloat(amount);
        if (!amount || isNaN(burnAmt)) { alert("Please specify burn amount"); return; }
        if (burnAmt > userTokenBalance) { alert("Insufficient tokens to burn"); return; }
        
        setTotalSupply(prev => prev - burnAmt);
        setUserTokenBalance(prev => prev - burnAmt);

        const newTx: Transaction = {
            id: Date.now().toString(),
            type: 'BURN',
            description: 'Burn tokens from circulation',
            amount: `-${burnAmt} ${token.symbol}`,
            date: new Date(),
            status: 'Success',
            txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
        };
        onUpdateToken({
            ...token,
            supply: totalSupply - burnAmt,
            transactions: [newTx, ...(token.transactions || [])]
        });
        alert(`Burn Success: -${burnAmt} ${token.symbol}`);
        setAmount('');
        return;
    }
    
    if (activeTab === 'BRIDGE') {
        const bridgeAmt = parseFloat(amount);
        if(!amount || isNaN(bridgeAmt)) { alert("Specify amount"); return; }
        recordTransaction('BRIDGE', `Bridge to External Chain`, `${bridgeAmt} ${token.symbol}`);
        alert(`Bridge Request Submitted.`);
        setAmount('');
        return;
    }
    
    if (activeTab === 'LOCK') {
        const lockAmt = parseFloat(amount);
        const days = parseInt(lockDuration);

        if (!amount || isNaN(lockAmt) || lockAmt <= 0) { alert("Please specify lock amount"); return; }
        if (!lockDuration || isNaN(days) || days <= 0) { alert("Please specify lock duration (days)"); return; }
        if (lockAmt > userTokenBalance) { alert("Insufficient tokens to lock"); return; }

        setUserTokenBalance(prev => prev - lockAmt);
        
        const unlockDate = new Date();
        unlockDate.setDate(unlockDate.getDate() + days);

        const newTx: Transaction = {
            id: Date.now().toString(),
            type: 'LOCK',
            description: `Lock Tokens for ${days} Days`,
            amount: `${lockAmt} ${token.symbol}`,
            date: new Date(),
            status: 'Success',
            txHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')
        };

        onUpdateToken({
            ...token,
            liquidityLocked: true,
            lockedAmount: (token.lockedAmount || 0) + lockAmt,
            unlockDate: unlockDate,
            transactions: [newTx, ...(token.transactions || [])]
        });

        alert(`Tokens Locked Successfully until ${unlockDate.toLocaleDateString()}`);
        setAmount('');
        return;
    }

    alert(`Simulating ${activeTab} for ${amount} ${chainConfig.currency}. Fee deducted.`);
    setAmount('');
  };

  const toggleSwapDirection = () => {
    setIsSwapBuy(!isSwapBuy);
    setAmount('');
    setSecondaryAmount('');
  };

  const renderTabContent = () => {
    const baseFee = 0.002; // Mock gas fee
    
    switch (activeTab) {
      case 'LIQUIDITY':
        return (
          <div className="space-y-6 animate-slide-up">
            <TabHeader 
              icon={Droplets} 
              color="blue" 
              title="Add Liquidity" 
              description={`Pair ${token.symbol} with ${chainConfig.currency} to create a trading pool on top DEXs.`} 
            />
            
            <div className="bg-card border border-gray-800 rounded-3xl p-6 relative overflow-hidden shadow-xl">
               {/* Inputs */}
               <div className="flex flex-col md:flex-row items-center gap-4">
                  {/* Asset 1 */}
                  <div className="flex-1 w-full bg-dark p-5 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 group">
                      <div className="flex justify-between mb-3">
                          <span className="text-sm text-gray-400 group-hover:text-blue-400 transition-colors">Native Coin</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1"><Wallet className="w-3 h-3"/> {nativeBalance.toFixed(4)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                          <span className="text-3xl p-2 bg-slate-800/50 rounded-xl">{chainConfig.icon}</span>
                          <div className="flex-1">
                             <input 
                                type="number"
                                value={amount}
                                onChange={(e) => handleLiquidityChange(e.target.value, 'NATIVE')}
                                placeholder="0.0"
                                className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none placeholder-gray-700"
                             />
                             <div className="text-xs text-gray-500 font-bold">{chainConfig.currency}</div>
                          </div>
                      </div>
                  </div>

                  {/* Connector */}
                  <div className="bg-slate-800 p-2 rounded-full text-gray-400 border border-gray-700 shadow-lg z-10">
                      <Plus className="w-5 h-5" />
                  </div>

                  {/* Asset 2 */}
                  <div className="flex-1 w-full bg-dark p-5 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-all duration-300 group">
                      <div className="flex justify-between mb-3">
                          <span className="text-sm text-gray-400 group-hover:text-blue-400 transition-colors">Token Amount</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1"><Wallet className="w-3 h-3"/> {userTokenBalance.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-800/50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-700">
                             {token.logoUrl ? <img src={token.logoUrl} className="w-full h-full object-cover" /> : token.symbol[0]}
                          </div>
                          <div className="flex-1">
                             <input 
                                type="number"
                                value={secondaryAmount}
                                onChange={(e) => handleLiquidityChange(e.target.value, 'TOKEN')}
                                placeholder="0.0"
                                className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none placeholder-gray-700"
                             />
                             <div className="text-xs text-gray-500 font-bold">{token.symbol}</div>
                          </div>
                      </div>
                  </div>
               </div>

               <div className="mt-6 bg-blue-900/10 p-4 rounded-xl border border-blue-500/20 flex flex-col sm:flex-row justify-between items-center text-sm gap-2">
                  <span className="text-blue-300 flex items-center gap-2"><Info className="w-4 h-4"/> Initial Exchange Rate</span>
                  <span className="font-mono font-medium text-white">1 {chainConfig.currency} = {MOCK_RATE.toLocaleString()} {token.symbol}</span>
               </div>
            </div>

             <FeeDisplay 
                baseAmount={parseFloat(amount) || 0} 
                networkFee={baseFee} 
                currency={chainConfig.currency} 
                actionName="Add Liquidity" 
              />
          </div>
        );

      case 'MINT':
        const mintServiceCost = 0.01;
        
        if (isRenounced) {
             return (
                <div className="space-y-6 animate-slide-up">
                    <TabHeader icon={Coins} color="gray" title="Mint Tokens" description="This function is permanently disabled because ownership has been renounced." />
                    <div className="p-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-700 rounded-3xl bg-dark/30">
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <Lock className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-300">Minting Disabled</h3>
                        <p className="text-gray-500 mt-2 max-w-md">Contract ownership has been renounced.</p>
                    </div>
                </div>
             )
        }

        return (
          <div className="space-y-6 animate-slide-up">
             <TabHeader 
              icon={Coins} 
              color="green" 
              title="Mint Tokens" 
              description="Create additional tokens to increase your Total Supply (Only for mintable contracts)." 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-dark p-6 rounded-3xl border border-gray-700 shadow-lg">
                     <div className="flex items-center justify-between mb-4">
                         <h4 className="text-gray-400 font-medium">Total Supply</h4>
                         <Coins className="text-green-500 w-5 h-5" />
                     </div>
                     <div className="text-3xl font-bold text-white mb-2">{totalSupply.toLocaleString()}</div>
                     <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                         <div className="h-full bg-green-500 w-3/4"></div>
                     </div>
                 </div>
                 <div className="bg-dark p-6 rounded-3xl border border-gray-700 shadow-lg">
                     <div className="flex items-center justify-between mb-4">
                         <h4 className="text-gray-400 font-medium">Your Balance</h4>
                         <Wallet className="text-yellow-500 w-5 h-5" />
                     </div>
                     <div className="text-3xl font-bold text-green-400 mb-2">{userTokenBalance.toLocaleString()}</div>
                     <div className="text-xs text-gray-500">Tokens available in your wallet</div>
                 </div>
            </div>

            <div className="bg-card p-8 rounded-3xl border border-gray-800 shadow-xl">
                <label className="text-gray-300 font-medium mb-2 block">Amount to Mint</label>
                <div className="bg-dark border border-gray-600 rounded-xl p-4 flex items-center gap-4 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all">
                    <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-transparent text-white text-2xl w-full focus:outline-none font-mono"
                    placeholder="0.00"
                    />
                    <span className="font-bold text-green-500 text-lg">{token.symbol}</span>
                </div>
                <p className="text-xs text-gray-500 text-right mt-2">
                    Minting Service Fee: {mintServiceCost} {chainConfig.currency}
                </p>
            </div>

             <FeeDisplay baseAmount={mintServiceCost} networkFee={baseFee} currency={chainConfig.currency} actionName="Minting Service" />
          </div>
        );

      case 'BURN':
        return (
          <div className="space-y-6 animate-slide-up">
            <TabHeader 
              icon={Flame} 
              color="red" 
              title="Burn Tokens" 
              description="Permanently reduce supply to increase scarcity (Deflationary Action)." 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-red-900/20 to-dark p-8 rounded-3xl border border-red-500/20 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl">
                <div className="absolute inset-0 bg-red-500/5 blur-3xl"></div>
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Flame className="w-10 h-10 text-red-500" />
                </div>
                <h4 className="text-gray-300 font-medium">Current Supply</h4>
                <p className="text-3xl font-bold text-white my-2 font-mono">{totalSupply.toLocaleString()}</p>
                <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs">Irreversible Action</span>
              </div>

              <div className="bg-card p-8 rounded-3xl border border-gray-800 flex flex-col justify-center shadow-xl">
                <label className="text-gray-300 font-medium mb-2">Amount to Burn</label>
                <div className="bg-dark border border-gray-600 rounded-xl p-4 flex items-center gap-4 focus-within:border-red-500 transition-colors mb-2">
                   <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-transparent text-white text-xl w-full focus:outline-none"
                    placeholder="0.00"
                  />
                  <button 
                    onClick={() => setAmount(userTokenBalance.toString())}
                    className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg transition-colors font-bold"
                  >
                    MAX
                  </button>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Balance: {userTokenBalance.toLocaleString()}</span>
                    <span>Fee: {baseFee} {chainConfig.currency}</span>
                </div>
              </div>
            </div>
            
            <FeeDisplay baseAmount={0} networkFee={baseFee} currency={chainConfig.currency} actionName="Burn Token" />
          </div>
        );

      case 'LOCK':
        return (
          <div className="space-y-6 animate-slide-up">
             <TabHeader 
              icon={Lock} 
              color="yellow" 
              title="Lock Tokens" 
              description="Lock LP tokens or supply for a specific duration to build trust (Rug Pull Protection)." 
            />
            
            {token.liquidityLocked && (
                <div className="bg-yellow-900/20 border border-yellow-500/40 rounded-2xl p-6 flex items-start gap-4 mb-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl"></div>
                    <div className="bg-yellow-500/20 p-3 rounded-full shrink-0">
                        <Lock className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-yellow-400 font-bold text-lg">Active Lock Detected</h4>
                        <p className="text-yellow-200/70 text-sm mt-1">
                            Locked: <span className="font-mono font-bold text-white">{token.lockedAmount?.toLocaleString()} {token.symbol}</span>
                        </p>
                        <p className="text-yellow-200/70 text-sm">
                            Unlocks on: <span className="font-mono font-bold text-white">{token.unlockDate?.toLocaleDateString()}</span>
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-card p-8 rounded-3xl border border-gray-800 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm text-gray-400 font-medium ml-1">Token Amount</label>
                  <div className="bg-dark border border-gray-600 rounded-xl p-4 flex items-center gap-3 focus-within:border-yellow-500 transition-colors">
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-transparent text-white text-xl focus:outline-none font-mono" 
                        placeholder="0.0" 
                    />
                    <span className="text-yellow-500 font-bold">{token.symbol}</span>
                  </div>
                  <div className="text-xs text-right text-gray-500">Available: {userTokenBalance.toLocaleString()}</div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm text-gray-400 font-medium ml-1">Duration (Days)</label>
                  <div className="bg-dark border border-gray-600 rounded-xl p-4 flex items-center gap-3 focus-within:border-yellow-500 transition-colors">
                    <input 
                        type="number" 
                        value={lockDuration}
                        onChange={(e) => setLockDuration(e.target.value)}
                        className="w-full bg-transparent text-white text-xl focus:outline-none font-mono" 
                        placeholder="365" 
                    />
                    <span className="text-gray-500 text-sm font-bold">Days</span>
                  </div>
                  <div className="flex gap-2">
                      {[90, 180, 365].map(days => (
                        <button 
                            key={days} 
                            onClick={() => setLockDuration(days.toString())}
                            className={`flex-1 py-1 rounded text-xs transition-colors ${lockDuration === days.toString() ? 'bg-yellow-500 text-black font-bold' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
                        >
                            {days}d
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <FeeDisplay baseAmount={0} networkFee={baseFee + 0.01} currency={chainConfig.currency} actionName="Lock Token Service" />
          </div>
        );

       case 'BRIDGE':
        const bridgeTokenAmount = parseFloat(amount) || 0;
        const bridgeValueInNative = bridgeTokenAmount / MOCK_RATE;
        const totalBridgeNetworkFee = 0.008; 

        return (
          <div className="space-y-6 animate-slide-up">
             <TabHeader 
              icon={ArrowRightLeft} 
              color="orange" 
              title="Bridge Tokens" 
              description="Transfer assets across chains securely (Burn @Source -> Mint @Destination)." 
            />

             <div className="bg-card p-8 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    {/* Source */}
                    <div className="flex-1 w-full bg-dark p-5 rounded-2xl border border-gray-700">
                       <div className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">From</div>
                       <div className="flex items-center gap-3">
                          <span className="text-3xl">{chainConfig.icon}</span>
                          <div>
                            <h4 className="font-bold text-white text-lg">{token.chain}</h4>
                            <div className="text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded inline-block mt-1">{token.networkMode}</div>
                          </div>
                       </div>
                    </div>

                    {/* Arrow Animation */}
                    <div className="flex flex-col items-center justify-center gap-1 text-orange-500">
                       <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                          <ArrowRight className="w-6 h-6 animate-pulse" />
                       </div>
                    </div>

                    {/* Destination */}
                    <div className="flex-1 w-full bg-dark p-5 rounded-2xl border border-gray-700">
                       <div className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">To</div>
                       <div className="relative">
                         <select className="w-full bg-slate-800 border border-gray-600 rounded-xl p-3 text-white appearance-none cursor-pointer focus:ring-2 focus:ring-orange-500 focus:outline-none pl-10 transition-all hover:border-orange-500/50">
                            <option>Solana ({token.networkMode})</option>
                            <option>TON Network ({token.networkMode})</option>
                            <option>BNB Chain ({token.networkMode})</option>
                         </select>
                         <Layers className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                         <ChevronRight className="absolute right-3 top-4 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
                       </div>
                    </div>
                </div>
                
                {/* Amount Input */}
                <div className="mt-8 bg-dark/50 p-6 rounded-2xl border border-gray-700">
                    <div className="flex justify-between mb-2">
                        <label className="text-sm text-gray-400">Amount to Bridge</label>
                        <span className="text-xs text-gray-500">Max: {userTokenBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <input 
                          type="number" 
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="flex-1 bg-transparent text-3xl text-white focus:outline-none font-mono placeholder-gray-700"
                          placeholder="0.00"
                        />
                        <span className="font-bold text-xl text-gray-300 bg-slate-800 px-3 py-1 rounded-lg border border-gray-600">{token.symbol}</span>
                    </div>
                </div>
             </div>

             <FeeDisplay baseAmount={bridgeValueInNative} networkFee={totalBridgeNetworkFee} currency={chainConfig.currency} actionName="Bridge Service" />
          </div>
        );

      case 'SWAP':
        const topLabel = isSwapBuy ? chainConfig.currency : token.symbol;
        const bottomLabel = isSwapBuy ? token.symbol : chainConfig.currency;
        const topIcon = isSwapBuy ? chainConfig.icon : (token.logoUrl ? <img src={token.logoUrl} className="w-full h-full object-cover"/> : token.symbol[0]);
        const bottomIcon = !isSwapBuy ? chainConfig.icon : (token.logoUrl ? <img src={token.logoUrl} className="w-full h-full object-cover"/> : token.symbol[0]);
        
        const feeBaseAmount = isSwapBuy ? (parseFloat(amount) || 0) : (parseFloat(secondaryAmount) || 0);
        const topBalance = isSwapBuy ? nativeBalance.toFixed(4) : userTokenBalance.toLocaleString();
        const bottomBalance = isSwapBuy ? userTokenBalance.toLocaleString() : nativeBalance.toFixed(4);

        return (
          <div className="space-y-6 animate-slide-up max-w-xl mx-auto">
            <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 text-yellow-500" /> Quick Swap
                </h3>
            </div>

            <div className="bg-card rounded-[2.5rem] border border-gray-800 p-2 shadow-2xl relative">
              {/* Top Section */}
              <div className="bg-dark p-6 rounded-[2rem] rounded-b-none hover:bg-dark/80 transition-colors">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>You Pay</span>
                  <span>Bal: {topBalance}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                   <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => handleSwapChange(e.target.value, 'TOP')}
                      placeholder="0.0"
                      className="bg-transparent text-4xl font-bold text-white w-full focus:outline-none placeholder-gray-700"
                    />
                    <div className="flex items-center gap-2 bg-slate-800 pl-2 pr-4 py-1.5 rounded-full border border-gray-700 shrink-0">
                         <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden text-xs">
                            {typeof topIcon === 'string' ? topIcon : topIcon}
                         </div>
                         <span className="font-bold text-white">{topLabel}</span>
                    </div>
                </div>
              </div>

              {/* Swap Button */}
              <div className="h-2 bg-card relative z-10 flex items-center justify-center -my-1">
                 <button 
                  onClick={toggleSwapDirection}
                  className="w-10 h-10 bg-yellow-500 rounded-xl border-4 border-card flex items-center justify-center text-black hover:scale-110 transition-transform shadow-lg z-20"
                >
                  <ArrowRightLeft className="w-5 h-5 rotate-90" />
                </button>
              </div>

              {/* Bottom Section */}
              <div className="bg-dark p-6 rounded-[2rem] rounded-t-none hover:bg-dark/80 transition-colors">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>You Receive</span>
                  <span>Bal: {bottomBalance}</span>
                </div>
                 <div className="flex items-center justify-between gap-4">
                   <input 
                      type="number" 
                      value={secondaryAmount}
                      onChange={(e) => handleSwapChange(e.target.value, 'BOTTOM')}
                      placeholder="0.0"
                      className="bg-transparent text-4xl font-bold text-white w-full focus:outline-none placeholder-gray-700"
                    />
                    <div className="flex items-center gap-2 bg-slate-800 pl-2 pr-4 py-1.5 rounded-full border border-gray-700 shrink-0">
                         <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden text-xs">
                            {typeof bottomIcon === 'string' ? bottomIcon : bottomIcon}
                         </div>
                         <span className="font-bold text-white">{bottomLabel}</span>
                    </div>
                </div>
              </div>
            </div>

            <div className="px-4 flex justify-between text-sm text-gray-500">
               <span>Slippage Tolerance</span>
               <span className="text-yellow-500">0.5%</span>
            </div>

            <FeeDisplay baseAmount={feeBaseAmount} networkFee={0.0015} currency={chainConfig.currency} actionName="Swap" />
          </div>
        );

      case 'VERIFY':
        return (
          <div className="space-y-6 animate-slide-up">
             <TabHeader 
              icon={ShieldCheck} 
              color="emerald" 
              title="Verify Contract" 
              description="Verify Source Code and Audit for Vulnerabilities (Powered by AI)." 
            />

            <div className="bg-emerald-900/10 p-5 rounded-2xl border border-emerald-500/20 flex gap-4 items-start">
                <Info className="w-6 h-6 text-emerald-400 shrink-0" />
                <div className="space-y-1">
                    <h4 className="text-emerald-400 font-bold">Smart Verification ({token.networkMode})</h4>
                    <p className="text-emerald-100/70 text-sm">
                        Use the "AI Security Audit" below to scan your contract for hidden backdoors, mint functions, or logic errors before verification.
                    </p>
                </div>
            </div>

            <div className="bg-card p-6 rounded-3xl border border-gray-800 shadow-xl space-y-6">
              <div>
                <label className="text-sm text-gray-400 font-medium mb-2 block uppercase tracking-wider">Contract Address</label>
                <div className="relative group">
                  <input 
                      type="text" 
                      value={verifyAddress}
                      onChange={(e) => setVerifyAddress(e.target.value)}
                      className="w-full bg-dark border border-gray-600 rounded-xl p-4 text-white font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all pr-24"
                      placeholder="0x..."
                  />
                  {token.contractAddress && (
                    <button 
                      onClick={() => setVerifyAddress(token.contractAddress || '')}
                      className="absolute right-2 top-2 bottom-2 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs rounded-lg transition-colors font-bold flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Auto-fill
                    </button>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 font-medium mb-2 flex items-center justify-between uppercase tracking-wider">
                    <span className="flex items-center gap-2"><Code className="w-4 h-4" /> Source Code / ABI</span>
                    <span className="text-xs normal-case text-gray-500">{verifyAbi.length} chars</span>
                </label>
                <div className="relative">
                    <textarea 
                        value={verifyAbi}
                        onChange={(e) => setVerifyAbi(e.target.value)}
                        className="w-full bg-[#0d1117] border border-gray-700 rounded-xl p-4 text-gray-300 font-mono text-xs h-56 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none leading-relaxed resize-none"
                        placeholder={`Paste your Solidity/Rust/FunC source code here for analysis...`}
                    />
                    <button 
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !verifyAbi}
                        className={`absolute bottom-4 right-4 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg transition-all ${isAnalyzing ? 'bg-gray-600 cursor-wait' : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black hover:scale-105'}`}
                    >
                        {isAnalyzing ? (
                            <><Loader2 className="w-3 h-3 animate-spin" /> Analyzing...</>
                        ) : (
                            <><Sparkles className="w-3 h-3" /> AI Security Audit</>
                        )}
                    </button>
                </div>
              </div>

              {/* AI Analysis Result */}
              {analysisResult && (
                  <div className="bg-slate-800 rounded-xl p-5 border border-yellow-500/30 relative overflow-hidden animate-fade-in">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-yellow-500 to-orange-500"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl pointer-events-none"></div>
                      <h4 className="flex items-center gap-2 text-yellow-400 font-bold mb-3 border-b border-gray-700 pb-2">
                          <Bot className="w-5 h-5" /> KUBA Security Audit Report
                      </h4>
                      <div className="text-gray-300 text-sm whitespace-pre-line leading-relaxed font-mono bg-black/20 p-4 rounded-lg border border-gray-700/50">
                          {analysisResult}
                      </div>
                  </div>
              )}
            </div>

             <FeeDisplay baseAmount={0} networkFee={0.01} currency={chainConfig.currency} actionName="Verification" />
          </div>
        );
        
      case 'RENOUNCE':
        const renounceServiceCost = 0.02;
        return (
           <div className="space-y-6 animate-slide-up">
             <TabHeader 
              icon={UserX} 
              color="red" 
              title="Renounce Ownership" 
              description="This action is IRREVERSIBLE. Ownership will be transferred to a Dead Address." 
            />

            {isRenounced ? (
                 <div className="p-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-green-500/30 rounded-[2rem] bg-green-900/5 animate-fade-in">
                    <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20 shadow-lg shadow-green-500/10">
                        <ShieldCheck className="w-12 h-12 text-green-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">Ownership Renounced</h3>
                    <p className="text-green-400/80 max-w-lg leading-relaxed">
                        This contract is now trustless. No administrative actions can be taken by the deployer anymore.
                    </p>
                </div>
            ) : (
                <div className="bg-card p-8 rounded-[2rem] border border-red-900/30 shadow-[0_0_30px_rgba(220,38,38,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="bg-red-950/30 border border-red-500/20 p-6 rounded-2xl flex gap-5 mb-8 relative z-10">
                         <div className="bg-red-500/10 p-3 rounded-xl h-fit shrink-0 border border-red-500/20">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                         </div>
                         <div>
                            <h4 className="text-red-400 font-bold text-xl mb-2">Danger Zone</h4>
                            <p className="text-red-200/70 text-sm leading-relaxed">
                                This action will permanently remove your administrative rights. You will <strong>NOT</strong> be able to mint tokens, change fees, or update the contract logic ever again.
                            </p>
                         </div>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div>
                            <label className="block text-gray-300 font-medium mb-3">
                                Type <span className="text-red-500 font-mono font-bold bg-red-950 px-2 py-0.5 rounded border border-red-900">RENOUNCE</span> to confirm
                            </label>
                            <input 
                                type="text" 
                                value={renounceConfirmText}
                                onChange={(e) => setRenounceConfirmText(e.target.value)}
                                className="w-full bg-dark border border-red-900/50 rounded-xl p-4 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all placeholder-red-900/50"
                                placeholder="RENOUNCE"
                            />
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <FeeDisplay baseAmount={renounceServiceCost} networkFee={0.005} currency={chainConfig.currency} actionName="Renounce Tool" />
                    </div>
                </div>
            )}
           </div>
        );
        
      case 'HISTORY':
        const transactions = token.transactions || [];
        return (
            <div className="space-y-6 animate-slide-up">
                 <TabHeader 
                  icon={History} 
                  color="purple" 
                  title="Transaction History" 
                  description="Log of all activities performed on this token." 
                />
                
                <div className="bg-card border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
                    {transactions.length === 0 ? (
                         <div className="p-16 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                <Clock className="w-10 h-10 text-gray-600" />
                            </div>
                            <h3 className="text-gray-300 font-bold text-lg">No Transactions Yet</h3>
                            <p className="text-gray-600 mt-2">Start interacting with your token to see history.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-800">
                            {transactions.map((tx) => {
                                let TxIcon = CheckCircle2;
                                let txColor = "text-green-400 bg-green-500/10 border-green-500/20";
                                
                                switch(tx.type) {
                                    case 'BURN': TxIcon = Flame; txColor = "text-red-400 bg-red-500/10 border-red-500/20"; break;
                                    case 'MINT': TxIcon = Coins; txColor = "text-green-400 bg-green-500/10 border-green-500/20"; break;
                                    case 'SWAP': TxIcon = RefreshCw; txColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/20"; break;
                                    case 'LIQUIDITY': TxIcon = Droplets; txColor = "text-blue-400 bg-blue-500/10 border-blue-500/20"; break;
                                    case 'BRIDGE': TxIcon = ArrowRightLeft; txColor = "text-orange-400 bg-orange-500/10 border-orange-500/20"; break;
                                    case 'RENOUNCE': TxIcon = UserX; txColor = "text-red-500 bg-red-500/10 border-red-500/20"; break;
                                    case 'VERIFY': TxIcon = ShieldCheck; txColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"; break;
                                    case 'LOCK': TxIcon = Lock; txColor = "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"; break;
                                    case 'FAUCET': TxIcon = Gift; txColor = "text-pink-400 bg-pink-500/10 border-pink-500/20"; break;
                                }
                                
                                return (
                                    <div key={tx.id} className="p-6 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row items-start md:items-center gap-5 group">
                                        <div className={`p-3 rounded-xl border shrink-0 ${txColor}`}>
                                            <TxIcon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-gray-200 text-base truncate pr-4">{tx.description}</h4>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border tracking-wider ${tx.status === 'Success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2">{new Date(tx.date).toLocaleString()}</p>
                                            <div className="flex flex-wrap justify-between items-center gap-2">
                                                <span className="text-sm text-gray-300 font-mono bg-black/20 px-3 py-1 rounded-lg border border-gray-800">{tx.amount}</span>
                                                <a href="#" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    View on Explorer <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
      
      default:
        return null;
    }
  };

  const explorerUrl = chainConfig.explorer ? chainConfig.explorer[token.networkMode] : '#';

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <button onClick={onBack} className="group text-gray-400 hover:text-yellow-400 mb-6 flex items-center gap-2 transition-colors pl-2">
        <div className="p-1.5 bg-slate-800 rounded-lg group-hover:bg-yellow-500 transition-colors border border-gray-700 group-hover:border-yellow-500">
             <ArrowRight className="w-4 h-4 rotate-180 text-white group-hover:text-black" />
        </div>
        <span className="text-sm font-bold">Back to Dashboard</span>
      </button>

      <div className="bg-card rounded-[2rem] border border-gray-800 overflow-hidden shadow-2xl ring-1 ring-white/5">
        {/* Token Header */}
        <div className="p-8 md:p-10 border-b border-gray-800 flex flex-col lg:flex-row items-start lg:items-center justify-between bg-gradient-to-r from-slate-900/80 to-slate-900/40 gap-8 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 opacity-50"></div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-24 h-24 rounded-2xl bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-gray-700 shadow-2xl group hover:scale-105 transition-transform duration-500">
              {token.logoUrl ? <img src={token.logoUrl} className="w-full h-full object-cover" /> : <span className="text-4xl font-bold text-gray-600">{token.symbol[0]}</span>}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-4xl font-bold text-white tracking-tight">{token.name}</h2>
                  <span className="text-sm font-bold bg-yellow-500 text-black px-3 py-1 rounded-lg shadow-lg shadow-yellow-500/20">{token.symbol}</span>
                  
                   {/* Status Indicator */}
                   {token.status === 'deploying' && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" /> Deploying
                    </span>
                  )}
                  {token.status === 'active' && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-wider">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Active
                    </span>
                  )}
                  {token.status === 'error' && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
                      <AlertTriangle className="w-3 h-3" /> Error
                    </span>
                  )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                 <span className="px-3 py-1 rounded-full bg-slate-800 border border-gray-700 text-gray-300 flex items-center gap-2">
                    {chainConfig.icon} {token.chain}
                 </span>
                 <span className={`px-3 py-1 rounded-full border flex items-center gap-2 ${token.networkMode === NetworkMode.MAINNET ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                    {token.networkMode === NetworkMode.MAINNET ? <Globe className="w-3 h-3"/> : <Beaker className="w-3 h-3"/>}
                    {token.networkMode}
                 </span>
              </div>

              {token.contractAddress && (
                <div className="flex items-center gap-2 mt-3 group cursor-pointer" onClick={() => navigator.clipboard.writeText(token.contractAddress!)}>
                    <span className="text-xs text-gray-500 font-mono bg-black/30 px-3 py-1.5 rounded-lg border border-gray-800 group-hover:border-yellow-500/50 group-hover:text-yellow-200 transition-colors flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3" />
                        {token.contractAddress}
                        <Copy className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                    </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 relative z-10 items-center">
             {/* Quality Score Widget */}
             <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-xl border border-gray-700 backdrop-blur-sm">
                 <div className="relative w-10 h-10 flex items-center justify-center">
                     <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                         <path className="text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                         <path 
                            className={`${getScoreRingColor(qualityScore)} drop-shadow-[0_0_5px_rgba(0,0,0,0.3)] transition-all duration-1000 ease-out`} 
                            strokeDasharray={`${qualityScore}, 100`} 
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="4" 
                            strokeLinecap="round"
                         />
                     </svg>
                     <span className={`absolute text-[10px] font-bold ${getScoreColor(qualityScore)}`}>{qualityScore}</span>
                 </div>
                 <div className="flex flex-col">
                     <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Trust Score</span>
                     <span className={`text-sm font-bold ${getScoreColor(qualityScore)}`}>
                         {qualityScore >= 100 ? 'Excellent' : qualityScore > 60 ? 'Good' : 'Risk'}
                     </span>
                 </div>
             </div>

             <div className="flex gap-3">
                {token.networkMode === NetworkMode.TESTNET && (
                    <button 
                        onClick={handleFaucet}
                        className="px-5 py-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/40 rounded-xl text-yellow-400 text-sm font-bold transition-all hover:scale-105 flex items-center gap-2 shadow-lg shadow-yellow-500/5"
                    >
                    <Gift className="w-4 h-4" /> Faucet
                    </button>
                )}
                <a 
                    href={explorerUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl text-gray-300 text-sm font-bold transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
                >
                <ExternalLink className="w-4 h-4" /> Explorer
                </a>
             </div>
          </div>
        </div>

        {/* Market Stats Bar - NEW SECTION */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-gray-800 divide-x divide-gray-800 bg-slate-900/30 backdrop-blur-sm">
           <div className="p-6 flex flex-col gap-1">
               <span className="text-xs text-gray-500 uppercase tracking-wider font-bold flex items-center gap-1">
                   <DollarSign className="w-3 h-3" /> Current Price
               </span>
               <div className="flex items-baseline gap-2">
                   {marketPrice > 0 ? (
                       <span className="text-2xl font-bold text-white font-mono">${marketPrice.toFixed(6)}</span>
                   ) : (
                       <span className="text-2xl font-bold text-gray-600 font-mono">---</span>
                   )}
               </div>
           </div>
           
           <div className="p-6 flex flex-col gap-1">
               <span className="text-xs text-gray-500 uppercase tracking-wider font-bold flex items-center gap-1">
                   <Activity className="w-3 h-3" /> 24h Change
               </span>
               <div className="flex items-baseline gap-2">
                   {marketPrice > 0 ? (
                       <span className={`text-lg font-bold flex items-center ${isPositiveChange ? 'text-green-400' : 'text-red-400'}`}>
                           {isPositiveChange ? '+' : ''}{priceChangePercent.toFixed(2)}%
                       </span>
                   ) : (
                       <span className="text-lg font-bold text-gray-600">---</span>
                   )}
               </div>
           </div>

           <div className="p-6 flex flex-col gap-1">
               <span className="text-xs text-gray-500 uppercase tracking-wider font-bold flex items-center gap-1">
                   <Droplets className="w-3 h-3" /> Liquidity
               </span>
               <div className="flex items-baseline gap-2">
                   {marketLiq > 0 ? (
                       <span className="text-xl font-bold text-white font-mono">${marketLiq.toLocaleString()}</span>
                   ) : (
                       <span className="text-xl font-bold text-gray-600 font-mono">$0.00</span>
                   )}
               </div>
           </div>

           <div className="p-6 flex flex-col gap-1">
               <span className="text-xs text-gray-500 uppercase tracking-wider font-bold flex items-center gap-1">
                   <BarChart3 className="w-3 h-3" /> Market Cap
               </span>
               <div className="flex items-baseline gap-2">
                   {marketCap > 0 ? (
                       <span className="text-xl font-bold text-white font-mono">${marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                   ) : (
                       <span className="text-xl font-bold text-gray-600 font-mono">---</span>
                   )}
               </div>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row min-h-[700px] bg-slate-900/20">
          {/* Sidebar Menu */}
          <div className="w-full lg:w-72 bg-card/50 border-r border-gray-800 p-4 space-y-1.5 backdrop-blur-sm">
            {[
              { id: 'LIQUIDITY', label: 'Liquidity', icon: Droplets, color: 'text-blue-400' },
              { id: 'SWAP', label: 'Swap', icon: RefreshCw, color: 'text-orange-400' },
              { id: 'MINT', label: 'Mint', icon: Coins, color: 'text-green-400' },
              { id: 'BURN', label: 'Burn', icon: Flame, color: 'text-red-400' },
              { id: 'LOCK', label: 'Lock', icon: Lock, color: 'text-yellow-400' },
              { id: 'BRIDGE', label: 'Bridge', icon: ArrowRightLeft, color: 'text-purple-400' },
              { id: 'VERIFY', label: 'Verify Contract', icon: ShieldCheck, color: 'text-emerald-400' },
              { id: 'RENOUNCE', label: 'Renounce Owner', icon: UserX, color: 'text-red-500' },
              { id: 'HISTORY', label: 'History', icon: History, color: 'text-purple-400' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActionType)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all group relative overflow-hidden ${
                  activeTab === item.id 
                    ? 'bg-slate-800 text-white shadow-lg border border-gray-700' 
                    : 'text-gray-400 hover:bg-slate-800/50 hover:text-gray-200 border border-transparent'
                }`}
              >
                {activeTab === item.id && (
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500"></div>
                )}
                <item.icon className={`w-5 h-5 transition-colors ${activeTab === item.id ? item.color : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span className="font-bold text-sm tracking-wide">{item.label}</span>
                {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto text-yellow-500 animate-pulse" />}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 md:p-12 bg-[#020617]">
            {renderTabContent()}
            
            {/* Main Action Button */}
            {!(activeTab === 'HISTORY' || (activeTab === 'RENOUNCE' && isRenounced)) && (
              <div className="mt-12 pt-8 border-t border-gray-800 flex justify-end animate-fade-in">
                <button 
                  onClick={handleAction}
                  className={`relative overflow-hidden px-12 py-5 rounded-2xl font-bold text-lg shadow-2xl transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-3 group ${
                    activeTab === 'RENOUNCE' 
                        ? 'bg-gradient-to-r from-red-600 to-red-500 hover:shadow-red-600/30 text-white' 
                        : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-yellow-500/30 text-black'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                      {activeTab === 'VERIFY' ? 'Verify Now' : activeTab === 'SWAP' ? `Swap Tokens` : activeTab === 'RENOUNCE' ? 'Renounce Ownership' : activeTab === 'LOCK' ? 'Confirm Lock' : 'Confirm Transaction'}
                  </span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};