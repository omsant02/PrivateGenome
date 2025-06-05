'use client';

import { useState } from 'react';
import { IExecDataProtector } from '@iexec/dataprotector';

// Define the genetic data structure matching backend expectations
interface GeneticData {
  [key: string]: any;
  rs1801133: string;
  rs7412: string;
  rs429358: string;
}

// Define result interface to handle iExec response
interface AnalysisResult {
  [key: string]: any;
  result?: any;
  error?: string;
}

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dataProtector, setDataProtector] = useState<IExecDataProtector | null>(null);

  const [formData, setFormData] = useState({
    rs1801133: '',
    rs7412: '',
    rs429358: ''
  });

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        
        // Configure DataProtector for TDX
        const dp = new IExecDataProtector((window as any).ethereum, {
          iexecOptions: {
            smsURL: 'https://sms.labs.iex.ec',  // TDX SMS endpoint
          },
        });
        
        setDataProtector(dp);
        setIsConnected(true);
        setError(null);
        console.log('✅ Wallet connected with TDX configuration');
      } else {
        setError('Please install MetaMask');
      }
    } catch (err) {
      setError('Failed to connect wallet: ' + (err as Error).message);
    }
  };

  // Process genetic data using corrected backend schema
  const analyzeGenetics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataProtector) return;

    setIsProcessing(true);
    setError(null);

    try {
      console.log('🔬 Starting genetic analysis...');

      // Prepare genetic data matching backend expected schema
      const geneticData: GeneticData = {
        rs1801133: formData.rs1801133.toUpperCase(),
        rs7412: formData.rs7412.toUpperCase(),
        rs429358: formData.rs429358.toUpperCase()
      };

      console.log('📊 Genetic data:', geneticData);

      // Step 1: Protect the data with proper schema
      console.log('🔒 Protecting genomic data...');
      const protectedData = await dataProtector.core.protectData({
        data: geneticData as any, // Type assertion for iExec DataObject compatibility
        name: `genetic-analysis-${Date.now()}`,
      });

      console.log('✅ Data protected:', protectedData.address);

      // Step 2: Process in TDX TEE
      console.log('🤖 Processing in TDX TEE...');
      const result: any = await dataProtector.core.processProtectedData({
        protectedData: protectedData.address,
        app: process.env.NEXT_PUBLIC_IEXEC_APP_ADDRESS!,
        workerpool: 'tdx-labs.pools.iexec.eth',  // TDX workerpool
        maxPrice: 0,
        onStatusUpdate: (status: any) => {
          console.log('📊 TEE Status:', status);
          if (status.title) {
            console.log(`🔄 ${status.title}: ${status.isDone ? 'Complete' : 'In Progress'}`);
          }
        }
      });

      console.log('✅ Analysis complete:', result);
      setResults({ result: result });

    } catch (err) {
      console.error('❌ Error:', err);
      setError('Analysis failed: ' + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Test with public args (no protected data)
  const testWithPublicArgs = async () => {
    if (!dataProtector) return;

    setIsProcessing(true);
    setError(null);

    try {
      console.log('🧪 Testing with public args...');
      
      const testArgs = `${formData.rs1801133.toUpperCase()} ${formData.rs7412.toUpperCase()} ${formData.rs429358.toUpperCase()}`;
      
      // For testing purposes, we can create a simple task without protected data
      // This would use the command line args path in your backend
      console.log('📝 Test args:', testArgs);
      
      // This is a simplified test - in practice you'd need to handle this differently
      setResults({
        result: `Test mode: Would analyze ${testArgs} using public args pathway`
      });
      
    } catch (err) {
      console.error('❌ Test error:', err);
      setError('Test failed: ' + (err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Fill sample data
  const fillSampleData = () => {
    setFormData({
      rs1801133: 'AG',
      rs7412: 'TC',
      rs429358: 'CT'
    });
  };

  // Fill high-risk sample
  const fillHighRiskSample = () => {
    setFormData({
      rs1801133: 'GG',
      rs7412: 'TT',
      rs429358: 'GG'
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧬 PrivateGenome - TDX Genetic Risk Analysis</h1>
      <p>AI-powered genetic analysis using iExec TDX (Trusted Domain Extensions)</p>

      {!isConnected ? (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <h2>Connect Your Wallet</h2>
          <p>Connect MetaMask to start secure genomic analysis</p>
          <button 
            onClick={connectWallet}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🦊 Connect MetaMask
          </button>
        </div>
      ) : results ? (
        <div>
          <h2>🎉 Analysis Results</h2>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #dee2e6'
          }}>
            <h3>📊 Genomic Analysis Output</h3>
            {results.result && (
              <div style={{ 
                backgroundColor: '#ffffff', 
                padding: '15px', 
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px',
                lineHeight: '1.4',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {typeof results.result === 'string' ? (
                  <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                    {results.result}
                  </pre>
                ) : (
                  <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                    {JSON.stringify(results.result, null, 2)}
                  </pre>
                )}
              </div>
            )}
            {results.error && (
              <div style={{ color: '#dc3545', fontWeight: 'bold' }}>
                ❌ Error: {results.error}
              </div>
            )}
          </div>

          <button 
            onClick={() => setResults(null)}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            🔄 Analyze Another Sample
          </button>
        </div>
      ) : (
        <div>
          <h2>Enter Genetic Data</h2>
          <form style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                rs1801133 (MTHFR gene - e.g., AA, AG, GG):
              </label>
              <input
                type="text"
                value={formData.rs1801133}
                onChange={(e) => setFormData(prev => ({ ...prev, rs1801133: e.target.value }))}
                required
                maxLength={2}
                placeholder="AA"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                rs7412 (APOE gene - e.g., CC, CT, TT):
              </label>
              <input
                type="text"
                value={formData.rs7412}
                onChange={(e) => setFormData(prev => ({ ...prev, rs7412: e.target.value }))}
                required
                maxLength={2}
                placeholder="CC"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                rs429358 (APOE gene - e.g., CC, CT, TT):
              </label>
              <input
                type="text"
                value={formData.rs429358}
                onChange={(e) => setFormData(prev => ({ ...prev, rs429358: e.target.value }))}
                required
                maxLength={2}
                placeholder="TT"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
                📝 Fill Sample Data
              </button>
              
              <button 
                type="button" 
                onClick={fillHighRiskSample}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ⚠️ Fill High Risk Sample
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                type="button"
                onClick={analyzeGenetics}
                disabled={isProcessing || !formData.rs1801133 || !formData.rs7412 || !formData.rs429358}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '12px',
                  fontSize: '16px',
                  backgroundColor: isProcessing ? '#6c757d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing ? '🔒 Processing in TDX...' : '🧬 Analyze with Protected Data'}
              </button>

              <button 
                type="button"
                onClick={testWithPublicArgs}
                disabled={isProcessing || !formData.rs1801133 || !formData.rs7412 || !formData.rs429358}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '12px',
                  fontSize: '16px',
                  backgroundColor: isProcessing ? '#6c757d' : '#ffc107',
                  color: isProcessing ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }}
              >
                {isProcessing ? '🧪 Testing...' : '🧪 Test Mode'}
              </button>
            </div>
          </form>

          {error && (
            <div style={{ 
              backgroundColor: '#f8d7da', 
              color: '#721c24', 
              padding: '12px', 
              borderRadius: '4px', 
              marginTop: '16px',
              border: '1px solid #f5c6cb'
            }}>
              ❌ {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}