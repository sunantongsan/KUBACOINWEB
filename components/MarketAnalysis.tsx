import React, { useEffect, useState } from 'react';
import { RefreshCw, Newspaper, ExternalLink, AlertCircle } from 'lucide-react';
import { getCryptoNewsAndAnalysis } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

export const MarketAnalysis: React.FC = () => {
  const [analysis, setAnalysis] = useState<{ text: string; sources?: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchAnalysis = async () => {
    setLoading(true);
    const data = await getCryptoNewsAndAnalysis("current crypto market sentiment, Bitcoin price action today, and Bitkub Coin (KUB) news");
    setAnalysis(data);
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Newspaper className="text-purple-400" />
            AI Market Insights
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time analysis powered by Google Search Grounding
          </p>
        </div>
        <button
          onClick={fetchAnalysis}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Analyzing..." : "Refresh Analysis"}
        </button>
      </div>

      {lastUpdate && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-xl min-h-[400px]">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <RefreshCw size={40} className="animate-spin text-emerald-500" />
              <p>Scanning global markets...</p>
            </div>
          ) : analysis ? (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown components={{
                h1: ({node, ...props}) => <h3 className="text-xl font-bold text-emerald-400 mb-4" {...props} />,
                h2: ({node, ...props}) => <h4 className="text-lg font-semibold text-white mt-4 mb-2" {...props} />,
                ul: ({node, ...props}) => <ul className="space-y-2 my-4" {...props} />,
                li: ({node, ...props}) => <li className="text-slate-300 marker:text-emerald-500" {...props} />,
                strong: ({node, ...props}) => <span className="text-emerald-300 font-bold" {...props} />,
              }}>
                {analysis.text}
              </ReactMarkdown>

              {analysis.sources && analysis.sources.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-700">
                  <h4 className="text-sm font-semibold text-slate-400 mb-3">Sources & References</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {analysis.sources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 p-2 rounded bg-slate-700/30 hover:bg-slate-700 transition-colors text-sm text-blue-300 hover:text-blue-200"
                      >
                        <ExternalLink size={14} className="shrink-0" />
                        <span className="truncate">{source.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              <AlertCircle size={32} className="mr-2" />
              Failed to load data.
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Why use Kubacoin AI?</h3>
          <ul className="space-y-4 text-sm text-slate-300">
            <li className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 font-bold">1</div>
              <span>Instant aggregation of news from multiple global sources.</span>
            </li>
            <li className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold">2</div>
              <span>Real-time price checking using Google Search Grounding.</span>
            </li>
             <li className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold">3</div>
              <span>Focused analysis on Thai markets (Bitkub) and global trends.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};