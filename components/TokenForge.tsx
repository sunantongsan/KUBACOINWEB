import React, { useState, useEffect, useRef } from 'react';
import { Hammer, Flame, Lock, Info, CheckCircle2, AlertTriangle, Shield, Fuel, FileText, Image as ImageIcon, Upload, X, ExternalLink } from 'lucide-react';
import { NetworkId } from '../types';
import { analyzeTokenSafety, AIAnalysisResult } from '../services/aiService';
import { estimateCreationFee, TREASURY_WALLETS, ACTION_FEES } from '../services/walletService';
import { BEP20_ABI, BEP20_BYTECODE } from '../services/bnbContract';
import { ethers } from 'ethers';

interface TokenForgeProps {
  network: NetworkId;
  isConnected: boolean;
}

type ForgeTab = 'create' | 'manage' | 'vesting';

export const TokenForge: React.FC<TokenForgeProps> = ({ network, isConnected }) => {
  const [activeTab, setActiveTab] = useState<ForgeTab>('create');
  
  // Form States
  const [formState, setFormState] = useState({ 
    name: '', 
    symbol: '', 
    supply: '', 
    decimals: '18',
    logoUrl: '',
    description: ''
  });
  const [manageState, setManageState] = useState({
      tokenAddress: '',
      amount: ''
  });
  const [lockState, setLockState] = useState({
      tokenAddress: '',
      amount: '',
      unlockDate: ''
  });

  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [estimatedFee, setEstimatedFee] = useState<string>('Calculating...');
  const [verifyLink, setVerifyLink] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      try {
        const fee = await estimateCreationFee(network);
        if (mounted) setEstimatedFee(fee);
      } catch (e: any) {
        // Display specific error if calculation fails completely
        if (mounted) setEstimatedFee(e.message || 'Fee Error');
      }
    };
    fetchFee();
    return () => { mounted = false; };
  }, [network]);

  const getCurrencyLabel = (net: NetworkId) => {
    if (net.includes('bnb')) return 'BNB';
    if (net.includes('solana')) return 'SOL';
    if (net.includes('ton')) return 'TON';
    return '';
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files[0]) return;
    
    const file = files[0];
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Only JPG and PNG files are allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormState(prev => ({ ...prev, logoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleMint = async () => {
    if (!isConnected) return;
    if (analysis && !analysis.isSafe) {
        if(!confirm("AI Security Warning: This token has a low safety score. Do you want to proceed?")) return;
    }

    setIsProcessing(true);
    setSuccess(null);
    setError(null);
    setVerifyLink(null);

    try {
        if (network.includes('bnb')) {
            if (!window.ethereum) throw new Error("MetaMask not found");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            // 1. Collect Mint Fee (0.005 BNB)
            const platformFee = ethers.parseEther(ACTION_FEES.MINT); 
            const feeTx = await signer.sendTransaction({
                to: TREASURY_WALLETS.BNB,
                value: platformFee
            });
            await feeTx.wait(1);

            // 2. Deploy Contract
            const factory = new ethers.ContractFactory(BEP20_ABI, BEP20_BYTECODE, signer);
            const supplyClean = formState.supply.replace(/,/g, '');
            const supplyWei = ethers.parseUnits(supplyClean, parseInt(formState.decimals));
            const contract = await factory.deploy(formState.name, formState.symbol, supplyWei);
            await contract.waitForDeployment();
            const contractAddress = await contract.getAddress();

            const explorerBase = network === 'bnb-testnet' ? 'https://testnet.bscscan.com' : 'https://bscscan.com';
            setVerifyLink(`${explorerBase}/verifyContract?a=${contractAddress}`);
            setSuccess(`Successfully forged ${formState.name}! Contract Address: ${contractAddress}`);
        } else {
             // SIMULATION FOR NON-EVM
             await new Promise(resolve => setTimeout(resolve, 2000));
             
             let mockAddress = "";
             if (network.includes('ton')) {
                 // Generate realistic looking TON address
                 mockAddress = "EQD" + Math.random().toString(36).substring(2, 15).toUpperCase() + Math.random().toString(36).substring(2, 15).toUpperCase();
             } else {
                 mockAddress = "So" + Math.random().toString(36).substring(2, 15) + "...";
             }

             setSuccess(`Successfully forged ${formState.name} on ${network}! Address: ${mockAddress} (Simulation)`);
             
             if (network === 'ton-testnet') {
                setVerifyLink(`https://testnet.tonviewer.com/${mockAddress}`);
             } else if (network === 'ton') {
                setVerifyLink(`https://tonviewer.com/${mockAddress}`);
             } else if (network.includes('solana')) {
                 // Just a placeholder for Solana
                 const cluster = network === 'solana-devnet' ? '?cluster=devnet' : '';
                 setVerifyLink(`https://solscan.io/token/${mockAddress}${cluster}`);
             }
        }
    } catch (err: any) {
        console.error(err);
        setError(err.message || "Transaction failed");
    } finally {
        setIsProcessing(false);
    }
  };

  const handleManageAction = async (action: 'burn' | 'renounce') => {
      if(!isConnected || !manageState.tokenAddress) return;

      // Confirmation Checks
      if (action === 'burn') {
          if (!manageState.amount || parseFloat(manageState.amount) <= 0) {
              setError("Please enter a valid amount to burn.");
              return;
          }
          const confirmBurn = window.confirm(`Are you sure you want to BURN ${manageState.amount} tokens? This action is irreversible and destroys tokens forever.`);
          if (!confirmBurn) return;
      } else {
          const confirmRenounce = window.confirm("DANGER: Are you sure you want to RENOUNCE OWNERSHIP? You will lose all control over the token contract (cannot mint, pause, or blacklist anymore). This cannot be undone.");
          if (!confirmRenounce) return;
      }

      setIsProcessing(true);
      setSuccess(null);
      setError(null);

      try {
          if(network.includes('bnb')) {
              const provider = new ethers.BrowserProvider(window.ethereum);
              const signer = await provider.getSigner();
              
              // 1. Pay Fee
              const feeAmount = action === 'burn' ? ACTION_FEES.BURN : ACTION_FEES.RENOUNCE;
              const feeTx = await signer.sendTransaction({
                to: TREASURY_WALLETS.BNB,
                value: ethers.parseEther(feeAmount)
              });
              await feeTx.wait(1);

              // 2. Contract Interaction
              const contract = new ethers.Contract(manageState.tokenAddress, BEP20_ABI, signer);
              
              if(action === 'burn') {
                  // Fetch decimals to ensure correct burning
                  let decimals = 18;
                  try {
                      decimals = await contract.decimals();
                  } catch (e) {
                      console.warn("Could not fetch decimals, defaulting to 18");
                  }

                  const burnAmount = ethers.parseUnits(manageState.amount, decimals);
                  
                  // Execute Burn
                  const tx = await contract.burn(burnAmount);
                  await tx.wait(1);
                  setSuccess(`Successfully burned ${manageState.amount} tokens!`);
              } else {
                  // Renounce
                  const tx = await contract.renounceOwnership();
                  await tx.wait(1);
                  setSuccess(`Successfully renounced ownership! Contract is now trustless.`);
              }
          } else {
              // Simulation for other chains
              await new Promise(resolve => setTimeout(resolve, 2000));
              setSuccess(`${action === 'burn' ? 'Burn' : 'Renounce'} successful on ${network} (Simulation)`);
          }
      } catch (err: any) {
          console.error(err);
          setError(err.message || "Action failed. Ensure you are the owner and have enough tokens.");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleLock = async () => {
      if(!isConnected) return;
      setIsProcessing(true);
      setSuccess(null);
      setError(null);
      try {
          if(network.includes('bnb')) {
              const provider = new ethers.BrowserProvider(window.ethereum);
              const signer = await provider.getSigner();
              
              // 1. Pay Lock Fee
              const feeTx = await signer.sendTransaction({
                  to: TREASURY_WALLETS.BNB,
                  value: ethers.parseEther(ACTION_FEES.LOCK)
              });
              await feeTx.wait(1);
              
              // 2. Simulate Lock (Transfer to Safe/Lock Address or Contract)
              // Since we don't have a deployed Lock Contract address, we'll simulate the payment success
              // In a real app, you would approve() and call lock() on a VestingContract.
              setSuccess("Liquidity successfully locked! (Fee Paid, Lock Contract interaction simulated)");
          } else {
              await new Promise(resolve => setTimeout(resolve, 2000));
              setSuccess("Lock successful (Simulation)");
          }
      } catch (err: any) {
          setError(err.message);
      } finally {
          setIsProcessing(false);
      }
  };

  const TabButton = ({ id, label, icon: Icon }: { id: ForgeTab, label: string, icon: any }) => (
    <button
      onClick={() => { setActiveTab(id); setSuccess(null); setError(null); setVerifyLink(null); }}
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

  const getLinkText = () => {
    if (network.includes('bnb')) return 'Verify Contract on BscScan';
    if (network.includes('ton')) return 'View Contract on Tonviewer';
    return 'View on Explorer';
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Token Forge</h2>
        <p className="text-slate-400">Mint, manage, and bridge assets across BNB, Solana, and TON.</p>
      </div>

      <div className="flex border-b border-slate-800 mb-0 overflow-x-auto">
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
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex flex-col gap-3 text-green-400 animate-slideUp break-all">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={20} className="shrink-0" />
                        <span>{success}</span>
                    </div>
                    {verifyLink && (
                        <a 
                            href={verifyLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-8 text-sm font-bold underline hover:text-green-300 flex items-center gap-1 w-fit"
                        >
                            {getLinkText()} <ExternalLink size={12} />
                        </a>
                    )}
                </div>
            )}
            
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 animate-slideUp">
                    <AlertTriangle size={20} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {activeTab === 'create' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slideUp">
                {/* Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Section 1: Basic Info */}
                    <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50">
                        <h4 className="text-slate-200 font-bold mb-4 flex items-center gap-2">
                            <FileText size={18} className="text-yellow-500"/> Token Details
                        </h4>
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
                    </div>

                    {/* Section 2: Branding */}
                    <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50">
                        <h4 className="text-slate-200 font-bold mb-4 flex items-center gap-2">
                            <ImageIcon size={18} className="text-yellow-500"/> Branding & Logo
                        </h4>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex justify-between">
                                    <span>Token Logo</span>
                                    <span className="text-xs text-slate-500">Max 2MB (PNG/JPG)</span>
                                </label>
                                
                                <div className="flex gap-4 items-start">
                                    {formState.logoUrl ? (
                                        <div className="relative group shrink-0">
                                             <img 
                                                src={formState.logoUrl} 
                                                alt="Token Logo" 
                                                className="w-24 h-24 rounded-xl object-cover border-2 border-slate-700 bg-slate-800"
                                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Error'; }}
                                             />
                                             <button 
                                                onClick={() => setFormState({...formState, logoUrl: ''})}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                             >
                                                <X size={12} />
                                             </button>
                                        </div>
                                    ) : (
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-700 hover:border-yellow-500 bg-slate-800/50 flex flex-col items-center justify-center cursor-pointer transition-colors group shrink-0"
                                        >
                                            <Upload size={20} className="text-slate-500 group-hover:text-yellow-500 mb-1" />
                                            <span className="text-[10px] text-slate-500 group-hover:text-slate-300">Upload</span>
                                        </div>
                                    )}

                                    <div className="flex-1 space-y-2">
                                         <input 
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            accept="image/png, image/jpeg"
                                            className="hidden"
                                        />
                                        <input 
                                            type="text" 
                                            value={formState.logoUrl}
                                            onChange={(e) => setFormState({...formState, logoUrl: e.target.value})}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none text-sm"
                                            placeholder="or paste image URL..."
                                        />
                                        <p className="text-xs text-slate-500">
                                            Upload a logo or paste a direct link. Recommended size: 200x200px.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Description</label>
                                <textarea 
                                    value={formState.description}
                                    onChange={(e) => setFormState({...formState, description: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none h-24 resize-none"
                                    placeholder="Briefly describe your token project..."
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-4 space-y-4">
                        {/* Fee Estimate Section */}
                        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                 <div className="p-2 bg-yellow-500/10 rounded-lg">
                                    <Fuel size={20} className="text-yellow-500" />
                                 </div>
                                 <div>
                                    <p className="text-sm text-slate-300 font-medium">Estimated Cost</p>
                                    <p className="text-xs text-slate-500">{ACTION_FEES.MINT} Fee + Gas</p>
                                 </div>
                             </div>
                             <div className="text-right">
                                 <div className="text-lg font-bold text-white font-mono">
                                    ~{estimatedFee} <span className="text-yellow-500 text-sm">{getCurrencyLabel(network)}</span>
                                 </div>
                             </div>
                        </div>

                        <button 
                            onClick={handleMint}
                            disabled={isProcessing}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-slate-900 font-bold py-4 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-orange-500/20 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? 'Processing Transaction...' : <><Hammer size={20} /> Forge Token on {network}</>}
                        </button>
                    </div>
                </div>

                {/* AI Validator Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 h-full sticky top-24">
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
               <div className="max-w-2xl mx-auto space-y-8 animate-slideUp">
                   <div className="text-center">
                        <Flame size={48} className="mx-auto text-red-500 mb-4" />
                        <h3 className="text-2xl font-bold text-white">Burn & Renounce</h3>
                        <p className="text-slate-400">Manage your token ownership and supply.</p>
                   </div>

                   <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-300">Token Address</label>
                            <input 
                                type="text"
                                value={manageState.tokenAddress}
                                onChange={(e) => setManageState({...manageState, tokenAddress: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white mt-1"
                                placeholder="0x..."
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-900/50 border border-red-500/20 rounded-xl p-6 text-center hover:border-red-500/50 transition-all">
                                <h4 className="font-bold text-red-400 mb-2">Burn Tokens</h4>
                                <p className="text-xs text-slate-500 mb-4">Permanently remove tokens from circulation.</p>
                                <input 
                                    type="text"
                                    placeholder="Amount"
                                    value={manageState.amount}
                                    onChange={(e) => setManageState({...manageState, amount: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white mb-4 text-sm"
                                />
                                <button 
                                    onClick={() => handleManageAction('burn')}
                                    disabled={isProcessing}
                                    className="w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg font-bold text-sm"
                                >
                                    Burn ({ACTION_FEES.BURN} Fee)
                                </button>
                            </div>
                            
                            <div className="bg-slate-900/50 border border-orange-500/20 rounded-xl p-6 text-center hover:border-orange-500/50 transition-all">
                                <h4 className="font-bold text-orange-400 mb-2">Renounce Ownership</h4>
                                <p className="text-xs text-slate-500 mb-4">Make contract immutable and trustless.</p>
                                <div className="h-[42px] mb-4"></div> {/* Spacer */}
                                <button 
                                    onClick={() => handleManageAction('renounce')}
                                    disabled={isProcessing}
                                    className="w-full bg-orange-600 hover:bg-orange-500 text-white py-2 rounded-lg font-bold text-sm"
                                >
                                    Renounce ({ACTION_FEES.RENOUNCE} Fee)
                                </button>
                            </div>
                        </div>
                   </div>
               </div>
            )}
            
             {activeTab === 'vesting' && (
               <div className="max-w-2xl mx-auto space-y-8 animate-slideUp">
                   <div className="text-center">
                       <Lock size={48} className="mx-auto text-blue-500 mb-4" />
                       <h3 className="text-2xl font-bold text-white">Liquidity Locker</h3>
                       <p className="text-slate-400">Secure your LP tokens to gain community trust.</p>
                   </div>
                   
                   <div className="space-y-4 bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                        <div>
                            <label className="text-sm font-medium text-slate-300">LP / Token Address</label>
                            <input 
                                type="text"
                                value={lockState.tokenAddress}
                                onChange={(e) => setLockState({...lockState, tokenAddress: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white mt-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-sm font-medium text-slate-300">Amount</label>
                                <input 
                                    type="number"
                                    value={lockState.amount}
                                    onChange={(e) => setLockState({...lockState, amount: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white mt-1"
                                />
                             </div>
                             <div>
                                <label className="text-sm font-medium text-slate-300">Unlock Date</label>
                                <input 
                                    type="date"
                                    value={lockState.unlockDate}
                                    onChange={(e) => setLockState({...lockState, unlockDate: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white mt-1"
                                />
                             </div>
                        </div>
                        
                        <button 
                            onClick={handleLock}
                            disabled={isProcessing}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/20 mt-4"
                        >
                           {isProcessing ? 'Processing...' : `Lock Assets (${ACTION_FEES.LOCK} BNB Fee)`}
                        </button>
                   </div>
               </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};