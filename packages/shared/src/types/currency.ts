export interface CurrencyBalance {
  characterId: string
  gold: number
  silver: number
  copper: number
  premiumCurrency?: number
  lastUpdated: Date
}

export interface CurrencyAmount {
  gold?: number
  silver?: number
  copper?: number
  premiumCurrency?: number
}

export enum TransactionSource {
  QUEST = 'quest',
  COMBAT = 'combat',
  TRADE = 'trade',
  VENDOR = 'vendor',
  MAIL = 'mail',
  AUCTION = 'auction',
  ADMIN = 'admin'
}

export interface TransactionMetadata {
  source: TransactionSource
  sourceId?: string
  description?: string
  timestamp: Date
}