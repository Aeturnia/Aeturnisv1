import { useState, useEffect } from 'react'
import { ActionSlot, ActionData } from './ActionSlot'
import { useCombat } from '../../../hooks/useServices'

// Mock action data for testing
const mockAbilities: ActionData[] = [
  {
    id: 'fireball',
    name: 'Fireball',
    icon: '🔥',
    type: 'spell',
    cooldown: 0,
    maxCooldown: 3,
    resourceCost: { type: 'mana', amount: 25 },
    isAvailable: true,
    description: 'Launch a blazing fireball at your target',
    level: 1,
    hotkey: '1'
  },
  {
    id: 'heal',
    name: 'Heal',
    icon: '💚',
    type: 'spell',
    cooldown: 0,
    maxCooldown: 5,
    resourceCost: { type: 'mana', amount: 30 },
    isAvailable: true,
    description: 'Restore health to yourself or an ally',
    level: 1,
    hotkey: '2'
  },
  {
    id: 'sword_slash',
    name: 'Sword Slash',
    icon: '⚔️',
    type: 'weapon_skill',
    cooldown: 0,
    maxCooldown: 2,
    resourceCost: { type: 'stamina', amount: 15 },
    isAvailable: true,
    description: 'A quick sword attack',
    level: 1,
    hotkey: '3'
  },
  {
    id: 'health_potion',
    name: 'Health Potion',
    icon: '🧪',
    type: 'item',
    charges: 5,
    maxCharges: 5,
    isAvailable: true,
    description: 'Instantly restore 100 HP',
    hotkey: '4'
  },
  {
    id: 'shield_bash',
    name: 'Shield Bash',
    icon: '🛡️',
    type: 'ability',
    cooldown: 0,
    maxCooldown: 8,
    resourceCost: { type: 'stamina', amount: 20 },
    isAvailable: true,
    description: 'Stun an enemy with your shield',
    level: 5,
    hotkey: '5'
  }
]

interface ActionBarProps {
  slotCount?: number
  size?: 'small' | 'medium' | 'large'
  layout?: 'horizontal' | 'vertical' | 'grid'
  showHotkeys?: boolean
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
}

export function ActionBar({
  slotCount = 8,
  size = 'medium',
  layout = 'horizontal',
  showHotkeys = true,
  isCollapsed = false,
  onToggleCollapse,
  className = ''
}: ActionBarProps) {
  const [actionSlots, setActionSlots] = useState<(ActionData | null)[]>([])
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [draggedAction, setDraggedAction] = useState<ActionData | null>(null)

  const { isInCombat } = useCombat()

  // Initialize action slots
  useEffect(() => {
    const initialSlots = Array(slotCount).fill(null)
    // Pre-fill first few slots with mock abilities
    mockAbilities.forEach((ability, index) => {
      if (index < slotCount) {
        initialSlots[index] = ability
      }
    })
    setActionSlots(initialSlots)
  }, [slotCount])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isCustomizing) return

      const key = event.key
      const slotIndex = parseInt(key) - 1

      if (slotIndex >= 0 && slotIndex < actionSlots.length) {
        const action = actionSlots[slotIndex]
        if (action && action.isAvailable) {
          handleActionUse(action, slotIndex)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [actionSlots, isCustomizing])

  const handleActionUse = async (action: ActionData, slotIndex: number) => {
    if (!action.isAvailable || action.cooldown && action.cooldown > 0) {
      return
    }

    try {
      console.log(`Using action: ${action.name} from slot ${slotIndex + 1}`)

      // Update the action to start cooldown
      const updatedSlots = [...actionSlots]
      updatedSlots[slotIndex] = {
        ...action,
        cooldown: action.maxCooldown || 0,
        isAvailable: false
      }
      setActionSlots(updatedSlots)

      // Simulate cooldown countdown
      if (action.maxCooldown) {
        const cooldownInterval = setInterval(() => {
          setActionSlots(current => {
            const updated = [...current]
            const currentAction = updated[slotIndex]
            if (currentAction && currentAction.cooldown && currentAction.cooldown > 0) {
              updated[slotIndex] = {
                ...currentAction,
                cooldown: currentAction.cooldown - 1,
                isAvailable: currentAction.cooldown <= 1
              }
            } else {
              clearInterval(cooldownInterval)
            }
            return updated
          })
        }, 1000)
      }

      // Handle charges for consumable items
      if (action.charges && action.charges > 1) {
        const updatedSlots = [...actionSlots]
        updatedSlots[slotIndex] = {
          ...action,
          charges: action.charges - 1
        }
        setActionSlots(updatedSlots)
      } else if (action.charges === 1) {
        // Remove item when last charge is used
        const updatedSlots = [...actionSlots]
        updatedSlots[slotIndex] = null
        setActionSlots(updatedSlots)
      }

    } catch (error) {
      console.error('Failed to use action:', error)
    }
  }

  const handleActionAssign = (slotIndex: number) => {
    if (!isCustomizing) {
      setIsCustomizing(true)
    }
    // In a real implementation, this would open an ability/item selection dialog
    console.log(`Assigning action to slot ${slotIndex + 1}`)
  }

  const handleActionRemove = (slotIndex: number) => {
    const updatedSlots = [...actionSlots]
    updatedSlots[slotIndex] = null
    setActionSlots(updatedSlots)
  }

  const getLayoutClasses = () => {
    switch (layout) {
      case 'vertical':
        return 'flex-col'
      case 'grid':
        return 'grid grid-cols-4 gap-2'
      default:
        return 'flex-row'
    }
  }

  if (isCollapsed) {
    return (
      <div className={`bg-dark-800 border border-dark-700 rounded-lg p-2 ${className}`}>
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-between text-white hover:text-amber-400 transition-colors"
        >
          <span className="text-sm font-medium">Actions</span>
          <span className="text-lg">⚡</span>
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-dark-800 border border-dark-700 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-dark-700 p-2 border-b border-dark-600">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white">Action Bar</h4>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                isCustomizing 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-dark-600 text-gray-300 hover:bg-dark-500'
              }`}
            >
              {isCustomizing ? 'Done' : 'Edit'}
            </button>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ▲
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Slots */}
      <div className="p-3">
        <div className={`flex gap-2 ${getLayoutClasses()}`}>
          {actionSlots.map((action, index) => (
            <ActionSlot
              key={index}
              slotIndex={index}
              action={action}
              onActionUse={handleActionUse}
              onActionAssign={handleActionAssign}
              onActionRemove={handleActionRemove}
              size={size}
              showHotkey={showHotkeys}
              isLocked={isInCombat && !isCustomizing}
            />
          ))}
        </div>

        {/* Customization Hint */}
        {isCustomizing && (
          <div className="mt-3 p-2 bg-amber-900/20 border border-amber-600 rounded text-xs text-amber-200">
            <div className="font-medium mb-1">Customization Mode Active</div>
            <div>• Tap empty slots to assign actions</div>
            <div>• Long press to remove actions</div>
            <div>• Press "Done" when finished</div>
          </div>
        )}

        {/* Combat Status */}
        {isInCombat && (
          <div className="mt-3 p-2 bg-red-900/20 border border-red-600 rounded text-xs text-red-200">
            <div className="font-medium">⚔️ In Combat</div>
            <div>Action customization is locked</div>
          </div>
        )}
      </div>
    </div>
  )
}