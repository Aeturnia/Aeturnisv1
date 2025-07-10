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
import { DeveloperTools } from './components/debug'

// Lazy load game screens for code splitting
const GameScreen = lazy(() => import('./components/game/GameScreen').then(module => ({ default: module.GameScreen })))
const InventoryScreen = lazy(() => import('./components/game/InventoryScreen').then(module => ({ default: module.InventoryScreen })))
const CharacterScreen = lazy(() => import('./components/game/CharacterScreen').then(module => ({ default: module.CharacterScreen })))
const MapScreen = lazy(() => import('./components/game/MapScreen').then(module => ({ default: module.MapScreen })))
const SettingsScreen = lazy(() => import('./components/game/SettingsScreen').then(module => ({ default: module.SettingsScreen })))

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
    // Simulate app initialization
    const initializeApp = async () => {
      try {
        // Initialize app services
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setIsAppReady(true)
        setIsLoading(false)
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
          
          {/* Developer Tools (dev only) */}
          <DeveloperTools />
        </div>
      </SafeArea>
    </ErrorBoundary>
  )
}

export default App