import { config } from 'dotenv';

// Load environment variables
config();

export interface GameConfig {
  maxPlayersPerZone: number;
  combatTimeoutSeconds: number;
  movementCooldownMs: number;
  maxLevel: number;
  baseExperience: number;
  experienceScaling: number;
  maxInventorySlots: number;
  maxCharactersPerAccount: number;
  autoSaveIntervalMs: number;
  sessionTimeoutMs: number;
}

export const gameConfig: GameConfig = {
  maxPlayersPerZone: parseInt(process.env.MAX_PLAYERS_PER_ZONE || '100'),
  combatTimeoutSeconds: parseInt(process.env.COMBAT_TIMEOUT_SECONDS || '30'),
  movementCooldownMs: parseInt(process.env.MOVEMENT_COOLDOWN_MS || '1000'),
  maxLevel: parseInt(process.env.MAX_LEVEL || '999999'),
  baseExperience: parseInt(process.env.BASE_EXPERIENCE || '100'),
  experienceScaling: parseFloat(process.env.EXPERIENCE_SCALING || '1.15'),
  maxInventorySlots: parseInt(process.env.MAX_INVENTORY_SLOTS || '50'),
  maxCharactersPerAccount: parseInt(process.env.MAX_CHARACTERS_PER_ACCOUNT || '5'),
  autoSaveIntervalMs: parseInt(process.env.AUTO_SAVE_INTERVAL_MS || '300000'), // 5 minutes
  sessionTimeoutMs: parseInt(process.env.SESSION_TIMEOUT_MS || '3600000'), // 1 hour
};

export default gameConfig;