export interface Item {
  id: number;
  name: string;
  type: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  value: number;
  stackable: boolean;
  maxStack: number;
  description?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
}

export interface ItemStack {
  itemId: number;
  quantity: number;
  metadata?: Record<string, unknown>;
}