// Visual Development Tools - Conditional Loading System
import { useState, useEffect } from 'react';

// Dynamic loading to prevent production bundle bloat
export const loadDevTools = async () => {
  if (process.env.REACT_APP_VISUAL_DEV !== 'true') {
    return null;
  }
  
  const { DevPanel } = await import('./DevPanel');
  return DevPanel;
};

// Hook for conditional rendering
export const useDevTools = () => {
  const [DevTools, setDevTools] = useState<React.ComponentType | null>(null);
  
  useEffect(() => {
    loadDevTools().then(setDevTools);
  }, []);
  
  return DevTools;
};