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
} from '@aeturnis/shared';
import { logger } from '../utils/logger';
import { sendSuccess, sendError, sendValidationError } from '../utils/response.utils';

export class TutorialController {
  private tutorialService: MockTutorialService;

  constructor() {
    this.tutorialService = new MockTutorialService();
  }

  /**
   * Get tutorial zone information
   * GET /api/v1/tutorial/zone
   */
  async getTutorialZone(_req: Request, res: Response): Promise<Response> {
    try {
      const zone = await this.tutorialService.getTutorialZone();
      
      return sendSuccess(res, zone, 'Tutorial zone retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving tutorial zone:', error);
      return sendError(res, 'Failed to retrieve tutorial zone', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Get character's tutorial status
   * GET /api/v1/tutorial/status/:characterId
   */
  async getTutorialStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { characterId } = req.params;
      
      if (!characterId) {
        return sendValidationError(res, 'Character ID is required');
      }

      const status = await this.tutorialService.getTutorialStatus(characterId);
      
      return sendSuccess(res, status, `Tutorial status retrieved for character ${characterId}`);
    } catch (error) {
      logger.error('Error retrieving tutorial status:', error);
      return sendError(res, 'Failed to retrieve tutorial status', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Get all tutorial quests
   * GET /api/v1/tutorial/quests
   */
  async getAllQuests(_req: Request, res: Response): Promise<Response> {
    try {
      const quests = await this.tutorialService.getAllQuests();
      
      return sendSuccess(res, { quests, count: quests.length }, 'Tutorial quests retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving tutorial quests:', error);
      return sendError(res, 'Failed to retrieve tutorial quests', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Update tutorial progress
   * POST /api/v1/tutorial/progress
   */
  async updateProgress(req: Request, res: Response): Promise<Response> {
    try {
      const request: UpdateTutorialProgressRequest = req.body;
      
      if (!request.characterId || !request.questId || request.stepIndex === undefined) {
        return sendValidationError(res, 'Missing required fields: characterId, questId, stepIndex');
      }

      const result = await this.tutorialService.updateProgress(request);
      
      return sendSuccess(res, result, 'Tutorial progress updated successfully');
    } catch (error) {
      logger.error('Error updating tutorial progress:', error);
      return sendError(res, 'Failed to update tutorial progress', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Get contextual guidance for character
   * GET /api/v1/tutorial/guidance/:characterId
   */
  async getGuidance(req: Request, res: Response): Promise<Response> {
    try {
      const { characterId } = req.params;
      
      if (!characterId) {
        return sendValidationError(res, 'Character ID is required');
      }

      const guidance = await this.tutorialService.getGuidance(characterId);
      
      return sendSuccess(res, guidance, `Tutorial guidance retrieved for character ${characterId}`);
    } catch (error) {
      logger.error('Error retrieving tutorial guidance:', error);
      return sendError(res, 'Failed to retrieve tutorial guidance', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Get help messages based on context
   * GET /api/v1/tutorial/help?context=...&category=...
   */
  async getHelp(req: Request, res: Response): Promise<Response> {
    try {
      const { context, category } = req.query;
      
      const request: TutorialHelpRequest = {
        context: context as string || '',
        category: category as TutorialHelpCategory
      };

      const result = await this.tutorialService.getHelp(request);
      
      return sendSuccess(res, result, 'Help messages retrieved successfully');
    } catch (error) {
      logger.error('Error retrieving help messages:', error);
      return sendError(res, 'Failed to retrieve help messages', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Test endpoint for tutorial service
   * GET /api/v1/tutorial/test
   */
  async testTutorialService(_req: Request, res: Response): Promise<Response> {
    try {
      const zone = await this.tutorialService.getTutorialZone();
      const quests = await this.tutorialService.getAllQuests();
      const testStatus = await this.tutorialService.getTutorialStatus('test_player');
      const testGuidance = await this.tutorialService.getGuidance('test_player');
      
      return sendSuccess(res, {
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
      }, 'Tutorial service test completed successfully');
    } catch (error) {
      logger.error('Error in tutorial service test:', error);
      return sendError(res, 'Tutorial service test failed', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}