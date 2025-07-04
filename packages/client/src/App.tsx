import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GameProvider, useGame } from './stores/gameStore';
import { GameEngine } from './components/GameEngine';
import { GameUI } from './components/GameUI';
import './App.css';

const queryClient = new QueryClient();

function GameContent() {
  const game = useGame();
  const { isConnected, currentCharacter } = game;

  return (
    <div className="app">
      <header>
        <h1>Aeturnis Online</h1>
        <div className="connection-status">
          Status: {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </header>
      
      <main className="game-container">
        <GameEngine />
        <GameUI />
        
        <div className="game-info">
          <h3>Character Info</h3>
          {currentCharacter ? (
            <div>
              <p>Name: {currentCharacter.name}</p>
              <p>Level: {currentCharacter.level}</p>
              <p>Race: {currentCharacter.race}</p>
            </div>
          ) : (
            <p>No character selected</p>
          )}
        </div>
      </main>
      
      <footer>
        <p>MMORPG Development Environment Ready</p>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <GameContent />
      </GameProvider>
    </QueryClientProvider>
  );
}