
import React from 'react';
import { Rocket, Calendar, Users, Target, ChevronRight, PlusCircle, Zap } from 'lucide-react';
import { PLATFORM_FEES } from '../types';

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
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative bg-gradient-to-r from-emerald-900/50 to-slate-900 border border-emerald-500/20 rounded-2xl p-8 overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 rounded text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-wider">Featured</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Kubacoin Launchpad</h2>
            <p className="text-slate-300 max-w-xl mb-6">
              Early access to the highest potential tokens on BNB, Solana, and TON networks. 
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
               Raise capital for your project with the lowest fees in the industry.
             </p>
             <div className="bg-slate-800/50 rounded-lg p-3 mb-4 border border-slate-700">
               <div className="flex justify-between text-sm mb-1">
                 <span className="text-slate-400">Platform Fee</span>
                 <span className="text-green-400 font-bold">{PLATFORM_FEES.LAUNCHPAD_PERCENT}%</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-500">Competitors</span>
                 <span className="text-red-400 line-through">5-8%</span>
               </div>
             </div>
          </div>
          <button className="w-full py-3 bg-slate-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
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
