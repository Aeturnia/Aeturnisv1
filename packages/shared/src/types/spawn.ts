export interface SpawnConfig {
  id: string
  entityType: 'monster' | 'npc' | 'resource'
  entityId: string
  position: { x: number; y: number; z: number }
  respawnTime: number
  maxCount: number
  radius: number
  zoneId: string
}

export interface SpawnTimer {
  spawnConfigId: string
  lastSpawnTime: Date
  nextSpawnTime: Date
  currentCount: number
  isActive: boolean
}