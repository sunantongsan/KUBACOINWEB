import React, { useState } from 'react';
import { ChainType, TokenData, NetworkMode } from '../types';
import { CHAIN_CONFIG } from '../constants';
import { Upload, AlertTriangle, CheckCircle, Info, Globe, Beaker } from 'lucide-react';
import { FeeDisplay } from './FeeDisplay';
import { analyzeErrorWithGemini } from '../services/geminiService';

interface TokenCreatorProps {
  onTokenCreated: (token: TokenData) => void;
}

export const TokenCreator: React.FC<TokenCreatorProps> = ({ onTokenCreated }) => {
  const [selectedChain, setSelectedChain] = useState<ChainType>(ChainType.BNB);
  const [networkMode, setNetworkMode] = useState<NetworkMode>(NetworkMode.MAINNET);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    supply: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    setError(null);
    setIsProcessing(true);

    // Basic Validation
    if (!formData.name || !formData.symbol || !formData.supply) {
      setError("Please fill in all required fields.");
      setIsProcessing(false);
      return;
    }

    // Simulate API Call / Blockchain Interaction
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Random error simulation for AI demonstration
      if (formData.symbol.length > 10) {
        throw new Error("SYMBOL_TOO_LONG_FOR_CONTRACT");
      }

      // Generate mock contract address
      const mockContractAddress = "0x" + Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('');

      const newToken: TokenData = {
        id: Date.now().toString(),
        name: formData.name,
        symbol: formData.symbol.toUpperCase(),
        supply: parseFloat(formData.supply),
        chain: selectedChain,
        networkMode: networkMode,
        logoUrl: logoPreview,
        createdAt: new Date(),
        status: 'deploying', // Start as deploying
        liquidityLocked: false,
        contractAddress: mockContractAddress,
        ownershipRenounced: false,
        transactions: [] // Initialize empty history
      };

      onTokenCreated(newToken);
    } catch (err: any) {
      const errorMessage = err.message || "Unknown Error";
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentChainConfig = CHAIN_CONFIG[selectedChain];
  // Simulate a base creation fee of 0.01 native coin for creation
  const creationCost = networkMode === NetworkMode.TESTNET ? 0 : 0.01; 
  
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Create Your Token</h2>
        <p className="text-gray-400">Select a network and define your token properties. AI will verify parameters.</p>
      </div>

      {/* Chain Selection */}
      <div className="grid grid-cols-3 gap-4">
        {Object.values(ChainType).map((chain) => (
          <button
            key={chain}
            onClick={() => setSelectedChain(chain)}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
              selectedChain === chain
                ? `${CHAIN_CONFIG[chain].borderColor} ${CHAIN_CONFIG[chain].bgColor} shadow-lg shadow-yellow-500/10`
                : 'border-gray-700 bg-card hover:border-gray-600'
            }`}
          >
            <span className="text-4xl">{CHAIN_CONFIG[chain].icon}</span>
            <span className={`font-semibold ${selectedChain === chain ? 'text-white' : 'text-gray-400'}`}>
              {chain}
            </span>
          </button>
        ))}
      </div>

      {/* Network Mode Selection */}
      <div className="flex justify-center">
        <div className="bg-card border border-gray-700 p-1 rounded-full flex">
          <button
            onClick={() => setNetworkMode(NetworkMode.MAINNET)}
            className={`px-6 py-2 rounded-full flex items-center gap-2 text-sm font-bold transition-all ${
              networkMode === NetworkMode.MAINNET
                ? 'bg-yellow-500 text-black shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" /> Mainnet
          </button>
          <button
            onClick={() => setNetworkMode(NetworkMode.TESTNET)}
            className={`px-6 py-2 rounded-full flex items-center gap-2 text-sm font-bold transition-all ${
              networkMode === NetworkMode.TESTNET
                ? 'bg-gray-700 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Beaker className="w-4 h-4" /> Testnet
          </button>
        </div>
      </div>
      
      {networkMode === NetworkMode.TESTNET && (
        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex items-center gap-3 justify-center">
           <Info className="w-5 h-5 text-blue-400" />
           <span className="text-blue-200 text-sm">You are in Testnet Mode. Tokens created here have no real value.</span>
        </div>
      )}

      {/* Form */}
      <div className="bg-card p-8 rounded-2xl border border-gray-700 shadow-xl space-y-6 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-600"></div>
        <div className="flex gap-6 flex-col md:flex-row">
           {/* Logo Upload */}
          <div className="flex flex-col items-center gap-2">
            <div className={`w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden relative transition-all ${logoPreview ? 'border-yellow-500' : 'border-gray-600 bg-dark hover:border-yellow-500/50'}`}>
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-8 h-8 text-gray-500" />
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <span className="text-xs text-gray-400">Upload Logo</span>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Token Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Bitcoin"
                className="w-full bg-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Symbol</label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={e => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                  placeholder="e.g. BTC"
                  className="w-full bg-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-all"
                />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-300 mb-1">Total Supply</label>
                <input
                  type="number"
                  value={formData.supply}
                  onChange={e => setFormData({...formData, supply: e.target.value})}
                  placeholder="e.g. 1000000"
                  className="w-full bg-dark border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-lg flex items-start gap-3 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-red-400 font-semibold">Error Encountered</h4>
              <p className="text-red-200 text-sm">{error}</p>
              <button 
                className="mt-2 text-xs bg-red-500/20 hover:bg-red-500/40 text-red-300 px-2 py-1 rounded transition-colors"
                onClick={() => analyzeErrorWithGemini(error, "Token Creation Form")}
              >
                Ask AI about this error
              </button>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-700">
           <FeeDisplay baseAmount={creationCost} networkFee={0.002} currency={currentChainConfig.currency} actionName={`Token Creation (${networkMode})`} />
           
           <button
            onClick={handleCreate}
            disabled={isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-lg mt-4 shadow-lg transition-all flex items-center justify-center gap-2 ${
              isProcessing 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-yellow-500 to-orange-600 text-black hover:shadow-yellow-500/40 hover:-translate-y-1'
            }`}
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" /> Confirm Creation
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};