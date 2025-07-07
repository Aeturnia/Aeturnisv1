export interface IDeathEvent {
  characterId: string;
  reason: DeathReason;
  killerId?: string;
  context?: IDeathContext;
  deathAt: Date;
  zoneId: string;
  position: { x: number; y: number };
}

export enum DeathReason {
  COMBAT = 'combat',
  FALL_DAMAGE = 'fall_damage',
  ENVIRONMENTAL = 'environmental',
  ADMIN = 'admin',
  UNKNOWN = 'unknown'
}

export interface IDeathContext {
  damageType?: string;
  lastDamageSource?: string;
  combatSessionId?: string;
}

export interface IPenaltyBreakdown {
  xpLoss: number;
  xpLossPercentage: number;
  durabilityDamage: IDurabilityPenalty[];
  goldLoss?: number;
}

export interface IDurabilityPenalty {
  itemId: string;
  slot: string;
  damagePercent: number;
  newDurability: number;
}

export interface IRespawnPoint {
  id: string;
  zoneId: string;
  x: number;
  y: number;
  isGraveyard: boolean;
  name: string;
  restrictions: IRespawnRestrictions;
}

export interface IRespawnRestrictions {
  minLevel?: number;
  maxLevel?: number;
  requiredQuests?: string[];
  faction?: string;
}

export interface IDeathStatus {
  isDead: boolean;
  deathAt?: string;
  canRespawn: boolean;
  respawnCooldownMs: number;
  availableReviveTypes: ReviveType[];
}

export enum ReviveType {
  SELF_RESPAWN = 'self_respawn',
  ITEM_REVIVE = 'item_revive',
  SPELL_REVIVE = 'spell_revive',
  PLAYER_ASSIST = 'player_assist',
  ADMIN_REVIVE = 'admin_revive'
}

// Request/Response DTOs
export interface IDeathRequest {
  reason: DeathReason;
  killerId?: string;
  context?: IDeathContext;
}

export interface IDeathResponse {
  success: boolean;
  deathAt: string;
  penalties: IPenaltyBreakdown;
}

export interface IRespawnResponse {
  success: boolean;
  location: {
    zoneId: string;
    x: number;
    y: number;
  };
  revivedAt: string;
}

export interface IDeathStatusResponse extends IDeathStatus {}