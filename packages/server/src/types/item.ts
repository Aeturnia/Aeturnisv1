// Placeholder for item types - will be fully implemented in inventory system
export interface Item {
  id: number;
  name: string;
  description?: string;
  type: ItemType;
  rarity: ItemRarity;
  stackable: boolean;
  maxStack?: number;
  value: number; // gold value
}

export type ItemType = 'weapon' | 'armor' | 'consumable' | 'material' | 'quest' | 'misc';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';