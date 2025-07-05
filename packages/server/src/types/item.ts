export interface Item {
  id: number;
  name: string;
  description?: string;
  type: ItemType;
  rarity: ItemRarity;
  value: number;
  stackable: boolean;
  maxStack?: number;
  level?: number;
  stats?: ItemStats;
  metadata?: Record<string, unknown>;
}

export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  CONSUMABLE = 'consumable',
  MATERIAL = 'material',
  QUEST = 'quest',
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

export interface ItemStats {
  damage?: number;
  defense?: number;
  strength?: number;
  dexterity?: number;
  intelligence?: number;
  constitution?: number;
  wisdom?: number;
  charisma?: number;
}

export interface InventoryItem {
  slot: number;
  itemId: number;
  quantity: number;
  item?: Item;
}

export interface ItemTransferRequest {
  fromSlot: number;
  toSlot: number;
  quantity?: number;
}