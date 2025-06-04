const LandingPageLayout = ({ children }) => {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1a1a1a', // Dark background for the entire app
      }}>
        <header style={{
          background: '#282c34',
          padding: '20px',
          color: 'white',
          textAlign: 'center', // Center text in the header
        }}>
          <h1>Private Gnome</h1>
        </header>
  
        <main style={{
          padding: '20px',
          flex: 1,
          display: 'flex',
          justifyContent: 'center', // Center content vertically in the main area
          alignItems: 'center',      // Center content horizontally in the main area
          width: '100%',
          backgroundColor: '#1a1a1a', // Dark background for the main content area
        }}>
          <div style={{ width: '100%', maxWidth: '900px' }}>
            {children}
          </div>
        </main>
  
        <footer style={{
          background: '#282c34',
          padding: '10px',
          color: 'white',
          textAlign: 'center',
        }}>
          <p>&copy; 2025 Private Gnome</p>
        </footer>
      </div>
    );
  };
  
export default LandingPageLayout;

  