import { useState, useEffect } from 'react'
import { EquipmentSlot, EquipmentItem } from './EquipmentSlot'
import { EquipmentStats } from './EquipmentStats'
import { useInventory } from '../../../hooks/useServices'

// Mock equipment data structure
const mockEquippedItems: Record<string, EquipmentItem> = {
  head: {
    id: 'helm_001',
    name: 'Mystic Circlet',
    icon: '👑',
    rarity: 'epic',
    type: 'armor',
    slot: 'head',
    stats: { intelligence: 12, mana: 45, magicResistance: 8 },
    setBonusId: 'mystic_set',
    description: 'A circlet imbued with arcane energies',
    level: 25
  },
  chest: {
    id: 'armor_001',
    name: 'Robes of the Arcane',
    icon: '🧙‍♀️',
    rarity: 'epic',
    type: 'armor',
    slot: 'chest',
    stats: { intelligence: 18, mana: 75, magicResistance: 15 },
    setBonusId: 'mystic_set',
    description: 'Flowing robes that enhance magical prowess',
    level: 25
  },
  weapon: {
    id: 'staff_001',
    name: 'Staff of Elements',
    icon: '🧙‍♂️',
    rarity: 'legendary',
    type: 'weapon',
    slot: 'weapon',
    stats: { intelligence: 25, spellPower: 40, criticalChance: 12 },
    description: 'A powerful staff that channels elemental forces',
    level: 30
  },
  hands: {
    id: 'gloves_001',
    name: 'Spellweaver Gloves',
    icon: '🧤',
    rarity: 'rare',
    type: 'armor',
    slot: 'hands',
    stats: { intelligence: 8, castSpeed: 15, mana: 30 },
    description: 'Gloves that enhance spellcasting speed',
    level: 20
  },
  ring1: {
    id: 'ring_001',
    name: 'Ring of Wisdom',
    icon: '💍',
    rarity: 'uncommon',
    type: 'accessory',
    slot: 'ring1',
    stats: { intelligence: 6, mana: 25 },
    description: 'A simple ring that enhances mental acuity',
    level: 15
  }
}

interface EquipmentPanelProps {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
}

export function EquipmentPanel({
  isCollapsed = false,
  onToggleCollapse,
  className = ''
}: EquipmentPanelProps) {
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null)
  const [equippedItems, setEquippedItems] = useState<Record<string, EquipmentItem>>(mockEquippedItems)
  
  const { getInventory } = useInventory()

  useEffect(() => {
    // Load equipment data
    const loadEquipment = async () => {
      try {
        // In a real implementation, this would load equipped items from the character service
        // For now, using mock data
        console.log('Loading equipment data...')
      } catch (error) {
        console.error('Failed to load equipment:', error)
      }
    }

    loadEquipment()
  }, [])

  const handleSlotSelect = (item: EquipmentItem | null) => {
    setSelectedItem(item)
  }

  const handleUnequip = (slotType: string) => {
    setEquippedItems(prev => {
      const updated = { ...prev }
      delete updated[slotType]
      return updated
    })
    setSelectedItem(null)
  }

  const equipmentSlots = ['head', 'neck', 'chest', 'hands', 'legs', 'feet', 'weapon', 'offhand', 'ring1', 'ring2']

  const totalStats = Object.values(equippedItems).reduce((acc, item) => {
    if (item.stats) {
      Object.entries(item.stats).forEach(([stat, value]) => {
        acc[stat] = (acc[stat] || 0) + value
      })
    }
    return acc
  }, {} as Record<string, number>)

  if (isCollapsed) {
    return (
      <div className={`bg-dark-800 border border-dark-700 rounded-lg p-2 ${className}`}>
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-between text-white hover:text-amber-400 transition-colors"
        >
          <span className="text-sm font-medium">Equipment</span>
          <span className="text-lg">▼</span>
        </button>
      </div>
    )
  }

  return (
    <div className={`bg-dark-800 border border-dark-700 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-dark-700 p-3 border-b border-dark-600">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Equipment</h3>
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

      <div className="p-4">
        {/* Equipment Grid */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {equipmentSlots.map((slotType) => (
            <EquipmentSlot
              key={slotType}
              slotType={slotType}
              item={equippedItems[slotType]}
              isSelected={selectedItem?.id === equippedItems[slotType]?.id}
              onSelect={handleSlotSelect}
              onUnequip={handleUnequip}
              className="mx-auto"
            />
          ))}
        </div>

        {/* Selected Item Details */}
        {selectedItem && (
          <div className="bg-dark-700 rounded-lg p-3 mb-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{selectedItem.icon}</span>
                  <h4 className="font-semibold text-white">{selectedItem.name}</h4>
                </div>
                <p className="text-xs text-gray-400 capitalize">
                  {selectedItem.rarity} {selectedItem.type}
                </p>
              </div>
              {selectedItem.level && (
                <div className="text-xs text-amber-400 bg-dark-600 px-2 py-1 rounded">
                  Lv. {selectedItem.level}
                </div>
              )}
            </div>

            {selectedItem.description && (
              <p className="text-sm text-gray-300 mb-2">{selectedItem.description}</p>
            )}

            {selectedItem.stats && (
              <div className="text-xs">
                <div className="text-gray-400 mb-1">Stats:</div>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(selectedItem.stats).map(([stat, value]) => (
                    <div key={stat} className="flex justify-between">
                      <span className="text-gray-300 capitalize">
                        {stat.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-green-400">+{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedItem.setBonusId && (
              <div className="mt-2 p-2 bg-emerald-900/20 border border-emerald-700 rounded">
                <div className="text-xs text-emerald-400">
                  Set: {selectedItem.setBonusId.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Equipment Stats Summary */}
        <EquipmentStats stats={totalStats} />
      </div>
    </div>
  )
}