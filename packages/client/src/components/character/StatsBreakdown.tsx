import React, { memo } from 'react'
import { Stats } from '@aeturnis/shared'
import { StatTooltip } from './StatTooltip'

interface StatsBreakdownProps {
  stats: Stats
  compact?: boolean
  showTooltips?: boolean
  baseStats?: Stats
  bonusStats?: Stats
}

interface StatInfo {
  name: string
  icon: string
  color: string
  description: string
}

const STAT_INFO: Record<keyof Stats, StatInfo> = {
  strength: {
    name: 'Strength',
    icon: '💪',
    color: 'text-red-400',
    description: 'Increases physical damage and carrying capacity'
  },
  dexterity: {
    name: 'Dexterity', 
    icon: '🏃',
    color: 'text-green-400',
    description: 'Improves accuracy, critical hit chance, and movement speed'
  },
  intelligence: {
    name: 'Intelligence',
    icon: '🧠', 
    color: 'text-blue-400',
    description: 'Increases magical damage and mana pool'
  },
  vitality: {
    name: 'Vitality',
    icon: '🛡️',
    color: 'text-orange-400', 
    description: 'Increases health points and damage resistance'
  },
  wisdom: {
    name: 'Wisdom',
    icon: '🔮',
    color: 'text-purple-400',
    description: 'Improves mana regeneration and spell effectiveness'
  },
  charisma: {
    name: 'Charisma',
    icon: '🎭',
    color: 'text-pink-400',
    description: 'Affects social interactions and leadership abilities'
  }
}

export const StatsBreakdown = memo<StatsBreakdownProps>(({ 
  stats, 
  compact = false,
  showTooltips = true,
  baseStats,
  bonusStats
}) => {
  const getStatColor = (value: number) => {
    if (value >= 30) return 'text-red-400'
    if (value >= 25) return 'text-orange-400'
    if (value >= 20) return 'text-yellow-400'
    if (value >= 15) return 'text-green-400'
    if (value >= 10) return 'text-blue-400'
    return 'text-gray-400'
  }

  const getStatValue = (statKey: keyof Stats) => {
    const base = baseStats?.[statKey] || 0
    const bonus = bonusStats?.[statKey] || 0
    const total = stats[statKey]
    
    return { base, bonus, total }
  }

  const renderStat = (statKey: keyof Stats) => {
    const statInfo = STAT_INFO[statKey]
    const { base, bonus, total } = getStatValue(statKey)
    const hasBreakdown = baseStats && bonusStats && (base !== total || bonus > 0)

    const statElement = (
      <div className={`flex items-center justify-between ${compact ? 'bg-dark-800 rounded-lg p-2' : 'bg-dark-700 rounded-lg p-3'}`}>
        <div className="flex items-center space-x-2">
          <span className={compact ? 'text-lg' : 'text-xl'}>{statInfo.icon}</span>
          <div>
            <span className={`${compact ? 'text-sm' : 'text-base'} text-white font-medium`}>
              {statInfo.name}
            </span>
            {!compact && (
              <p className="text-xs text-dark-400">{statInfo.description}</p>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <span className={`${compact ? 'text-lg' : 'text-xl'} font-bold ${getStatColor(total)}`}>
            {total}
          </span>
          {hasBreakdown && (
            <div className="text-xs text-dark-400">
              {base > 0 && <span>{base}</span>}
              {bonus > 0 && <span className="text-green-400">+{bonus}</span>}
            </div>
          )}
        </div>
      </div>
    )

    if (showTooltips && !compact) {
      return (
        <StatTooltip
          key={statKey}
          stat={statInfo}
          value={total}
          baseValue={base}
          bonusValue={bonus}
        >
          {statElement}
        </StatTooltip>
      )
    }

    return <div key={statKey}>{statElement}</div>
  }

  return (
    <div className={`${compact ? 'grid grid-cols-2 gap-2' : 'space-y-3'}`}>
      {(Object.keys(STAT_INFO) as Array<keyof Stats>).map(renderStat)}
    </div>
  )
})

StatsBreakdown.displayName = 'StatsBreakdown'