import React from 'react';

const LandingPageLayout = ({ children }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--background-dark)',
    }}>
      <header style={{
        background: 'var(--card-bg)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1.5rem 0',
      }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="text-gradient" style={{
              margin: 0,
              fontSize: '2rem',
              fontWeight: '600',
              background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.025em'
            }}>
              Private Gnome
            </h1>
          </div>
        </div>
      </header>

      <main style={{
        flex: 1,
        padding: '2rem 0',
        position: 'relative',
      }}>
        <div className="container">
          {children}
        </div>
        
        {/* Background gradient effect */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at top center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: '0'
        }} />
      </main>

      <footer style={{
        background: 'var(--card-bg)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1.5rem 0',
      }}>
        <div className="container text-center">
          <p className="text-secondary" style={{ margin: 0, fontSize: '0.875rem' }}>
            &copy; {new Date().getFullYear()} Private Gnome. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageLayout;

  