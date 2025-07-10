import React, { useState, memo, ReactNode } from 'react'
import { useTouch } from '../../hooks/useTouch'

interface StatInfo {
  name: string
  icon: string
  color: string
  description: string
}

interface StatTooltipProps {
  stat: StatInfo
  value: number
  baseValue?: number
  bonusValue?: number
  children: ReactNode
}

export const StatTooltip = memo<StatTooltipProps>(({ 
  stat, 
  value, 
  baseValue, 
  bonusValue, 
  children 
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  
  const { hapticFeedback } = useTouch()

  const handleTouch = (event: React.TouchEvent) => {
    event.preventDefault()
    hapticFeedback('light')
    
    const touch = event.touches[0]
    setPosition({ x: touch.clientX, y: touch.clientY })
    setIsVisible(true)
    
    // Hide tooltip after 2 seconds on mobile
    setTimeout(() => setIsVisible(false), 2000)
  }

  const handleMouseEnter = (event: React.MouseEvent) => {
    setPosition({ x: event.clientX, y: event.clientY })
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    setPosition({ x: event.clientX, y: event.clientY })
  }

  return (
    <>
      <div
        onTouchStart={handleTouch}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className="relative cursor-help"
      >
        {children}
      </div>

      {isVisible && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${position.x + 10}px`,
            top: `${position.y - 10}px`,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="bg-dark-800 border border-dark-600 rounded-lg p-3 shadow-lg max-w-xs">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{stat.icon}</span>
              <span className="font-semibold text-white">{stat.name}</span>
              <span className={`font-bold ${stat.color}`}>{value}</span>
            </div>
            
            {/* Description */}
            <p className="text-sm text-dark-300 mb-2">{stat.description}</p>
            
            {/* Stat Breakdown */}
            {(baseValue !== undefined || bonusValue !== undefined) && (
              <div className="border-t border-dark-600 pt-2">
                <div className="text-xs space-y-1">
                  {baseValue !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-dark-400">Base:</span>
                      <span className="text-white">{baseValue}</span>
                    </div>
                  )}
                  {bonusValue !== undefined && bonusValue > 0 && (
                    <div className="flex justify-between">
                      <span className="text-dark-400">Bonus:</span>
                      <span className="text-green-400">+{bonusValue}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-dark-600 pt-1">
                    <span className="text-dark-400 font-medium">Total:</span>
                    <span className={`font-bold ${stat.color}`}>{value}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Effects */}
            <div className="border-t border-dark-600 pt-2 mt-2">
              <div className="text-xs text-dark-400">
                {getStatEffects(stat.name.toLowerCase(), value)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
})

function getStatEffects(statName: string, value: number): string {
  const effects: Record<string, (value: number) => string> = {
    strength: (val) => `Physical Damage: +${Math.floor(val * 2)}%, Carry Weight: +${val * 5}`,
    dexterity: (val) => `Accuracy: +${Math.floor(val * 1.5)}%, Crit Chance: +${Math.floor(val * 0.5)}%`,
    intelligence: (val) => `Spell Damage: +${Math.floor(val * 2)}%, Mana: +${val * 10}`,
    vitality: (val) => `Health: +${val * 15}, Damage Resist: +${Math.floor(val * 0.5)}%`,
    wisdom: (val) => `Mana Regen: +${Math.floor(val * 1.2)}/sec, Spell Power: +${Math.floor(val * 1.5)}%`,
    charisma: (val) => `Social Bonus: +${val * 2}, Leadership: +${Math.floor(val * 1.5)}%`
  }
  
  return effects[statName]?.(value) || 'No additional effects'
}

StatTooltip.displayName = 'StatTooltip'