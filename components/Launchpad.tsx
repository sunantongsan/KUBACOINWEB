
import React, { useState } from 'react';
import { Rocket, Calendar, Users, Target, ChevronRight, PlusCircle, Zap, X, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { PLATFORM_FEES } from '../types';
import { BlockchainService } from '../services/blockchain';

interface Project {
  id: number;
  name: string;
  symbol: string;
  description: string;
  status: 'Live' | 'Upcoming' | 'Ended';
  raised: number;
  hardcap: number;
  participants: number;
  network: 'BNB' | 'SOL' | 'TON';
  logo: string;
}

const PROJECTS: Project[] = [
  {
    id: 1,
    name: 'MetaGaming Guild',
    symbol: 'MGG',
    description: 'The next generation P2E gaming guild on Solana.',
    status: 'Live',
    raised: 450000,
    hardcap: 500000,
    participants: 1205,
    network: 'SOL',
    logo: 'M'
  },
  {
    id: 2,
    name: 'TonDeFi Protocol',
    symbol: 'TDF',
    description: 'Decentralized lending platform built on TON.',
    status: 'Upcoming',
    raised: 0,
    hardcap: 250000,
    participants: 0,
    network: 'TON',
    logo: 'T'
  },
];

export const Launchpad: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tokenAddress: '',
    softCap: '',
    hardCap: '',
    rate: '',
    logoUrl: ''
  });
  const [successHash, setSuccessHash] = useState<string | null>(null);
  const [blockchainService] = useState(new BlockchainService());

  const handleCreate = async () => {
    if(!form.tokenAddress || !form.hardCap) {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const txHash = await blockchainService.createLaunchpad(form.tokenAddress, form.hardCap);
      if(txHash) {
        setSuccessHash(txHash);
        setForm({ tokenAddress: '', softCap: '', hardCap: '', rate: '', logoUrl: '' });
      }
    } catch(e) {
      alert("Failed to create launchpad. Please check your balance.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* CREATE MODAL */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button 
              onClick={() => { setIsCreating(false); setSuccessHash(null); }} 
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Rocket className="text-emerald-500" />
              Launch Your Token
            </h2>

            {successHash ? (
              <div className="text-center py-8 animate-in fade-in">
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">Launchpad Created!</h3>
                <p className="text-slate-400 mt-2 mb-4">Your presale is now being processed on the blockchain.</p>
                <p className="text-xs font-mono text-slate-500 bg-slate-900 p-2 rounded mb-6">{successHash}</p>
                <button onClick={() => setIsCreating(false)} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg">
                  Back to Dashboard
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                   <h3 className="text-sm font-bold text-white mb-3">Market Rate Comparison</h3>
                   <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-slate-800 p-3 rounded border border-slate-700 opacity-70">
                        <span className="block text-xs text-slate-500">PinkSale / Others</span>
                        <span className="text-lg font-bold text-slate-300 strike-through line-through decoration-red-500">1.0 BNB</span>
                      </div>
                      <div className="bg-emerald-900/20 p-3 rounded border border-emerald-500/50 relative overflow-hidden">
                         <div className="absolute top-0 right-0 bg-emerald-500 text-[10px] text-white px-2 py-0.5 rounded-bl">SAVE 50%</div>
                        <span className="block text-xs text-emerald-400">Kubacoin Launchpad</span>
                        <span className="text-lg font-bold text-white">{PLATFORM_FEES.LAUNCHPAD_CREATION_BNB} BNB</span>
                      </div>
                   </div>
                </div>

                <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg text-xs text-blue-200 flex items-start gap-2">
                  <Zap size={14} className="shrink-0 mt-0.5" />
                  <div>
                    <strong>Professional Tier:</strong> Includes bot protection, audit verification badge (optional), and priority support.
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Token Contract Address</label>
                  <input 
                    type="text" 
                    placeholder="0x..." 
                    value={form.tokenAddress}
                    onChange={e => setForm({...form, tokenAddress: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Soft Cap (BNB)</label>
                    <input 
                      type="number" 
                      placeholder="10" 
                      value={form.softCap}
                      onChange={e => setForm({...form, softCap: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Hard Cap (BNB)</label>
                    <input 
                      type="number" 
                      placeholder="100" 
                      value={form.hardCap}
                      onChange={e => setForm({...form, hardCap: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Presale Rate (Tokens per BNB)</label>
                  <input 
                    type="number" 
                    placeholder="1000000" 
                    value={form.rate}
                    onChange={e => setForm({...form, rate: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none"
                  />
                </div>

                <button 
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Rocket size={20} />}
                  {loading ? 'Creating Presale...' : `Pay ${PLATFORM_FEES.LAUNCHPAD_CREATION_BNB} BNB & Launch`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative bg-gradient-to-r from-emerald-900/50 to-slate-900 border border-emerald-500/20 rounded-2xl p-8 overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-wider">Featured</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Kubacoin Launchpad</h2>
            <p className="text-slate-300 max-w-xl mb-6">
              Secure, fair, and affordable fundraising. 
              Curated by AI analysis.
            </p>
            <button className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2">
              Explore Projects
              <ChevronRight size={16} />
            </button>
          </div>
          <Rocket className="absolute -right-6 -bottom-6 text-emerald-500/10" size={250} />
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between">
          <div>
             <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
               <PlusCircle className="text-yellow-400" />
               Create Launchpad
             </h3>
             <p className="text-sm text-slate-400 mb-4">
               Raise capital for your project. 50% Cheaper than PinkSale.
             </p>
             <div className="bg-slate-800/50 rounded-lg p-3 mb-4 border border-slate-700">
               <div className="flex justify-between text-sm mb-1">
                 <span className="text-slate-400">Platform Fee</span>
                 <span className="text-green-400 font-bold">{PLATFORM_FEES.LAUNCHPAD_PERCENT}%</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-500">Setup Cost</span>
                 <span className="text-white font-bold">{PLATFORM_FEES.LAUNCHPAD_CREATION_BNB} BNB</span>
               </div>
             </div>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="w-full py-3 bg-slate-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Zap size={16} />
            Launch Your Project
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Target className="text-emerald-400" />
          Active & Upcoming Sales
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROJECTS.map((project) => (
            <div key={project.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-emerald-500/50 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg ${
                    project.network === 'SOL' ? 'bg-purple-600' : project.network === 'TON' ? 'bg-blue-600' : 'bg-yellow-500'
                  }`}>
                    {project.logo}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{project.name}</h4>
                    <span className="text-xs font-medium text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded">{project.symbol}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  project.status === 'Live' ? 'bg-green-500/20 text-green-400 animate-pulse' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {project.status}
                </span>
              </div>

              <p className="text-sm text-slate-400 mb-6 line-clamp-2">
                {project.description}
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-emerald-400 font-bold">
                      {project.hardcap > 0 ? Math.round((project.raised / project.hardcap) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                      style={{ width: `${(project.raised / project.hardcap) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs mt-1 text-slate-500">
                    <span>{project.raised.toLocaleString()} USDC</span>
                    <span>{project.hardcap.toLocaleString()} USDC</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700/50">
                   <div className="flex flex-col">
                     <span className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Calendar size={10}/> Start Date</span>
                     <span className="text-sm font-medium text-white">Oct 24, 2025</span>
                   </div>
                   <div className="flex flex-col">
                     <span className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Users size={10}/> Participants</span>
                     <span className="text-sm font-medium text-white">{project.participants}</span>
                   </div>
                </div>

                <button className="w-full py-3 bg-slate-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
