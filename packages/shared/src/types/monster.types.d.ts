export declare enum MonsterState {
    IDLE = "idle",
    PATROL = "patrol",
    COMBAT = "combat",
    FLEE = "flee"
}
export declare enum AIBehavior {
    AGGRESSIVE = "aggressive",
    DEFENSIVE = "defensive",
    NEUTRAL = "neutral"
}
export interface Position3D {
    x: number;
    y: number;
    z: number;
}
export interface Monster {
    id: string;
    monsterTypeId: string;
    zoneId: string;
    position: Position3D;
    currentHp: number;
    maxHp: number;
    state: MonsterState;
    aggroRadius: number;
    targetId?: string;
    spawnPointId?: string;
}
export interface MonsterType {
    id: string;
    name: string;
    displayName: string;
    level: number;
    baseHp: number;
    baseAttack: number;
    baseDefense: number;
    experienceValue: number;
    lootTableId?: string;
    aiBehavior: AIBehavior;
    metadata: Record<string, unknown>;
}
export interface SpawnPoint {
    id: string;
    zoneId: string;
    position: Position3D;
    monsterTypeId: string;
    respawnTime: number;
    maxSpawns: number;
    isActive: boolean;
}
export interface MonsterSpawnRequest {
    spawnPointId: string;
}
export interface MonsterStateUpdateRequest {
    monsterId: string;
    newState: MonsterState;
    targetId?: string;
}
export interface Zone {
    id: string;
    name: string;
    displayName: string;
    level: number;
    maxPlayers: number;
    description?: string;
    metadata: Record<string, unknown>;
}
//# sourceMappingURL=monster.types.d.ts.map