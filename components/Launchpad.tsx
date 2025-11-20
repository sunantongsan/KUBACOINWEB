import React, { useState } from 'react';
import { Rocket, Calendar, Users, Target, CheckCircle2, AlertTriangle, Settings, Wallet, Copy } from 'lucide-react';
import { LaunchpadProject, WalletState } from '../types';
import { ethers } from 'ethers';
import { TREASURY_WALLETS, ACTION_FEES } from '../services/walletService';

const MOCK_PROJECTS: LaunchpadProject[] = [
  { 
    id: 'kuba-ton', 
    name: 'KUBA Coin', 
    symbol: 'KUBA', 
    raised: 25000, 
    hardcap: 100000, 
    status: 'Live', 
    chain: 'ton',
    address: 'EQDCCMpdq2lab20fVNcXTx44TrGfAnNDvWiFWt9wDfDUY5YT'
  },
  { id: '1', name: 'Galaxy AI', symbol: 'GAI', raised: 150, hardcap: 200, status: 'Live', chain: 'bnb-mainnet' },
  { id: '2', name: 'Solana Dex', symbol: 'SDX', raised: 0, hardcap: 5000, status: 'Upcoming', chain: 'solana' },
  { id: '3', name: 'Ton Game', symbol: 'TGAME', raised: 500, hardcap: 500, status: 'Ended', chain: 'ton' },
];

interface LaunchpadProps {
    wallet: WalletState;
}

export const Launchpad: React.FC<LaunchpadProps> = ({ wallet }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [revenueShare, setRevenueShare] = useState('3'); // Default 3%
  
  // Contribution State
  const [contributeId, setContributeId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');

  const handleCreatePresale = async () => {
      if(!window.ethereum && wallet.network.includes('bnb')) {
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
          if (wallet.network.includes('bnb')) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            
            // 1. Pay Platform Fee (0.25 BNB)
            const feeTx = await signer.sendTransaction({
                to: TREASURY_WALLETS.BNB,
                value: ethers.parseEther(ACTION_FEES.LAUNCHPAD)
            });
            await feeTx.wait(1);
          } else {
            // Simulate other chains
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
          setStatus({ 
              type: 'success', 
              msg: `Fee Paid (${ACTION_FEES.LAUNCHPAD}). Presale created successfully! You can now list your token.` 
          });
          setShowCreateForm(false);

      } catch (err: any) {
          setStatus({ type: 'error', msg: err.message || 'Transaction failed' });
      } finally {
          setIsProcessing(false);
      }
  };

  const handleContribute = async (project: LaunchpadProject) => {
      if (!wallet.isConnected || !wallet.address) {
          setStatus({ type: 'error', msg: 'Please connect your wallet first.' });
          return;
      }

      // Simple network check
      const isBNB = wallet.network.includes('bnb') && project.chain.includes('bnb');
      const isSOL = wallet.network.includes('solana') && project.chain.includes('solana');
      const isTON = wallet.network.includes('ton') && project.chain.includes('ton');

      if (!isBNB && !isSOL && !isTON) {
           setStatus({ type: 'error', msg: `Mismatch: You are on ${wallet.network}, but this project is on ${project.chain}. Please switch networks.` });
           return;
      }

      if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
          setStatus({ type: 'error', msg: 'Please enter a valid amount.' });
          return;
      }

      setIsProcessing(true);
      setStatus(null);

      try {
          if (isBNB) {
              // Real BNB Transaction simulating investment
              const provider = new ethers.BrowserProvider(window.ethereum);
              const signer = await provider.getSigner();
              
              // Fee Logic for Contribution (1% of contribution)
              const amountVal = parseFloat(contributionAmount);
              const feeVal = amountVal * 0.01;
              const projectVal = amountVal * 0.99;

              // 1. Send Fee
              const feeTx = await signer.sendTransaction({
                  to: TREASURY_WALLETS.BNB,
                  value: ethers.parseEther(feeVal.toFixed(18))
              });
              await feeTx.wait(1);

              // 2. Send to Project (Simulated here as we don't have real presale contract addresses)
              // In real app, this is a function call to PresaleContract.contribute{value: amount}()
              // Here we just send to self/treasury as a simulation of "depositing"
              const tx = await signer.sendTransaction({
                  to: TREASURY_WALLETS.BNB, 
                  value: ethers.parseEther(projectVal.toFixed(18))
              });
              await tx.wait(1);

              setStatus({ type: 'success', msg: `Successfully contributed ${contributionAmount} BNB! (1% Fee Paid)` });
          } else {
              // Simulate for SOL/TON
              await new Promise(resolve => setTimeout(resolve, 2000));
              const currency = isSOL ? 'SOL' : 'TON';
              setStatus({ type: 'success', msg: `Successfully contributed ${contributionAmount} ${currency} to ${project.name} (Simulation)!` });
          }
          setContributeId(null);
          setContributionAmount('');
      } catch (err: any) {
          setStatus({ type: 'error', msg: err.message || 'Contribution failed' });
      } finally {
          setIsProcessing(false);
      }
  };

  const getCurrency = (chain: string) => {
      if (chain.includes('bnb')) return 'BNB';
      if (chain.includes('solana')) return 'SOL';
      if (chain.includes('ton')) return 'TON';
      return '';
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      setStatus({ type: 'success', msg: 'Address copied to clipboard!' });
      setTimeout(() => setStatus(null), 2000);
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
                  <div className="md:col-span-2">
                      <label className="text-sm font-medium text-slate-300 block mb-2">Token Address</label>
                      <input type="text" placeholder="Paste your token address from Forge..." className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white" />
                      <p className="text-xs text-slate-500 mt-1">The token you want to raise funds for.</p>
                  </div>
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
          <div key={project.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-yellow-500/30 transition-all group relative overflow-hidden flex flex-col">
             {project.status === 'Live' && (
                 <div className="absolute top-4 right-4">
                     <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                 </div>
             )}
            
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xl shrink-0">
                    {project.name[0]}
                </div>
                <div className="overflow-hidden">
                    <h3 className="font-bold text-white truncate">{project.name}</h3>
                    <span className="text-xs text-slate-500 font-mono">${project.symbol}</span>
                </div>
            </div>
            
            {project.address && (
                <div className="mb-4 p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 font-mono truncate">{project.address.substring(0, 6)}...{project.address.substring(project.address.length - 6)}</span>
                    <button onClick={() => copyToClipboard(project.address!)} className="text-slate-400 hover:text-yellow-500">
                        <Copy size={12} />
                    </button>
                </div>
            )}

            <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Status</span>
                    <span className={`font-bold ${project.status === 'Live' ? 'text-green-400' : project.status === 'Ended' ? 'text-red-400' : 'text-yellow-400'}`}>
                        {project.status}
                    </span>
                </div>
                
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Raised</span>
                        <span className="text-white font-mono">{project.raised.toLocaleString()} / {project.hardcap.toLocaleString()} {getCurrency(project.chain)}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                        <div 
                            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-1000" 
                            style={{ width: `${Math.min(100, (project.raised / project.hardcap) * 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="mt-auto">
                {project.status === 'Live' && contributeId === project.id ? (
                    <div className="space-y-2 animate-slideUp bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                        <label className="text-xs text-slate-400">Amount ({getCurrency(project.chain)})</label>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                value={contributionAmount}
                                onChange={(e) => setContributionAmount(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white"
                                placeholder="0.1"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => handleContribute(project)}
                                disabled={isProcessing}
                                className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 rounded"
                            >
                                {isProcessing ? 'Sending...' : 'Confirm'}
                            </button>
                            <button 
                                onClick={() => { setContributeId(null); setContributionAmount(''); }}
                                className="px-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-2 rounded"
                            >
                                X
                            </button>
                        </div>
                    </div>
                ) : project.status === 'Live' ? (
                    <button 
                        onClick={() => setContributeId(project.id)}
                        className="w-full py-3 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold transition-colors shadow-lg shadow-yellow-500/10 flex justify-center items-center gap-2"
                    >
                        <Wallet size={16} /> Contribute
                    </button>
                ) : (
                    <button className="w-full py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors">
                        View Project
                    </button>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};