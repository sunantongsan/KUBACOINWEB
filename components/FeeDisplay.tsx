import React from 'react';
import { PLATFORM_FEE_PERCENT } from '../constants';

interface FeeDisplayProps {
  baseAmount: number; // The amount being processed (e.g., liquidity amount)
  networkFee: number; // Estimated gas
  currency: string;
  actionName: string;
}

export const FeeDisplay: React.FC<FeeDisplayProps> = ({ baseAmount, networkFee, currency, actionName }) => {
  const platformFee = baseAmount * PLATFORM_FEE_PERCENT;
  const total = networkFee + platformFee;

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 my-4 hover:border-yellow-500/20 transition-colors">
      <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
        Fee Summary ({actionName})
      </h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-300">
          <span>Network Gas (Est.)</span>
          <span>{networkFee.toFixed(4)} {currency}</span>
        </div>
        <div className="flex justify-between text-yellow-400 font-medium">
          <div className="flex flex-col">
            <span>Platform Fee (3%)</span>
            <span className="text-xs text-gray-500">Dev Support</span>
          </div>
          <span>{platformFee.toFixed(4)} {currency}</span>
        </div>
        <div className="h-px bg-slate-600 my-2"></div>
        <div className="flex justify-between text-white font-bold text-lg">
          <span>Total Cost</span>
          <span>{total.toFixed(4)} {currency}</span>
        </div>
      </div>
    </div>
  );
};