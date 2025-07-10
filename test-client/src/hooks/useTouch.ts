/**
 * Touch event handling hook for mobile interactions
 */

import { useGesture } from '@use-gesture/react';
import { useState, useCallback } from 'react';

// Touch configuration as defined in the prompt
interface TouchConfig {
  swipeThreshold: number;      // Minimum distance for swipe
  tapDelay: number;           // Max delay for tap vs hold
  doubleTapWindow: number;    // Time window for double tap
  pinchZoomEnabled: boolean;  // For map/inventory zoom
  dragScrollEnabled: boolean;  // For lists and inventories
}

const defaultConfig: TouchConfig = {
  swipeThreshold: 50,
  tapDelay: 300,
  doubleTapWindow: 300,
  pinchZoomEnabled: true,
  dragScrollEnabled: true,
};

interface TouchHandlers {
  onTap?: (info: { point: [number, number] }) => void;
  onDoubleTap?: (info: { point: [number, number] }) => void;
  onLongPress?: (info: { point: [number, number] }) => void;
  onSwipeUp?: (info: { distance: number, velocity: number }) => void;
  onSwipeDown?: (info: { distance: number, velocity: number }) => void;
  onSwipeLeft?: (info: { distance: number, velocity: number }) => void;
  onSwipeRight?: (info: { distance: number, velocity: number }) => void;
  onPinch?: (info: { scale: number, origin: [number, number] }) => void;
  onDrag?: (info: { movement: [number, number], velocity: [number, number] }) => void;
  onPullToRefresh?: () => void;
}

export const useTouch = (handlers: TouchHandlers, config: Partial<TouchConfig> = {}) => {
  const touchConfig = { ...defaultConfig, ...config };
  const [lastTap, setLastTap] = useState<number>(0);
  const [isPulling, setIsPulling] = useState(false);

  const gestureHandler = useGesture({
    // Tap handling
    onClick: ({ event, timeStamp }) => {
      event.preventDefault();
      const now = timeStamp;
      const timeSinceLastTap = now - lastTap;
      
      if (timeSinceLastTap < touchConfig.doubleTapWindow) {
        // Double tap
        handlers.onDoubleTap?.({ 
          point: [event.clientX, event.clientY] 
        });
      } else {
        // Single tap
        handlers.onTap?.({ 
          point: [event.clientX, event.clientY] 
        });
      }
      
      setLastTap(now);
    },

    // Long press
    onPointerDown: ({ event, timeStamp }) => {
      const startTime = timeStamp;
      const timer = setTimeout(() => {
        handlers.onLongPress?.({ 
          point: [event.clientX, event.clientY] 
        });
      }, touchConfig.tapDelay);

      const cleanup = () => clearTimeout(timer);
      
      event.target?.addEventListener('pointerup', cleanup, { once: true });
      event.target?.addEventListener('pointermove', cleanup, { once: true });
    },

    // Drag handling
    onDrag: ({ movement, velocity, direction, active }) => {
      if (!touchConfig.dragScrollEnabled) return;
      
      handlers.onDrag?.({ 
        movement, 
        velocity 
      });

      // Check for pull to refresh (drag down from top)
      if (direction[1] > 0 && movement[1] > 100 && !active) {
        setIsPulling(false);
        handlers.onPullToRefresh?.();
      } else if (direction[1] > 0 && movement[1] > 50) {
        setIsPulling(true);
      } else {
        setIsPulling(false);
      }
    },

    // Swipe detection
    onDragEnd: ({ movement, velocity, direction }) => {
      const [mx, my] = movement;
      const [vx, vy] = velocity;
      
      // Determine swipe direction based on movement and velocity
      if (Math.abs(mx) > touchConfig.swipeThreshold || Math.abs(vx) > 0.5) {
        if (mx > 0 && mx > Math.abs(my)) {
          handlers.onSwipeRight?.({ distance: mx, velocity: vx });
        } else if (mx < 0 && Math.abs(mx) > Math.abs(my)) {
          handlers.onSwipeLeft?.({ distance: Math.abs(mx), velocity: Math.abs(vx) });
        }
      }
      
      if (Math.abs(my) > touchConfig.swipeThreshold || Math.abs(vy) > 0.5) {
        if (my > 0 && my > Math.abs(mx)) {
          handlers.onSwipeDown?.({ distance: my, velocity: vy });
        } else if (my < 0 && Math.abs(my) > Math.abs(mx)) {
          handlers.onSwipeUp?.({ distance: Math.abs(my), velocity: Math.abs(vy) });
        }
      }
    },

    // Pinch to zoom
    onPinch: ({ offset: [scale], origin }) => {
      if (!touchConfig.pinchZoomEnabled) return;
      
      handlers.onPinch?.({ 
        scale, 
        origin 
      });
    },
  }, {
    // Gesture configuration
    drag: {
      threshold: 10,
      filterTaps: true,
    },
    pinch: {
      scaleBounds: { min: 0.5, max: 3 },
      rubberband: true,
    },
  });

  // Haptic feedback utility
  const hapticFeedback = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 25,
        heavy: 50,
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  return {
    gestureHandler,
    isPulling,
    hapticFeedback,
  };
};

/**
 * Hook for detecting touch device capabilities
 */
export const useTouchCapabilities = () => {
  const [hasTouchSupport, setHasTouchSupport] = useState(false);
  const [maxTouchPoints, setMaxTouchPoints] = useState(0);

  useState(() => {
    setHasTouchSupport('ontouchstart' in window || navigator.maxTouchPoints > 0);
    setMaxTouchPoints(navigator.maxTouchPoints || 0);
  });

  return {
    hasTouchSupport,
    maxTouchPoints,
    isMultiTouch: maxTouchPoints > 1,
  };
};