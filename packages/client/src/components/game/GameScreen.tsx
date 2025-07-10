import { useState, useEffect } from 'react'
import { useTouch } from '../../hooks/useTouch'
import { useIsMobile } from '../../utils/responsive'
import { useCharacter, useCombat, useInventory } from '../../hooks/useServices'
import { TargetFrame, TargetInfo } from './hud/TargetFrame'
import { BuffDebuffBar, BuffDebuff } from './hud/BuffDebuffBar'
import { MiniMap, MapPosition, MapMarker, ZoneInfo } from './hud/MiniMap'
import { QuestTracker, QuestInfo } from './hud/QuestTracker'
import { ActionBar } from './combat/ActionBar'
import { GameTextDisplay, GameMessage } from './ui/GameTextDisplay'
import { CombatLog, CombatEvent } from './ui/CombatLog'

export function GameScreen() {
  const [playerPosition, setPlayerPosition] = useState<MapPosition>({ x: 50, y: 50 })
  const [isConnected, setIsConnected] = useState(true)
  const [currentTarget, setCurrentTarget] = useState<TargetInfo | null>(null)
  const [playerBuffs, setPlayerBuffs] = useState<BuffDebuff[]>([])
  const [gameMessages, setGameMessages] = useState<GameMessage[]>([])
  const [combatEvents, setCombatEvents] = useState<CombatEvent[]>([])
  const [hudCollapsed, setHudCollapsed] = useState({
    target: false,
    quests: false,
    minimap: false,
    actions: false,
    textDisplay: false,
    combatLog: false
  })
  
  const isMobile = useIsMobile()
  const { character, getCharacter } = useCharacter()
  const { isInCombat } = useCombat()
  
  // Mock data for testing
  const mockZone: ZoneInfo = {
    id: 'tutorial_area',
    name: 'Tutorial Area',
    bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100 }
  }

  const mockMarkers: MapMarker[] = [
    { id: 'npc1', name: 'Village Elder', position: { x: 30, y: 70 }, type: 'npc', icon: '🧙‍♂️', isVisible: true },
    { id: 'quest1', name: 'Ancient Ruins', position: { x: 80, y: 20 }, type: 'quest', icon: '❗', isVisible: true },
    { id: 'exit1', name: 'Forest Path', position: { x: 90, y: 50 }, type: 'exit', icon: '🌲', isVisible: true }
  ]

  const mockQuests: QuestInfo[] = [
    {
      id: 'tutorial_quest',
      title: 'Welcome to Aeturnis',
      description: 'Learn the basics of gameplay and explore the tutorial area.',
      type: 'main',
      level: 1,
      objectives: [
        { id: 'obj1', description: 'Talk to the Village Elder', current: 1, target: 1, isCompleted: true },
        { id: 'obj2', description: 'Collect 5 training crystals', current: 3, target: 5, isCompleted: false },
        { id: 'obj3', description: 'Defeat a training dummy', current: 0, target: 1, isCompleted: false }
      ],
      reward: { experience: 100, gold: 25 },
      isCompleted: false,
      canTurnIn: false
    }
  ]

  const { gestureHandler, hapticFeedback } = useTouch({
    onTap: ({ point }) => {
      hapticFeedback('light')
      console.log('Tap at:', point)
      // Simulate targeting enemies
      if (Math.random() > 0.7) {
        setCurrentTarget({
          id: 'training_dummy',
          name: 'Training Dummy',
          level: 1,
          health: 85,
          maxHealth: 100,
          type: 'monster',
          race: 'Construct',
          class: 'Dummy',
          isElite: false,
          isFriendly: false,
          buffs: [],
          debuffs: []
        })
      }
    },
    onDoubleTap: ({ point }) => {
      hapticFeedback('medium')
      console.log('Double tap at:', point)
    },
    onSwipeUp: ({ distance }) => {
      hapticFeedback('light')
      setPlayerPosition(pos => ({ ...pos, y: Math.max(0, pos.y - 5) }))
    },
    onSwipeDown: ({ distance }) => {
      hapticFeedback('light')
      setPlayerPosition(pos => ({ ...pos, y: Math.min(100, pos.y + 5) }))
    },
    onSwipeLeft: ({ distance }) => {
      hapticFeedback('light')
      setPlayerPosition(pos => ({ ...pos, x: Math.max(0, pos.x - 5) }))
    },
    onSwipeRight: ({ distance }) => {
      hapticFeedback('light')
      setPlayerPosition(pos => ({ ...pos, x: Math.min(100, pos.x + 5) }))
    }
  })

  const toggleHudPanel = (panel: keyof typeof hudCollapsed) => {
    setHudCollapsed(prev => ({ ...prev, [panel]: !prev[panel] }))
  }

  // Load character data on mount
  useEffect(() => {
    getCharacter()
  }, [getCharacter])

  // Initialize mock data
  useEffect(() => {
    // Simulate connection status
    const interval = setInterval(() => {
      setIsConnected(Math.random() > 0.1) // 90% uptime
    }, 3000)

    // Mock player buffs
    setPlayerBuffs([
      {
        id: 'str_boost',
        name: 'Strength Boost',
        icon: '💪',
        duration: 45,
        maxDuration: 60,
        type: 'buff',
        description: '+5 Strength for combat',
        source: 'Magic Potion'
      },
      {
        id: 'mana_regen',
        name: 'Mana Regeneration',
        icon: '🔮',
        duration: 120,
        maxDuration: 180,
        type: 'buff',
        description: 'Regenerate mana over time',
        source: 'Mystic Aura'
      }
    ])

    // Mock game messages
    setGameMessages([
      {
        id: 'msg1',
        content: 'Welcome to Aeturnis Online! Your adventure begins in the Tutorial Area.',
        type: 'system',
        timestamp: new Date(Date.now() - 30000)
      },
      {
        id: 'msg2',
        content: 'You have entered the Tutorial Area. Look around and get familiar with the controls.',
        type: 'narrative',
        timestamp: new Date(Date.now() - 15000)
      },
      {
        id: 'msg3',
        content: 'Welcome, brave adventurer! I am here to guide you on your journey.',
        type: 'dialogue',
        speaker: 'Village Elder',
        timestamp: new Date(Date.now() - 5000)
      }
    ])

    return () => clearInterval(interval)
  }, [getCharacter])

  return (
    <div
      className="h-full bg-gradient-to-b from-dark-800 to-dark-900 relative overflow-hidden"
      {...gestureHandler()}
    >
      {/* Game World */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-green-900/20">
        {/* Player character */}
        <div
          className="absolute w-8 h-8 bg-primary-500 rounded-full border-2 border-white shadow-lg transition-all duration-300"
          style={{
            left: `${playerPosition.x}%`,
            top: `${playerPosition.y}%`,
          }}
        />
        
        {/* Environment elements */}
        <div className="absolute bottom-10 left-10 w-6 h-6 bg-green-600 rounded-full opacity-60" />
        <div className="absolute bottom-20 right-15 w-4 h-4 bg-brown-600 rounded-full opacity-60" />
        <div className="absolute top-20 left-20 w-5 h-5 bg-gray-600 rounded-full opacity-60" />
        
        {/* Mock NPCs and objects */}
        {mockMarkers.map(marker => (
          <div
            key={marker.id}
            className="absolute w-6 h-6 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
            style={{
              left: `${marker.position.x}%`,
              top: `${marker.position.y}%`,
            }}
            onClick={() => {
              hapticFeedback('medium')
              if (marker.type === 'npc') {
                setGameMessages(prev => [...prev, {
                  id: `msg_${Date.now()}`,
                  content: `Hello there, adventurer! I have tasks for you.`,
                  type: 'dialogue',
                  speaker: marker.name,
                  timestamp: new Date()
                }])
              }
            }}
          >
            <span className="text-lg">{marker.icon}</span>
          </div>
        ))}
      </div>

      {/* Enhanced HUD Layout */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top HUD Row */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start gap-2 pointer-events-auto">
          {/* Player Health/Resources */}
          <div className="bg-dark-800/90 backdrop-blur-sm border border-dark-600 rounded-lg p-2 space-y-1">
            {character && (
              <>
                <div className="flex items-center space-x-2">
                  <span className="text-red-400 text-sm">❤️</span>
                  <div className="w-20 h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full transition-all duration-300" 
                         style={{ width: `${(character.health / character.maxHealth) * 100}%` }} />
                  </div>
                  <span className="text-xs text-white">{character.health}/{character.maxHealth}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400 text-sm">💧</span>
                  <div className="w-20 h-2 bg-dark-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                         style={{ width: `${(character.mana / character.maxMana) * 100}%` }} />
                  </div>
                  <span className="text-xs text-white">{character.mana}/{character.maxMana}</span>
                </div>
              </>
            )}
          </div>

          {/* Connection Status & Mini Map */}
          <div className="flex flex-col gap-2">
            <div className="bg-dark-800/90 backdrop-blur-sm border border-dark-600 rounded-lg p-2 flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-white">{isConnected ? 'Online' : 'Offline'}</span>
            </div>
            
            <MiniMap
              playerPosition={playerPosition}
              zone={mockZone}
              markers={mockMarkers}
              size={120}
              isCollapsed={hudCollapsed.minimap}
              onToggleCollapse={() => toggleHudPanel('minimap')}
            />
          </div>
        </div>

        {/* Left Side HUD */}
        <div className="absolute left-2 top-20 bottom-32 flex flex-col gap-2 w-64 pointer-events-auto">
          {/* Target Frame */}
          {currentTarget && (
            <TargetFrame
              target={currentTarget}
              onClearTarget={() => setCurrentTarget(null)}
            />
          )}

          {/* Quest Tracker */}
          <QuestTracker
            quests={mockQuests}
            isCollapsed={hudCollapsed.quests}
            onToggleCollapse={() => toggleHudPanel('quests')}
            maxVisible={3}
          />
        </div>

        {/* Right Side HUD */}
        <div className="absolute right-2 top-20 bottom-32 flex flex-col gap-2 w-64 pointer-events-auto">
          {/* Player Buffs/Debuffs */}
          {playerBuffs.length > 0 && (
            <div className="bg-dark-800/90 backdrop-blur-sm border border-dark-600 rounded-lg p-2">
              <BuffDebuffBar
                effects={playerBuffs}
                maxVisible={8}
              />
            </div>
          )}

          {/* Game Text Display */}
          <GameTextDisplay
            messages={gameMessages}
            maxMessages={50}
            isCollapsed={hudCollapsed.textDisplay}
            onToggleCollapse={() => toggleHudPanel('textDisplay')}
            className="flex-1"
          />
        </div>

        {/* Bottom HUD */}
        <div className="absolute bottom-2 left-2 right-2 pointer-events-auto">
          {/* Action Bar */}
          <ActionBar
            slotCount={8}
            size={isMobile ? 'medium' : 'large'}
            layout="horizontal"
            showHotkeys={!isMobile}
            isCollapsed={hudCollapsed.actions}
            onToggleCollapse={() => toggleHudPanel('actions')}
          />
        </div>

        {/* Combat Log (Overlay when in combat) */}
        {isInCombat && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-80 pointer-events-auto">
            <CombatLog
              events={combatEvents}
              maxEvents={20}
              isCollapsed={hudCollapsed.combatLog}
              onToggleCollapse={() => toggleHudPanel('combatLog')}
            />
          </div>
        )}
      </div>

      {/* Mobile-specific touch instructions */}
      {isMobile && !isInCombat && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center pointer-events-none">
          <p className="text-xs text-gray-400 bg-dark-800/50 px-3 py-1 rounded-full">
            Swipe to move • Tap objects to interact
          </p>
        </div>
      )}
    </div>
  )
}