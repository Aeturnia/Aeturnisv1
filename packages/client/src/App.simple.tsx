export function App() {
  console.log('App component rendering...');
  
  return (
    <div style={{ 
      padding: '2rem', 
      backgroundColor: '#1a1a2e', 
      color: 'white', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#00d2ff', marginBottom: '1rem' }}>
          🎮 Aeturnis Online - TEST MODE
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          React Application is Working!
        </p>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#16213e', 
          borderRadius: '8px',
          border: '2px solid #00d2ff'
        }}>
          <p>✅ React initialized successfully</p>
          <p>✅ TypeScript compilation working</p>
          <p>✅ CSS styles loading correctly</p>
          <p>✅ JavaScript bundle loading properly</p>
        </div>
      </div>
    </div>
  );
}