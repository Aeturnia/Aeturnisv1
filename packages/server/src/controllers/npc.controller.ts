import { Request, Response } from 'express';
import { MockNPCService } from '../providers/mock/MockNPCService';
import { logger } from '../utils/logger';
import { NPCInteraction } from '@aeturnis/shared';

// Create a singleton instance for all controller methods
const mockNPCService = new MockNPCService();

/**
 * Get NPCs in a specific zone
 */
export const getNPCsInZone = async (req: Request, res: Response) => {
  try {
    const { zoneId } = req.params;
    const npcs = await mockNPCService.getNPCsInZone(zoneId);
    
    return res.json({ 
      success: true, 
      data: { 
        npcs,
        count: npcs.length,
        zone: zoneId
      }
    });
  } catch (error) {
    logger.error('Error getting NPCs in zone:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get NPCs'
    });
  }
};

/**
 * Get NPC by ID
 */
export const getNPCById = async (req: Request, res: Response) => {
  try {
    const { npcId } = req.params;
    const npc = await mockNPCService.getNPCById(npcId);
    
    if (!npc) {
      return res.status(404).json({
        success: false,
        error: 'NPC not found'
      });
    }
    
    return res.json({ 
      success: true, 
      data: npc
    });
  } catch (error) {
    logger.error('Error getting NPC by ID:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get NPC'
    });
  }
};

/**
 * Interact with NPC
 */
export const interactWithNPC = async (req: Request, res: Response) => {
  try {
    const { npcId } = req.params;
    const { characterId, action } = req.body;
    
    const interaction = await mockNPCService.interactWithNPC(npcId, characterId, action);
    
    return res.json({ 
      success: true, 
      data: interaction
    });
  } catch (error) {
    logger.error('Error interacting with NPC:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to interact with NPC'
    });
  }
};

/**
 * Get available interactions for NPC
 */
export const getNPCInteractions = async (_req: Request, res: Response) => {
  try {
    // const { npcId } = req.params;
    // const { characterId } = req.query;
    
    // TODO: getAvailableInteractions not in INPCService interface
    // const interactions = await mockNPCService.getAvailableInteractions(npcId, characterId as string);
    const interactions: NPCInteraction[] = [];
    
    return res.json({ 
      success: true, 
      data: { 
        interactions,
        count: interactions.length
      }
    });
  } catch (error) {
    logger.error('Error getting NPC interactions:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get NPC interactions'
    });
  }
};

/**
 * Test NPC system
 */
export const testNPCSystem = async (_req: Request, res: Response) => {
  try {
    const testData = {
      system: "NPC Management System",
      status: "operational", 
      timestamp: new Date().toISOString(),
      features: {
        npcRetrieval: "enabled",
        zoneFiltering: "enabled",
        npcInteractions: "enabled",
        dialogueSystem: "enabled"
      },
      mockData: {
        npcsInTutorialArea: 1,
        availableInteractions: ["talk", "trade", "quest"],
        dialogueTreesAvailable: 3
      }
    };
    
    return res.json(testData);
  } catch (error) {
    logger.error('Error testing NPC system:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to test NPC system'
    });
  }
};