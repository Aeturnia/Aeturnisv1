import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../App';

// Mock the game store
vi.mock('../stores/gameStore', () => ({
  GameProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="game-provider">{children}</div>,
  useGame: () => ({
    isConnected: false,
    currentCharacter: null,
    setConnected: vi.fn(),
    setCharacter: vi.fn()
  })
}));

// Mock the components
vi.mock('../components/GameEngine', () => ({
  GameEngine: () => <div data-testid="game-engine">Game Engine</div>
}));

vi.mock('../components/GameUI', () => ({
  GameUI: () => <div data-testid="game-ui">Game UI</div>
}));

describe('App Component', () => {
  it('should render the main app structure', () => {
    render(<App />);
    
    expect(screen.getByText('Aeturnis Online')).toBeInTheDocument();
    expect(screen.getByText('Status: Disconnected')).toBeInTheDocument();
    expect(screen.getByText('MMORPG Development Environment Ready')).toBeInTheDocument();
  });

  it('should render game provider wrapper', () => {
    render(<App />);
    
    expect(screen.getByTestId('game-provider')).toBeInTheDocument();
  });

  it('should render game engine component', () => {
    render(<App />);
    
    expect(screen.getByTestId('game-engine')).toBeInTheDocument();
  });

  it('should render game UI component', () => {
    render(<App />);
    
    expect(screen.getByTestId('game-ui')).toBeInTheDocument();
  });

  it('should display character info section', () => {
    render(<App />);
    
    expect(screen.getByText('Character Info')).toBeInTheDocument();
    expect(screen.getByText('No character selected')).toBeInTheDocument();
  });

  it('should have proper header structure', () => {
    render(<App />);
    
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(header).toContainElement(screen.getByText('Aeturnis Online'));
  });

  it('should have proper main content area', () => {
    render(<App />);
    
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('game-container');
  });

  it('should have proper footer', () => {
    render(<App />);
    
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(footer).toContainElement(screen.getByText('MMORPG Development Environment Ready'));
  });
});