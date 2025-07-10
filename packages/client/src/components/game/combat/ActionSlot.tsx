import { useState, useEffect } from 'react'
import { useTouch } from '../../../hooks/useTouch'

export interface ActionData {
  id: string
  name: string
  icon: string
  type: 'ability' | 'item' | 'spell' | 'weapon_skill' | 'empty'
  cooldown?: number
  maxCooldown?: number
  resourceCost?: {
    type: 'mana' | 'stamina' | 'health'
    amount: number
  }
  charges?: number
  maxCharges?: number
  isAvailable?: boolean
  description?: string
  level?: number
  hotkey?: string
}

interface ActionSlotProps {
  slotIndex: number
  action?: ActionData | null
  onActionUse?: (action: ActionData, slotIndex: number) => void
  onActionAssign?: (slotIndex: number) => void
  onActionRemove?: (slotIndex: number) => void
  size?: 'small' | 'medium' | 'large'
  showHotkey?: boolean
  isLocked?: boolean
  className?: string
}

const sizeClasses = {
  small: 'w-10 h-10 text-xs',
  medium: 'w-12 h-12 text-sm',
  large: 'w-16 h-16 text-base'
}

const typeColors = {
  ability: 'border-blue-500 bg-blue-900/30',
  item: 'border-green-500 bg-green-900/30',
  spell: 'border-purple-500 bg-purple-900/30',
  weapon_skill: 'border-red-500 bg-red-900/30',
  empty: 'border-dark-600 bg-dark-800'
}

export function ActionSlot({
  slotIndex,
  action,
  onActionUse,
  onActionAssign,
  onActionRemove,
  size = 'medium',
  showHotkey = true,
  isLocked = false,
  className = ''
}: ActionSlotProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [isOnCooldown, setIsOnCooldown] = useState(false)

  const { handleTouchStart, handleTouchEnd } = useTouch({
    onTap: () => {
      if (action && action.type !== 'empty' && onActionUse && action.isAvailable) {
        onActionUse(action, slotIndex)
      } else if (!action && onActionAssign) {
        onActionAssign(slotIndex)
      }
    },
    onLongPress: () => {
      if (action && action.type !== 'empty' && onActionRemove && !isLocked) {
        onActionRemove(slotIndex)
      }
    }
  })

  // Handle cooldown animations
  useEffect(() => {
    if (action?.cooldown && action.cooldown > 0) {
      setIsOnCooldown(true)
      const timer = setTimeout(() => {
        setIsOnCooldown(false)
      }, action.cooldown * 1000)
      return () => clearTimeout(timer)
    }
  }, [action?.cooldown])

  const isDisabled = action && (!action.isAvailable || isOnCooldown)
  const isEmpty = !action || action.type === 'empty'
  const cooldownPercentage = action?.cooldown && action?.maxCooldown 
    ? ((action.maxCooldown - action.cooldown) / action.maxCooldown) * 100 
    : 100

  const baseClasses = `
    relative flex flex-col items-center justify-center
    border-2 rounded-lg transition-all duration-200
    cursor-pointer select-none
    ${sizeClasses[size]}
    ${className}
  `

  const stateClasses = (() => {
    if (isLocked) {
      return 'border-gray-600 bg-gray-800 opacity-50 cursor-not-allowed'
    }
    if (isEmpty) {
      return `${typeColors.empty} hover:border-dark-500 hover:bg-dark-700`
    }
    if (isDisabled) {
      return `${typeColors[action!.type]} opacity-50 cursor-not-allowed`
    }
    return `${typeColors[action!.type]} hover:border-opacity-80 active:scale-95`
  })()

  const pressedStyle = isPressed && !isDisabled ? 'scale-95 brightness-110' : ''

  return (
    <div
      className={`${baseClasses} ${stateClasses} ${pressedStyle}`}
      onTouchStart={(e) => {
        if (!isDisabled && !isLocked) {
          setIsPressed(true)
          handleTouchStart(e)
        }
      }}
      onTouchEnd={(e) => {
        setIsPressed(false)
        handleTouchEnd(e)
      }}
      onMouseDown={() => !isDisabled && !isLocked && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      role="button"
      tabIndex={isLocked ? -1 : 0}
      aria-label={action ? `${action.name} - ${action.description || 'Action slot'}` : `Empty slot ${slotIndex + 1}`}
    >
      {/* Hotkey Display */}
      {showHotkey && action?.hotkey && (
        <div className="absolute -top-2 -left-2 bg-dark-700 text-white text-xs px-1 py-0.5 rounded border border-dark-600">
          {action.hotkey}
        </div>
      )}

      {/* Slot Number */}
      {!action?.hotkey && showHotkey && (
        <div className="absolute -top-2 -left-2 bg-dark-700 text-gray-400 text-xs px-1 py-0.5 rounded border border-dark-600">
          {slotIndex + 1}
        </div>
      )}

      {/* Action Icon */}
      <div className={`text-2xl mb-1 ${size === 'small' ? 'text-lg mb-0' : ''}`}>
        {action?.icon || (isEmpty ? '+' : '?')}
      </div>

      {/* Resource Cost Indicator */}
      {action?.resourceCost && (
        <div className="absolute -top-2 -right-2 bg-dark-700 text-xs px-1 py-0.5 rounded border border-dark-600">
          <span className={
            action.resourceCost.type === 'mana' ? 'text-blue-400' :
            action.resourceCost.type === 'stamina' ? 'text-yellow-400' :
            'text-red-400'
          }>
            {action.resourceCost.amount}
          </span>
        </div>
      )}

      {/* Charges Display */}
      {action?.charges !== undefined && action.maxCharges && (
        <div className="absolute -bottom-2 -left-2 bg-dark-700 text-white text-xs px-1 py-0.5 rounded border border-dark-600">
          {action.charges}/{action.maxCharges}
        </div>
      )}

      {/* Level Requirement */}
      {action?.level && (
        <div className="absolute -bottom-2 -right-2 bg-dark-700 text-amber-400 text-xs px-1 py-0.5 rounded border border-dark-600">
          L{action.level}
        </div>
      )}

      {/* Cooldown Overlay */}
      {isOnCooldown && action?.cooldown && (
        <>
          {/* Cooldown Sweep */}
          <div className="absolute inset-0 rounded-lg overflow-hidden">
            <div 
              className="absolute inset-0 bg-dark-900/70"
              style={{
                clipPath: `polygon(50% 50%, 50% 0%, ${
                  cooldownPercentage < 12.5 ? `${50 + cooldownPercentage * 4}% 0%` :
                  cooldownPercentage < 37.5 ? `100% 0%, 100% ${(cooldownPercentage - 12.5) * 4}%` :
                  cooldownPercentage < 62.5 ? `100% 100%, ${100 - (cooldownPercentage - 37.5) * 4}% 100%` :
                  cooldownPercentage < 87.5 ? `0% 100%, 0% ${100 - (cooldownPercentage - 62.5) * 4}%` :
                  `0% 0%, ${(cooldownPercentage - 87.5) * 4}% 0%`
                }, 50% 50%)`
              }}
            />
          </div>
          
          {/* Cooldown Timer */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-xs bg-dark-900/80 px-1 py-0.5 rounded">
              {Math.ceil(action.cooldown)}
            </span>
          </div>
        </>
      )}

      {/* Empty Slot Indicator */}
      {isEmpty && !isLocked && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-xs">
          Empty
        </div>
      )}

      {/* Locked Indicator */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-500 text-lg">🔒</span>
        </div>
      )}

      {/* Unavailable Overlay */}
      {action && !action.isAvailable && !isOnCooldown && (
        <div className="absolute inset-0 bg-red-900/30 rounded-lg flex items-center justify-center">
          <span className="text-red-400 text-xs font-bold">N/A</span>
        </div>
      )}
    </div>
  )
}