
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, DollarSign, Percent, Copy, Check } from 'lucide-react';
import { CoinData, KUBA_LOGO_URL } from '../types';

// Mock data for visual demonstration
const MOCK_CHART_DATA = [
  { name: '00:00', price: 42000 },
  { name: '04:00', price: 42500 },
  { name: '08:00', price: 41800 },
  { name: '12:00', price: 43200 },
  { name: '16:00', price: 42900 },
  { name: '20:00', price: 43500 },
  { name: '24:00', price: 44100 },
];

const MOCK_COINS: CoinData[] = [
  { name: 'KUBA (TON)', symbol: 'KUBA', price: 1.85, change24h: 12.5, marketCap: '2M', volume: '500K', logo: KUBA_LOGO_URL },
  { name: 'Bitcoin', symbol: 'BTC', price: 44123.45, change24h: 2.5, marketCap: '850B', volume: '24B' },
  { name: 'Ethereum', symbol: 'ETH', price: 2345.12, change24h: 1.2, marketCap: '280B', volume: '12B' },
  { name: 'Solana', symbol: 'SOL', price: 98.45, change24h: 5.8, marketCap: '42B', volume: '4B' },
];

const CoinCard: React.FC<{ coin: CoinData }> = ({ coin }) => (
  <div className={`bg-slate-800/50 backdrop-blur-sm border rounded-xl p-5 transition-all duration-300 shadow-lg ${coin.symbol === 'KUBA' ? 'border-green-500/50 shadow-green-500/10' : 'border-slate-700 hover:border-slate-600'}`}>
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white overflow-hidden ${
          coin.logo ? 'bg-transparent' :
          coin.symbol === 'BTC' ? 'bg-orange-500' : 
          coin.symbol === 'ETH' ? 'bg-blue-600' : 
          'bg-purple-600'
        }`}>
          {coin.logo ? (
            <img src={coin.logo} alt={coin.symbol} className="w-full h-full object-cover" />
          ) : (
            coin.symbol[0]
          )}
        </div>
        <div>
          <h3 className="font-bold text-white flex items-center gap-1">
            {coin.name}
            {coin.symbol === 'KUBA' && <span className="bg-blue-500 text-[9px] px-1.5 py-0.5 rounded-full text-white">TON</span>}
          </h3>
          <span className="text-xs text-slate-400">{coin.symbol}</span>
        </div>
      </div>
      <div className={`flex items-center text-sm font-bold ${coin.change24h >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
        {coin.change24h >= 0 ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
        {Math.abs(coin.change24h)}%
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-2xl font-bold text-white">${coin.price.toLocaleString()}</p>
      <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-slate-700/50">
        <span>Vol: {coin.volume}</span>
        <span>Cap: {coin.marketCap}</span>
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const [copied, setCopied] = React.useState(false);
  const kubaTonAddress = "EQDCCMpdq2lab20fVNcXTx44TrGfAnNDvWiFWt9wDfDUY5YT";

  const handleCopy = () => {
    navigator.clipboard.writeText(kubaTonAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Featured KUBA TON Banner */}
      <div className="bg-gradient-to-r from-yellow-900/20 to-green-900/20 border border-green-500/30 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-green-500/30 flex items-center justify-center overflow-hidden shadow-lg shrink-0">
             <img src={KUBA_LOGO_URL} alt="KUBA" className="w-full h-full object-cover" />
           </div>
           <div>
             <h2 className="text-xl font-bold text-white">KUBA Coin (TON)</h2>
             <p className="text-slate-400 text-sm">Official contract address on TON Network</p>
           </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-lg border border-green-500/20 w-full md:w-auto justify-between">
          <code className="text-sm text-green-400 font-mono truncate max-w-[200px] md:max-w-none">{kubaTonAddress}</code>
          <button onClick={handleCopy} className="text-slate-400 hover:text-white ml-2 transition-colors" title="Copy Address">
             {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_COINS.map((coin) => (
          <CoinCard key={coin.symbol} coin={coin} />
        ))}
      </div>

      {/* Main Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="text-green-400" />
              Market Overview
            </h2>
            <div className="flex gap-2">
              {['1H', '24H', '7D', '30D'].map((period) => (
                <button key={period} className="px-3 py-1 text-xs font-medium rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#22c55e' }}
                />
                <Area type="monotone" dataKey="price" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Panel / Portfolio Summary */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-xl flex flex-col">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <DollarSign className="text-yellow-400" />
            Portfolio Value
          </h2>
          <div className="text-center py-8">
            <span className="text-4xl font-bold text-white">$0.00</span>
            <p className="text-slate-400 mt-2">Connect wallet to view assets</p>
          </div>
          <div className="mt-auto space-y-4">
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-700">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Asset Allocation</span>
                <span className="text-white font-bold">N/A</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-slate-500 h-2 rounded-full w-0"></div>
              </div>
            </div>
            <button className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors">
              Manage Assets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
