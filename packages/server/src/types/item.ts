export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  value: number;
  stackable: boolean;
  maxStack?: number;
  weight: number;
  icon?: string;
  metadata?: Record<string, unknown>;
}

export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable',
  MATERIAL = 'material',
  QUEST = 'quest',
  MISC = 'misc',
}

export enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
  MYTHIC = 'mythic',
}

export interface ItemInstance {
  id: string;
  itemId: string;
  quantity: number;
  durability?: number;
  enchantments?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventorySlot {
  slot: number;
  itemInstance: ItemInstance | null;
}

export interface ItemStack {
  itemId: string;
  quantity: number;
  metadata?: Record<string, unknown>;
}

// Types and enums only - no default export needed