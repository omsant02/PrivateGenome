'use client';

import { useState } from 'react';
import { IExecDataProtector } from '@iexec/dataprotector';

interface GeneticData {
  [key: string]: any;
  age: number;
  gender: string;
  rs1801133: string;
  rs7412: string;
  rs429358: string;
}

interface AnalysisResult {
  [key: string]: any;
  risk_class?: string;
  risk_probability?: number;
  age?: number;
  gender?: string;
  snps?: {
    rs1801133: string;
    rs7412: string;
    rs429358: string;
  };
  recommendations?: string[];
}

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataProtector, setDataProtector] = useState<IExecDataProtector | null>(null);

  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    rs1801133: '',
    rs7412: '',
    rs429358: ''
  });

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        
        const dp = new IExecDataProtector((window as any).ethereum);
        setDataProtector(dp);
        setIsConnected(true);
        setError(null);
      } else {
        setError('Please install MetaMask');
      }
    } catch (err) {
      setError('Failed to connect wallet: ' + (err as Error).message);
    }
  };

  // Process genetic data
  const analyzeGenetics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataProtector) return;

    setIsProcessing(true);
    setError(null);

    try {
      console.log('🔬 Starting genetic analysis...');

      // Prepare genetic data
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

      // Step 2: Process in TEE
      console.log('🤖 Processing in TEE...');
      const result = await dataProtector.core.processProtectedData({
        protectedData: protectedData.address,
        app: process.env.NEXT_PUBLIC_IEXEC_APP_ADDRESS!,
        workerpool: process.env.NEXT_PUBLIC_WORKERPOOL_ADDRESS!,
        maxPrice: 0,
        onStatusUpdate: (status) => {
          console.log('📊 TEE Status:', status);
          if (status.title) {
            console.log(`🔄 ${status.title}: ${status.isDone ? 'Complete' : 'In Progress'}`);
          }
        }
      });

      console.log('✅ Analysis complete:', result);
      setResults(result);

    } catch (err) {
      console.error('❌ Error:', err);
      setError('Analysis failed: ' + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Fill sample data
  const fillSampleData = () => {
    setFormData({
      age: '35',
      gender: 'male',
      rs1801133: 'AG',
      rs7412: 'TC',
      rs429358: 'CT'
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧬 PrivateGenome - Genetic Risk Analysis</h1>
      <p>AI-powered genetic analysis using iExec TEE</p>

      {!isConnected ? (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <h2>Connect Your Wallet</h2>
          <button 
            onClick={connectWallet}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Connect MetaMask
          </button>
        </div>
      ) : results ? (
        <div>
          <h2>🎉 Analysis Results</h2>
          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>Risk Classification: {results.risk_class || 'N/A'}</h3>
            <p>Risk Probability: {results.risk_probability ? Math.round(results.risk_probability * 100) : 0}%</p>
            <p>Age: {results.age || 'N/A'}</p>
            <p>Gender: {results.gender || 'N/A'}</p>
          </div>

          <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>Genetic Markers</h3>
            <p>rs1801133: {results.snps?.rs1801133 || 'N/A'}</p>
            <p>rs7412: {results.snps?.rs7412 || 'N/A'}</p>
            <p>rs429358: {results.snps?.rs429358 || 'N/A'}</p>
          </div>

          {results.recommendations && (
            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3>Recommendations</h3>
              <ul>
                {results.recommendations.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          <button 
            onClick={() => setResults(null)}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Analyze Another Sample
          </button>
        </div>
      ) : (
        <div>
          <h2>Enter Genetic Data</h2>
          <form onSubmit={analyzeGenetics} style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>Age:</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>Gender:</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>rs1801133 (e.g., AA, AG, GG):</label>
              <input
                type="text"
                value={formData.rs1801133}
                onChange={(e) => setFormData(prev => ({ ...prev, rs1801133: e.target.value }))}
                required
                maxLength={2}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>rs7412 (e.g., CC, CT, TT):</label>
              <input
                type="text"
                value={formData.rs7412}
                onChange={(e) => setFormData(prev => ({ ...prev, rs7412: e.target.value }))}
                required
                maxLength={2}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px' }}>rs429358 (e.g., CC, CT, TT):</label>
              <input
                type="text"
                value={formData.rs429358}
                onChange={(e) => setFormData(prev => ({ ...prev, rs429358: e.target.value }))}
                required
                maxLength={2}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <button 
                type="button" 
                onClick={fillSampleData}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Fill Sample Data
              </button>
            </div>

            <button 
              type="submit" 
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                backgroundColor: isProcessing ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isProcessing ? 'not-allowed' : 'pointer'
              }}
            >
              {isProcessing ? '🤖 Analyzing in TEE...' : '🧬 Analyze My Genetic Risk'}
            </button>
          </form>

          {error && (
            <div style={{ 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              padding: '12px', 
              borderRadius: '4px', 
              marginTop: '16px' 
            }}>
              ❌ {error}
            </div>
          )}

          <div style={{ 
            backgroundColor: '#d1ecf1', 
            color: '#0c5460', 
            padding: '12px', 
            borderRadius: '4px', 
            marginTop: '16px' 
          }}>
            🔒 Your data is encrypted and processed in a Trusted Execution Environment (TEE)
          </div>
        </div>
      )}
    </div>
  );
}