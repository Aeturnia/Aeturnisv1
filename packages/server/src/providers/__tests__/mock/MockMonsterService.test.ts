import { MockMonsterService } from '../../mock/MockMonsterService';
import { MonsterState } from '@aeturnis/shared';

describe('MockMonsterService', () => {
  let service: MockMonsterService;

  beforeEach(() => {
    service = new MockMonsterService();
  });

  describe('getMonstersInZone', () => {
    it('should return monsters for a valid zone', async () => {
      const monsters = await service.getMonstersInZone('starter-zone');
      
      expect(monsters).toBeDefined();
      expect(Array.isArray(monsters)).toBe(true);
      expect(monsters.length).toBeGreaterThan(0);
      
      // Verify monster structure
      const monster = monsters[0];
      expect(monster).toHaveProperty('id');
      expect(monster).toHaveProperty('name');
      expect(monster).toHaveProperty('level');
      expect(monster).toHaveProperty('position');
      expect(monster).toHaveProperty('state');
    });

    it('should return different monsters for different zones', async () => {
      const starterMonsters = await service.getMonstersInZone('starter-zone');
      const forestMonsters = await service.getMonstersInZone('forest-zone');
      
      expect(starterMonsters[0].id).not.toBe(forestMonsters[0].id);
      expect(starterMonsters[0].name).not.toBe(forestMonsters[0].name);
    });

    it('should return empty array for unknown zone', async () => {
      const monsters = await service.getMonstersInZone('unknown-zone');
      expect(monsters).toEqual([]);
    });
  });

  describe('spawnMonster', () => {
    it('should spawn a monster at a spawn point', async () => {
      const monster = await service.spawnMonster('spawn-001');
      
      expect(monster).toBeDefined();
      expect(monster.id).toContain('monster-');
      expect(monster.spawnPointId).toBe('spawn-001');
      expect(monster.state).toBe(MonsterState.IDLE);
    });

    it('should add spawned monster to the zone', async () => {
      const initialMonsters = await service.getMonstersInZone('starter-zone');
      const initialCount = initialMonsters.length;
      
      await service.spawnMonster('spawn-001');
      
      const updatedMonsters = await service.getMonstersInZone('starter-zone');
      expect(updatedMonsters.length).toBe(initialCount + 1);
    });
  });

  describe('updateMonsterState', () => {
    it('should update monster state', async () => {
      const monsters = await service.getMonstersInZone('starter-zone');
      const monsterId = monsters[0].id;
      
      const updatedMonster = await service.updateMonsterState(
        monsterId, 
        MonsterState.IN_COMBAT
      );
      
      expect(updatedMonster.state).toBe(MonsterState.IN_COMBAT);
    });

    it('should throw error for non-existent monster', async () => {
      await expect(
        service.updateMonsterState('non-existent', MonsterState.DEAD)
      ).rejects.toThrow('Monster non-existent not found');
    });
  });

  describe('killMonster', () => {
    it('should remove monster from the zone', async () => {
      const monsters = await service.getMonstersInZone('starter-zone');
      const monsterId = monsters[0].id;
      const initialCount = monsters.length;
      
      await service.killMonster(monsterId);
      
      const updatedMonsters = await service.getMonstersInZone('starter-zone');
      expect(updatedMonsters.length).toBe(initialCount - 1);
      expect(updatedMonsters.find(m => m.id === monsterId)).toBeUndefined();
    });

    it('should not throw error for non-existent monster', async () => {
      await expect(
        service.killMonster('non-existent')
      ).resolves.not.toThrow();
    });
  });

  describe('getMonsterTypes', () => {
    it('should return list of monster types', async () => {
      const types = await service.getMonsterTypes();
      
      expect(types).toBeDefined();
      expect(Array.isArray(types)).toBe(true);
      expect(types.length).toBeGreaterThan(0);
      
      const type = types[0];
      expect(type).toHaveProperty('id');
      expect(type).toHaveProperty('name');
      expect(type).toHaveProperty('level');
      expect(type).toHaveProperty('baseStats');
    });
  });

  describe('getSpawnPoints', () => {
    it('should return spawn points for a zone', async () => {
      const spawnPoints = await service.getSpawnPoints('starter-zone');
      
      expect(spawnPoints).toBeDefined();
      expect(Array.isArray(spawnPoints)).toBe(true);
      expect(spawnPoints.length).toBeGreaterThan(0);
      
      const spawnPoint = spawnPoints[0];
      expect(spawnPoint).toHaveProperty('id');
      expect(spawnPoint).toHaveProperty('position');
      expect(spawnPoint).toHaveProperty('monsterTypeId');
      expect(spawnPoint).toHaveProperty('maxSpawns');
    });

    it('should return empty array for unknown zone', async () => {
      const spawnPoints = await service.getSpawnPoints('unknown-zone');
      expect(spawnPoints).toEqual([]);
    });
  });
});