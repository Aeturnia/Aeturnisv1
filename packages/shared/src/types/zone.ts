export type ZoneId = string

export interface ZoneData {
  id: ZoneId
  name: string
  description: string
  level: { min: number; max: number }
  type: 'outdoor' | 'dungeon' | 'city' | 'instance'
  parentZoneId?: ZoneId
  boundaries: {
    minX: number
    maxX: number
    minY: number
    maxY: number
    minZ: number
    maxZ: number
  }
}