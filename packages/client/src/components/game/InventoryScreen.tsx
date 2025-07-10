import { useState, useEffect } from 'react'
import { useTouch } from '../../hooks/useTouch'
import { useInventory, useCharacter } from '../../hooks/useServices'
import { InventoryItem, ItemRarity } from '../../types/inventory.types'

// Get icon for item type
const getItemIcon = (item: InventoryItem): string => {
  const itemType = item.item.itemType
  switch (itemType) {
    case 'weapon': return '⚔️'
    case 'armor': 
      if (item.item.equipmentSlot === 'head') return '🪖'
      if (item.item.equipmentSlot === 'chest') return '🛡️'
      return '🛡️'
    case 'consumable': return '🧪'
    case 'material': return '💎'
    case 'accessory': return '💍'
    default: return '📦'
  }
}

export function InventoryScreen() {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [inventoryStats, setInventoryStats] = useState({ usedSlots: 0, maxSlots: 100, weight: 0, maxWeight: 1000 })
  
  const { getInventory, dropItem } = useInventory()
  const { currentCharacter } = useCharacter()
  
  // Load inventory on mount or when character changes
  useEffect(() => {
    if (currentCharacter?.id) {
      loadInventory()
    }
  }, [currentCharacter])
  
  const loadInventory = async () => {
    if (!currentCharacter?.id) return
    
    try {
      setLoading(true)
      const inventoryData = await getInventory(currentCharacter.id)
      setInventory(inventoryData.items)
      setInventoryStats({
        usedSlots: inventoryData.usedSlots,
        maxSlots: inventoryData.maxSlots,
        weight: inventoryData.weight,
        maxWeight: inventoryData.maxWeight
      })
    } catch (error) {
      console.error('Failed to load inventory:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleDrop = async (item: InventoryItem) => {
    if (!currentCharacter?.id) return
    
    try {
      await dropItem(currentCharacter.id, item.id, item.quantity)
      setSelectedItem(null)
      await loadInventory() // Reload inventory
      hapticFeedback('success')
    } catch (error) {
      console.error('Failed to drop item:', error)
      hapticFeedback('error')
    }
  }
  
  const { hapticFeedback } = useTouch({
    onTap: () => {
      hapticFeedback('light')
    }
  })

  const getRarityColor = (rarity: ItemRarity) => {
    switch (rarity) {
      case 'common': return 'border-gray-500'
      case 'uncommon': return 'border-green-500'
      case 'rare': return 'border-blue-500'
      case 'epic': return 'border-purple-500'
      case 'legendary': return 'border-yellow-500'
      case 'mythic': return 'border-red-500'
      default: return 'border-gray-500'
    }
  }
  
  if (loading) {
    return (
      <div className="h-full bg-dark-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">🎒</div>
          <p className="text-white">Loading inventory...</p>
        </div>
      </div>
    )
  }
  
  if (!currentCharacter) {
    return (
      <div className="h-full bg-dark-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🎒</div>
          <p className="text-white">No character selected</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="h-full bg-dark-900 p-4"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Inventory</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`btn-touch px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-primary-500' : 'bg-dark-700'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`btn-touch px-3 py-1 rounded ${viewMode === 'list' ? 'bg-primary-500' : 'bg-dark-700'}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-dark-800 rounded-lg p-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-dark-400">Items: {inventoryStats.usedSlots}/{inventoryStats.maxSlots}</span>
          <span className="text-dark-400">Weight: {inventoryStats.weight}/{inventoryStats.maxWeight} kg</span>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="flex-1 overflow-y-auto momentum-scroll">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {inventory.map((item) => (
              <div
                key={item.id}
                className={`card p-2 border-2 ${getRarityColor(item.item.rarity)} cursor-pointer relative`}
                onClick={() => {
                  setSelectedItem(item)
                  hapticFeedback('light')
                }}
              >
                <div className="text-2xl text-center mb-1">{getItemIcon(item)}</div>
                <div className="text-xs text-center text-white truncate">{item.item.name}</div>
                {item.quantity > 1 && (
                  <div className="absolute top-1 right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.quantity}
                  </div>
                )}
              </div>
            ))}
            {inventory.length === 0 && (
              <div className="col-span-full text-center py-8 text-dark-400">
                <div className="text-4xl mb-2">📦</div>
                <p>Your inventory is empty</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {inventory.map((item) => (
              <div
                key={item.id}
                className={`card p-3 border-l-4 ${getRarityColor(item.item.rarity)} cursor-pointer flex items-center space-x-3`}
                onClick={() => {
                  setSelectedItem(item)
                  hapticFeedback('light')
                }}
              >
                <div className="text-2xl">{getItemIcon(item)}</div>
                <div className="flex-1">
                  <div className="text-white font-medium">{item.item.name}</div>
                  <div className="text-xs text-dark-400">{item.item.description}</div>
                </div>
                {item.quantity > 1 && (
                  <div className="bg-primary-500 text-white text-sm rounded-full px-2 py-1">
                    {item.quantity}
                  </div>
                )}
              </div>
            ))}
            {inventory.length === 0 && (
              <div className="text-center py-8 text-dark-400">
                <div className="text-4xl mb-2">📦</div>
                <p>Your inventory is empty</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="card p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{getItemIcon(selectedItem)}</div>
              <h3 className="text-xl font-bold text-white">{selectedItem.item.name}</h3>
              <p className="text-sm text-dark-400 capitalize">{selectedItem.item.rarity} {selectedItem.item.itemType}</p>
            </div>
            
            <p className="text-white mb-4">{selectedItem.item.description}</p>
            
            <div className="space-y-2 mb-4">
              {selectedItem.quantity > 1 && (
                <p className="text-sm text-dark-400">Quantity: {selectedItem.quantity}</p>
              )}
              {selectedItem.item.levelRequirement > 1 && (
                <p className="text-sm text-dark-400">Level Required: {selectedItem.item.levelRequirement}</p>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-dark-400">Buy Price:</span>
                <span className="text-yellow-400">{selectedItem.item.buyPrice} gold</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-dark-400">Sell Price:</span>
                <span className="text-yellow-400">{selectedItem.item.sellPrice} gold</span>
              </div>
            </div>
            
            {selectedItem.item.stats && selectedItem.item.stats.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-white mb-2">Stats:</h4>
                <div className="space-y-1">
                  {selectedItem.item.stats.map((stat, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-dark-400 capitalize">{stat.statType}:</span>
                      <span className="text-green-400">
                        +{stat.value}{stat.isPercentage ? '%' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex space-x-2">
              {selectedItem.item.itemType === 'consumable' && (
                <button className="btn-touch btn-primary flex-1">Use</button>
              )}
              {(selectedItem.item.itemType === 'weapon' || selectedItem.item.itemType === 'armor') && (
                <button className="btn-touch btn-primary flex-1">Equip</button>
              )}
              <button 
                className="btn-touch btn-secondary flex-1"
                onClick={() => handleDrop(selectedItem)}
              >
                Drop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}