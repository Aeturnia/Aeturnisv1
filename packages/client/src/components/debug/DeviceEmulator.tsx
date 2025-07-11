import { useState } from 'react'
import { useDeviceEmulation, devicePresets } from '../../utils/devicePresets'

export function DeviceEmulator() {
  const [isOpen, setIsOpen] = useState(false)
  const { currentDevice, isEmulating, emulateDevice, stopEmulation } = useDeviceEmulation()
  const [selectedCategory, setSelectedCategory] = useState<'phone' | 'tablet' | 'desktop'>('phone')

  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null

  const filteredDevices = devicePresets.filter(device => device.category === selectedCategory)

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-4 left-4 z-[9998] p-3 rounded-full shadow-lg
          ${isEmulating ? 'bg-blue-500' : 'bg-gray-700'}
          text-white transition-colors
        `}
        aria-label="Toggle device emulator"
      >
        📱
      </button>

      {/* Emulator panel */}
      {isOpen && (
        <div className="fixed bottom-20 left-4 z-[9997] bg-dark-800 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold">Device Emulator</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Current device info */}
          {isEmulating && currentDevice && (
            <div className="mb-4 p-3 bg-dark-700 rounded-lg">
              <div className="text-sm text-gray-400">Current Device:</div>
              <div className="text-white font-medium">{currentDevice.name}</div>
              <div className="text-xs text-gray-400 mt-1">
                {currentDevice.width} × {currentDevice.height} @ {currentDevice.deviceScaleFactor}x
              </div>
              <button
                onClick={stopEmulation}
                className="mt-2 text-sm text-red-400 hover:text-red-300"
              >
                Stop Emulation
              </button>
            </div>
          )}

          {/* Category tabs */}
          <div className="flex gap-2 mb-3">
            {(['phone', 'tablet', 'desktop'] as const).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-3 py-1 rounded text-sm capitalize
                  ${selectedCategory === category 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-dark-700 text-gray-400 hover:text-white'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Device list */}
          <div className="space-y-2">
            {filteredDevices.map(device => (
              <button
                key={device.name}
                onClick={() => emulateDevice(device.name)}
                className={`
                  w-full text-left p-3 rounded-lg transition-colors
                  ${currentDevice?.name === device.name
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                  }
                `}
              >
                <div className="font-medium">{device.name}</div>
                <div className="text-xs opacity-75 mt-1">
                  {device.width} × {device.height} 
                  {device.hasTouch && ' • Touch'}
                </div>
              </button>
            ))}
          </div>

          {/* Shortcuts info */}
          <div className="mt-4 p-3 bg-dark-700 rounded-lg text-xs text-gray-400">
            <div className="font-medium mb-1">Keyboard Shortcuts:</div>
            <div>Ctrl+Shift+D - Toggle emulator</div>
            <div>Ctrl+Shift+R - Rotate device</div>
            <div>Esc - Stop emulation</div>
          </div>
        </div>
      )}

      {/* Device frame overlay */}
      {isEmulating && currentDevice && (
        <div 
          className="fixed top-0 left-0 z-[9996] pointer-events-none"
          style={{
            width: `${currentDevice.width}px`,
            height: `${currentDevice.height}px`,
            border: '2px dashed rgba(59, 130, 246, 0.5)',
            boxShadow: 'inset 0 0 0 10px rgba(0, 0, 0, 0.1)'
          }}
        >
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            {currentDevice.name}
          </div>
        </div>
      )}
    </>
  )
}