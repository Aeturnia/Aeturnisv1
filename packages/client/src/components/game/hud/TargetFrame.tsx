import { useState, useEffect } from 'react'

export interface TargetInfo {
  id: string
  name: string
  level: number
  health: number
  maxHealth: number
  type: 'player' | 'npc' | 'monster' | 'boss'
  race?: string
  class?: string
  icon?: string
  buffs?: Array<{ id: string; name: string; icon: string; duration: number }>
  debuffs?: Array<{ id: string; name: string; icon: string; duration: number }>
  isElite?: boolean
  isFriendly?: boolean
}

interface TargetFrameProps {
  target?: TargetInfo | null
  onClearTarget?: () => void
  className?: string
}

const typeColors: Record<string, string> = {
  player: 'border-blue-500 bg-blue-900/20',
  npc: 'border-green-500 bg-green-900/20',
  monster: 'border-red-500 bg-red-900/20',
  boss: 'border-purple-500 bg-purple-900/20'
}

const typeIcons: Record<string, string> = {
  player: '👤',
  npc: '🤝',
  monster: '👹',
  boss: '👑'
}

export function TargetFrame({
  target,
  onClearTarget,
  className = ''
}: TargetFrameProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (target) {
      setIsVisible(true)
    } else {
      // Delay hiding to allow for fade out animation
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [target])

  if (!isVisible && !target) {
    return null
  }

  const healthPercentage = target ? (target.health / target.maxHealth) * 100 : 0
  const borderColor = target ? typeColors[target.type] || 'border-gray-500 bg-gray-900/20' : 'border-gray-500'

  const getHealthBarColor = (percentage: number) => {
    if (percentage > 75) return 'bg-green-500'
    if (percentage > 50) return 'bg-yellow-500'
    if (percentage > 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div
      className={`
        relative bg-dark-800 border-2 rounded-lg p-3 
        transition-all duration-300 transform
        ${target ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        ${borderColor}
        ${className}
      `}
    >
      {target && (
        <>
          {/* Clear Target Button */}
          {onClearTarget && (
            <button
              onClick={onClearTarget}
              className="absolute top-1 right-1 w-6 h-6 bg-dark-700 hover:bg-red-600 text-white text-xs rounded transition-colors"
              aria-label="Clear target"
            >
              ×
            </button>
          )}

          {/* Target Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {target.icon || typeIcons[target.type] || '❓'}
              </span>
              <div>
                <div className="flex items-center gap-1">
                  <h4 className="font-semibold text-white text-sm">
                    {target.name}
                  </h4>
                  {target.isElite && (
                    <span className="text-xs text-orange-400 font-bold">★</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>Lv. {target.level}</span>
                  {target.race && target.class && (
                    <span>{target.race} {target.class}</span>
                  )}
                  <span className={`
                    px-1 py-0.5 rounded text-xs capitalize
                    ${target.isFriendly ? 'bg-green-600 text-white' : ''}
                    ${target.type === 'monster' && !target.isFriendly ? 'bg-red-600 text-white' : ''}
                    ${target.type === 'npc' ? 'bg-blue-600 text-white' : ''}
                  `}>
                    {target.type}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Health Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Health</span>
              <span>{target.health.toLocaleString()} / {target.maxHealth.toLocaleString()}</span>
            </div>
            <div className="w-full bg-dark-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getHealthBarColor(healthPercentage)}`}
                style={{ width: `${healthPercentage}%` }}
              />
            </div>
          </div>

          {/* Buffs and Debuffs */}
          {(target.buffs?.length || target.debuffs?.length) && (
            <div className="flex gap-2">
              {/* Buffs */}
              {target.buffs && target.buffs.length > 0 && (
                <div className="flex gap-1">
                  {target.buffs.slice(0, 6).map((buff) => (
                    <div
                      key={buff.id}
                      className="relative w-6 h-6 bg-green-600 rounded border border-green-400 flex items-center justify-center"
                      title={`${buff.name} (${buff.duration}s)`}
                    >
                      <span className="text-xs">{buff.icon}</span>
                      <div className="absolute -bottom-1 -right-1 bg-dark-800 text-white text-xs rounded px-1 leading-none">
                        {buff.duration}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Debuffs */}
              {target.debuffs && target.debuffs.length > 0 && (
                <div className="flex gap-1">
                  {target.debuffs.slice(0, 6).map((debuff) => (
                    <div
                      key={debuff.id}
                      className="relative w-6 h-6 bg-red-600 rounded border border-red-400 flex items-center justify-center"
                      title={`${debuff.name} (${debuff.duration}s)`}
                    >
                      <span className="text-xs">{debuff.icon}</span>
                      <div className="absolute -bottom-1 -right-1 bg-dark-800 text-white text-xs rounded px-1 leading-none">
                        {debuff.duration}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}