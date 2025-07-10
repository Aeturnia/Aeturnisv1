import { useState, useEffect } from 'react'
import { useAppInstall } from '../../utils/appInstall'

interface InstallPromptProps {
  onInstall?: () => void
  onDismiss?: () => void
}

export function InstallPrompt({ onInstall, onDismiss }: InstallPromptProps) {
  const { installState, isPromptReady, promptInstall, getInstructions } = useAppInstall()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if user has previously dismissed
    const dismissed = localStorage.getItem('install-prompt-dismissed')
    if (dismissed) {
      setIsDismissed(true)
    }

    // Show prompt after delay if installable
    if (installState === 'installable' && !dismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 10000) // Show after 10 seconds

      return () => clearTimeout(timer)
    }
  }, [installState])

  const handleInstall = async () => {
    const result = await promptInstall()
    
    if (result === 'accepted') {
      setIsVisible(false)
      onInstall?.()
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    localStorage.setItem('install-prompt-dismissed', 'true')
    onDismiss?.()
  }

  // Don't show if already installed, dismissed, or not ready
  if (installState !== 'installable' || isDismissed || !isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slide-up">
      <div className="bg-dark-800 rounded-lg shadow-xl border border-dark-700 p-4">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🎮</div>
          <div className="flex-1">
            <h3 className="text-white font-bold mb-1">Install Aeturnis Online</h3>
            <p className="text-gray-300 text-sm mb-3">
              Install the app for a better gaming experience with offline support and quick access.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Manual install instructions component
export function InstallInstructions() {
  const { installState, getInstructions } = useAppInstall()
  const [isOpen, setIsOpen] = useState(false)

  if (installState === 'installed') {
    return null
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-primary-400 hover:text-primary-300 text-sm underline"
      >
        How to install?
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-dark-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">Install Aeturnis Online</h2>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-4">
                To install Aeturnis Online as an app on your device:
              </p>
              
              <div className="bg-dark-700 rounded-lg p-4">
                <p className="text-white">{getInstructions()}</p>
              </div>
            </div>

            <div className="text-gray-400 text-sm mb-4">
              <p className="mb-2">Benefits of installing:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Quick access from your home screen</li>
                <li>Full-screen gaming experience</li>
                <li>Works offline (UI only)</li>
                <li>Faster loading times</li>
              </ul>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}

// Install status badge
export function InstallStatusBadge() {
  const { installState } = useAppInstall()

  if (installState !== 'installed') return null

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 bg-opacity-20 text-green-400 text-xs rounded-full">
      <span>✓</span>
      <span>Installed</span>
    </div>
  )
}