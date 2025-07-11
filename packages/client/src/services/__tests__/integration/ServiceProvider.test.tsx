import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { ServiceProvider, useServiceContext } from '../../../providers/ServiceProvider';
import { initializeServices } from '../../../services';

// Mock the services module
vi.mock('../../../services', () => ({
  initializeServices: vi.fn(),
}));

// Test component that uses the service context
function TestComponent() {
  const { services, isInitialized, error } = useServiceContext();
  
  return (
    <div>
      <div data-testid="initialized">{isInitialized ? 'true' : 'false'}</div>
      <div data-testid="has-services">{services ? 'true' : 'false'}</div>
      {error && <div data-testid="error">{error.message}</div>}
    </div>
  );
}

describe('ServiceProvider', () => {
  const mockConfig = {
    apiBaseUrl: 'http://localhost:3000',
    wsUrl: 'ws://localhost:3000',
  };

  let mockServiceLayer: any;

  beforeEach(() => {
    mockServiceLayer = {
      initialize: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn().mockResolvedValue(undefined),
      combat: { getName: () => 'CombatService' },
    };

    (initializeServices as any).mockReturnValue(mockServiceLayer);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize services on mount', async () => {
      render(
        <ServiceProvider config={mockConfig}>
          <TestComponent />
        </ServiceProvider>
      );

      expect(screen.getByTestId('initialized').textContent).toBe('false');
      expect(screen.getByTestId('has-services').textContent).toBe('true');

      await waitFor(() => {
        expect(screen.getByTestId('initialized').textContent).toBe('true');
      });

      expect(initializeServices).toHaveBeenCalledWith(mockConfig);
      expect(mockServiceLayer.initialize).toHaveBeenCalled();
    });

    it('should handle initialization errors', async () => {
      const initError = new Error('Failed to initialize');
      mockServiceLayer.initialize.mockRejectedValue(initError);

      render(
        <ServiceProvider config={mockConfig}>
          <TestComponent />
        </ServiceProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).toBe('Failed to initialize');
      });

      expect(screen.getByTestId('initialized').textContent).toBe('false');
    });

    it('should not reinitialize on config change', async () => {
      const { rerender } = render(
        <ServiceProvider config={mockConfig}>
          <TestComponent />
        </ServiceProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('initialized').textContent).toBe('true');
      });

      const newConfig = { ...mockConfig, apiBaseUrl: 'http://localhost:4000' };

      rerender(
        <ServiceProvider config={newConfig}>
          <TestComponent />
        </ServiceProvider>
      );

      // Should only be called once
      expect(initializeServices).toHaveBeenCalledTimes(1);
      expect(mockServiceLayer.initialize).toHaveBeenCalledTimes(1);
    });
  });

  describe('cleanup', () => {
    it('should destroy services on unmount', async () => {
      const { unmount } = render(
        <ServiceProvider config={mockConfig}>
          <TestComponent />
        </ServiceProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('initialized').textContent).toBe('true');
      });

      unmount();

      expect(mockServiceLayer.destroy).toHaveBeenCalled();
    });

    it('should handle destroy errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockServiceLayer.destroy.mockRejectedValue(new Error('Destroy failed'));

      const { unmount } = render(
        <ServiceProvider config={mockConfig}>
          <TestComponent />
        </ServiceProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('initialized').textContent).toBe('true');
      });

      unmount();

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to destroy services:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('should handle unmount during initialization', async () => {
      let resolveInit: any;
      const initPromise = new Promise(resolve => {
        resolveInit = resolve;
      });
      mockServiceLayer.initialize.mockReturnValue(initPromise);

      const { unmount } = render(
        <ServiceProvider config={mockConfig}>
          <TestComponent />
        </ServiceProvider>
      );

      // Unmount before initialization completes
      unmount();

      // Complete initialization after unmount
      resolveInit();

      // Destroy should not be called since initialization hadn't completed
      expect(mockServiceLayer.destroy).not.toHaveBeenCalled();
    });
  });

  describe('context usage', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useServiceContext must be used within ServiceProvider');

      consoleSpy.mockRestore();
    });

    it('should provide context values to children', async () => {
      render(
        <ServiceProvider config={mockConfig}>
          <TestComponent />
        </ServiceProvider>
      );

      expect(screen.getByTestId('has-services').textContent).toBe('true');

      await waitFor(() => {
        expect(screen.getByTestId('initialized').textContent).toBe('true');
      });

      expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    });
  });

  describe('error logging', () => {
    it('should log initialization errors to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const initError = new Error('Init failed');
      mockServiceLayer.initialize.mockRejectedValue(initError);

      render(
        <ServiceProvider config={mockConfig}>
          <TestComponent />
        </ServiceProvider>
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Failed to initialize services:',
          initError
        );
      });

      consoleSpy.mockRestore();
    });
  });

  describe('multiple children', () => {
    it('should provide services to multiple children', async () => {
      function Child1() {
        const { services } = useServiceContext();
        return <div data-testid="child1">{services ? 'has-services' : 'no-services'}</div>;
      }

      function Child2() {
        const { isInitialized } = useServiceContext();
        return <div data-testid="child2">{isInitialized ? 'initialized' : 'not-initialized'}</div>;
      }

      render(
        <ServiceProvider config={mockConfig}>
          <Child1 />
          <Child2 />
        </ServiceProvider>
      );

      expect(screen.getByTestId('child1').textContent).toBe('has-services');
      expect(screen.getByTestId('child2').textContent).toBe('not-initialized');

      await waitFor(() => {
        expect(screen.getByTestId('child2').textContent).toBe('initialized');
      });
    });
  });
});