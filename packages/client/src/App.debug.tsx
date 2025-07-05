import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GameProvider, useGame } from './stores/gameStore';
import './App.css';

const queryClient = new QueryClient();

function GameContent() {
  console.log('GameContent rendering...');
  
  try {
    const game = useGame();
    console.log('Game store loaded:', game);
    
    const { isConnected, currentCharacter } = game;
    
    return (
      <div className="app">
        <header>
          <h1>Aeturnis Online - Debug Mode</h1>
          <div className="connection-status">
            Status: {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </header>
        
        <main className="game-container">
          <div style={{ padding: '2rem', background: '#1a1a2e', color: 'white' }}>
            <h2>Debug Info</h2>
            <p>✅ React Components Loading</p>
            <p>✅ Game Store Connected</p>
            <p>✅ Game State: {JSON.stringify({ isConnected, currentCharacter })}</p>
            
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#16213e', borderRadius: '8px' }}>
              <h3>Character Info</h3>
              {currentCharacter ? (
                <div>
                  <p>Name: {currentCharacter.name}</p>
                  <p>Level: {currentCharacter.level}</p>
                  <p>Race: {currentCharacter.race}</p>
                  <p>Health: {currentCharacter.health}/{currentCharacter.maxHealth}</p>
                  <p>Mana: {currentCharacter.mana}/{currentCharacter.maxMana}</p>
                </div>
              ) : (
                <p>No character selected (this is normal initially)</p>
              )}
            </div>
          </div>
        </main>
        
        <footer>
          <p>Debug Mode - Components isolated for testing</p>
        </footer>
      </div>
    );
  } catch (error) {
    console.error('Error in GameContent:', error);
    return (
      <div style={{ padding: '2rem', background: 'red', color: 'white' }}>
        <h1>Error in GameContent</h1>
        <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
}

export function App() {
  console.log('App component rendering...');
  
  try {
    return (
      <QueryClientProvider client={queryClient}>
        <GameProvider>
          <GameContent />
        </GameProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('Error in App:', error);
    return (
      <div style={{ padding: '2rem', background: 'red', color: 'white' }}>
        <h1>Error in App</h1>
        <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
}