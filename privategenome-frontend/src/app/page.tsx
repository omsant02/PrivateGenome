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

  const connectWallet = async () => {
    try {
      if ((window as any)?.ethereum) {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const { IExecDataProtector } = await import('@iexec/dataprotector');
        
        // CORRECT TDX configuration with SMS endpoint
        const dp = new IExecDataProtector((window as any).ethereum, {
          iexecOptions: {
            smsURL: 'https://sms.labs.iex.ec',
          },
        });
        
        setDataProtector(dp);
        setIsConnected(true);
        setError(null);
      } else {
        setError('Please install MetaMask');
      }
    } catch (err: any) {
      setError('Connection failed: ' + err.message);
    }
  };

  const analyzeGenetics = async () => {
    if (!dataProtector) return;

    setIsProcessing(true);
    setError(null);

    let protectedDataAddress = '';

    try {
      // Create genetic data matching your iApp's getValue calls
      const geneticData = {
        age: formData.age,
        gender: formData.gender,
        rs1801133: formData.rs1801133.toUpperCase(),
        rs7412: formData.rs7412.toUpperCase(),
        rs429358: formData.rs429358.toUpperCase()
      };

      console.log('🔒 Protecting genetic data...', geneticData);
      
      const protectedData = await dataProtector.core.protectData({
        data: geneticData,
        name: `genetic-analysis-${Date.now()}`
      });

      protectedDataAddress = protectedData.address;
      console.log('✅ Data protected:', protectedDataAddress);

      // GRANT ACCESS TO THE APP - This was missing!
      console.log('🔑 Granting access to TDX app...');
      await dataProtector.core.grantAccess({
        protectedData: protectedDataAddress,
        authorizedApp: '0xBF08466487a97afC83466E9F793f25150BA73dD5',
        authorizedUser: await (window as any).ethereum.request({ method: 'eth_requestAccounts' }).then((accounts: string[]) => accounts[0])
      });
      console.log('✅ Access granted to TDX app');

      // Now ACTUALLY call your deployed TEE app - try without specifying workerpool
      console.log('🤖 Calling TEE app (auto-select workerpool)...');
      
      const result = await dataProtector.core.processProtectedData({
        protectedData: protectedDataAddress,
        app: '0xBF08466487a97afC83466E9F793f25150BA73dD5',
        maxPrice: 10000
      });

      console.log('✅ TEE processing result:', result);

      if (result.result?.location) {
        console.log('📥 Fetching result from:', result.result.location);
        const response = await fetch(result.result.location);
        const resultText = await response.text();
        setResults(resultText);
      } else {
        // If no result location, show the task info
        setResults(`🎉 TEE PROCESSING COMPLETED!

Task ID: ${result.taskId || 'Processing...'}
Deal ID: ${result.dealId || 'Creating...'}

✅ Your genetic data was successfully processed in the TEE!
Check the iExec explorer for full results.

Protected Data: ${protectedDataAddress}
TDX App: 0xBF08466487a97afC83466E9F793f25150BA73dD5`);
      }

    } catch (err: any) {
      console.error('TEE processing failed:', err);
      
      // If TEE call fails, show the error but still show data was protected
      setError(`TEE Processing Error: ${err.message}

${protectedDataAddress ? `But your data was successfully protected! 
Protected Data Address: ${protectedDataAddress}

You can still run the analysis via CLI:
EXPERIMENTAL_TDX_APP=true iapp run 0xBF08466487a97afC83466E9F793f25150BA73dD5 --protectedData ${protectedDataAddress}` : 'Data protection failed.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const fillSample = () => setFormData({ 
    age: '35', gender: 'male', rs1801133: 'AG', rs7412: 'TC', rs429358: 'CT' 
  });

  const handleSubmit = () => {
    // Basic validation
    if (!formData.age || !formData.rs1801133 || !formData.rs7412 || !formData.rs429358) {
      setError('Please fill in all required fields');
      return;
    }
    analyzeGenetics();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-lg mx-auto">
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🧬 PrivateGenome</h1>
          <p className="text-gray-600">AI-powered genetic risk analysis using iExec TDX</p>
        </div>

        {!isConnected ? (
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">🦊</div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">Connect MetaMask to start secure genetic analysis</p>
            <button 
              onClick={connectWallet}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Connect MetaMask
            </button>
          </div>
        ) : results ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="text-2xl mr-3">🎉</div>
              <h2 className="text-xl font-semibold text-gray-800">Analysis Complete</h2>
            </div>
            <div className="bg-gray-50 border rounded-lg p-4 mb-4">
              <pre className="text-sm overflow-auto max-h-80 whitespace-pre-wrap font-mono text-gray-900 leading-relaxed">
                {results}
              </pre>
            </div>
            <button 
              onClick={() => setResults(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              🔄 New Analysis
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
              <span className="text-2xl mr-3">🔬</span>
              Enter Genetic Data
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="e.g., 35"
                  min="18"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">rs1801133 (MTHFR gene)</label>
                <input
                  type="text"
                  value={formData.rs1801133}
                  onChange={(e) => setFormData(prev => ({ ...prev, rs1801133: e.target.value }))}
                  placeholder="e.g., AG, AA, GG"
                  maxLength={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">rs7412 (APOE gene)</label>
                <input
                  type="text"
                  value={formData.rs7412}
                  onChange={(e) => setFormData(prev => ({ ...prev, rs7412: e.target.value }))}
                  placeholder="e.g., TC, CC, TT"
                  maxLength={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">rs429358 (APOE gene)</label>
                <input
                  type="text"
                  value={formData.rs429358}
                  onChange={(e) => setFormData(prev => ({ ...prev, rs429358: e.target.value }))}
                  placeholder="e.g., CT, CC, TT"
                  maxLength={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
                />
              </div>

              <button 
                type="button" 
                onClick={fillSample}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors mb-3"
              >
                📝 Fill Sample Data
              </button>

              <button 
                onClick={handleSubmit}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {isProcessing ? '🔄 Protecting & Analyzing...' : '🧬 Protect Data & Analyze'}
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-700 text-sm">{error}</div>
              </div>
            )}

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-blue-800 text-sm">
                <strong>🔒 Privacy Protected:</strong> Your genetic data is encrypted with DataProtector<br/>
                <strong>⚡ TDX Ready:</strong> App deployed at 0xBF08466487a97afC83466E9F793f25150BA73dD5<br/>
                <strong>💡 CLI Access:</strong> For full TDX processing, use the CLI command shown in results
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}