/**
 * Tutorial Controller
 * Handles all tutorial-related HTTP requests
 */

import { Request, Response } from 'express';
import { MockTutorialService } from '../services/mock/MockTutorialService';
import { 
  UpdateTutorialProgressRequest, 
  TutorialHelpRequest,
  TutorialHelpCategory 
} from '../../../shared/types/tutorial.types';
import { logger } from '../utils/logger';

export class TutorialController {
  private tutorialService: MockTutorialService;

  constructor() {
    this.tutorialService = new MockTutorialService();
  }

  /**
   * Get tutorial zone information
   * GET /api/v1/tutorial/zone
   */
  async getTutorialZone(req: Request, res: Response): Promise<void> {
    try {
      const zone = await this.tutorialService.getTutorialZone();
      
      res.status(200).json({
        success: true,
        data: zone,
        message: 'Tutorial zone retrieved successfully'
      });
    } catch (error) {
      logger.error('Error retrieving tutorial zone:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve tutorial zone',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get character's tutorial status
   * GET /api/v1/tutorial/status/:characterId
   */
  async getTutorialStatus(req: Request, res: Response): Promise<void> {
    try {
      const { characterId } = req.params;
      
      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'Character ID is required'
        });
        return;
      }

      const status = await this.tutorialService.getTutorialStatus(characterId);
      
      res.status(200).json({
        success: true,
        data: status,
        message: `Tutorial status retrieved for character ${characterId}`
      });
    } catch (error) {
      logger.error('Error retrieving tutorial status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve tutorial status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all tutorial quests
   * GET /api/v1/tutorial/quests
   */
  async getAllQuests(req: Request, res: Response): Promise<void> {
    try {
      const quests = await this.tutorialService.getAllQuests();
      
      res.status(200).json({
        success: true,
        data: quests,
        count: quests.length,
        message: 'Tutorial quests retrieved successfully'
      });
    } catch (error) {
      logger.error('Error retrieving tutorial quests:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve tutorial quests',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update tutorial progress
   * POST /api/v1/tutorial/progress
   */
  async updateProgress(req: Request, res: Response): Promise<void> {
    try {
      const request: UpdateTutorialProgressRequest = req.body;
      
      if (!request.characterId || !request.questId || request.stepIndex === undefined) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: characterId, questId, stepIndex'
        });
        return;
      }

      const result = await this.tutorialService.updateProgress(request);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Tutorial progress updated successfully'
      });
    } catch (error) {
      logger.error('Error updating tutorial progress:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update tutorial progress',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get contextual guidance for character
   * GET /api/v1/tutorial/guidance/:characterId
   */
  async getGuidance(req: Request, res: Response): Promise<void> {
    try {
      const { characterId } = req.params;
      
      if (!characterId) {
        res.status(400).json({
          success: false,
          error: 'Character ID is required'
        });
        return;
      }

      const guidance = await this.tutorialService.getGuidance(characterId);
      
      res.status(200).json({
        success: true,
        data: guidance,
        message: `Tutorial guidance retrieved for character ${characterId}`
      });
    } catch (error) {
      logger.error('Error retrieving tutorial guidance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve tutorial guidance',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get help messages based on context
   * GET /api/v1/tutorial/help?context=...&category=...
   */
  async getHelp(req: Request, res: Response): Promise<void> {
    try {
      const { context, category } = req.query;
      
      const request: TutorialHelpRequest = {
        context: context as string || '',
        category: category as TutorialHelpCategory
      };

      const result = await this.tutorialService.getHelp(request);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Help messages retrieved successfully'
      });
    } catch (error) {
      logger.error('Error retrieving help messages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve help messages',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test endpoint for tutorial service
   * GET /api/v1/tutorial/test
   */
  async testTutorialService(req: Request, res: Response): Promise<void> {
    try {
      const zone = await this.tutorialService.getTutorialZone();
      const quests = await this.tutorialService.getAllQuests();
      const testStatus = await this.tutorialService.getTutorialStatus('test_player');
      const testGuidance = await this.tutorialService.getGuidance('test_player');
      
      res.status(200).json({
        success: true,
        data: {
          zone: {
            id: zone.id,
            name: zone.name,
            npcs: zone.npcs.length
          },
          quests: {
            count: quests.length,
            questNames: quests.map(q => q.name)
          },
          testStatus: {
            characterId: testStatus.characterId,
            currentQuest: testStatus.currentQuestId,
            isComplete: testStatus.isComplete
          },
          testGuidance: {
            currentMessage: testGuidance.currentMessage,
            nextAction: testGuidance.nextAction
          }
        },
        message: 'Tutorial service test completed successfully'
      });
    } catch (error) {
      logger.error('Error in tutorial service test:', error);
      res.status(500).json({
        success: false,
        error: 'Tutorial service test failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}