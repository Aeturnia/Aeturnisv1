/**
 * Combat Controller Unit Tests
 */
import { Request, Response } from 'express';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as combatController from '../../../controllers/combat.controller';
import { ServiceProvider } from '../../../providers';
import { CombatActionType } from '../../../types/combat.types';
import { 
  createMockRequest, 
  createMockResponse,
  expectCalledWith
} from '../../helpers';

// Mock dependencies
vi.mock('../../../providers');
vi.mock('../../../utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

describe('Combat Controller', () => {
  let mockRequest: Request;
  let mockResponse: Response;
  let mockCombatService: any;
  let mockServiceProvider: any;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock services
    mockCombatService = {
      getSession: vi.fn(),
      performAction: vi.fn(),
      startCombat: vi.fn(),
      endCombat: vi.fn()
    };
    
    mockServiceProvider = {
      get: vi.fn((serviceName: string) => {
        if (serviceName === 'CombatService') return mockCombatService;
        return null;
      })
    };
    
    (ServiceProvider.getInstance as any) = vi.fn(() => mockServiceProvider);
    
    // Setup mock request and response
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
  });
  
  describe('getPlayerStats', () => {
    it('should return mock player stats successfully', async () => {
      await combatController.getPlayerStats(mockRequest, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Player stats retrieved successfully',
        data: expect.objectContaining({
          charId: 'player_test_001',
          name: 'Hero Player',
          level: 25,
          stats: expect.objectContaining({
            strength: 28,
            attack: 45,
            defense: 32
          }),
          resources: expect.objectContaining({
            hp: 180,
            maxHp: 180
          })
        })
      });
    });
    
    it('should handle errors gracefully', async () => {
      // Force an error by mocking JSON to throw
      mockResponse.json = vi.fn().mockImplementationOnce(() => {
        throw new Error('Test error');
      });
      
      await combatController.getPlayerStats(mockRequest, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
  
  describe('getCombatSession', () => {
    it('should return combat session when found', async () => {
      const mockSession = {
        id: 'session-123',
        status: 'active',
        roundNumber: 3,
        currentTurn: 0,
        participants: [
          { charId: 'player-1', charName: 'Hero' },
          { charId: 'goblin-1', charName: 'Goblin' }
        ],
        turnOrder: ['player-1', 'goblin-1']
      };
      
      mockRequest.params = { sessionId: 'session-123' };
      mockCombatService.getSession.mockResolvedValueOnce(mockSession);
      
      await combatController.getCombatSession(mockRequest, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Combat session retrieved successfully',
        data: {
          session: mockSession,
          plainText: expect.stringContaining('Combat Status: ACTIVE')
        }
      });
      expect(mockCombatService.getSession).toHaveBeenCalledWith('session-123');
    });
    
    it('should return 400 when session ID is missing', async () => {
      mockRequest.params = {};
      
      await combatController.getCombatSession(mockRequest, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Session ID is required'
      });
    });
    
    it('should return 404 when session not found', async () => {
      mockRequest.params = { sessionId: 'non-existent' };
      mockCombatService.getSession.mockResolvedValueOnce(null);
      
      await combatController.getCombatSession(mockRequest, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Combat session not found'
      });
    });
    
    it('should handle service errors', async () => {
      mockRequest.params = { sessionId: 'session-123' };
      mockCombatService.getSession.mockRejectedValueOnce(new Error('Database error'));
      
      await combatController.getCombatSession(mockRequest, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });
  
  describe('performTestAction', () => {
    const validActionRequest = {
      sessionId: 'session-123',
      action: 'attack',
      targetId: 'goblin-1'
    };
    
    beforeEach(() => {
      mockRequest.body = { ...validActionRequest };
    });
    
    it('should perform combat action successfully', async () => {
      const mockResult = {
        success: true,
        damage: 25,
        targetHealth: 75,
        log: 'Hero attacks Goblin for 25 damage!'
      };
      
      mockCombatService.getSession.mockResolvedValueOnce({ id: 'session-123' });
      mockCombatService.performAction.mockResolvedValueOnce(mockResult);
      
      await combatController.performTestAction(mockRequest, mockResponse);
      
      expect(mockCombatService.performAction).toHaveBeenCalledWith(
        'session-123',
        '550e8400-e29b-41d4-a716-446655440000', // Mock player ID
        expect.objectContaining({
          type: CombatActionType.ATTACK,
          targetCharId: 'goblin-1',
          targetId: 'goblin-1',
          timestamp: expect.any(Number)
        })
      );
    });
    
    it('should return 400 when session ID is missing', async () => {
      mockRequest.body = { action: 'attack' };
      
      await combatController.performTestAction(mockRequest, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '🆔 Combat session ID is required!',
        hint: 'Start a combat session first to perform actions'
      });
    });
    
    it('should return 400 when action is missing', async () => {
      mockRequest.body = { sessionId: 'session-123' };
      
      await combatController.performTestAction(mockRequest, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '⚡ Action is required!',
        hint: 'Specify what you want to do: attack, defend, flee, etc.',
        availableActions: expect.arrayContaining(['attack', 'defend', 'flee'])
      });
    });
    
    it('should validate action type', async () => {
      mockRequest.body = {
        sessionId: 'session-123',
        action: 'invalid-action'
      };
      
      await combatController.performTestAction(mockRequest, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining('Invalid combat action!'),
        hint: 'Try: attack, defend, flee, useItem, useSkill, or pass',
        validActions: expect.arrayContaining(Object.values(CombatActionType))
      });
    });
    
    it('should auto-select target for attack actions when not provided', async () => {
      mockRequest.body = {
        sessionId: 'session-123',
        action: 'attack'
        // No targetId provided
      };
      
      mockCombatService.getSession.mockResolvedValueOnce({ id: 'session-123' });
      mockCombatService.performAction.mockResolvedValueOnce({ success: true });
      
      await combatController.performTestAction(mockRequest, mockResponse);
      
      expect(mockCombatService.performAction).toHaveBeenCalledWith(
        'session-123',
        expect.any(String),
        expect.objectContaining({
          targetCharId: 'test_goblin_001', // Auto-selected target
          targetId: 'test_goblin_001'
        })
      );
    });
    
    it('should handle combat service not available', async () => {
      mockServiceProvider.get.mockReturnValueOnce(null);
      
      await combatController.performTestAction(mockRequest, mockResponse);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'CombatService not available'
      });
    });
    
    it('should handle different action types', async () => {
      const actions = ['defend', 'flee', 'useItem', 'useSkill', 'pass'];
      
      for (const action of actions) {
        vi.clearAllMocks();
        
        mockRequest.body = {
          sessionId: 'session-123',
          action
        };
        
        mockCombatService.getSession.mockResolvedValueOnce({ id: 'session-123' });
        mockCombatService.performAction.mockResolvedValueOnce({ success: true });
        
        await combatController.performTestAction(mockRequest, mockResponse);
        
        expect(mockCombatService.performAction).toHaveBeenCalledWith(
          'session-123',
          expect.any(String),
          expect.objectContaining({
            type: action
          })
        );
      }
    });
  });
});