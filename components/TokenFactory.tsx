
import React, { useState } from 'react';
import { Layers, CheckCircle, Settings, Loader2, Coins, Image as ImageIcon, Info, ExternalLink, AlertTriangle, Zap } from 'lucide-react';
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
  const [deployedAddress, setDeployedAddress] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    symbol: '',
    supply: '',
    decimals: '18',
    description: '',
    logoUrl: ''
  });

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
      alert("Real-time deployment via web is currently optimized for BNB Chain. Solana and TON require wallet-specific SDKs that are being integrated.");
      return;
    }

    setIsLoading(true);
    try {
      // Ensure we are on the right network
      await blockchainService.switchNetwork(isTestnet);

      // Call the service to deploy
      const txHash = await blockchainService.deployToken(form.name, form.symbol, form.supply);
      
      if (txHash) {
        const newAddress = "0x" + txHash.substring(2, 42); // Mock address from hash for display if real receipt not waited
        setDeployedAddress(txHash); // In this demo we use hash
        
        setUserTokens([
          { 
            id: Date.now(), 
            name: form.name, 
            symbol: form.symbol, 
            network: network, 
            supply: form.supply, 
            address: newAddress.substring(0,10) + "...",
            logoUrl: form.logoUrl
          }, 
          ...userTokens
        ]);
        
        alert(`Transaction Sent! Hash: ${txHash}`);
        setForm({ name: '', symbol: '', supply: '', decimals: '18', description: '', logoUrl: '' });
        setActiveTab('manage');
      }
    } catch (error) {
      console.error(error);
      alert("Deployment failed or rejected. See console.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
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
            <label className="block text-sm font-medium text-slate-300 mb-3">Select Network</label>
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
            {network !== 'BNB' && (
               <p className="text-xs text-yellow-500 mt-2 text-center">Note: Solana & TON deployments require manual wallet confirmation in the next step.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <span className="text-xs text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded">Optional</span>
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
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  placeholder="Brief description of your project..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
            <div className="flex flex-col gap-2 mb-4 bg-slate-900/50 p-4 rounded-xl border border-slate-700">
               <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Estimated Gas:</span>
                  <span className="text-white font-bold">~0.004 BNB</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1"><Zap size={14} className="text-yellow-400"/>Service Fee (Lowest in Market):</span>
                  <span className="text-green-400 font-bold">{PLATFORM_FEES.TOKEN_CREATION_BNB} BNB</span>
               </div>
               <div className="text-[10px] text-slate-500 text-right mt-1">
                 Fee sent to: {FEE_WALLETS.BNB.substring(0,8)}...{FEE_WALLETS.BNB.substring(FEE_WALLETS.BNB.length-6)}
               </div>
               {!walletAddress && <span className="text-red-400 text-sm mt-1">Wallet not connected</span>}
            </div>
            <button
              onClick={handleDeploy}
              disabled={isLoading || !form.name || !form.symbol || !walletAddress}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <Coins />}
              {isLoading ? 'Confirming in Wallet...' : `Deploy Contract (${PLATFORM_FEES.TOKEN_CREATION_BNB} BNB Fee)`}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="space-y-4">
          {deployedAddress && (
            <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl flex items-center gap-3 mb-4">
              <CheckCircle className="text-green-500" />
              <div>
                <p className="text-green-400 font-bold">Recent Deployment Successful!</p>
                <p className="text-xs text-green-300/70 font-mono break-all">{deployedAddress}</p>
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
                    <span className="font-mono">{token.address}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-300" title="View on Explorer">
                  <ExternalLink size={18} />
                </button>
                <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors">
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
