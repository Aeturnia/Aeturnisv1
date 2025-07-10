export interface BankData {
  id: string
  characterId: string
  items: BankItem[]
  maxSlots: number
  type: BankType
  lastAccessed: Date
}

export interface BankItem {
  id: string
  itemId: string
  quantity: number
  slot: number
}

export enum BankType {
  PERSONAL = 'personal',
  SHARED = 'shared',
  GUILD = 'guild'
}