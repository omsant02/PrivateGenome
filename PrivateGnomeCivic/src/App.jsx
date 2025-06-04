import React, { useState, useEffect } from 'react';
import { UserButton, useUser, CivicAuthProvider } from '@civic/auth-web3/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import 'bootstrap/dist/css/bootstrap.min.css';
import './UserButton.css';
import {
  WagmiProvider,
  createConfig,
  useAccount,
  useConnect,
  useBalance,
  http
} from 'wagmi';
import { embeddedWallet } from '@civic/auth-web3/wagmi';
import { mainnet, sepolia } from 'viem/chains';
import { userHasWallet } from '@civic/auth-web3';
import { useAutoConnect } from '@civic/auth-web3/wagmi';
import LandingPageLayout from './LandingPageLayout';
import html2canvas from 'html2canvas';  

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [embeddedWallet()],
});

const createWallet = async (userContext) => {
  if (userContext && userContext.user && !userHasWallet(userContext)) {
    await userContext.createWallet();
  }
};

const connectExistingWallet = async (connectors, connect) => {
  await connect({ connector: connectors[0] });
};

function Navbar({ onWalletClick, onSignOutClick, onSignInClick, isLoggedIn }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <button className="btn btn-primary" onClick={onWalletClick}>My Wallet</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  const [view, setView] = useState('wallet'); 
  const userContext = useUser();
  const { isConnected, address } = useAccount();
  const { connectors, connect, disconnect } = useConnect();
  const balance = useBalance({ address });
  const [isLoggedIn, setIsLoggedIn] = useState(isConnected);

  useAutoConnect();

  useEffect(() => {
    if (userContext && userContext.user && !userHasWallet(userContext)) {
      createWallet(userContext);
    }
    setIsLoggedIn(isConnected);
  }, [userContext, isConnected]);

  const handleWalletClick = () => {
    if (!isConnected) {
      connectExistingWallet(connectors, connect);
    }
    setView('wallet');
  };

  const handleSignOutClick = () => {
    if (userContext) {
      userContext.signOut(); 
    }
    disconnect(); 
    setIsLoggedIn(false); 
    setView('wallet'); 
  };

  const handleSignInClick = async () => {
    if (!userContext.user) {
      try {
        await userContext.signIn();
      } catch (error) {
        console.error('Sign-In Error:', error);
      }
    }
  };


  return (
    <>
      <Navbar 
        onWalletClick={handleWalletClick} 
        onSignOutClick={handleSignOutClick}
        onSignInClick={handleSignInClick}
        isLoggedIn={isLoggedIn}
      />
      <div className="container mt-4">
        {view === 'wallet' && (
          <div className="card p-4" style={{
            margin: 10,
            fontSize: '2rem',
            fontWeight: 600,
            background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
            letterSpacing: '-0.025em'
          }}>
            <div className="user-button-container">
              <UserButton/>
            </div>
            {!isLoggedIn ? (
              <div className="card-body">
                <h2 className="card-title" style={{ color: 'white' }}>Please Sign In</h2>
              </div>
            ) : (
              userContext.user && userHasWallet(userContext) && (
                <div className="card-body">
                  <h2 className="card-title" style={{ color: 'white' }}> Your Wallet</h2>
                  <p style={{ color: 'white' }}><strong style={{ color: 'white' }}>Wallet Address:</strong> <code style={{ color: 'lightgray' }}>{address}</code></p>
                  <p style={{ color: 'white' }}><strong style={{ color: 'white' }}>Balance:</strong> {
                    balance?.data
                      ? `${(BigInt(balance.data.value) / BigInt(1e18)).toString()} ${balance.data.symbol}`
                      : 'Loading...'
                  }</p>

                  {isConnected ? (
                    <p className="text-success">✅ Wallet Connected</p>
                  ) : null}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <CivicAuthProvider clientId={import.meta.env.VITE_CIVIC_CLIENT_ID}>
          <LandingPageLayout>
            <AppContent />
          </LandingPageLayout>
        </CivicAuthProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
