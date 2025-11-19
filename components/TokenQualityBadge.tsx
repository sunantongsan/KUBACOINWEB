import React from 'react';
import { ShieldCheck, UserX, Lock, AlertTriangle } from 'lucide-react';
import { TokenData } from '../types';

interface TokenQualityBadgeProps {
  token: TokenData;
  showLabel?: boolean;
}

export const TokenQualityBadge: React.FC<TokenQualityBadgeProps> = ({ token, showLabel = true }) => {
  const indicators = [
    {
      active: token.contractAddress && token.contractAddress.length > 0,
      icon: ShieldCheck,
      label: 'Verified',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      tooltip: 'Source Code Verified'
    },
    {
      active: token.ownershipRenounced,
      icon: UserX,
      label: 'Renounced',
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
      tooltip: 'Ownership Renounced'
    },
    {
      active: token.liquidityLocked,
      icon: Lock,
      label: 'LP Locked',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10 border-yellow-500/20',
      tooltip: 'Liquidity Locked'
    }
  ];

  const activeCount = indicators.filter(i => i.active).length;
  const trustScore = (activeCount / 3) * 100;

  return (
    <div className="flex flex-wrap gap-2">
      {indicators.map((item, idx) => {
        if (!item.active) return null;
        return (
          <div 
            key={idx} 
            className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${item.bg} ${item.color}`}
            title={item.tooltip}
          >
            <item.icon className="w-3 h-3" />
            {showLabel && <span>{item.label}</span>}
          </div>
        );
      })}
      {activeCount === 0 && (
         <div className="flex items-center gap-1 px-2 py-1 rounded-md border border-red-500/20 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase">
             <AlertTriangle className="w-3 h-3" />
             {showLabel && <span>High Risk</span>}
         </div>
      )}
    </div>
  );
};