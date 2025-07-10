import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTouch } from '../../hooks/useTouch'

interface InventoryItem {
  id: string
  name: string
  icon: string
  quantity: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  description: string
}

const mockInventory: InventoryItem[] = [
  { id: '1', name: 'Iron Sword', icon: '⚔️', quantity: 1, rarity: 'common', description: 'A basic iron sword' },
  { id: '2', name: 'Health Potion', icon: '🧪', quantity: 5, rarity: 'common', description: 'Restores 50 HP' },
  { id: '3', name: 'Magic Staff', icon: '🪄', quantity: 1, rarity: 'rare', description: 'Increases magic power' },
  { id: '4', name: 'Shield', icon: '🛡️', quantity: 1, rarity: 'uncommon', description: 'Provides defense' },
  { id: '5', name: 'Dragon Scale', icon: '🐉', quantity: 3, rarity: 'epic', description: 'Rare crafting material' },
  { id: '6', name: 'Ancient Artifact', icon: '🏺', quantity: 1, rarity: 'legendary', description: 'Mysterious power' },
]

export function InventoryScreen() {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const { hapticFeedback } = useTouch({
    onTap: () => {
      hapticFeedback('light')
    }
  })

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500'
      case 'uncommon': return 'border-green-500'
      case 'rare': return 'border-blue-500'
      case 'epic': return 'border-purple-500'
      case 'legendary': return 'border-yellow-500'
      default: return 'border-gray-500'
    }
  }

  return (
    <motion.div
      className="h-full bg-dark-900 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
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
          <span className="text-dark-400">Items: {mockInventory.length}/50</span>
          <span className="text-dark-400">Weight: 25.5/100 kg</span>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="flex-1 overflow-y-auto momentum-scroll">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
            {mockInventory.map((item) => (
              <motion.div
                key={item.id}
                className={`card p-2 border-2 ${getRarityColor(item.rarity)} cursor-pointer relative`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedItem(item)
                  hapticFeedback('light')
                }}
              >
                <div className="text-2xl text-center mb-1">{item.icon}</div>
                <div className="text-xs text-center text-white truncate">{item.name}</div>
                {item.quantity > 1 && (
                  <div className="absolute top-1 right-1 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {item.quantity}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {mockInventory.map((item) => (
              <motion.div
                key={item.id}
                className={`card p-3 border-l-4 ${getRarityColor(item.rarity)} cursor-pointer flex items-center space-x-3`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedItem(item)
                  hapticFeedback('light')
                }}
              >
                <div className="text-2xl">{item.icon}</div>
                <div className="flex-1">
                  <div className="text-white font-medium">{item.name}</div>
                  <div className="text-xs text-dark-400">{item.description}</div>
                </div>
                {item.quantity > 1 && (
                  <div className="bg-primary-500 text-white text-sm rounded-full px-2 py-1">
                    {item.quantity}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedItem(null)}
        >
          <motion.div
            className="card p-6 max-w-sm w-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">{selectedItem.icon}</div>
              <h3 className="text-xl font-bold text-white">{selectedItem.name}</h3>
              <p className="text-sm text-dark-400 capitalize">{selectedItem.rarity}</p>
            </div>
            
            <p className="text-white mb-4">{selectedItem.description}</p>
            
            {selectedItem.quantity > 1 && (
              <p className="text-sm text-dark-400 mb-4">Quantity: {selectedItem.quantity}</p>
            )}
            
            <div className="flex space-x-2">
              <button className="btn-touch btn-primary flex-1">Use</button>
              <button className="btn-touch btn-secondary flex-1">Drop</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}