import React, { memo, useMemo } from 'react'
import { Character, Stats } from '@aeturnis/shared'
import { useTouch } from '../../hooks/useTouch'
import { StatsBreakdown } from './StatsBreakdown'
import { EquipmentPreview } from './EquipmentPreview'

interface CharacterSheetProps {
  character: Character
  stats?: Stats
  onStatsClick?: () => void
  onEquipmentClick?: () => void
}

// Helper function to calculate experience for level
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

export const CharacterSheet = memo<CharacterSheetProps>(({ 
  character, 
  stats,
  onStatsClick,
  onEquipmentClick 
}) => {
  const { hapticFeedback } = useTouch()

  // Calculate experience progress
  const expInfo = useMemo(() => {
    const currentExp = BigInt(character.experience)
    const nextLevelExp = calculateExpForLevel(character.level + 1)
    const currentLevelExp = calculateExpForLevel(character.level)
    return {
      current: Number(currentExp - currentLevelExp),
      toNext: Number(nextLevelExp - currentLevelExp),
      total: Number(currentExp),
      percentage: Math.min(100, (Number(currentExp - currentLevelExp) / Number(nextLevelExp - currentLevelExp)) * 100)
    }
  }, [character.experience, character.level])

  // Calculate health and mana percentages
  const healthPercentage = (character.health / character.maxHealth) * 100
  const manaPercentage = (character.mana / character.maxMana) * 100

  const handleStatsClick = () => {
    hapticFeedback('light')
    onStatsClick?.()
  }

  const handleEquipmentClick = () => {
    hapticFeedback('light')
    onEquipmentClick?.()
  }

  return (
    <div className="space-y-4">
      {/* Character Header */}
      <div className="card p-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
            👤
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{character.name}</h2>
            <p className="text-sm text-dark-400">
              Level {character.level} {character.race} {character.class}
            </p>
            
            {/* Experience Progress */}
            <div className="mt-2">
              <div className="flex justify-between text-xs text-dark-400 mb-1">
                <span>XP: {expInfo.total.toLocaleString()}</span>
                <span>{expInfo.current.toLocaleString()} / {expInfo.toNext.toLocaleString()}</span>
              </div>
              <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 rounded-full transition-all duration-500"
                  style={{ width: `${expInfo.percentage}%` }}
                />
              </div>
              <div className="text-xs text-center text-dark-400 mt-1">
                {expInfo.percentage.toFixed(1)}% to next level
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Bars */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Resources</h3>
        <div className="space-y-3">
          {/* Health */}
          <div className="flex items-center justify-between">
            <span className="text-red-400 font-medium">❤️ Health</span>
            <div className="flex items-center space-x-2 flex-1 ml-4">
              <div className="flex-1 h-3 bg-dark-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full transition-all duration-300"
                  style={{ width: `${healthPercentage}%` }}
                />
              </div>
              <span className="text-sm text-white min-w-[60px] text-right">
                {character.health}/{character.maxHealth}
              </span>
            </div>
          </div>

          {/* Mana */}
          <div className="flex items-center justify-between">
            <span className="text-blue-400 font-medium">💧 Mana</span>
            <div className="flex items-center space-x-2 flex-1 ml-4">
              <div className="flex-1 h-3 bg-dark-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${manaPercentage}%` }}
                />
              </div>
              <span className="text-sm text-white min-w-[60px] text-right">
                {character.mana}/{character.maxMana}
              </span>
            </div>
          </div>

          {/* Stamina */}
          {character.stamina && character.maxStamina && (
            <div className="flex items-center justify-between">
              <span className="text-yellow-400 font-medium">⚡ Stamina</span>
              <div className="flex items-center space-x-2 flex-1 ml-4">
                <div className="flex-1 h-3 bg-dark-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full transition-all duration-300"
                    style={{ width: `${(character.stamina / character.maxStamina) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-white min-w-[60px] text-right">
                  {character.stamina}/{character.maxStamina}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Stats</h3>
          <button
            onClick={handleStatsClick}
            className="btn-touch text-sm text-primary-400 hover:text-primary-300"
          >
            View Details →
          </button>
        </div>
        
        <StatsBreakdown 
          stats={character.stats} 
          compact={true}
        />
      </div>

      {/* Equipment Overview */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Equipment</h3>
          <button
            onClick={handleEquipmentClick}
            className="btn-touch text-sm text-primary-400 hover:text-primary-300"
          >
            Manage →
          </button>
        </div>
        
        <EquipmentPreview 
          characterId={character.id}
          compact={true}
        />
      </div>

      {/* Character Info */}
      <div className="card p-4">
        <h3 className="text-lg font-semibold text-white mb-3">Character Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-dark-400">Race:</span>
            <span className="text-white">{character.race}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-400">Class:</span>
            <span className="text-white">{character.class}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-400">Gender:</span>
            <span className="text-white">{character.gender}</span>
          </div>
          {character.position && (
            <div className="flex justify-between">
              <span className="text-dark-400">Location:</span>
              <span className="text-white">
                ({character.position.x}, {character.position.y})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

CharacterSheet.displayName = 'CharacterSheet'