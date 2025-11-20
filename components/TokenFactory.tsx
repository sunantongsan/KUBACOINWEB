
import React, { useState } from 'react';
import { Layers, CheckCircle, Loader2, Coins, Image as ImageIcon, AlertTriangle, Zap, Flame, ShieldCheck, FileCode, Droplets, ExternalLink } from 'lucide-react';
import { BlockchainService } from '../services/blockchain';
import { FEE_WALLETS, PLATFORM_FEES } from '../types';

type Network = 'BNB' | 'SOL' | 'TON';

interface TokenFactoryProps {
  isTestnet?: boolean;
  walletAddress?: string | null;
  blockchainService?: BlockchainService;
}

export const TokenFactory: React.FC<TokenFactoryProps> = ({ isTestnet = true, walletAddress, blockchainService }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');
  const [network, setNetwork] = useState<Network>('BNB');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>(''); // 'FEE', 'DEPLOY', 'APPROVE', 'LIQUIDITY'
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  
  // Form State
  const [form, setForm] = useState({
    name: '',
    symbol: '',
    supply: '',
    decimals: '18',
    description: '',
    logoUrl: ''
  });

  // Advanced Options
  const [isRenounced, setIsRenounced] = useState(false);
  const [isVerified, setIsVerified] = useState(true);

  // Liquidity State
  const [addLiquidityNow, setAddLiquidityNow] = useState(false);
  const [liquidityBnbAmount, setLiquidityBnbAmount] = useState('');

  const [userTokens, setUserTokens] = useState([
    { id: 1, name: 'Kuba Test Token', symbol: 'KTT', network: 'BNB', supply: '1,000,000', address: '0x71C...9A21', logoUrl: '' },
  ]);

  const handleDeploy = async () => {
    if (!blockchainService) return;
    
    if (!walletAddress) {
      alert("Please connect your wallet first!");
      await blockchainService.connectWallet();
      return;
    }

    if (network !== 'BNB') {
      alert("Auto-Liquidity is currently optimized for BNB Chain. Please use BNB network.");
      return;
    }

    if (addLiquidityNow && !liquidityBnbAmount) {
      alert("Please enter a BNB amount to set the initial price.");
      return;
    }

    setIsLoading(true);
    setDeployedAddress(null);
    
    try {
      // Ensure we are on the right network
      await blockchainService.switchNetwork(isTestnet);

      // STEP 1: DEPLOY TOKEN (Includes Fee Payment inside service if structured, but here we treat deployToken as main entry)
      setCurrentStep('Paying Fee & Deploying Contract...');
      
      // This will THROW if funds are insufficient. No fake success.
      const newAddress = await blockchainService.deployToken(
        form.name, 
        form.symbol, 
        form.supply, 
        isRenounced,
        isVerified
      );
      
      if (newAddress) {
        setDeployedAddress(newAddress);
        
        // STEP 3 & 4: AUTO LIQUIDITY (If selected)
        if (addLiquidityNow && liquidityBnbAmount) {
          // 3. Approve
          setCurrentStep('Approving Token for Liquidity...');
          await blockchainService.approveToken(newAddress, form.supply, isTestnet);
          
          // 4. Add Liquidity
          setCurrentStep('Creating Market (Setting Price)...');
          await blockchainService.addLiquidity(newAddress, form.supply, liquidityBnbAmount, isTestnet);
        }

        // Success Handling
        const newToken = { 
          id: Date.now(), 
          name: form.name, 
          symbol: form.symbol, 
          network: network, 
          supply: form.supply, 
          address: newAddress,
          logoUrl: form.logoUrl 
        };
        
        setUserTokens([newToken, ...userTokens]);
        
        // Reset Form
        setForm({ name: '', symbol: '', supply: '', decimals: '18', description: '', logoUrl: '' });
        setAddLiquidityNow(false);
        setLiquidityBnbAmount('');
        setActiveTab('manage');
      }
    } catch (error: any) {
      console.error("Deploy Error:", error);
      // Show the REAL error to the user
      let errorMessage = error.message || "Unknown Error";
      
      // Making common errors user-friendly
      if (errorMessage.includes("insufficient funds")) {
        errorMessage = "Transaction Failed: Insufficient BNB for gas or fees.";
      } else if (errorMessage.includes("user rejected")) {
        errorMessage = "Transaction Failed: You rejected the request in MetaMask.";
      }
      
      alert(`${errorMessage}`);
    } finally {
      setIsLoading(false);
      setCurrentStep('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="text-emerald-400" />
            Real Token Factory
          </h2>
          <p className="text-slate-400 text-sm flex items-center gap-1">
             Deploy to {isTestnet ? 'Testnet' : 'Mainnet'}
             {isTestnet && <span className="text-yellow-500 text-xs border border-yellow-500/30 px-1 rounded">TEST MODE</span>}
          </p>
        </div>
        <div className="flex gap-2">
           {isTestnet && (
            <a 
              href="https://discord.com/invite/bnbchain" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold hover:bg-blue-600/30 transition-all"
            >
              <Droplets size={14} />
              💧 Get Free Testnet BNB
            </a>
           )}
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'create' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Create Token
            </button>
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'manage' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              My Tokens
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'create' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-xl">
          {!isTestnet && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-red-500 shrink-0" />
              <div>
                <h3 className="font-bold text-red-400">Warning: Mainnet Mode</h3>
                <p className="text-sm text-slate-300 mt-1">
                  You are about to deploy a contract on the real blockchain. This will cost real BNB. 
                  Please review your inputs carefully.
                </p>
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
               <label className="text-sm font-medium text-slate-300">Select Network</label>
               <span className="bg-emerald-900/30 text-emerald-400 text-[10px] px-2 py-1 rounded border border-emerald-500/30">
                  Competitors charge 0.5 - 1 BNB. We charge {PLATFORM_FEES.TOKEN_CREATION_BNB} BNB.
               </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'BNB', name: 'BNB Chain', color: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50 text-yellow-400' },
                { id: 'SOL', name: 'Solana', color: 'from-purple-500/20 to-purple-600/20 border-purple-500/50 text-purple-400' },
                { id: 'TON', name: 'TON Network', color: 'from-blue-500/20 to-blue-600/20 border-blue-500/50 text-blue-400' },
              ].map((net) => (
                <button
                  key={net.id}
                  onClick={() => setNetwork(net.id as Network)}
                  className={`relative p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                    network === net.id 
                    ? `bg-gradient-to-br ${net.color} ring-1 ring-offset-2 ring-offset-slate-900 ring-emerald-500` 
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-400'
                  }`}
                >
                  <span className="font-bold">{net.name}</span>
                  {network === net.id && <CheckCircle size={16} className="absolute top-2 right-2" />}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Token Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  placeholder="e.g. Kubacoin"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Symbol</label>
                <input
                  type="text"
                  value={form.symbol}
                  onChange={(e) => setForm({...form, symbol: e.target.value.toUpperCase()})}
                  placeholder="e.g. KUB"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                  Logo URL
                  <span className="text-xs text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded">Instant View</span>
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={form.logoUrl}
                      onChange={(e) => setForm({...form, logoUrl: e.target.value})}
                      placeholder="https://i.imgur.com/..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="w-12 h-12 shrink-0 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center overflow-hidden">
                    {form.logoUrl ? (
                      <img 
                        src={form.logoUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                        onError={(e) => (e.currentTarget as HTMLImageElement).style.display = 'none'} 
                      />
                    ) : (
                      <ImageIcon size={20} className="text-slate-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Total Supply</label>
                <input
                  type="number"
                  value={form.supply}
                  onChange={(e) => setForm({...form, supply: e.target.value})}
                  placeholder="e.g. 1000000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                   Tokens sent to wallet: {walletAddress ? `${walletAddress.substring(0,6)}...` : 'not connected'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Decimals</label>
                <input
                  type="number"
                  value={form.decimals}
                  onChange={(e) => setForm({...form, decimals: e.target.value})}
                  placeholder="18"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
              
              {/* Advanced Options */}
              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Security Options</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-emerald-400 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={isVerified}
                      onChange={(e) => setIsVerified(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600 text-emerald-600 bg-slate-800"
                    />
                    <div className="flex items-center gap-1 text-sm">
                      <FileCode size={14} />
                      Auto-Verify Contract on BscScan
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer hover:text-red-400 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={isRenounced}
                      onChange={(e) => setIsRenounced(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-600 text-red-600 bg-slate-800"
                    />
                    <div className="flex items-center gap-1 text-sm">
                      <ShieldCheck size={14} />
                      Renounce Ownership (Make SAFU)
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* INSTANT LIQUIDITY SECTION */}
          <div className="mb-8 bg-slate-900/60 border border-blue-500/30 rounded-xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
             
             <div className="flex items-start gap-4">
               <div className="mt-1">
                 <input 
                   type="checkbox" 
                   id="autoLiquidity"
                   checked={addLiquidityNow}
                   onChange={(e) => setAddLiquidityNow(e.target.checked)}
                   className="w-5 h-5 rounded border-slate-600 text-emerald-600 focus:ring-emerald-500 bg-slate-800 cursor-pointer"
                 />
               </div>
               <div className="flex-1">
                 <label htmlFor="autoLiquidity" className="font-bold text-white text-lg cursor-pointer flex items-center gap-2">
                   Create Market Immediately (Auto-Liquidity)
                   <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] rounded-full font-bold">RECOMMENDED</span>
                 </label>
                 <p className="text-slate-400 text-sm mt-1">
                   Automatically create a Liquidity Pool on PancakeSwap. 
                   Token will be tradable <strong>instantly</strong>.
                 </p>

                 {addLiquidityNow && (
                   <div className="mt-4 bg-slate-800 p-4 rounded-lg border border-slate-700 animate-in fade-in slide-in-from-top-2">
                     <label className="block text-sm font-medium text-white mb-2">
                       Initial BNB Liquidity
                     </label>
                     <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                          <input 
                            type="number" 
                            value={liquidityBnbAmount}
                            onChange={(e) => setLiquidityBnbAmount(e.target.value)}
                            placeholder="e.g. 1.0"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-4 pr-12 py-3 text-white focus:border-blue-500 outline-none"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">BNB</span>
                        </div>
                        <div className="text-slate-400 text-sm">=</div>
                        <div className="relative flex-1 opacity-75">
                          <input 
                            type="text" 
                            value={form.supply ? `${parseFloat(form.supply).toLocaleString()} ${form.symbol}` : ''}
                            disabled
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white cursor-not-allowed"
                          />
                        </div>
                     </div>
                   </div>
                 )}
               </div>
             </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="flex flex-col gap-2 mb-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
               <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Action:</span>
                  <span className="text-white font-bold">
                    Deploy + Mint {isRenounced ? '+ Renounce' : ''} {addLiquidityNow ? '+ Liquidity' : ''}
                  </span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1"><Zap size={14} className="text-yellow-400"/>Service Fee:</span>
                  <span className="text-green-400 font-bold">{PLATFORM_FEES.TOKEN_CREATION_BNB} BNB (50% OFF)</span>
               </div>
               <div className="text-[10px] text-slate-500 text-right mt-1">
                 Fee sent to: {FEE_WALLETS.BNB.substring(0,8)}...{FEE_WALLETS.BNB.substring(FEE_WALLETS.BNB.length-6)}
               </div>
            </div>
            
            <button
              onClick={handleDeploy}
              disabled={isLoading || !form.name || !form.symbol || !walletAddress}
              className={`w-full py-4 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg ${
                addLiquidityNow 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'
                : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  {currentStep || 'Processing...'}
                </>
              ) : (
                <>
                  {addLiquidityNow ? <Flame /> : <Coins />}
                  {addLiquidityNow ? 'Create Token & Launch Market' : 'Deploy Token Only'}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="space-y-4">
          {deployedAddress && (
            <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl flex items-center gap-3 mb-4 animate-in fade-in slide-in-from-top-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-green-400 font-bold text-lg">Token Created Successfully!</p>
                <p className="text-sm text-green-300/70 font-mono break-all">{deployedAddress}</p>
                <p className="text-xs text-slate-400 mt-1">Tokens are now in your wallet.</p>
              </div>
            </div>
          )}
          {userTokens.map((token) => (
            <div key={token.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex items-center justify-between hover:border-slate-500 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white overflow-hidden shrink-0 ${
                  !token.logoUrl && (token.network === 'BNB' ? 'bg-yellow-600' : token.network === 'SOL' ? 'bg-purple-600' : 'bg-blue-600')
                }`}>
                  {token.logoUrl ? (
                     <img src={token.logoUrl} alt={token.symbol} className="w-full h-full object-cover" />
                  ) : (
                     token.symbol[0]
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white">{token.name} <span className="text-xs font-normal text-slate-400 ml-2">({token.network})</span></h3>
                  <div className="flex gap-3 text-xs text-slate-400 mt-1">
                    <span>{token.symbol}</span>
                    <span>•</span>
                    <span>Supply: {token.supply}</span>
                    <span>•</span>
                    <span className="font-mono">{token.address.substring(0, 8)}...</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-300" title="View on Explorer">
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
