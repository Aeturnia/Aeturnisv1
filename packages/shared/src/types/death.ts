export interface DeathRequest {
  characterId: string
  killedBy: string
  killedByType: 'monster' | 'player' | 'environment'
  location: { x: number; y: number; z: number; zoneId: string }
  timestamp: Date
}

export interface DeathStatus {
  isDead: boolean
  deathTime?: Date
  deathLocation?: { x: number; y: number; z: number; zoneId: string }
  killedBy?: string
  respawnTime?: Date
  respawnLocation?: { x: number; y: number; z: number; zoneId: string }
  penaltiesApplied: boolean
}

export interface RespawnData {
  characterId: string
  respawnPoint: { x: number; y: number; z: number; zoneId: string }
  penaltyMultiplier: number
  goldLost: number
  experienceLost: number
}