import { useState } from 'react'
import { useTouch } from '../../../hooks/useTouch'

export interface EquipmentItem {
  id: string
  name: string
  icon: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  type: 'weapon' | 'armor' | 'accessory'
  slot: string
  stats?: Record<string, number>
  setBonusId?: string
  description?: string
  level?: number
}

interface EquipmentSlotProps {
  slotType: string
  item?: EquipmentItem
  isSelected?: boolean
  onSelect?: (item: EquipmentItem | null) => void
  onUnequip?: (slotType: string) => void
  className?: string
}

const slotLabels: Record<string, string> = {
  head: 'Head',
  neck: 'Neck',
  chest: 'Chest',
  hands: 'Hands',
  legs: 'Legs',
  feet: 'Feet',
  weapon: 'Weapon',
  offhand: 'Offhand',
  ring1: 'Ring 1',
  ring2: 'Ring 2'
}

const slotIcons: Record<string, string> = {
  head: '⛑️',
  neck: '📿',
  chest: '🦺',
  hands: '🧤',
  legs: '👖',
  feet: '👢',
  weapon: '⚔️',
  offhand: '🛡️',
  ring1: '💍',
  ring2: '💍'
}

const rarityColors: Record<string, string> = {
  common: 'border-gray-500 bg-gray-900',
  uncommon: 'border-green-500 bg-green-900/20',
  rare: 'border-blue-500 bg-blue-900/20',
  epic: 'border-purple-500 bg-purple-900/20',
  legendary: 'border-orange-500 bg-orange-900/20'
}

export function EquipmentSlot({
  slotType,
  item,
  isSelected = false,
  onSelect,
  onUnequip,
  className = ''
}: EquipmentSlotProps) {
  const [isPressed, setIsPressed] = useState(false)

  const { handleTouchStart, handleTouchEnd } = useTouch({
    onTap: () => {
      if (item && onSelect) {
        onSelect(item)
      }
    },
    onLongPress: () => {
      if (item && onUnequip) {
        onUnequip(slotType)
      }
    }
  })

  const baseClasses = `
    relative flex flex-col items-center justify-center
    w-16 h-16 min-w-[4rem] min-h-[4rem]
    border-2 rounded-lg transition-all duration-200
    active:scale-95 select-none cursor-pointer
    ${className}
  `

  const borderColor = item 
    ? rarityColors[item.rarity] 
    : 'border-dark-600 bg-dark-800 hover:border-dark-500'

  const selectedStyle = isSelected 
    ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-400/20' 
    : ''

  const pressedStyle = isPressed 
    ? 'scale-95 brightness-110' 
    : ''

  return (
    <div
      className={`${baseClasses} ${borderColor} ${selectedStyle} ${pressedStyle}`}
      onTouchStart={(e) => {
        setIsPressed(true)
        handleTouchStart(e)
      }}
      onTouchEnd={(e) => {
        setIsPressed(false)
        handleTouchEnd(e)
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      role="button"
      tabIndex={0}
      aria-label={`${slotLabels[slotType]} slot${item ? ` - ${item.name}` : ' - empty'}`}
    >
      {/* Slot Icon or Item */}
      <div className="text-2xl mb-1">
        {item?.icon || slotIcons[slotType] || '📦'}
      </div>

      {/* Slot Label */}
      <div className="text-xs text-gray-400 text-center leading-none">
        {slotLabels[slotType] || slotType}
      </div>

      {/* Set Bonus Indicator */}
      {item?.setBonusId && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border border-dark-900">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        </div>
      )}

      {/* Level Requirement Indicator */}
      {item?.level && (
        <div className="absolute -bottom-1 -right-1 px-1 py-0.5 bg-dark-700 text-xs text-white rounded border border-dark-600">
          {item.level}
        </div>
      )}

      {/* Empty Slot Overlay */}
      {!item && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-800/50 rounded-lg">
          <div className="text-xs text-gray-500 text-center">
            Empty
          </div>
        </div>
      )}
    </div>
  )
}