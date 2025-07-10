import { useState, useEffect } from 'react'
import { useTouch } from '../../hooks/useTouch'
import { useCharacter } from '../../hooks/useServices'
import { LoadingScreen } from '../common/LoadingScreen'
import { EquipmentPanel } from './equipment/EquipmentPanel'

export function CharacterScreen() {
  const [activeTab, setActiveTab] = useState<'stats' | 'equipment' | 'skills' | 'achievements'>('stats')
  
  const { hapticFeedback } = useTouch({
    onTap: () => {
      hapticFeedback('light')
    }
  })

  const { 
    character, 
    isLoading, 
    error, 
    getCharacter,
    levelUp 
  } = useCharacter()

  // Load character data on mount
  useEffect(() => {
    if (getCharacter) {
      getCharacter()
    }
  }, [getCharacter])

  const getStatColor = (value: number) => {
    if (value >= 25) return 'text-red-400'
    if (value >= 20) return 'text-orange-400'
    if (value >= 15) return 'text-yellow-400'
    if (value >= 10) return 'text-green-400'
    return 'text-gray-400'
  }

  const renderHealthBar = (current: number, max: number, color: string) => {
    const percentage = (current / max) * 100
    return (
      <div className="w-full bg-dark-700 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load character data</p>
          <button 
            onClick={() => getCharacter()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!character) {
    return null
  }

  return (
    <div className="h-full flex flex-col bg-dark-900">
      {/* Character Header */}
      <div className="bg-dark-800 p-4 border-b border-dark-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{character.name}</h1>
            <p className="text-gray-400">{character.race} {character.class}</p>
            {character.guild && (
              <p className="text-sm text-purple-400">&lt;{character.guild}&gt;</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-yellow-400">Lv. {character.level}</p>
            {character.title && (
              <p className="text-sm text-gray-500">"{character.title}"</p>
            )}
          </div>
        </div>

        {/* Experience Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Experience</span>
            <span>{character.experience.toLocaleString()} / {character.experienceToNext.toLocaleString()}</span>
          </div>
          {renderHealthBar(character.experience, character.experienceToNext, 'bg-purple-500')}
        </div>

        {/* Health and Mana */}
        <div className="mt-3 space-y-2">
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Health</span>
              <span>{character.health} / {character.maxHealth}</span>
            </div>
            {renderHealthBar(character.health, character.maxHealth, 'bg-red-500')}
          </div>
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Mana</span>
              <span>{character.mana} / {character.maxMana}</span>
            </div>
            {renderHealthBar(character.mana, character.maxMana, 'bg-blue-500')}
          </div>
          {character.stamina !== undefined && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Stamina</span>
                <span>{character.stamina} / {character.maxStamina}</span>
              </div>
              {renderHealthBar(character.stamina, character.maxStamina, 'bg-green-500')}
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-dark-800 border-b border-dark-700">
        {(['stats', 'equipment', 'skills', 'achievements'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab)
              hapticFeedback('light')
            }}
            className={`flex-1 py-3 px-2 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === tab 
                ? 'text-purple-400 border-b-2 border-purple-400' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'equipment' ? '⚔️' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'stats' && character.attributes && (
          <div className="p-4 space-y-6">
            {/* Primary Attributes */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Primary Attributes</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(character.attributes).map(([stat, value]) => (
                  <div key={stat} className="bg-dark-800 p-3 rounded-lg border border-dark-700">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 capitalize">{stat}</span>
                      <span className={`text-xl font-bold ${getStatColor(value as number)}`}>
                        {value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Derived Stats */}
            {character.derived && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Combat Stats</h3>
                <div className="space-y-2">
                  {Object.entries(character.derived).map(([stat, value]) => (
                    <div key={stat} className="bg-dark-800 p-3 rounded-lg border border-dark-700">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 capitalize">
                          {stat.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-white font-medium">
                          {typeof value === 'number' && value < 1 
                            ? `${(value * 100).toFixed(1)}%`
                            : value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dev Mode: Level Up Button */}
            {import.meta.env.MODE === 'development' && (
              <div className="pt-4">
                <button
                  onClick={async () => {
                    hapticFeedback('heavy')
                    await levelUp()
                  }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg shadow-lg active:scale-95 transition-transform"
                >
                  Level Up! (Dev Mode)
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'equipment' && (
          <div className="p-4">
            <EquipmentPanel />
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="p-4">
            <div className="text-center text-gray-500 mt-8">
              <p className="text-6xl mb-4">🔨</p>
              <p>Skills system coming soon!</p>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="p-4">
            <div className="text-center text-gray-500 mt-8">
              <p className="text-6xl mb-4">🏆</p>
              <p>Achievement system coming soon!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}