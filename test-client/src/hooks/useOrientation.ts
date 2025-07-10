/**
 * Orientation handling hook for mobile devices
 */

import { useState, useEffect } from 'react';

// Orientation configuration as defined in the prompt
interface OrientationConfig {
  lockPortrait: boolean;        // For phone layouts
  adaptiveUI: boolean;         // Different UIs for orientations
  transitionDuration: number;  // Smooth orientation changes
}

export type OrientationType = 'portrait' | 'landscape';

const defaultConfig: OrientationConfig = {
  lockPortrait: false,
  adaptiveUI: true,
  transitionDuration: 300,
};

export const useOrientation = (config: Partial<OrientationConfig> = {}) => {
  const orientationConfig = { ...defaultConfig, ...config };
  const [orientation, setOrientation] = useState<OrientationType>('portrait');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const updateOrientation = () => {
      setIsTransitioning(true);
      
      // Determine orientation based on screen dimensions
      const isPortrait = window.innerHeight > window.innerWidth;
      setOrientation(isPortrait ? 'portrait' : 'landscape');
      
      // End transition after configured duration
      setTimeout(() => {
        setIsTransitioning(false);
      }, orientationConfig.transitionDuration);
    };

    // Initial orientation
    updateOrientation();

    // Listen for orientation changes
    window.addEventListener('orientationchange', updateOrientation);
    window.addEventListener('resize', updateOrientation);

    return () => {
      window.removeEventListener('orientationchange', updateOrientation);
      window.removeEventListener('resize', updateOrientation);
    };
  }, [orientationConfig.transitionDuration]);

  // Lock orientation to portrait (if supported)
  const lockPortrait = async () => {
    if ('screen' in window && 'orientation' in window.screen) {
      try {
        await (window.screen.orientation as any).lock('portrait-primary');
        return true;
      } catch (error) {
        console.warn('Orientation lock not supported:', error);
        return false;
      }
    }
    return false;
  };

  // Unlock orientation
  const unlockOrientation = () => {
    if ('screen' in window && 'orientation' in window.screen) {
      try {
        (window.screen.orientation as any).unlock();
        return true;
      } catch (error) {
        console.warn('Orientation unlock not supported:', error);
        return false;
      }
    }
    return false;
  };

  // Get CSS for orientation-specific styling
  const getOrientationStyles = () => ({
    transition: `all ${orientationConfig.transitionDuration}ms ease-in-out`,
    opacity: isTransitioning ? 0.8 : 1,
  });

  // Save orientation preference to localStorage
  const saveOrientationPreference = (pref: OrientationType) => {
    localStorage.setItem('aeturnis-orientation-preference', pref);
  };

  // Load orientation preference from localStorage
  const loadOrientationPreference = (): OrientationType | null => {
    const saved = localStorage.getItem('aeturnis-orientation-preference');
    return saved as OrientationType | null;
  };

  return {
    orientation,
    isTransitioning,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    lockPortrait,
    unlockOrientation,
    getOrientationStyles,
    saveOrientationPreference,
    loadOrientationPreference,
  };
};

/**
 * Hook for handling keyboard visibility on mobile
 */
export const useKeyboardVisibility = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const initialViewportHeight = window.visualViewport?.height || window.innerHeight;

    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      // Keyboard is considered visible if viewport shrunk by more than 150px
      const keyboardVisible = heightDifference > 150;
      
      setIsKeyboardVisible(keyboardVisible);
      setKeyboardHeight(keyboardVisible ? heightDifference : 0);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
      };
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', handleViewportChange);
      return () => {
        window.removeEventListener('resize', handleViewportChange);
      };
    }
  }, []);

  return {
    isKeyboardVisible,
    keyboardHeight,
  };
};