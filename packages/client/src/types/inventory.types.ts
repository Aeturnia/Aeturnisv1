/**
 * Inventory and equipment types for frontend components
 */

export type EquipmentSlot = 
  | 'head'
  | 'neck'
  | 'chest'
  | 'hands'
  | 'legs'
  | 'feet'
  | 'weapon'
  | 'offhand'
  | 'ring1'
  | 'ring2'

export interface EquippedItem {
  id: string
  name: string
  rarity?: string
  level?: number
  stats?: Record<string, number>
}

export interface InventoryItem {
  id: string
  name: string
  type: string
  rarity?: string
  level?: number
  quantity: number
  stats?: Record<string, number>
  description?: string
}

export interface Equipment {
  [K in EquipmentSlot]?: EquippedItem
}

export interface EquipmentStats {
  damage?: number
  defense?: number
  health?: number
  mana?: number
  strength?: number
  dexterity?: number
  intelligence?: number
  vitality?: number
  wisdom?: number
  charisma?: number
}

export interface InventoryResponse {
  items: InventoryItem[]
  totalSlots: number
  usedSlots: number
}

export interface EquipmentResponse {
  equipment: Equipment
  stats: EquipmentStats
}