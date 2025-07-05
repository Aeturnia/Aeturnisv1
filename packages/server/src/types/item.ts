export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: ItemType;
  rarity: ItemRarity;
  stackable: boolean;
  maxStack: number;
  soulbound: boolean;
  value: number;
  metadata?: Record<string, any>;
}

export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  CONSUMABLE = 'consumable',
  MATERIAL = 'material',
  QUEST = 'quest',
  CURRENCY = 'currency',
  MISC = 'misc'
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic'
}

export interface ItemStack {
  itemId: string;
  quantity: number;
}