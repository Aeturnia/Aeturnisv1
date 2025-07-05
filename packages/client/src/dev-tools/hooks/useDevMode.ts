import { useEffect, useState } from 'react';

interface DevModeState {
  isEnabled: boolean;
  currentPhase: string;
  features: string[];
}

export const useDevMode = (): DevModeState => {
  const [state, setState] = useState<DevModeState>({
    isEnabled: false,
    currentPhase: '2.1',
    features: []
  });
  
  useEffect(() => {
    const isEnabled = process.env.REACT_APP_VISUAL_DEV === 'true' || 
                     process.env.VISUAL_DEV === 'true';
    
    setState({
      isEnabled,
      currentPhase: process.env.REACT_APP_DEV_PHASE || '2.1',
      features: (process.env.REACT_APP_DEV_FEATURES || '').split(',').filter(Boolean)
    });
  }, []);
  
  return state;
};