import { useEffect, useRef } from 'react';
import { useGame } from '../stores/gameStore';

export function GameEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const game = useGame();
  const setConnected = game.setConnected;
  const setCharacter = game.setCharacter;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize canvas
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    // Simple demo rendering
    function render() {
      if (!ctx || !canvas) return;
      
      // Clear canvas
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid pattern
      ctx.strokeStyle = '#16213e';
      ctx.lineWidth = 1;
      
      const gridSize = 50;
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Draw sample player character
      ctx.fillStyle = '#00d2ff';
      ctx.fillRect(canvas.width / 2 - 10, canvas.height / 2 - 10, 20, 20);
      
      // Draw character label
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Player', canvas.width / 2, canvas.height / 2 - 20);
    }

    // Initial render
    render();

    // Simulate connection and character setup
    setTimeout(() => {
      setConnected(true);
      setCharacter({
        name: 'Demo Hero',
        level: 1,
        race: 'human',
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
        gold: 12500,
        strength: 15,
        dexterity: 12,
        intelligence: 10,
        constitution: 14,
        wisdom: 11,
        charisma: 9
      });
    }, 1000);

    // Handle resize
    const handleResize = () => {
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        render();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setConnected, setCharacter]);

  return (
    <canvas 
      ref={canvasRef} 
      className="game-canvas"
      style={{ 
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        border: '2px solid #00d2ff'
      }}
    />
  );
}