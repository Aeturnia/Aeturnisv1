import { Item } from './item';

export interface BankSlot {
  slot: number;
  itemId?: number;
  quantity: number;
  item?: Item; // populated on fetch
}

export interface BankTransferRequest {
  fromType: 'inventory' | 'bank' | 'sharedBank';
  toType: 'inventory' | 'bank' | 'sharedBank';
  fromSlot: number;
  toSlot: number;
  quantity?: number;
}

export interface BankExpansionRequest {
  slots: number; // number of slots to add
}

export interface PersonalBank {
  characterId: string;
  slots: BankSlot[];
  maxSlots: number;
}

export interface SharedBank {
  userId: string;
  slots: BankSlot[];
  lastAccessedBy?: string;
  lastAccessedAt?: Date;
}

export interface BankTransaction {
  id: string;
  characterId: string;
  bankType: 'personal' | 'shared';
  action: 'deposit' | 'withdraw';
  slot: number;
  itemId: number;
  quantity: number;
  timestamp: Date;
}