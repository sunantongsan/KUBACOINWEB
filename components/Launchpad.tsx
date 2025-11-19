import React, { useState } from 'react';
import { TokenData, LaunchpadProject, ChainType, NetworkMode } from '../types';
import { CHAIN_CONFIG, PLATFORM_FEE_PERCENT } from '../constants';
import { Rocket, Calendar, Target, Users, ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { FeeDisplay } from './FeeDisplay';

interface LaunchpadProps {
  myTokens: TokenData[];
  launchpads: LaunchpadProject[];
  onCreateLaunchpad: (project: LaunchpadProject) => void;
}

export const Launchpad: React.FC<LaunchpadProps> = ({ myTokens, launchpads, onCreateLaunchpad }) => {
  const [mode, setMode] = useState<'LIST' | 'CREATE'>('LIST');
  const [selectedTokenId, setSelectedTokenId] = useState('');
  const [formData, setFormData] = useState({
    softCap: '',
    hardCap: '',
    rate: '',
    duration: '7'
  });

  const handleCreate = () => {
    const token = myTokens.find(t => t.id === selectedTokenId);
    if (!token) return alert("Please select a token");
    
    const soft = parseFloat(formData.softCap);
    const hard = parseFloat(formData.hardCap);
    const rate = parseFloat(formData.rate);
    
    if (!soft || !hard || !rate) return alert("Please fill all fields");
    if (hard <= soft) return alert("Hard cap must be greater than Soft cap");

    const newProject: LaunchpadProject = {
      id: Date.now().toString(),
      tokenId: token.id,
      tokenName: token.name,
      tokenSymbol: token.symbol,
      logoUrl: token.logoUrl,
      chain: token.chain,
      softCap: soft,
      hardCap: hard,
      rate: rate,
      raisedAmount: 0,
      startTime: new Date(),
      endTime: new Date(Date.now() + parseInt(formData.duration) * 24 * 60 * 60 * 1000),
      status: 'LIVE',
      participants: 0
    };

    onCreateLaunchpad(newProject);
    setMode('LIST');
    alert("Launchpad Created Successfully!");
  };

  const renderCreateForm = () => {
    const selectedToken = myTokens.find(t => t.id === selectedTokenId);
    const chainConfig = selectedToken ? CHAIN_CONFIG[selectedToken.chain] : CHAIN_CONFIG[ChainType.BNB];
    const creationFee = 0.5; // Fixed fee for creating launchpad

    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <button onClick={() => setMode('LIST')} className="mb-4 text-gray-400 hover:text-white flex items-center gap-1">
            ← Back to Launchpad List
        </button>
        
        <div className="bg-card border border-gray-700 rounded-2xl p-8 shadow-xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-600"></div>
           
           <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-400">
                  <Rocket className="w-8 h-8" />
              </div>
              <div>
                  <h2 className="text-2xl font-bold text-white">Create Launchpad</h2>
                  <p className="text-gray-400">Raise capital for your project securely</p>
              </div>
           </div>

           <div className="space-y-6">
              <div>
                  <label className="block text-gray-300 font-medium mb-2">Select Your Token</label>
                  <select 
                    value={selectedTokenId} 
                    onChange={(e) => setSelectedTokenId(e.target.value)}
                    className="w-full bg-dark border border-gray-600 rounded-xl p-3 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  >
                      <option value="">-- Select Token --</option>
                      {myTokens.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.symbol}) - {t.chain}</option>
                      ))}
                  </select>
              </div>

              {selectedToken && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 font-medium mb-2">Soft Cap ({chainConfig.currency})</label>
                            <input type="number" value={formData.softCap} onChange={e => setFormData({...formData, softCap: e.target.value})} className="w-full bg-dark border border-gray-600 rounded-xl p-3 text-white" placeholder="e.g. 10" />
                        </div>
                        <div>
                            <label className="block text-gray-300 font-medium mb-2">Hard Cap ({chainConfig.currency})</label>
                            <input type="number" value={formData.hardCap} onChange={e => setFormData({...formData, hardCap: e.target.value})} className="w-full bg-dark border border-gray-600 rounded-xl p-3 text-white" placeholder="e.g. 100" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-gray-300 font-medium mb-2">Presale Rate (1 {chainConfig.currency} = ? {selectedToken.symbol})</label>
                        <input type="number" value={formData.rate} onChange={e => setFormData({...formData, rate: e.target.value})} className="w-full bg-dark border border-gray-600 rounded-xl p-3 text-white" placeholder="e.g. 5000" />
                    </div>

                    <div>
                         <label className="block text-gray-300 font-medium mb-2">Duration (Days)</label>
                         <div className="flex gap-2">
                             {['3', '7', '14', '30'].map(d => (
                                 <button 
                                    key={d} 
                                    onClick={() => setFormData({...formData, duration: d})}
                                    className={`flex-1 py-2 rounded-lg border ${formData.duration === d ? 'bg-yellow-500 text-black border-yellow-500 font-bold' : 'bg-dark border-gray-600 text-gray-400'}`}
                                 >
                                     {d} Days
                                 </button>
                             ))}
                         </div>
                    </div>

                    <FeeDisplay baseAmount={creationFee} networkFee={0.01} currency={chainConfig.currency} actionName="Create Launchpad" />
                    
                    <button onClick={handleCreate} className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-bold rounded-xl shadow-lg hover:shadow-yellow-500/30 transition-all mt-2">
                        Launch Project
                    </button>
                  </>
              )}
           </div>
        </div>
      </div>
    );
  };

  const renderList = () => (
    <div className="animate-slide-up space-y-8">
       {/* Hero Banner */}
       <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 to-slate-800 border border-gray-700 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
           <div className="relative z-10 max-w-xl">
               <div className="flex items-center gap-2 text-yellow-400 font-bold mb-2">
                   <Target className="w-5 h-5" /> KUBA Launchpad
               </div>
               <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Discover the next <span className="text-yellow-500">100x</span> Gem</h1>
               <p className="text-gray-400 text-lg mb-6">Early access to high-quality projects on BNB, Solana, and TON. Verified by KUBA Forge Ai.</p>
               <div className="flex gap-4">
                   <button onClick={() => setMode('CREATE')} className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors">
                       Create Launchpad
                   </button>
                   <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors">
                       How it works
                   </button>
               </div>
           </div>
           <div className="relative z-10">
               {/* Decorative Element */}
               <div className="w-40 h-40 md:w-56 md:h-56 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-2xl rotate-3 shadow-2xl flex items-center justify-center">
                   <Rocket className="w-20 h-20 md:w-28 md:h-28 text-black" />
               </div>
           </div>
       </div>

       {/* Projects Grid */}
       <div>
           <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
               <Rocket className="w-6 h-6 text-orange-500" /> Live Presales
           </h3>
           
           {launchpads.length === 0 ? (
               <div className="text-center py-12 border border-dashed border-gray-700 rounded-2xl bg-slate-900/50">
                   <p className="text-gray-400">No active launchpads found. Be the first to launch!</p>
               </div>
           ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {launchpads.map(project => {
                       const chainConfig = CHAIN_CONFIG[project.chain];
                       const progress = (project.raisedAmount / project.hardCap) * 100;
                       
                       return (
                           <div key={project.id} className="bg-card border border-gray-700 rounded-2xl p-6 hover:border-yellow-500/50 transition-all group">
                               <div className="flex justify-between items-start mb-4">
                                   <div className="flex items-center gap-3">
                                       <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden border border-gray-600">
                                           {project.logoUrl ? <img src={project.logoUrl} className="w-full h-full object-cover"/> : <span className="flex items-center justify-center h-full text-lg font-bold text-gray-500">{project.tokenSymbol[0]}</span>}
                                       </div>
                                       <div>
                                           <h4 className="font-bold text-white group-hover:text-yellow-400 transition-colors">{project.tokenName}</h4>
                                           <div className="flex items-center gap-1">
                                               <span className="text-xs bg-slate-700 text-gray-300 px-1.5 py-0.5 rounded">{project.tokenSymbol}</span>
                                               <span className="text-xs text-gray-500">• {project.chain}</span>
                                           </div>
                                       </div>
                                   </div>
                                   <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full animate-pulse">LIVE</span>
                               </div>
                               
                               <div className="space-y-3 mb-6">
                                   <div className="flex justify-between text-sm">
                                       <span className="text-gray-400">Soft/Hard Cap</span>
                                       <span className="text-yellow-500 font-mono">{project.softCap} - {project.hardCap} {chainConfig.currency}</span>
                                   </div>
                                   <div className="flex justify-between text-sm">
                                       <span className="text-gray-400">Rate</span>
                                       <span className="text-white">1 {chainConfig.currency} = {project.rate} {project.tokenSymbol}</span>
                                   </div>
                               </div>

                               <div className="mb-6">
                                   <div className="flex justify-between text-xs mb-1">
                                       <span className="text-gray-400">Progress</span>
                                       <span className="text-yellow-400 font-bold">{progress.toFixed(1)}%</span>
                                   </div>
                                   <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                       <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" style={{width: `${progress}%`}}></div>
                                   </div>
                                   <div className="flex justify-between text-xs mt-1 text-gray-500">
                                       <span>{project.raisedAmount} {chainConfig.currency}</span>
                                       <span>{project.hardCap} {chainConfig.currency}</span>
                                   </div>
                               </div>

                               <button onClick={() => alert("Participation simulated: Wallet connected needed.")} className="w-full py-2 bg-slate-800 hover:bg-yellow-500 hover:text-black text-white rounded-xl font-bold border border-slate-600 transition-all">
                                   View Pool
                               </button>
                           </div>
                       );
                   })}
               </div>
           )}
       </div>
    </div>
  );

  return mode === 'LIST' ? renderList() : renderCreateForm();
};