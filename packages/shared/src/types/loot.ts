export interface LootDrop {
  id: string
  itemId: string
  quantity: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  dropChance: number
}

export interface LootModifiers {
  dropRateBonus: number
  rarityBonus: number
  goldBonus: number
  experienceBonus: number
}

export interface ClaimLootRequest {
  lootId: string
  characterId: string
  sessionId: string
}

export interface LootHistory {
  id: string
  characterId: string
  itemId: string
  quantity: number
  source: string
  sourceType: 'monster' | 'chest' | 'quest' | 'boss'
  timestamp: Date
}