import React, { useState, useEffect, memo } from 'react'
import { useCharacter, useZone, useInventory } from '../../hooks/useServices'
import { useTouch } from '../../hooks/useTouch'
import { Character, Zone } from '@aeturnis/shared'
import { GameHUD } from './GameHUD'
import { ActionBar } from './ActionBar'
import { TextDisplay } from './TextDisplay'

interface GameMessage {
  id: string
  type: 'system' | 'combat' | 'loot' | 'social' | 'quest'
  message: string
  timestamp: Date
}

export const MainGameView = memo(() => {
  const { 
    currentCharacter, 
    getCharacter, 
    getCharacters 
  } = useCharacter()
  
  const { 
    currentZone, 
    getZones, 
    getCharacterPosition 
  } = useZone()
  
  const { hapticFeedback } = useTouch()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [gameMessages, setGameMessages] = useState<GameMessage[]>([
    {
      id: '1',
      type: 'system',
      message: 'Welcome to Aeturnis Online! Your adventure begins...',
      timestamp: new Date()
    }
  ])

  useEffect(() => {
    initializeGameData()
  }, [])

  useEffect(() => {
    if (currentCharacter && !selectedCharacter) {
      setSelectedCharacter(currentCharacter as Character)
    }
  }, [currentCharacter, selectedCharacter])

  const initializeGameData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load character data
      await getCharacters()
      
      // Load zone data
      await getZones()
      
      addGameMessage('system', 'Game data loaded successfully.')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load game data'
      setError(errorMessage)
      addGameMessage('system', `Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const addGameMessage = (type: GameMessage['type'], message: string) => {
    const newMessage: GameMessage = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    }
    
    setGameMessages(prev => [...prev, newMessage].slice(-50)) // Keep last 50 messages
  }

  const handleAction = async (actionType: string, actionData?: any) => {
    hapticFeedback('light')
    
    try {
      switch (actionType) {
        case 'move':
          addGameMessage('system', `Moving ${actionData.direction}...`)
          // Handle movement logic here
          break
          
        case 'attack':
          addGameMessage('combat', 'Initiating combat...')
          // Handle combat logic here
          break
          
        case 'interact':
          addGameMessage('system', 'Interacting with object...')
          // Handle interaction logic here
          break
          
        case 'inventory':
          addGameMessage('system', 'Opening inventory...')
          // Navigate to inventory screen
          break
          
        case 'character':
          addGameMessage('system', 'Opening character sheet...')
          // Navigate to character screen
          break
          
        case 'map':
          addGameMessage('system', 'Opening map...')
          // Navigate to map screen
          break
          
        default:
          addGameMessage('system', `Unknown action: ${actionType}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Action failed'
      addGameMessage('system', `Error: ${errorMessage}`)
    }
  }

  const handleTouch = ({ point }: { point: { x: number; y: number } }) => {
    hapticFeedback('light')
    addGameMessage('system', `Touched at (${Math.round(point.x)}, ${Math.round(point.y)})`)
  }

  const { gestureHandler } = useTouch({
    onTap: handleTouch,
    onDoubleTap: ({ point }) => {
      hapticFeedback('medium')
      addGameMessage('system', `Double tap at (${Math.round(point.x)}, ${Math.round(point.y)}) - Quick action`)
    },
    onSwipeUp: () => {
      addGameMessage('system', 'Swiped up - Moving north')
      handleAction('move', { direction: 'north' })
    },
    onSwipeDown: () => {
      addGameMessage('system', 'Swiped down - Moving south')
      handleAction('move', { direction: 'south' })
    },
    onSwipeLeft: () => {
      addGameMessage('system', 'Swiped left - Moving west')
      handleAction('move', { direction: 'west' })
    },
    onSwipeRight: () => {
      addGameMessage('system', 'Swiped right - Moving east')
      handleAction('move', { direction: 'east' })
    }
  })

  if (loading) {
    return (
      <div className="h-full bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⚔️</div>
          <p className="text-white">Loading game world...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={initializeGameData}
            className="btn-touch btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-dark-900 flex flex-col relative overflow-hidden">
      {/* Game HUD */}
      <GameHUD 
        character={selectedCharacter}
        currentZone={currentZone as Zone}
      />

      {/* Main Game Area */}
      <div 
        className="flex-1 relative overflow-hidden"
        {...gestureHandler()}
      >
        {/* Game World Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-green-900/20">
          {/* Environment elements */}
          <div className="absolute bottom-10 left-10 w-6 h-6 bg-green-600 rounded-full opacity-60" />
          <div className="absolute bottom-20 right-15 w-4 h-4 bg-amber-600 rounded-full opacity-60" />
          <div className="absolute top-20 left-20 w-5 h-5 bg-gray-600 rounded-full opacity-60" />
          <div className="absolute top-40 right-30 w-3 h-3 bg-blue-600 rounded-full opacity-60" />
        </div>

        {/* Player Character */}
        {selectedCharacter && (
          <div
            className="absolute w-8 h-8 bg-primary-500 rounded-full border-2 border-white shadow-lg z-10 transition-all duration-300"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
              {selectedCharacter.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Game Messages Display */}
        <div className="absolute bottom-4 left-4 right-4 mb-16">
          <TextDisplay 
            messages={gameMessages}
            maxMessages={5}
          />
        </div>

        {/* Touch Instructions */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-xs text-dark-400 bg-dark-800/80 rounded px-2 py-1">
            Tap to interact • Swipe to move • Double tap for quick actions
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <ActionBar 
        character={selectedCharacter}
        onAction={handleAction}
      />
    </div>
  )
})

MainGameView.displayName = 'MainGameView'