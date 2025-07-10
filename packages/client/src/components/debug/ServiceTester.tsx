import { useState } from 'react'
import { useCharacter, useInventory, useLocation, useCombat } from '../../hooks/useServices'

export function ServiceTester() {
  const [isVisible, setIsVisible] = useState(false)
  const { character, getCharacter } = useCharacter()
  const { items, getInventory } = useInventory()
  const { currentLocation, getLocations } = useLocation()
  const { session, startCombat } = useCombat()

  const testServices = async () => {
    try {
      console.log('Testing services...')
      await getCharacter()
      await getInventory()
      await getLocations()
      console.log('All services tested successfully!')
    } catch (error) {
      console.error('Service test failed:', error)
    }
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 left-4 z-[9999] bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
      >
        Test Services
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-gray-900 text-white rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto border border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold">Service Test</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 text-sm">
        <button
          onClick={testServices}
          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Test All Services
        </button>

        {/* Character Service */}
        <div className="bg-gray-800 p-2 rounded">
          <h4 className="font-medium mb-1">Character Service</h4>
          {character ? (
            <div className="text-xs">
              <div>Name: {character.name}</div>
              <div>Level: {character.level}</div>
              <div>Class: {character.class}</div>
            </div>
          ) : (
            <div className="text-gray-400 text-xs">No character data</div>
          )}
        </div>

        {/* Inventory Service */}
        <div className="bg-gray-800 p-2 rounded">
          <h4 className="font-medium mb-1">Inventory Service</h4>
          {items?.length > 0 ? (
            <div className="text-xs">
              <div>Items: {items.length}</div>
              <div>{items[0]?.name} x{items[0]?.quantity}</div>
            </div>
          ) : (
            <div className="text-gray-400 text-xs">No inventory data</div>
          )}
        </div>

        {/* Location Service */}
        <div className="bg-gray-800 p-2 rounded">
          <h4 className="font-medium mb-1">Location Service</h4>
          {currentLocation ? (
            <div className="text-xs">
              <div>Location: {currentLocation.name}</div>
              <div>Type: {currentLocation.type}</div>
            </div>
          ) : (
            <div className="text-gray-400 text-xs">No location data</div>
          )}
        </div>

        {/* Combat Service */}
        <div className="bg-gray-800 p-2 rounded">
          <h4 className="font-medium mb-1">Combat Service</h4>
          {session ? (
            <div className="text-xs">Session: {session.id}</div>
          ) : (
            <div className="text-gray-400 text-xs">No combat session</div>
          )}
        </div>
      </div>
    </div>
  )
}