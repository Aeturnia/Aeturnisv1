// =============================================================================
// EQUIPMENT & INVENTORY TYPES
// =============================================================================

// Equipment slot constants
export const EQUIPMENT_SLOTS = {
  HEAD: 'head',
  CHEST: 'chest',
  LEGS: 'legs',
  FEET: 'feet',
  HANDS: 'hands',
  WEAPON: 'weapon',
  OFFHAND: 'offhand',
  RING1: 'ring1',
  RING2: 'ring2',
  NECK: 'neck',
} as const;

export type EquipmentSlotType = typeof EQUIPMENT_SLOTS[keyof typeof EQUIPMENT_SLOTS];

// Item types and rarities
export const ITEM_TYPES = {
  WEAPON: 'weapon',
  ARMOR: 'armor',
  ACCESSORY: 'accessory',
  CONSUMABLE: 'consumable',
  MATERIAL: 'material',
  QUEST: 'quest',
  MISC: 'misc',
} as const;

export type ItemType = typeof ITEM_TYPES[keyof typeof ITEM_TYPES];

export const ITEM_RARITIES = {
  COMMON: 'common',
  UNCOMMON: 'uncommon',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
  MYTHIC: 'mythic',
} as const;

export type ItemRarity = typeof ITEM_RARITIES[keyof typeof ITEM_RARITIES];

// Binding types
export const BIND_TYPES = {
  SOULBOUND: 'soulbound',
  ACCOUNT_BOUND: 'account_bound',
} as const;

export type BindType = typeof BIND_TYPES[keyof typeof BIND_TYPES];

// Stat types
export const STAT_TYPES = {
  STRENGTH: 'strength',
  DEXTERITY: 'dexterity',
  INTELLIGENCE: 'intelligence',
  WISDOM: 'wisdom',
  CONSTITUTION: 'constitution',
  CHARISMA: 'charisma',
  HEALTH: 'health',
  MANA: 'mana',
  STAMINA: 'stamina',
  DAMAGE: 'damage',
  MIN_DAMAGE: 'min_damage',
  MAX_DAMAGE: 'max_damage',
  DEFENSE: 'defense',
  CRITICAL_CHANCE: 'critical_chance',
  CRITICAL_DAMAGE: 'critical_damage',
  ATTACK_SPEED: 'attack_speed',
  MOVEMENT_SPEED: 'movement_speed',
} as const;

export type StatType = typeof STAT_TYPES[keyof typeof STAT_TYPES];

// Core interfaces
export interface Item {
  id: number;
  name: string;
  description?: string;
  itemType: ItemType;
  rarity: ItemRarity;
  levelRequirement: number;
  equipmentSlot?: EquipmentSlotType;
  maxStack: number;
  sellPrice: number;
  buyPrice: number;
  bindOnEquip: boolean;
  bindOnPickup: boolean;
  durability?: number;
  iconPath?: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EquipmentSlot {
  id: number;
  slotType: EquipmentSlotType;
  displayName: string;
  sortOrder: number;
  createdAt: Date;
}

export interface EquipmentItem {
  id: string;
  charId: string;
  slotType: EquipmentSlotType;
  itemId: number;
  durability: number;
  equippedAt: Date;
  item?: Item;
}

export interface InventoryItem {
  id: string;
  charId: string;
  itemId: number;
  quantity: number;
  slotPosition: number;
  bindStatus?: BindType;
  bindTime?: Date;
  durability?: number;
  obtainedAt: Date;
  item?: Item;
}

export interface ItemStat {
  id: number;
  itemId: number;
  statType: StatType;
  value: number;
  isPercentage: boolean;
}

export interface ItemSet {
  id: number;
  setName: string;
  description?: string;
  createdAt: Date;
}

export interface ItemSetPiece {
  id: number;
  setId: number;
  itemId: number;
}

export interface ItemSetBonus {
  id: number;
  setId: number;
  requiredPieces: number;
  bonusStats: Record<string, number>;
}

// Complex computed types
export interface EquipmentStats {
  baseStats: Record<StatType, number>;
  setBonuses: Record<StatType, number>;
  totalStats: Record<StatType, number>;
  activeSets: ActiveSetInfo[];
}

export interface ActiveSetInfo {
  setId: number;
  setName: string;
  equippedPieces: number;
  totalPieces: number;
  activeBonuses: ItemSetBonus[];
}

export interface ItemWithStats extends Item {
  stats: ItemStat[];
  setInfo?: {
    setId: number;
    setName: string;
    totalPieces: number;
  };
}

export interface InventoryItemWithDetails extends InventoryItem {
  item: ItemWithStats;
}

export interface EquipmentItemWithDetails extends EquipmentItem {
  item: ItemWithStats;
}

// Equipment management interfaces
export interface EquipmentSet {
  equipment: Record<EquipmentSlotType, EquipmentItem | null>;
  stats: EquipmentStats;
}

export interface InventoryData {
  items: InventoryItemWithDetails[];
  maxSlots: number;
  usedSlots: number;
  weight: number;
  maxWeight: number;
}

// API request/response types
export interface EquipItemRequest {
  inventorySlot: number;
  equipmentSlot: EquipmentSlotType;
}

export interface UnequipItemRequest {
  equipmentSlot: EquipmentSlotType;
}

export interface MoveInventoryItemRequest {
  fromSlot: number;
  toSlot: number;
}

export interface StackItemsRequest {
  fromSlot: number;
  toSlot: number;
  quantity?: number;
}

export interface DropItemRequest {
  slotPosition: number;
  quantity?: number;
}

export interface UseItemRequest {
  slotPosition: number;
  quantity?: number;
  targetId?: string; // For targeted consumables
}

// Equipment operation results
export interface EquipmentOperationResult {
  success: boolean;
  message: string;
  equipment?: EquipmentSet;
  inventory?: InventoryData;
  errors?: string[];
}

export interface InventoryOperationResult {
  success: boolean;
  message: string;
  inventory?: InventoryData;
  errors?: string[];
}

// Constants
export const MAX_INVENTORY_SLOTS = 100;
export const DEFAULT_INVENTORY_SIZE = 20;
export const MAX_ITEM_DURABILITY = 100;
export const REPAIR_COST_PERCENTAGE = 0.1; // 10% of item value per durability point

// Equipment slot configurations
export const EQUIPMENT_SLOT_CONFIG: Record<EquipmentSlotType, { displayName: string; sortOrder: number }> = {
  [EQUIPMENT_SLOTS.HEAD]: { displayName: 'Head', sortOrder: 1 },
  [EQUIPMENT_SLOTS.NECK]: { displayName: 'Neck', sortOrder: 2 },
  [EQUIPMENT_SLOTS.CHEST]: { displayName: 'Chest', sortOrder: 3 },
  [EQUIPMENT_SLOTS.HANDS]: { displayName: 'Hands', sortOrder: 4 },
  [EQUIPMENT_SLOTS.LEGS]: { displayName: 'Legs', sortOrder: 5 },
  [EQUIPMENT_SLOTS.FEET]: { displayName: 'Feet', sortOrder: 6 },
  [EQUIPMENT_SLOTS.WEAPON]: { displayName: 'Main Hand', sortOrder: 7 },
  [EQUIPMENT_SLOTS.OFFHAND]: { displayName: 'Off Hand', sortOrder: 8 },
  [EQUIPMENT_SLOTS.RING1]: { displayName: 'Ring 1', sortOrder: 9 },
  [EQUIPMENT_SLOTS.RING2]: { displayName: 'Ring 2', sortOrder: 10 },
};

// Item rarity colors (for UI)
export const RARITY_COLORS: Record<ItemRarity, string> = {
  [ITEM_RARITIES.COMMON]: '#ffffff',
  [ITEM_RARITIES.UNCOMMON]: '#1eff00',
  [ITEM_RARITIES.RARE]: '#0070dd',
  [ITEM_RARITIES.EPIC]: '#a335ee',
  [ITEM_RARITIES.LEGENDARY]: '#ff8000',
  [ITEM_RARITIES.MYTHIC]: '#e6cc80',
};

// Validation helpers
export const isValidEquipmentSlot = (slot: string): slot is EquipmentSlotType => {
  return Object.values(EQUIPMENT_SLOTS).includes(slot as EquipmentSlotType);
};

export const isValidItemType = (type: string): type is ItemType => {
  return Object.values(ITEM_TYPES).includes(type as ItemType);
};

export const isValidItemRarity = (rarity: string): rarity is ItemRarity => {
  return Object.values(ITEM_RARITIES).includes(rarity as ItemRarity);
};

export const isValidBindType = (bindType: string): bindType is BindType => {
  return Object.values(BIND_TYPES).includes(bindType as BindType);
};

export const isValidStatType = (statType: string): statType is StatType => {
  return Object.values(STAT_TYPES).includes(statType as StatType);
};