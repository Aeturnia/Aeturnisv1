export interface Currency {
  gold: number;
}

export interface Transaction {
  id: string;
  characterId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  relatedCharacterId?: string;
  description?: string;
  metadata?: TransactionMetadata;
  createdAt: Date;
}

export type TransactionType = 'deposit' | 'withdraw' | 'transfer' | 'purchase' | 'sale' | 'reward' | 'quest' | 'trade';

export interface TransactionMetadata {
  itemId?: number;
  itemName?: string;
  quantity?: number;
  unitPrice?: number;
  source?: string;
  destination?: string;
  transferType?: 'send' | 'receive';
  questId?: number;
  npcId?: number;
  shopId?: number;
  tradeId?: string;
}

export interface TransferRequest {
  toCharacterId: string;
  amount: number;
  description?: string;
}

export interface TransactionFilter {
  type?: TransactionType;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}