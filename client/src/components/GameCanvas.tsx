import { useEffect, useRef, useState } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { GameEngine } from '../lib/gameEngine';

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize the game engine
  useEffect(() => {
    if (canvasRef.current) {
      const engine = new GameEngine(canvasRef.current);
      setGameEngine(engine);
      
      console.log('Game Engine Initialized');
      
      return () => {
        engine.destroy();
      };
    }
  }, []);

  // Game loop
  useGameLoop((deltaTime) => {
    if (gameEngine) {
      gameEngine.update(deltaTime);
      gameEngine.render();
    }
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (gameEngine) {
        gameEngine.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [gameEngine]);

  // Keyboard event handlers (empty, ready for implementation)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // TODO: Implement key down handling
      console.log('Key down:', event.key);
      
      // Example: Toggle fullscreen with F key
      if (event.key === 'f' || event.key === 'F') {
        if (!isFullscreen) {
          canvasRef.current?.requestFullscreen();
          setIsFullscreen(true);
        } else {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      // TODO: Implement key up handling
      console.log('Key up:', event.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isFullscreen]);

  // Mouse event handlers (empty, ready for implementation)
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    // TODO: Implement mouse down handling
    console.log('Mouse down:', event.clientX, event.clientY);
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    // TODO: Implement mouse up handling
    console.log('Mouse up:', event.clientX, event.clientY);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    // TODO: Implement mouse move handling
    // console.log('Mouse move:', event.clientX, event.clientY);
  };

  // Touch event handlers (empty, ready for implementation)
  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    // TODO: Implement touch start handling
    console.log('Touch start:', event.touches[0].clientX, event.touches[0].clientY);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    // TODO: Implement touch end handling
    console.log('Touch end');
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    // TODO: Implement touch move handling
    // console.log('Touch move:', event.touches[0].clientX, event.touches[0].clientY);
  };

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        background: '#111',
        touchAction: 'none',
        cursor: 'crosshair'
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    />
  );
};

export default GameCanvas;
