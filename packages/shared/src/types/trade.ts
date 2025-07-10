export interface TradeData {
  id: string
  participant1: string
  participant2: string
  items1: TradeItem[]
  items2: TradeItem[]
  gold1: number
  gold2: number
  status: 'pending' | 'accepted' | 'cancelled' | 'completed'
  createdAt: Date
}

export interface TradeItem {
  itemId: string
  quantity: number
  slot: number
}