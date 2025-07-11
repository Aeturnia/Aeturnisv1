import React, { memo, useEffect, useState } from 'react'
import { useInventory } from '../../hooks/useServices'
import { useTouch } from '../../hooks/useTouch'
import { EquippedItem, EquipmentSlot } from '../../types/inventory.types'

interface EquipmentPreviewProps {
  characterId: string
  compact?: boolean
  onSlotClick?: (slot: EquipmentSlot) => void
}

interface SlotInfo {
  name: string
  icon: string
  position: { row: number; col: number }
}

const EQUIPMENT_SLOTS: Record<EquipmentSlot, SlotInfo> = {
  head: { name: 'Head', icon: '👑', position: { row: 0, col: 1 } },
  neck: { name: 'Neck', icon: '📿', position: { row: 1, col: 1 } },
  chest: { name: 'Chest', icon: '👕', position: { row: 2, col: 1 } },
  hands: { name: 'Hands', icon: '🧤', position: { row: 3, col: 1 } },
  legs: { name: 'Legs', icon: '👖', position: { row: 4, col: 1 } },
  feet: { name: 'Feet', icon: '👠', position: { row: 5, col: 1 } },
  weapon: { name: 'Weapon', icon: '⚔️', position: { row: 2, col: 0 } },
  offhand: { name: 'Offhand', icon: '🛡️', position: { row: 2, col: 2 } },
  ring1: { name: 'Ring 1', icon: '💍', position: { row: 3, col: 0 } },
  ring2: { name: 'Ring 2', icon: '💍', position: { row: 3, col: 2 } }
}

const getRarityColor = (rarity?: string) => {
  switch (rarity?.toLowerCase()) {
    case 'common': return 'border-gray-400 bg-gray-400/10'
    case 'uncommon': return 'border-green-400 bg-green-400/10'
    case 'rare': return 'border-blue-400 bg-blue-400/10'
    case 'epic': return 'border-purple-400 bg-purple-400/10'
    case 'legendary': return 'border-orange-400 bg-orange-400/10'
    case 'mythic': return 'border-red-400 bg-red-400/10'
    default: return 'border-dark-600 bg-dark-700'
  }
}

export const EquipmentPreview = memo<EquipmentPreviewProps>(({ 
  characterId, 
  compact = false,
  onSlotClick
}) => {
  const { getEquipment } = useInventory()
  const { hapticFeedback } = useTouch()
  
  const [equipment, setEquipment] = useState<Record<EquipmentSlot, EquippedItem | null>>({
    head: null,
    neck: null,
    chest: null,
    hands: null,
    legs: null,
    feet: null,
    weapon: null,
    offhand: null,
    ring1: null,
    ring2: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEquipment()
  }, [characterId])

  const loadEquipment = async () => {
    try {
      setLoading(true)
      setError(null)
      const equipmentData = await getEquipment(characterId)
      
      // Map equipment response to our slot structure
      const equipmentMap: Record<EquipmentSlot, EquippedItem | null> = {
        head: equipmentData.head || null,
        neck: equipmentData.neck || null,
        chest: equipmentData.chest || null,
        hands: equipmentData.hands || null,
        legs: equipmentData.legs || null,
        feet: equipmentData.feet || null,
        weapon: equipmentData.weapon || null,
        offhand: equipmentData.offhand || null,
        ring1: equipmentData.ring1 || null,
        ring2: equipmentData.ring2 || null
      }
      
      setEquipment(equipmentMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load equipment')
    } finally {
      setLoading(false)
    }
  }

  const handleSlotClick = (slot: EquipmentSlot) => {
    hapticFeedback('light')
    onSlotClick?.(slot)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24">
        <div className="text-center">
          <div className="text-2xl mb-2 animate-spin">⚙️</div>
          <p className="text-sm text-dark-400">Loading equipment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-400 p-4">
        <div className="text-2xl mb-2">⚠️</div>
        <p className="text-sm">{error}</p>
        <button
          onClick={loadEquipment}
          className="btn-touch text-xs mt-2 text-primary-400"
        >
          Retry
        </button>
      </div>
    )
  }

  if (compact) {
    // Compact view - show equipped items in a simple list
    const equippedItems = Object.entries(equipment).filter(([_, item]) => item !== null)
    
    if (equippedItems.length === 0) {
      return (
        <div className="text-center text-dark-400 py-4">
          <div className="text-2xl mb-2">👕</div>
          <p className="text-sm">No equipment equipped</p>
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {equippedItems.slice(0, 3).map(([slot, item]) => {
          const slotInfo = EQUIPMENT_SLOTS[slot as EquipmentSlot]
          return (
            <div 
              key={slot}
              className="flex items-center space-x-2 bg-dark-800 rounded p-2"
            >
              <span className="text-lg">{slotInfo.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  {item?.name || 'Unknown Item'}
                </p>
                <p className="text-xs text-dark-400 capitalize">
                  {slotInfo.name} • {item?.rarity || 'Common'}
                </p>
              </div>
            </div>
          )
        })}
        
        {equippedItems.length > 3 && (
          <div className="text-center">
            <span className="text-xs text-dark-400">
              +{equippedItems.length - 3} more items
            </span>
          </div>
        )}
      </div>
    )
  }

  // Full equipment grid view
  return (
    <div className="space-y-4">
      {/* Equipment Grid */}
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
        {Array.from({ length: 6 }, (_, row) => 
          Array.from({ length: 3 }, (_, col) => {
            // Find equipment slot for this position
            const slot = Object.entries(EQUIPMENT_SLOTS).find(
              ([_, info]) => info.position.row === row && info.position.col === col
            )
            
            if (!slot) {
              return <div key={`${row}-${col}`} className="aspect-square" />
            }
            
            const [slotKey, slotInfo] = slot
            const item = equipment[slotKey as EquipmentSlot]
            
            return (
              <button
                key={slotKey}
                onClick={() => handleSlotClick(slotKey as EquipmentSlot)}
                className={`
                  aspect-square rounded-lg border-2 flex flex-col items-center justify-center
                  transition-all duration-200 hover:scale-105 active:scale-95
                  ${item ? getRarityColor(item.rarity) : 'border-dark-600 bg-dark-700'}
                  ${item ? 'hover:brightness-110' : 'hover:bg-dark-600'}
                `}
              >
                <div className="text-lg mb-1">{slotInfo.icon}</div>
                {item ? (
                  <div className="text-center px-1">
                    <div className="text-xs text-white font-medium truncate w-full">
                      {item.name}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-dark-400">{slotInfo.name}</div>
                )}
              </button>
            )
          })
        )}
      </div>

      {/* Equipment Stats Summary */}
      <div className="bg-dark-800 rounded-lg p-3">
        <h4 className="text-sm font-medium text-white mb-2">Equipment Bonus</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-dark-400">Damage:</span>
            <span className="text-green-400">+12</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-400">Defense:</span>
            <span className="text-blue-400">+8</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-400">Health:</span>
            <span className="text-red-400">+45</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-400">Mana:</span>
            <span className="text-blue-400">+30</span>
          </div>
        </div>
      </div>
    </div>
  )
})

EquipmentPreview.displayName = 'EquipmentPreview'