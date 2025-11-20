import React from 'react';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, ExternalLink } from 'lucide-react';
import { Transaction, NetworkId } from '../types';
import { getExplorerBaseUrl } from '../services/walletService';

interface TransactionsProps {
  transactions: Transaction[];
  isConnected: boolean;
  network: NetworkId;
}

export const Transactions: React.FC<TransactionsProps> = ({ transactions, isConnected, network }) => {
  const explorerBaseUrl = getExplorerBaseUrl(network);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-slate-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Recent Transactions</h2>
        <button className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
            <RefreshCw size={16} />
        </button>
      </div>
      
      {!isConnected ? (
        <div className="p-12 text-center text-slate-500">
          <p>Connect your wallet to view transaction history.</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          <p>No recent transactions found for this address.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${tx.type === 'Buy' ? 'bg-green-500/10 text-green-400' : tx.type === 'Sell' ? 'bg-red-500/10 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                        {tx.type === 'Buy' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <span className="font-medium text-slate-200">{tx.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white font-medium">{tx.amount} KUBA</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tx.status === 'Completed' ? 'bg-green-500/10 text-green-400' : 
                      tx.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400' : 
                      'bg-red-500/10 text-red-400'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{tx.date}</td>
                  <td className="px-6 py-4 text-right">
                    <a 
                      href={`${explorerBaseUrl}${tx.hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-1"
                    >
                      {tx.hash.substring(0, 6)}...{tx.hash.substring(tx.hash.length - 4)}
                      <ExternalLink size={12} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};