import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GameProvider } from './stores/gameStore';
import './App.css';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <div className="app">
          <header className="app-header">
            <h1>Aeturnis Online</h1>
            <p>Game client initialized</p>
          </header>
          <main className="app-main">
            <div className="game-container">
              <canvas id="game-canvas" width="800" height="600">
                Your browser does not support the HTML5 canvas element.
              </canvas>
            </div>
          </main>
        </div>
      </GameProvider>
    </QueryClientProvider>
  );
}