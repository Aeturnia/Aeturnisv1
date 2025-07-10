import { useState, useEffect } from 'react'

export interface BuffDebuff {
  id: string
  name: string
  icon: string
  duration: number
  maxDuration: number
  type: 'buff' | 'debuff'
  description?: string
  stacks?: number
  source?: string
}

interface BuffDebuffBarProps {
  effects: BuffDebuff[]
  onEffectClick?: (effect: BuffDebuff) => void
  onEffectRemove?: (effectId: string) => void
  maxVisible?: number
  className?: string
}

export function BuffDebuffBar({
  effects,
  onEffectClick,
  onEffectRemove,
  maxVisible = 10,
  className = ''
}: BuffDebuffBarProps) {
  const [visibleEffects, setVisibleEffects] = useState<BuffDebuff[]>([])

  useEffect(() => {
    // Sort effects: buffs first, then by remaining duration
    const sortedEffects = effects
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'buff' ? -1 : 1
        }
        return b.duration - a.duration
      })
      .slice(0, maxVisible)

    setVisibleEffects(sortedEffects)
  }, [effects, maxVisible])

  if (visibleEffects.length === 0) {
    return null
  }

  const getDurationColor = (duration: number, maxDuration: number) => {
    const percentage = (duration / maxDuration) * 100
    if (percentage > 75) return 'text-green-400'
    if (percentage > 50) return 'text-yellow-400'
    if (percentage > 25) return 'text-orange-400'
    return 'text-red-400'
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.ceil(seconds)}s`
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m`
    } else {
      return `${Math.floor(seconds / 3600)}h`
    }
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {visibleEffects.map((effect) => {
        const isExpiringSoon = effect.duration <= 10
        const durationPercentage = (effect.duration / effect.maxDuration) * 100

        return (
          <div
            key={effect.id}
            className={`
              relative group cursor-pointer
              w-10 h-10 min-w-[2.5rem] min-h-[2.5rem]
              rounded border-2 transition-all duration-200
              flex items-center justify-center
              hover:scale-110 active:scale-95
              ${effect.type === 'buff' 
                ? 'bg-green-900/40 border-green-500 hover:bg-green-800/60' 
                : 'bg-red-900/40 border-red-500 hover:bg-red-800/60'
              }
              ${isExpiringSoon ? 'animate-pulse' : ''}
            `}
            onClick={() => onEffectClick?.(effect)}
            role="button"
            tabIndex={0}
            aria-label={`${effect.name} - ${formatDuration(effect.duration)} remaining`}
          >
            {/* Effect Icon */}
            <span className="text-lg">{effect.icon}</span>

            {/* Stack Count */}
            {effect.stacks && effect.stacks > 1 && (
              <div className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                {effect.stacks}
              </div>
            )}

            {/* Duration */}
            <div className="absolute -bottom-1 left-0 right-0 text-center">
              <span className={`text-xs font-bold ${getDurationColor(effect.duration, effect.maxDuration)}`}>
                {formatDuration(effect.duration)}
              </span>
            </div>

            {/* Duration Progress Ring */}
            <div className="absolute inset-0 rounded">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-dark-600"
                  strokeDasharray="100, 100"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={effect.type === 'buff' ? 'text-green-400' : 'text-red-400'}
                  strokeDasharray={`${durationPercentage}, 100`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>

            {/* Remove Button (on hover) */}
            {onEffectRemove && (
              <button
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  onEffectRemove(effect.id)
                }}
                aria-label={`Remove ${effect.name}`}
              >
                ×
              </button>
            )}

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-dark-700 border border-dark-600 rounded-lg p-2 text-xs text-white whitespace-nowrap shadow-lg">
                <div className="font-semibold text-white">{effect.name}</div>
                {effect.description && (
                  <div className="text-gray-300 mt-1">{effect.description}</div>
                )}
                <div className="text-gray-400 mt-1">
                  Duration: {formatDuration(effect.duration)}
                </div>
                {effect.source && (
                  <div className="text-gray-400">
                    Source: {effect.source}
                  </div>
                )}
                {effect.stacks && effect.stacks > 1 && (
                  <div className="text-amber-400">
                    Stacks: {effect.stacks}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {/* Overflow Indicator */}
      {effects.length > maxVisible && (
        <div className="w-10 h-10 bg-dark-700 border-2 border-dark-500 rounded flex items-center justify-center">
          <span className="text-xs text-gray-400">
            +{effects.length - maxVisible}
          </span>
        </div>
      )}
    </div>
  )
}