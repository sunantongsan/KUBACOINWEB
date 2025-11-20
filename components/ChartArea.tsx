
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '00:00', price: 0.45 },
  { name: '04:00', price: 0.48 },
  { name: '08:00', price: 0.47 },
  { name: '12:00', price: 0.52 },
  { name: '16:00', price: 0.50 },
  { name: '20:00', price: 0.55 },
  { name: '24:00', price: 0.58 },
];

export const ChartArea: React.FC = () => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6 h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Price History</h2>
          <p className="text-sm text-slate-400">KUBA/USD - 24 Hours</p>
        </div>
        <div className="flex gap-2">
            {['1H', '24H', '7D', '1M', 'ALL'].map((p) => (
                <button key={p} className={`px-3 py-1 text-xs rounded-lg ${p === '24H' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
                    {p}
                </button>
            ))}
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                tick={{fontSize: 12}}
                axisLine={false}
                tickLine={false}
            />
            <YAxis 
                stroke="#94a3b8" 
                tick={{fontSize: 12}}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `$${val}`}
            />
            <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                itemStyle={{ color: '#818cf8' }}
                formatter={(value: number) => {
                  return [`$${value}`, 'Price'];
                }}
            />
            <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#6366f1" 
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
