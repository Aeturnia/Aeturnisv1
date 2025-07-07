import { MockNPCService } from '../../mock/MockNPCService';

describe('MockNPCService', () => {
  let service: MockNPCService;

  beforeEach(() => {
    service = new MockNPCService();
  });

  describe('getNPCsInZone', () => {
    it('should return NPCs for a valid zone', async () => {
      const npcs = await service.getNPCsInZone('starter-zone');
      
      expect(npcs).toBeDefined();
      expect(Array.isArray(npcs)).toBe(true);
      expect(npcs.length).toBeGreaterThan(0);
      
      // Verify NPC structure
      const npc = npcs[0];
      expect(npc).toHaveProperty('id');
      expect(npc).toHaveProperty('name');
      expect(npc).toHaveProperty('npcType');
      expect(npc).toHaveProperty('position');
      expect(npc).toHaveProperty('isInteractable');
    });

    it('should return different NPCs for different zones', async () => {
      const starterNpcs = await service.getNPCsInZone('starter-zone');
      const marketNpcs = await service.getNPCsInZone('market-zone');
      
      expect(starterNpcs[0].id).not.toBe(marketNpcs[0].id);
      expect(starterNpcs[0].name).not.toBe(marketNpcs[0].name);
    });

    it('should return empty array for unknown zone', async () => {
      const npcs = await service.getNPCsInZone('unknown-zone');
      expect(npcs).toEqual([]);
    });
  });

  describe('getNPCById', () => {
    it('should return NPC by id', async () => {
      const npcs = await service.getNPCsInZone('starter-zone');
      const npcId = npcs[0].id;
      
      const npc = await service.getNPCById(npcId);
      
      expect(npc).toBeDefined();
      expect(npc?.id).toBe(npcId);
    });

    it('should return null for non-existent NPC', async () => {
      const npc = await service.getNPCById('non-existent');
      expect(npc).toBeNull();
    });
  });

  describe('startInteraction', () => {
    it('should start an interaction with an NPC', async () => {
      const npcs = await service.getNPCsInZone('starter-zone');
      const npcId = npcs[0].id;
      
      const interaction = await service.startInteraction(npcId, 'character-001');
      
      expect(interaction).toBeDefined();
      expect(interaction.id).toContain('interaction-');
      expect(interaction.npcId).toBe(npcId);
      expect(interaction.characterId).toBe('character-001');
      expect(interaction.currentNodeId).toBe('greeting');
    });

    it('should throw error for non-existent NPC', async () => {
      await expect(
        service.startInteraction('non-existent', 'character-001')
      ).rejects.toThrow('NPC non-existent not found');
    });
  });

  describe('advanceDialogue', () => {
    it('should advance dialogue based on choice', async () => {
      const npcs = await service.getNPCsInZone('starter-zone');
      const npcId = npcs[0].id;
      
      const interaction = await service.startInteraction(npcId, 'character-001');
      const response = await service.advanceDialogue(interaction.id, '1');
      
      expect(response).toBeDefined();
      expect(response.nodeId).toBeDefined();
      expect(response.text).toBeDefined();
      expect(response.choices).toBeDefined();
      expect(Array.isArray(response.choices)).toBe(true);
    });

    it('should end dialogue on goodbye choice', async () => {
      const npcs = await service.getNPCsInZone('starter-zone');
      const npcId = npcs[0].id;
      
      const interaction = await service.startInteraction(npcId, 'character-001');
      const response = await service.advanceDialogue(interaction.id, '999');
      
      expect(response.isComplete).toBe(true);
      expect(response.text).toContain('Goodbye');
    });
  });

  describe('getQuestGivers', () => {
    it('should return NPCs that give quests', async () => {
      const questGivers = await service.getQuestGivers();
      
      expect(questGivers).toBeDefined();
      expect(Array.isArray(questGivers)).toBe(true);
      expect(questGivers.length).toBeGreaterThan(0);
      
      // All quest givers should have questGiver flag
      questGivers.forEach(npc => {
        expect(npc.questGiver).toBe(true);
      });
    });
  });

  describe('getMerchants', () => {
    it('should return NPCs that are merchants', async () => {
      const merchants = await service.getMerchants();
      
      expect(merchants).toBeDefined();
      expect(Array.isArray(merchants)).toBe(true);
      expect(merchants.length).toBeGreaterThan(0);
      
      // All merchants should have shopkeeper flag
      merchants.forEach(npc => {
        expect(npc.shopkeeper).toBe(true);
      });
    });
  });

  describe('getInteractionHistory', () => {
    it('should return empty array for new character', async () => {
      const history = await service.getInteractionHistory('new-character');
      
      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBe(0);
    });

    it('should track interaction history', async () => {
      const npcs = await service.getNPCsInZone('starter-zone');
      const npcId = npcs[0].id;
      const characterId = 'test-character';
      
      // Start interaction
      await service.startInteraction(npcId, characterId);
      
      // Check history
      const history = await service.getInteractionHistory(characterId);
      expect(history.length).toBe(1);
      expect(history[0].npcId).toBe(npcId);
      expect(history[0].characterId).toBe(characterId);
    });
  });
});