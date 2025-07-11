import { useState, useEffect } from 'react'
import { useTouch } from '../../hooks/useTouch'
import { useCharacter } from '../../hooks/useServices'
import { Character } from '@aeturnis/shared'

// Helper function to calculate experience for level
// TODO: Use from @aeturnis/shared once export issue is resolved
function calculateExpForLevel(level: number): bigint {
  if (level <= 1) return 0n;
  const base = 100n;
  const scaling = 115n; // 1.15 as percentage
  let exp = base;
  for (let i = 2; i < level; i++) {
    exp = (exp * scaling) / 100n;
  }
  return exp;
}

export function CharacterScreen() {
  const [activeTab, setActiveTab] = useState<'stats' | 'skills' | 'achievements'>('stats')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  
  const { 
    currentCharacter, 
    characterList,
    getCharacter,
    getCharacters
  } = useCharacter()
  
  const { hapticFeedback } = useTouch({
    onTap: () => {
      hapticFeedback('light')
    }
  })

  // Load character data on mount
  useEffect(() => {
    loadCharacterData()
  }, [])

  // Use currentCharacter from state or selectedCharacter
  useEffect(() => {
    if (currentCharacter && !selectedCharacter) {
      setSelectedCharacter(currentCharacter as Character)
    }
  }, [currentCharacter, selectedCharacter])

  const loadCharacterData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Try to get all characters first
      await getCharacters()
      
      // If we have a current character in state, use it
      if (currentCharacter) {
        setSelectedCharacter(currentCharacter as Character)
      } else if (characterList && characterList.size > 0) {
        // Otherwise, select the first character from the list
        const firstCharId = Array.from(characterList.keys())[0]
        const character = await getCharacter(firstCharId)
        setSelectedCharacter(character)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load character data')
    } finally {
      setLoading(false)
    }
  }

  const getStatColor = (value: number) => {
    if (value >= 25) return 'text-red-400'
    if (value >= 20) return 'text-orange-400'
    if (value >= 15) return 'text-yellow-400'
    if (value >= 10) return 'text-green-400'
    return 'text-gray-400'
  }

  // Calculate experience for next level
  const getExperienceToNextLevel = (character: Character) => {
    const currentExp = BigInt(character.experience)
    const nextLevelExp = calculateExpForLevel(character.level + 1)
    const currentLevelExp = calculateExpForLevel(character.level)
    return {
      current: Number(currentExp - currentLevelExp),
      toNext: Number(nextLevelExp - currentLevelExp),
      total: Number(currentExp)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="h-full bg-dark-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⚔️</div>
          <p className="text-white">Loading character data...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="h-full bg-dark-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadCharacterData}
            className="btn-touch btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Show message if no character data
  if (!selectedCharacter) {
    return (
      <div className="h-full bg-dark-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">👤</div>
          <p className="text-white mb-4">No character data available</p>
          <button
            onClick={loadCharacterData}
            className="btn-touch btn-primary"
          >
            Load Character
          </button>
        </div>
      </div>
    )
  }

  const expInfo = getExperienceToNextLevel(selectedCharacter)

  return (
    <div
      className="h-full bg-dark-900 p-4"
    >
      {/* Character Header */}
      <div className="card p-4 mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-2xl">
            👤
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{selectedCharacter.name}</h2>
            <p className="text-sm text-dark-400">Level {selectedCharacter.level} {selectedCharacter.race}</p>
            
            {/* Experience Bar */}
            <div className="mt-2">
              <div className="flex justify-between text-xs text-dark-400 mb-1">
                <span>XP: {expInfo.total.toLocaleString()}</span>
                <span>Progress: {expInfo.current.toLocaleString()} / {expInfo.toNext.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 rounded-full transition-all duration-500"
                  style={{ width: `${(expInfo.current / expInfo.toNext) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-4">
        {['stats', 'skills', 'achievements'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab as any)
              hapticFeedback('light')
            }}
            className={`btn-touch flex-1 py-2 rounded-lg font-medium capitalize ${
              activeTab === tab 
                ? 'bg-primary-500 text-white' 
                : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto momentum-scroll">
        {activeTab === 'stats' && (
          <div className="space-y-4">
            {/* Health & Mana */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Resources</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-red-400">❤️ Health</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${(selectedCharacter.health / selectedCharacter.maxHealth) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-white">
                      {selectedCharacter.health}/{selectedCharacter.maxHealth}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-400">💧 Mana</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(selectedCharacter.mana / selectedCharacter.maxMana) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-white">
                      {selectedCharacter.mana}/{selectedCharacter.maxMana}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Stats */}
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Attributes</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Strength', value: selectedCharacter.stats.strength, icon: '💪' },
                  { name: 'Dexterity', value: selectedCharacter.stats.dexterity, icon: '🏃' },
                  { name: 'Intelligence', value: selectedCharacter.stats.intelligence, icon: '🧠' },
                  { name: 'Vitality', value: selectedCharacter.stats.vitality, icon: '🛡️' },
                  { name: 'Wisdom', value: selectedCharacter.stats.wisdom, icon: '🔮' },
                ].map((stat) => (
                  <div key={stat.name} className="flex items-center justify-between bg-dark-800 rounded-lg p-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{stat.icon}</span>
                      <span className="text-sm text-white">{stat.name}</span>
                    </div>
                    <span className={`text-lg font-bold ${getStatColor(stat.value)}`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Combat Skills</h3>
              <div className="space-y-3">
                {/* For now, show placeholder skills - will be replaced when skills data is available */}
                <div className="text-center text-dark-400 py-8">
                  <div className="text-4xl mb-4">🎯</div>
                  <p>Skills system coming soon!</p>
                  <p className="text-sm mt-2">Train your abilities to unlock new skills</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Recent Achievements</h3>
              <div className="space-y-3">
                {/* For now, show placeholder achievements - will be replaced when achievements data is available */}
                <div className="text-center text-dark-400 py-8">
                  <div className="text-4xl mb-4">🏆</div>
                  <p>Achievements system coming soon!</p>
                  <p className="text-sm mt-2">Complete quests and challenges to earn achievements</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}