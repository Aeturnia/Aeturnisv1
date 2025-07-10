import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTouch } from '../../hooks/useTouch'

interface CharacterStats {
  level: number
  experience: number
  experienceToNext: number
  health: number
  maxHealth: number
  mana: number
  maxMana: number
  strength: number
  dexterity: number
  intelligence: number
  constitution: number
  wisdom: number
  charisma: number
}

const mockCharacter: CharacterStats = {
  level: 25,
  experience: 12500,
  experienceToNext: 15000,
  health: 180,
  maxHealth: 200,
  mana: 85,
  maxMana: 120,
  strength: 28,
  dexterity: 18,
  intelligence: 22,
  constitution: 25,
  wisdom: 20,
  charisma: 15,
}

export function CharacterScreen() {
  const [activeTab, setActiveTab] = useState<'stats' | 'skills' | 'achievements'>('stats')
  
  const { hapticFeedback } = useTouch({
    onTap: () => {
      hapticFeedback('light')
    }
  })

  const getStatColor = (value: number) => {
    if (value >= 25) return 'text-red-400'
    if (value >= 20) return 'text-orange-400'
    if (value >= 15) return 'text-yellow-400'
    if (value >= 10) return 'text-green-400'
    return 'text-gray-400'
  }

  return (
    <motion.div
      className="h-full bg-dark-900 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Character Header */}
      <div className="card p-4 mb-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-2xl">
            👤
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">Hero</h2>
            <p className="text-sm text-dark-400">Level {mockCharacter.level} Warrior</p>
            
            {/* Experience Bar */}
            <div className="mt-2">
              <div className="flex justify-between text-xs text-dark-400 mb-1">
                <span>XP: {mockCharacter.experience.toLocaleString()}</span>
                <span>Next: {mockCharacter.experienceToNext.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 rounded-full transition-all duration-500"
                  style={{ width: `${(mockCharacter.experience / mockCharacter.experienceToNext) * 100}%` }}
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
                        style={{ width: `${(mockCharacter.health / mockCharacter.maxHealth) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-white">
                      {mockCharacter.health}/{mockCharacter.maxHealth}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-400">💧 Mana</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(mockCharacter.mana / mockCharacter.maxMana) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-white">
                      {mockCharacter.mana}/{mockCharacter.maxMana}
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
                  { name: 'Strength', value: mockCharacter.strength, icon: '💪' },
                  { name: 'Dexterity', value: mockCharacter.dexterity, icon: '🏃' },
                  { name: 'Intelligence', value: mockCharacter.intelligence, icon: '🧠' },
                  { name: 'Constitution', value: mockCharacter.constitution, icon: '🛡️' },
                  { name: 'Wisdom', value: mockCharacter.wisdom, icon: '🔮' },
                  { name: 'Charisma', value: mockCharacter.charisma, icon: '💬' },
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
                {[
                  { name: 'Sword Fighting', level: 15, icon: '⚔️' },
                  { name: 'Archery', level: 8, icon: '🏹' },
                  { name: 'Magic', level: 12, icon: '🔮' },
                  { name: 'Defense', level: 10, icon: '🛡️' },
                ].map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{skill.icon}</span>
                      <span className="text-white">{skill.name}</span>
                    </div>
                    <span className="text-primary-400 font-bold">Lv.{skill.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Recent Achievements</h3>
              <div className="space-y-3">
                {[
                  { name: 'First Victory', description: 'Win your first battle', icon: '🏆', completed: true },
                  { name: 'Explorer', description: 'Visit 10 different zones', icon: '🗺️', completed: true },
                  { name: 'Collector', description: 'Collect 50 items', icon: '🎒', completed: false },
                  { name: 'Master Warrior', description: 'Reach level 50', icon: '⚔️', completed: false },
                ].map((achievement) => (
                  <div key={achievement.name} className={`flex items-center space-x-3 p-2 rounded-lg ${
                    achievement.completed ? 'bg-green-900/20 border border-green-500/20' : 'bg-dark-800'
                  }`}>
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <div className="text-white font-medium">{achievement.name}</div>
                      <div className="text-xs text-dark-400">{achievement.description}</div>
                    </div>
                    {achievement.completed && (
                      <div className="text-green-400 text-sm">✓</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}