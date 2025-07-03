import { create } from 'zustand';
import { ReactNode, createContext, useContext } from 'react';

interface GameState {
  isConnected: boolean;
  currentCharacter: any | null;
  setConnected: (connected: boolean) => void;
  setCharacter: (character: any) => void;
}

const useGameStore = create<GameState>((set) => ({
  isConnected: false,
  currentCharacter: null,
  setConnected: (connected) => set({ isConnected: connected }),
  setCharacter: (character) => set({ currentCharacter: character })
}));

const GameContext = createContext<ReturnType<typeof useGameStore> | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  return (
    <GameContext.Provider value={useGameStore()}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};