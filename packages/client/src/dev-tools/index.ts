// Visual Development Tools - Conditional Loading System
import { useState, useEffect } from 'react';

// Simple conditional loading to prevent runtime errors
export const useDevTools = () => {
  const [DevTools, setDevTools] = useState<React.ComponentType | null>(null);
  
  useEffect(() => {
    // Only load in development mode
    if (process.env.REACT_APP_VISUAL_DEV === 'true') {
      try {
        // Direct import for now to avoid dynamic import issues
        import('./DevPanel').then(module => {
          setDevTools(() => module.DevPanel);
        }).catch(error => {
          console.warn('Failed to load dev tools:', error);
        });
      } catch (error) {
        console.warn('Dev tools not available:', error);
      }
    }
  }, []);
  
  return DevTools;
};