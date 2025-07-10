export interface CombatSessionData {
  id: string
  participants: CombatParticipant[]
  currentTurn: number
  turnOrder: string[]
  isActive: boolean
  startedAt: Date
  endedAt?: Date
  winner?: string
}

export interface CombatParticipant {
  id: string
  type: 'player' | 'monster' | 'npc'
  health: number
  maxHealth: number
  mana: number
  maxMana: number
  stamina: number
  maxStamina: number
  buffs: Buff[]
  debuffs: Debuff[]
}

export interface Buff {
  id: string
  name: string
  duration: number
  effect: string
}

export interface Debuff {
  id: string
  name: string
  duration: number
  effect: string
}

export interface CombatActionRequest {
  sessionId: string
  action: 'attack' | 'defend' | 'flee' | 'ability'
  targetId?: string
  abilityId?: string
}

export interface ProcessedCombatAction {
  id: string
  sessionId: string
  actorId: string
  targetId?: string
  action: string
  damage?: number
  healing?: number
  effects: string[]
  timestamp: Date
}

export interface CombatStats {
  totalDamageDealt: number
  totalDamageTaken: number
  totalHealing: number
  criticalHits: number
  dodges: number
  blocks: number
}

export interface StartCombatRequest {
  targetId: string
  targetType: 'monster' | 'player'
  initiatorId: string
  initiatorPosition?: { x: number; y: number; z: number }
}