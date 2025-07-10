import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useOrientation } from './hooks/useOrientation'
import { useIsMobile } from './utils/responsive'
import { Navigation } from './components/navigation/Navigation'
import { Header } from './components/layout/Header'
import { SafeArea } from './components/layout/SafeArea'
import { LoadingScreen } from './components/common/LoadingScreen'
import { ErrorBoundary } from './components/common/ErrorBoundary'

// Game screens
import { GameScreen } from './components/game/GameScreen'
import { InventoryScreen } from './components/game/InventoryScreen'
import { CharacterScreen } from './components/game/CharacterScreen'
import { MapScreen } from './components/game/MapScreen'
import { SettingsScreen } from './components/game/SettingsScreen'

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
        <motion.div
          className="min-h-screen bg-dark-900 flex flex-col"
          style={getOrientationStyles()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <Header />

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Navigate to="/game" replace />} />
                <Route path="/game" element={<GameScreen />} />
                <Route path="/inventory" element={<InventoryScreen />} />
                <Route path="/character" element={<CharacterScreen />} />
                <Route path="/map" element={<MapScreen />} />
                <Route path="/settings" element={<SettingsScreen />} />
                <Route path="*" element={<Navigate to="/game" replace />} />
              </Routes>
            </AnimatePresence>
          </main>

          {/* Bottom Navigation */}
          <Navigation />

          {/* Orientation Transition Overlay */}
          {isTransitioning && (
            <motion.div
              className="fixed inset-0 bg-dark-900 bg-opacity-50 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-white text-center">
                <div className="text-2xl mb-2">⚡</div>
                <div>Adjusting display...</div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </SafeArea>
    </ErrorBoundary>
  )
}

export default App