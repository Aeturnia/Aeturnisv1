/**
 * Affinity Controller
 * Handles all affinity-related HTTP requests
 */

import { Request, Response } from 'express';
import { MockAffinityService } from '../services/mock/MockAffinityService';
import { 
  TrackWeaponUseRequest,
  TrackMagicUseRequest,
  GetAffinitySummaryRequest,
  WeaponType,
  MagicSchool,
  AffinityUsageContext
} from '@aeturnis/shared';
import { logger } from '../utils/logger';
import { sendValidationError } from '../utils/response.utils';

export class AffinityController {
  private affinityService: MockAffinityService;

  constructor() {
    this.affinityService = new MockAffinityService();
  }

  /**
   * Get affinity summary for character
   * GET /api/v1/affinity/summary/:characterId
   */
  async getAffinitySummary(req: Request, res: Response): Promise<Response> {
    try {
      const { characterId } = req.params;
      const { includeAchievements, includeMilestones } = req.query;
      
      if (!characterId) {
        return sendValidationError(res, 'Character ID is required');
      }

      const request: GetAffinitySummaryRequest = {
        characterId,
        includeAchievements: includeAchievements === 'true',
        includeMilestones: includeMilestones === 'true'
      };

      const result = await this.affinityService.getAffinitySummary(request);
      
      return res.status(200).json({
        success: true,
        data: result,
        message: `Affinity summary retrieved for character ${characterId}`
      });
    } catch (error) {
      logger.error('Error retrieving affinity summary:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve affinity summary',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Track weapon usage and update affinity
   * POST /api/v1/affinity/weapon/use
   */
  async trackWeaponUse(req: Request, res: Response): Promise<void> {
    try {
      const request: TrackWeaponUseRequest = req.body;
      
      if (!request.characterId || !request.weaponType || !request.usageData) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: characterId, weaponType, usageData'
        });
        return;
      }

      // Validate weapon type
      if (!Object.values(WeaponType).includes(request.weaponType)) {
        res.status(400).json({
          success: false,
          error: `Invalid weapon type: ${request.weaponType}`
        });
        return;
      }

      // Validate usage context
      if (!Object.values(AffinityUsageContext).includes(request.usageData.context)) {
        res.status(400).json({
          success: false,
          error: `Invalid usage context: ${request.usageData.context}`
        });
        return;
      }

      const result = await this.affinityService.trackWeaponUse(request);
      
      res.status(200).json({
        success: true,
        data: result,
        message: `Weapon usage tracked for ${request.weaponType}`
      });
    } catch (error) {
      logger.error('Error tracking weapon usage:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to track weapon usage',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Track magic usage and update affinity
   * POST /api/v1/affinity/magic/use
   */
  async trackMagicUse(req: Request, res: Response): Promise<void> {
    try {
      const request: TrackMagicUseRequest = req.body;
      
      if (!request.characterId || !request.school || !request.usageData) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: characterId, school, usageData'
        });
        return;
      }

      // Validate magic school
      if (!Object.values(MagicSchool).includes(request.school)) {
        res.status(400).json({
          success: false,
          error: `Invalid magic school: ${request.school}`
        });
        return;
      }

      // Validate usage context
      if (!Object.values(AffinityUsageContext).includes(request.usageData.context)) {
        res.status(400).json({
          success: false,
          error: `Invalid usage context: ${request.usageData.context}`
        });
        return;
      }

      const result = await this.affinityService.trackMagicUse(request);
      
      res.status(200).json({
        success: true,
        data: result,
        message: `Magic usage tracked for ${request.school}`
      });
    } catch (error) {
      logger.error('Error tracking magic usage:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to track magic usage',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test endpoint for affinity service
   * GET /api/v1/affinity/test
   */
  async testAffinityService(_req: Request, res: Response): Promise<void> {
    try {
      const testSummary = await this.affinityService.getAffinitySummary({
        characterId: 'test_player',
        includeAchievements: true,
        includeMilestones: true
      });

      const demoSummary = await this.affinityService.getAffinitySummary({
        characterId: 'demo_user',
        includeAchievements: false,
        includeMilestones: false
      });
      
      res.status(200).json({
        success: true,
        data: {
          test_player: {
            overallRank: testSummary.summary.overallRank,
            weaponCount: testSummary.summary.totalWeaponAffinities,
            magicCount: testSummary.summary.totalMagicAffinities,
            specializations: testSummary.summary.specializations
          },
          demo_user: {
            overallRank: demoSummary.summary.overallRank,
            weaponCount: demoSummary.summary.totalWeaponAffinities,
            magicCount: demoSummary.summary.totalMagicAffinities,
            specializations: demoSummary.summary.specializations
          },
          weaponTypes: Object.values(WeaponType),
          magicSchools: Object.values(MagicSchool),
          usageContexts: Object.values(AffinityUsageContext)
        },
        message: 'Affinity service test completed successfully'
      });
    } catch (error) {
      logger.error('Error in affinity service test:', error);
      res.status(500).json({
        success: false,
        error: 'Affinity service test failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Simulate weapon usage for testing
   * POST /api/v1/affinity/simulate/weapon
   */
  async simulateWeaponUse(req: Request, res: Response): Promise<void> {
    try {
      const { characterId, weaponType, experienceGained = 50, weaponName } = req.body;
      
      if (!characterId || !weaponType) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: characterId, weaponType'
        });
        return;
      }

      const request: TrackWeaponUseRequest = {
        characterId,
        weaponType,
        weaponName,
        usageData: {
          sessionId: `sim_${Date.now()}`,
          timestamp: new Date(),
          experienceGained,
          context: AffinityUsageContext.COMBAT,
          damageDealt: Math.floor(Math.random() * 100) + 20,
          criticalHit: Math.random() > 0.8
        }
      };

      const result = await this.affinityService.trackWeaponUse(request);
      
      res.status(200).json({
        success: true,
        data: result,
        message: `Simulated weapon usage for ${weaponType}`
      });
    } catch (error) {
      logger.error('Error simulating weapon usage:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to simulate weapon usage',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Simulate magic usage for testing
   * POST /api/v1/affinity/simulate/magic
   */
  async simulateMagicUse(req: Request, res: Response): Promise<void> {
    try {
      const { characterId, school, experienceGained = 40, spellName } = req.body;
      
      if (!characterId || !school) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: characterId, school'
        });
        return;
      }

      const request: TrackMagicUseRequest = {
        characterId,
        school,
        spellName,
        usageData: {
          sessionId: `sim_${Date.now()}`,
          timestamp: new Date(),
          experienceGained,
          context: AffinityUsageContext.COMBAT,
          damageDealt: Math.floor(Math.random() * 80) + 15
        }
      };

      const result = await this.affinityService.trackMagicUse(request);
      
      res.status(200).json({
        success: true,
        data: result,
        message: `Simulated magic usage for ${school}`
      });
    } catch (error) {
      logger.error('Error simulating magic usage:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to simulate magic usage',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}