import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useOrientation } from './hooks/useOrientation'
import { useIsMobile } from './utils/responsive'
import { Navigation } from './components/navigation/Navigation'
import { Header } from './components/layout/Header'
import { SafeArea } from './components/layout/SafeArea'
import { LoadingScreen } from './components/common/LoadingScreen'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { InstallPrompt, ShareHandler } from './components/common'
import { MockModeIndicator } from './components/common/MockModeIndicator'
import { SimpleDevToggle } from './components/debug/SimpleDevToggle'
import { ServiceTester } from './components/debug/ServiceTester'
import { ServiceProvider, useServiceContext } from './providers/ServiceProvider'

// Lazy load game screens for code splitting
const GameScreen = lazy(() => import('./components/game/GameScreen').then(module => ({ default: module.GameScreen })))
const InventoryScreen = lazy(() => import('./components/game/InventoryScreen').then(module => ({ default: module.InventoryScreen })))
const CharacterScreen = lazy(() => import('./components/game/CharacterScreen').then(module => ({ default: module.CharacterScreen })))
const MapScreen = lazy(() => import('./components/game/MapScreen').then(module => ({ default: module.MapScreen })))
const SettingsScreen = lazy(() => import('./components/game/SettingsScreen').then(module => ({ default: module.SettingsScreen })))

// Service configuration
const serviceConfig = {
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:5000',
  timeout: 30000,
  useMockServices: import.meta.env.VITE_USE_MOCKS === 'true',
  mockConfig: {
    delay: 500, // 500ms simulated network delay
    errorRate: 0, // No random errors by default
    offlineMode: false
  },
  cacheConfig: {
    storage: 'localStorage' as const,
    maxSize: 1000,
    defaultTTL: 300000 // 5 minutes
  },
  offlineConfig: {
    storage: 'localStorage' as const,
    maxSize: 100,
    maxRetries: 3
  }
}

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAppReady, setIsAppReady] = useState(false)
  const { orientation, isTransitioning, getOrientationStyles } = useOrientation({
    lockPortrait: true,
    adaptiveUI: true,
    transitionDuration: 300,
  })
  const isMobile = useIsMobile()

  useEffect(() => {
    // Simple app initialization - services will be initialized by ServiceProvider
    const initializeApp = async () => {
      try {
        console.log('Initializing Aeturnis Online app...')
        console.log('Service config:', serviceConfig)
        
        // Brief delay for smooth loading transition
        await new Promise(resolve => setTimeout(resolve, 100))
        
        setIsAppReady(true)
        setIsLoading(false)
        console.log('App initialized successfully!')
      } catch (error) {
        console.error('App initialization failed:', error)
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [])

  useEffect(() => {
    // Lock orientation to portrait on mobile
    if (isMobile && orientation === 'landscape') {
      // Show orientation warning or handle landscape mode
      console.log('Landscape mode detected on mobile')
    }
  }, [isMobile, orientation])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <ErrorBoundary>
      <ServiceProvider config={serviceConfig}>
        <ServiceInitializationWrapper>
          <SafeArea>
            <div
              className="min-h-screen bg-dark-900 flex flex-col"
              style={getOrientationStyles()}
            >
              {/* Header */}
              <Header />

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/game" replace />} />
                  <Route path="/game" element={<GameScreen />} />
                  <Route path="/inventory" element={<InventoryScreen />} />
                  <Route path="/character" element={<CharacterScreen />} />
                  <Route path="/map" element={<MapScreen />} />
                  <Route path="/settings" element={<SettingsScreen />} />
                  <Route path="*" element={<Navigate to="/game" replace />} />
                </Routes>
              </Suspense>
            </main>

            {/* Bottom Navigation */}
            <Navigation />

            {/* Orientation Transition Overlay */}
            {isTransitioning && (
              <div
                className="fixed inset-0 bg-dark-900 bg-opacity-50 z-50 flex items-center justify-center"
              >
                <div className="text-white text-center">
                  <div className="text-2xl mb-2">⚡</div>
                  <div>Adjusting display...</div>
                </div>
              </div>
            )}
            
            {/* PWA Components */}
            <InstallPrompt />
            <ShareHandler />
            </div>
          </SafeArea>
          
          {/* Developer Overlay - Disabled for now */}
          {/* 
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 999999
          }}>
            <div style={{ position: 'absolute', top: '20px', left: '20px', pointerEvents: 'auto' }}>
              <MockModeIndicator />
            </div>
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', pointerEvents: 'auto' }}>
              <ServiceTester />
            </div>
            <div style={{ position: 'absolute', bottom: '20px', right: '20px', pointerEvents: 'auto' }}>
              <SimpleDevToggle />
            </div>
          </div>
          */}
        </ServiceInitializationWrapper>
      </ServiceProvider>
    </ErrorBoundary>
  )
}

// Component to wait for service initialization
function ServiceInitializationWrapper({ children }: { children: React.ReactNode }) {
  const { services, isInitialized, error } = useServiceContext();

  // Show error state if service initialization failed
  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-red-400 text-xl font-bold mb-4">Service Error</h2>
          <p className="text-red-300 mb-4">Failed to initialize game services:</p>
          <p className="text-red-200 text-sm mb-6">{error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reload Game
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while services are initializing
  if (!services || !isInitialized) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <h2 className="text-cyan-400 text-xl font-semibold mb-2">Initializing Aeturnis Online</h2>
          <p className="text-gray-400">Loading game services...</p>
        </div>
      </div>
    );
  }

  // Render children only when services are ready
  return <>{children}</>;
}

export default App