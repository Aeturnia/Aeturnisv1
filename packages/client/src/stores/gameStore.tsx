import { create } from 'zustand';
import { ReactNode, createContext, useContext } from 'react';

interface Character {
  name: string;
  level: number;
  race: string;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  strength?: number;
  dexterity?: number;
  intelligence?: number;
  constitution?: number;
  wisdom?: number;
  charisma?: number;
}

interface GameState {
  isConnected: boolean;
  currentCharacter: Character | null;
  setConnected: (connected: boolean) => void;
  setCharacter: (character: Character) => void;
}

const useGameStore = create<GameState>((set) => ({
  isConnected: false,
  currentCharacter: null,
  setConnected: (connected: boolean) => set({ isConnected: connected }),
  setCharacter: (character: Character) => set({ currentCharacter: character })
}));

const GameContext = createContext<GameState | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const store = useGameStore();
  return (
    <GameContext.Provider value={store}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = (): GameState => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};