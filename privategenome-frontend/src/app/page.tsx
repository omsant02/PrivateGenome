'use client';

import { useState } from 'react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataProtector, setDataProtector] = useState<any>(null);

  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    rs1801133: '',
    rs7412: '',
    rs429358: ''
  });

  interface GeneticData {
    age: number;
    gender: string;
    rs1801133: string;
    rs7412: string;
    rs429358: string;
  }

  const connectWallet = async () => {
    try {
      if (window?.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const { IExecDataProtector } = await import('@iexec/dataprotector');
        
        const dp = new IExecDataProtector(window.ethereum, {
          iexecOptions: {
            smsURL: 'https://sms.labs.iex.ec',
          },
        });
        
        setDataProtector(dp);
        setIsConnected(true);
        setError(null);
        console.log('✅ Wallet connected with TDX configuration');
      } else {
        setError('Please install MetaMask');
      }
    } catch (err: any) {
      setError('Connection failed: ' + err.message);
    }
  };

  const analyzeGenetics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataProtector) return;

    setIsProcessing(true);
    setError(null);

    try {
      console.log('🔬 Starting genetic analysis...');

      const geneticData: GeneticData = {
        age: parseInt(formData.age),
        gender: formData.gender,
        rs1801133: formData.rs1801133.toUpperCase(),
        rs7412: formData.rs7412.toUpperCase(),
        rs429358: formData.rs429358.toUpperCase()
      };
      console.log('📊 Genetic data:', geneticData);

      // Step 1: Protect the data
      console.log('🔒 Protecting data with DataProtector...');
      const protectedData = await dataProtector.core.protectData({
        data: geneticData,
        name: `genetic-analysis-${Date.now()}`
      });
      console.log('✅ Data protected:', protectedData.address);

      // Step 2: Process in TEE with TDX workerpool
      console.log('🤖 Processing in TDX TEE...');
      const result = await dataProtector.core.processProtectedData({
        protectedData: protectedData.address,
        workerpool: 'tdx-labs.pools.iexec.eth',
        app: process.env.NEXT_PUBLIC_IEXEC_APP_ADDRESS!,
        maxPrice: 0,
        onStatusUpdate: (status: any) => {
          console.log('📊 TEE Status:', status);
          if (status.title) {
            console.log(`🔄 ${status.title}: ${status.isDone ? 'Complete' : 'In Progress'}`);
          }
        }
      });

      console.log('✅ Analysis complete:', result);
      setResults(JSON.stringify(result, null, 2));

    } catch (err: any) {
      setError('Analysis failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const fillSample = () => setFormData({ 
    age: '35',
    gender: 'male',
    rs1801133: 'AG', 
    rs7412: 'TC', 
    rs429358: 'CT' 
  });
  
  const fillHighRisk = () => setFormData({ 
    age: '45',
    gender: 'female',
    rs1801133: 'GG', 
    rs7412: 'TT', 
    rs429358: 'GG' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧬</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">PrivateGenome</h1>
          <p className="text-gray-600">AI-powered genetic risk analysis using iExec TDX</p>
        </div>

        {!isConnected ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">🦊</div>
            <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">Connect MetaMask to start secure genetic analysis</p>
            <button 
              onClick={connectWallet}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Connect MetaMask
            </button>
          </div>
        ) : results ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="text-3xl mr-3">🎉</div>
              <h2 className="text-2xl font-semibold">Analysis Complete</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <pre className="text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                {results}
              </pre>
            </div>
            <button 
              onClick={() => setResults(null)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              🔄 New Analysis
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <span className="text-3xl mr-3">🔬</span>
              Enter Genetic Data
            </h2>

            <form onSubmit={analyzeGenetics} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="e.g., 35"
                  min="18"
                  max="100"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 font-medium"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  rs1801133 (MTHFR gene)
                </label>
                <input
                  type="text"
                  value={formData.rs1801133}
                  onChange={(e) => setFormData(prev => ({ ...prev, rs1801133: e.target.value }))}
                  placeholder="e.g., AA, AG, GG"
                  maxLength={2}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  rs7412 (APOE gene)
                </label>
                <input
                  type="text"
                  value={formData.rs7412}
                  onChange={(e) => setFormData(prev => ({ ...prev, rs7412: e.target.value }))}
                  placeholder="e.g., CC, CT, TT"
                  maxLength={2}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  rs429358 (APOE gene)
                </label>
                <input
                  type="text"
                  value={formData.rs429358}
                  onChange={(e) => setFormData(prev => ({ ...prev, rs429358: e.target.value }))}
                  placeholder="e.g., CC, CT, TT"
                  maxLength={2}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 placeholder-gray-500 font-medium"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={fillSample}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  📝 Sample Data
                </button>
                <button 
                  type="button" 
                  onClick={fillHighRisk}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  ⚠️ High Risk Sample
                </button>
              </div>

              <button 
                type="submit"
                disabled={isProcessing || !formData.age || !formData.rs1801133 || !formData.rs7412 || !formData.rs429358}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing in TDX TEE...
                  </span>
                ) : (
                  '🧬 Analyze My Genetics'
                )}
              </button>
            </form>

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="text-red-400 text-xl mr-3">❌</div>
                  <div className="text-red-700">{error}</div>
                </div>
              </div>
            )}

            <div className="mt-8 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-blue-600 text-xl mr-3">🔒</div>
                  <div>
                    <h4 className="font-semibold text-blue-900">Privacy Protected</h4>
                    <p className="text-blue-700 text-sm">Your genetic data is encrypted and processed in Intel TDX hardware</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}