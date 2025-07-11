/**
 * Responsive utilities for mobile-first design
 */

// Breakpoint system as defined in the prompt
export const breakpoints = {
  xs: 320,   // Small phones
  sm: 375,   // Standard phones  
  md: 768,   // Tablets
  lg: 1024,  // Large tablets/small laptops
  xl: 1280   // Desktop (admin panel)
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Hook to get current breakpoint
 */
export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('xs');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width >= breakpoints.xl) setBreakpoint('xl');
      else if (width >= breakpoints.lg) setBreakpoint('lg');
      else if (width >= breakpoints.md) setBreakpoint('md');
      else if (width >= breakpoints.sm) setBreakpoint('sm');
      else setBreakpoint('xs');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
};

/**
 * Check if current screen is mobile
 */
export const useIsMobile = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'xs' || breakpoint === 'sm';
};

/**
 * Check if current screen is tablet
 */
export const useIsTablet = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'md';
};

/**
 * Check if current screen is desktop
 */
export const useIsDesktop = (): boolean => {
  const breakpoint = useBreakpoint();
  return breakpoint === 'lg' || breakpoint === 'xl';
};

/**
 * Get responsive grid columns based on breakpoint
 */
export const getGridColumns = (breakpoint: Breakpoint): number => {
  switch (breakpoint) {
    case 'xs': return 1;
    case 'sm': return 1;
    case 'md': return 2;
    case 'lg': return 3;
    case 'xl': return 4;
    default: return 1;
  }
};

/**
 * Get safe area padding for devices with notches
 */
export const getSafeAreaPadding = () => ({
  paddingTop: 'env(safe-area-inset-top)',
  paddingRight: 'env(safe-area-inset-right)',
  paddingBottom: 'env(safe-area-inset-bottom)',
  paddingLeft: 'env(safe-area-inset-left)',
});

import { useState, useEffect } from 'react';