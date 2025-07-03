import { useEffect, useState } from 'react';
import GameCanvas from './components/GameCanvas';

function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Simple initialization
    console.log('Game Development Environment Ready');
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        color: 'white',
        fontSize: '18px'
      }}>
        Loading Game Environment...
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative',
      background: '#000'
    }}>
      <GameCanvas />
      
      {/* Debug Info */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        color: 'white',
        fontSize: '12px',
        fontFamily: 'monospace',
        background: 'rgba(0,0,0,0.5)',
        padding: '5px',
        borderRadius: '3px'
      }}>
        Game Development Environment
        <br />
        Canvas Ready - Start Building!
      </div>
    </div>
  );
}

export default App;
