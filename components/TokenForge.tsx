import React, { useState, useEffect } from 'react';
import { Hammer, Flame, Lock, Info, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';
import { NetworkId } from '../types';
import { analyzeTokenSafety, AIAnalysisResult } from '../services/aiService';
import { estimateCreationFee } from '../services/walletService';

interface TokenForgeProps {
  network: NetworkId;
  isConnected: boolean;
}

type ForgeTab = 'create' | 'manage' | 'vesting';

export const TokenForge: React.FC<TokenForgeProps> = ({ network, isConnected }) => {
  const [activeTab, setActiveTab] = useState<ForgeTab>('create');
  const [formState, setFormState] = useState({ name: '', symbol: '', supply: '', decimals: '18' });
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [estimatedFee, setEstimatedFee] = useState<string>('Calculating...');

  // Real-time AI Validation
  useEffect(() => {
    const result = analyzeTokenSafety(
      formState.name, 
      formState.symbol, 
      formState.supply, 
      formState.decimals
    );
    setAnalysis(result);
  }, [formState]);

  // Fetch Estimated Fee
  useEffect(() => {
    let mounted = true;
    const fetchFee = async () => {
      setEstimatedFee('Calculating...');
      const fee = await estimateCreationFee(network);
      if (mounted) setEstimatedFee(fee);
    };
    fetchFee();
    return () => { mounted = false; };
  }, [network]);

  const handleAction = () => {
    if (!isConnected) return;
    if (analysis && !analysis.isSafe) {
        if(!confirm("AI Security Warning: This token has a low safety score. Do you want to proceed?")) return;
    }

    setIsProcessing(true);
    setSuccess(null);
    
    // Simulate blockchain interaction
    setTimeout(() => {
        setIsProcessing(false);
        setSuccess(`Successfully forged ${formState.name || 'Token'} on ${network}!`);
        // In real app, this would trigger wallet transaction
    }, 2000);
  };

  const TabButton = ({ id, label, icon: Icon }: { id: ForgeTab, label: string, icon: any }) => (
    <button
      onClick={() => { setActiveTab(id); setSuccess(null); }}
      className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-medium text-sm transition-all ${
        activeTab === id 
          ? 'bg-slate-800 text-yellow-400 border-t-2 border-yellow-400' 
          : 'bg-slate-900/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Token Forge</h2>
        <p className="text-slate-400">Mint, manage, and bridge assets across BNB, Solana, and TON.</p>
      </div>

      <div className="flex border-b border-slate-800 mb-0">
        <TabButton id="create" label="Mint Token" icon={Hammer} />
        <TabButton id="manage" label="Burn & Renounce" icon={Flame} />
        <TabButton id="vesting" label="Liquidity Lock" icon={Lock} />
      </div>

      <div className="bg-slate-800 p-8 rounded-b-2xl rounded-tr-2xl border border-slate-700 shadow-xl">
        {!isConnected ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Wallet Disconnected</h3>
            <p className="text-slate-400">Please connect your wallet to access the Forge.</p>
          </div>
        ) : (
          <>
            {success && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 text-green-400 animate-slideUp">
                    <CheckCircle2 size={20} />
                    <span>{success}</span>
                </div>
            )}

            {activeTab === 'create' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slideUp">
                {/* Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Token Name</label>
                        <input 
                            type="text" 
                            value={formState.name}
                            onChange={(e) => setFormState({...formState, name: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none"
                            placeholder="e.g. Kuba Coin"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Symbol</label>
                        <input 
                            type="text" 
                            value={formState.symbol}
                            onChange={(e) => setFormState({...formState, symbol: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                            placeholder="e.g. KUBA"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Total Supply</label>
                        <input 
                            type="number" 
                            value={formState.supply}
                            onChange={(e) => setFormState({...formState, supply: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                            placeholder="1000000"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Decimals</label>
                        <input 
                            type="number" 
                            value={formState.decimals}
                            onChange={(e) => setFormState({...formState, decimals: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                            placeholder="18"
                        />
                    </div>
                    </div>
                    
                    <div className="pt-4">
                        <button 
                            onClick={handleAction}
                            disabled={isProcessing}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-slate-900 font-bold py-4 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-orange-500/20 flex justify-center items-center gap-2"
                        >
                            {isProcessing ? (
                                <>Thinking...</>
                            ) : (
                                <><Hammer size={20} /> Forge Token on {network}</>
                            )}
                        </button>
                        <p className="text-center text-xs text-slate-500 mt-3 flex items-center justify-center gap-1">
                            <Info size={12} /> 
                            Estimated Network Fee: <span className="text-yellow-500 font-mono">{estimatedFee}</span> {network.includes('bnb') ? 'BNB' : network === 'solana' ? 'SOL' : 'TON'}
                        </p>
                    </div>
                </div>

                {/* AI Validator Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 h-full">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-800">
                            <Shield className="text-yellow-500" size={20} />
                            <h3 className="font-bold text-white">AI Validator</h3>
                        </div>

                        {analysis && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Safety Score</span>
                                    <span className={`text-xl font-bold ${analysis.score > 80 ? 'text-green-400' : analysis.score > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {analysis.score}/100
                                    </span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-500 ${analysis.score > 80 ? 'bg-green-500' : analysis.score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        style={{ width: `${analysis.score}%` }}
                                    ></div>
                                </div>

                                {analysis.issues.length > 0 && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase mb-2">
                                            <AlertTriangle size={12} /> Issues Detected
                                        </div>
                                        <ul className="space-y-1">
                                            {analysis.issues.map((issue, idx) => (
                                                <li key={idx} className="text-xs text-red-300">• {issue}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {analysis.recommendations.length > 0 && (
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                        <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase mb-2">
                                            <Info size={12} /> Recommendations
                                        </div>
                                        <ul className="space-y-1">
                                            {analysis.recommendations.map((rec, idx) => (
                                                <li key={idx} className="text-xs text-blue-300">• {rec}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {analysis.score === 100 && analysis.issues.length === 0 && (
                                    <div className="text-center py-4">
                                        <CheckCircle2 size={40} className="text-green-500 mx-auto mb-2" />
                                        <p className="text-sm text-green-400">Ready to Forge!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'manage' && (
               <div className="text-center py-12 space-y-4 animate-slideUp">
                   <Flame size={48} className="mx-auto text-red-500 mb-4" />
                   <h3 className="text-xl font-bold text-white">Burn & Renounce</h3>
                   <p className="text-slate-400 max-w-md mx-auto">
                       Select a token from your wallet to burn supply or renounce ownership. 
                       This action is irreversible.
                   </p>
                   <button className="bg-slate-700 hover:bg-red-500/20 hover:text-red-400 text-white px-6 py-3 rounded-lg transition-colors border border-slate-600">
                       Select Token
                   </button>
               </div>
            )}
            
             {activeTab === 'vesting' && (
               <div className="text-center py-12 space-y-4 animate-slideUp">
                   <Lock size={48} className="mx-auto text-blue-500 mb-4" />
                   <h3 className="text-xl font-bold text-white">Liquidity Locker</h3>
                   <p className="text-slate-400 max-w-md mx-auto">
                       Lock your LP tokens to build trust with your community. 
                       KUBA Forge provides audited vesting contracts.
                   </p>
                   <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition-colors shadow-lg shadow-blue-500/20">
                       Create Lock
                   </button>
               </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};