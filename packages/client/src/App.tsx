import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GameProvider, useGame } from './stores/gameStore';
import { GameEngine } from './components/GameEngine';
import { GameUI } from './components/GameUI';
import { CurrencyDisplay } from './components/CurrencyDisplay';
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
              <div className="info-section">
                <p><strong>Name:</strong> {currentCharacter.name}</p>
                <p><strong>Level:</strong> {currentCharacter.level}</p>
                <p><strong>Race:</strong> {currentCharacter.race}</p>
              </div>
              <div className="divider"></div>
              <div className="info-section">
                <h4>Stats</h4>
                <p><strong>Health:</strong> {currentCharacter.health}/{currentCharacter.maxHealth}</p>
                <p><strong>Mana:</strong> {currentCharacter.mana}/{currentCharacter.maxMana}</p>
                <p><strong>Gold:</strong> <CurrencyDisplay amount={currentCharacter.gold || 0} /></p>
                <p><strong>STR:</strong> {currentCharacter.strength || 10}</p>
                <p><strong>DEX:</strong> {currentCharacter.dexterity || 10}</p>
                <p><strong>INT:</strong> {currentCharacter.intelligence || 10}</p>
                <p><strong>CON:</strong> {currentCharacter.constitution || 10}</p>
                <p><strong>WIS:</strong> {currentCharacter.wisdom || 10}</p>
                <p><strong>CHA:</strong> {currentCharacter.charisma || 10}</p>
              </div>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#aaa' }}>No character selected</p>
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