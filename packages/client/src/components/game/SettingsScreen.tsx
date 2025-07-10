import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTouch } from '../../hooks/useTouch'
import { useOrientation } from '../../hooks/useOrientation'

interface Settings {
  soundEnabled: boolean
  musicEnabled: boolean
  hapticEnabled: boolean
  autoSaveEnabled: boolean
  lowPowerMode: boolean
  notificationsEnabled: boolean
  language: string
  theme: 'dark' | 'light'
  orientation: 'portrait' | 'landscape' | 'auto'
}

export function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>({
    soundEnabled: true,
    musicEnabled: true,
    hapticEnabled: true,
    autoSaveEnabled: true,
    lowPowerMode: false,
    notificationsEnabled: true,
    language: 'en',
    theme: 'dark',
    orientation: 'portrait'
  })
  
  const { hapticFeedback } = useTouch({
    onTap: () => {
      if (settings.hapticEnabled) {
        hapticFeedback('light')
      }
    }
  })
  
  const { lockPortrait, unlockOrientation } = useOrientation()

  const handleToggle = (key: keyof Settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    if (settings.hapticEnabled) {
      hapticFeedback('light')
    }
  }

  const handleOrientationChange = (orientation: string) => {
    setSettings(prev => ({ ...prev, orientation: orientation as any }))
    
    if (orientation === 'portrait') {
      lockPortrait()
    } else {
      unlockOrientation()
    }
  }

  return (
    <motion.div
      className="h-full bg-dark-900 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
        
        <div className="space-y-6">
          {/* Audio Settings */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Audio</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white">Sound Effects</span>
                <button
                  onClick={() => handleToggle('soundEnabled')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.soundEnabled ? 'bg-primary-500' : 'bg-dark-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white">Music</span>
                <button
                  onClick={() => handleToggle('musicEnabled')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.musicEnabled ? 'bg-primary-500' : 'bg-dark-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.musicEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Gameplay Settings */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Gameplay</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white">Haptic Feedback</span>
                <button
                  onClick={() => handleToggle('hapticEnabled')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.hapticEnabled ? 'bg-primary-500' : 'bg-dark-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.hapticEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white">Auto Save</span>
                <button
                  onClick={() => handleToggle('autoSaveEnabled')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.autoSaveEnabled ? 'bg-primary-500' : 'bg-dark-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.autoSaveEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white">Low Power Mode</span>
                <button
                  onClick={() => handleToggle('lowPowerMode')}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.lowPowerMode ? 'bg-primary-500' : 'bg-dark-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.lowPowerMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Display</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white">Orientation</span>
                <select
                  value={settings.orientation}
                  onChange={(e) => handleOrientationChange(e.target.value)}
                  className="bg-dark-700 text-white rounded-lg px-3 py-1 border border-dark-600"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white">Theme</span>
                <select
                  value={settings.theme}
                  onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as any }))}
                  className="bg-dark-700 text-white rounded-lg px-3 py-1 border border-dark-600"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="card p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Account</h3>
            <div className="space-y-3">
              <button className="w-full btn-touch bg-dark-700 text-white rounded-lg py-3 text-left px-4">
                📧 Change Email
              </button>
              <button className="w-full btn-touch bg-dark-700 text-white rounded-lg py-3 text-left px-4">
                🔐 Change Password
              </button>
              <button className="w-full btn-touch bg-dark-700 text-white rounded-lg py-3 text-left px-4">
                🔄 Sync Data
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button className="w-full btn-touch bg-green-600 hover:bg-green-700 text-white rounded-lg py-3">
              💾 Save Settings
            </button>
            <button className="w-full btn-touch bg-red-600 hover:bg-red-700 text-white rounded-lg py-3">
              🚪 Sign Out
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}