import React, { useState } from 'react';
import { Rocket, Calendar, Users, Target, CheckCircle2, AlertTriangle, Settings } from 'lucide-react';
import { LaunchpadProject } from '../types';
import { ethers } from 'ethers';
import { TREASURY_WALLETS, ACTION_FEES } from '../services/walletService';

const MOCK_PROJECTS: LaunchpadProject[] = [
  { id: '1', name: 'Galaxy AI', symbol: 'GAI', raised: 150, hardcap: 200, status: 'Live', chain: 'bnb-mainnet' },
  { id: '2', name: 'Solana Dex', symbol: 'SDX', raised: 0, hardcap: 5000, status: 'Upcoming', chain: 'solana' },
  { id: '3', name: 'Ton Game', symbol: 'TGAME', raised: 500, hardcap: 500, status: 'Ended', chain: 'ton' },
];

export const Launchpad: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [revenueShare, setRevenueShare] = useState('3'); // Default 3%

  const handleCreatePresale = async () => {
      if(!window.ethereum) {
          setStatus({ type: 'error', msg: 'Wallet not connected' });
          return;
      }
      
      // Validate Share
      const shareNum = parseFloat(revenueShare);
      if (isNaN(shareNum) || shareNum < 3) {
          setStatus({ type: 'error', msg: 'Platform revenue share must be at least 3%.' });
          return;
      }
      
      setIsProcessing(true);
      setStatus(null);

      try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          
          // 1. Pay Platform Fee (0.25 BNB)
          const feeTx = await signer.sendTransaction({
              to: TREASURY_WALLETS.BNB,
              value: ethers.parseEther(ACTION_FEES.LAUNCHPAD)
          });
          await feeTx.wait(1);
          
          setStatus({ 
              type: 'success', 
              msg: `Fee Paid (${ACTION_FEES.LAUNCHPAD} BNB). Presale created with ${revenueShare}% revenue share! (Contract interaction simulated)` 
          });
          setShowCreateForm(false);

      } catch (err: any) {
          setStatus({ type: 'error', msg: err.message || 'Transaction failed' });
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <div className="space-y-8 animate-slideUp">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
            <h2 className="text-3xl font-bold text-white">KUBA Launchpad</h2>
            <p className="text-slate-400">Discover the next 100x gems on BNB, Solana, and TON.</p>
        </div>
        <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            disabled={isProcessing}
            className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold px-6 py-3 rounded-xl shadow-lg shadow-yellow-500/20 flex items-center gap-2 disabled:opacity-50"
        >
            <Rocket size={18} /> {showCreateForm ? 'Cancel' : 'Create Presale'}
        </button>
      </div>

      {status && (
          <div className={`p-4 rounded-xl border flex items-center gap-3 ${status.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
              {status.msg}
          </div>
      )}

      {showCreateForm && (
          <div className="bg-slate-800 border border-yellow-500/30 rounded-2xl p-6 animate-slideUp">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Settings className="text-yellow-500" /> Presale Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                      <label className="text-sm font-medium text-slate-300 block mb-2">Project Name</label>
                      <input type="text" placeholder="e.g. My Token" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" />
                  </div>
                  <div>
                      <label className="text-sm font-medium text-slate-300 block mb-2">Soft Cap / Hard Cap (BNB)</label>
                      <div className="flex gap-2">
                        <input type="number" placeholder="Soft" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" />
                        <input type="number" placeholder="Hard" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" />
                      </div>
                  </div>
                  <div>
                      <label className="text-sm font-medium text-slate-300 block mb-2">Platform Revenue Share (%)</label>
                      <input 
                        type="number" 
                        value={revenueShare}
                        onChange={(e) => setRevenueShare(e.target.value)}
                        min="3"
                        max="50"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" 
                       />
                      <p className="text-xs text-slate-500 mt-1">Minimum 3% of raised funds goes to the platform.</p>
                  </div>
                  <div>
                      <label className="text-sm font-medium text-slate-300 block mb-2">Liquidity Lock Duration</label>
                       <input type="date" className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" />
                  </div>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-xl flex justify-between items-center mb-6">
                  <div>
                      <span className="text-slate-400 text-sm">Creation Fee</span>
                      <p className="text-xl font-bold text-white">{ACTION_FEES.LAUNCHPAD} BNB</p>
                  </div>
                  <button 
                    onClick={handleCreatePresale}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold"
                  >
                      {isProcessing ? 'Confirming...' : 'Pay & Deploy'}
                  </button>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_PROJECTS.map((project) => (
          <div key={project.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-yellow-500/30 transition-all group relative overflow-hidden">
             {project.status === 'Live' && (
                 <div className="absolute top-4 right-4">
                     <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                 </div>
             )}
            
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xl">
                    {project.name[0]}
                </div>
                <div>
                    <h3 className="font-bold text-white">{project.name}</h3>
                    <span className="text-xs text-slate-500 font-mono">${project.symbol}</span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Status</span>
                    <span className={`font-bold ${project.status === 'Live' ? 'text-green-400' : project.status === 'Ended' ? 'text-red-400' : 'text-yellow-400'}`}>
                        {project.status}
                    </span>
                </div>
                
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Raised</span>
                        <span className="text-white font-mono">{project.raised} / {project.hardcap}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                        <div 
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-1000" 
                            style={{ width: `${(project.raised / project.hardcap) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <button className="w-full mt-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors group-hover:bg-yellow-500 group-hover:text-slate-900">
                View Project
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};