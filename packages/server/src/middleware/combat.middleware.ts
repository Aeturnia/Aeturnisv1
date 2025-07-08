import { Request, Response, NextFunction } from 'express';
import { CombatActionType } from '../types/combat.types';
import { testMonsterService } from '../services/TestMonsterService';

/**
 * Validate combat action request
 */
export const validateCombatAction = (req: Request, res: Response, next: NextFunction): void => {
  const { action } = req.body;

  if (!action) {
    res.status(400).json({
      success: false,
      message: 'Combat action is required'
    });
    return;
  }

  // Validate action type
  if (!Object.values(CombatActionType).includes(action.type)) {
    res.status(400).json({
      success: false,
      message: 'Invalid action type'
    });
    return;
  }

  // Validate target for actions that require one
  const targetRequiredActions = [CombatActionType.ATTACK, CombatActionType.USE_SKILL];
  if (targetRequiredActions.includes(action.type) && !action.targetCharId) {
    res.status(400).json({
      success: false,
      message: `${action.type} requires a target`
    });
    return;
  }

  // Validate item ID for USE_ITEM action
  if (action.type === CombatActionType.USE_ITEM && !action.itemId) {
    res.status(400).json({
      success: false,
      message: 'USE_ITEM action requires an item ID'
    });
    return;
  }

  // Validate skill ID for USE_SKILL action
  if (action.type === CombatActionType.USE_SKILL && !action.skillId) {
    res.status(400).json({
      success: false,
      message: 'USE_SKILL action requires a skill ID'
    });
    return;
  }

  // Add timestamp if not provided
  if (!action.timestamp) {
    action.timestamp = Date.now();
  }

  next();
};

/**
 * Validate combat start request
 */
export const validateCombatStart = (req: Request, res: Response, next: NextFunction): void => {
  const { targetIds, battleType } = req.body;

  if (!targetIds || !Array.isArray(targetIds) || targetIds.length === 0) {
    res.status(400).json({
      success: false,
      message: 'At least one target is required'
    });
    return;
  }

  if (targetIds.length > 5) {
    res.status(400).json({
      success: false,
      message: 'Maximum 5 targets allowed'
    });
    return;
  }

  // Validate target IDs format (UUID or test monster ID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const invalidTargets = targetIds.filter(id => {
    // Allow test monster IDs or valid UUIDs
    return !testMonsterService.isTestMonster(id) && !uuidRegex.test(id);
  });
  
  if (invalidTargets.length > 0) {
    res.status(400).json({
      success: false,
      message: 'Invalid target ID format (must be UUID or test monster ID)',
      details: { invalidTargets }
    });
    return;
  }

  // Validate battle type
  const validBattleTypes = ['pve', 'pvp', 'training'];
  if (!battleType || !validBattleTypes.includes(battleType)) {
    res.status(400).json({
      success: false,
      message: 'Valid battleType is required (pve, pvp, training)'
    });
    return;
  }

  next();
};

/**
 * Check if user is in combat
 */
export const checkCombatStatus = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // TODO: Implement actual combat status check
    // For now, allow all requests
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check combat status'
    });
  }
};

/**
 * Validate session ID parameter
 */
export const validateSessionId = (req: Request, res: Response, next: NextFunction): void => {
  const { sessionId } = req.params;

  if (!sessionId) {
    res.status(400).json({
      success: false,
      message: 'Session ID is required'
    });
    return;
  }

  // Basic UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(sessionId)) {
    res.status(400).json({
      success: false,
      message: 'Invalid session ID format'
    });
    return;
  }

  next();
};

// In-memory cooldown tracking for combat actions
const playerCooldowns = new Map<string, number>();

/**
 * Anti-spam cooldown for combat actions (3 seconds)
 */
export const combatActionCooldown = (req: Request, res: Response, next: NextFunction): void => {
  const userId = (req as any).user?.userId;
  
  if (!userId) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  const now = Date.now();
  const lastActionTime = playerCooldowns.get(userId) || 0;
  const cooldownMs = 3000; // 3 seconds
  const timeRemaining = Math.max(0, cooldownMs - (now - lastActionTime));

  if (timeRemaining > 0) {
    res.status(429).json({
      success: false,
      message: `⏰ Combat action cooldown active. Please wait ${Math.ceil(timeRemaining / 1000)} seconds before your next action.`,
      cooldownRemaining: timeRemaining
    });
    return;
  }

  // Update cooldown timestamp
  playerCooldowns.set(userId, now);
  
  next();
};