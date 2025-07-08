/**
 * Mock Zone Service Implementation
 * Provides zone data, boundaries, and exit validation for testing
 */

import { Zone, ZoneListResponse, ZoneDetailsResponse, CharacterPosition } from '@aeturnis/shared';
import { logger } from '../../utils/logger';

export class MockZoneService {
  private zones: Map<string, Zone> = new Map();
  private characterPositions: Map<string, CharacterPosition> = new Map();

  constructor() {
    this.initializeMockZones();
    logger.info('MockZoneService initialized');
  }

  /**
   * Initialize mock zone data with interconnected world map
   */
  private initializeMockZones(): void {
    const mockZones: Zone[] = [
      {
        id: "starter_city",
        displayName: "Haven's Rest",
        description: "A peaceful city where adventurers begin their journey. The town square bustles with merchants and trainers.",
        coordinates: { x: 0, y: 0 },
        boundaries: { minX: -50, maxX: 50, minY: -50, maxY: 50 },
        exits: { north: "forest_edge", east: "trade_road" },
        type: "city",
        features: ["shops", "trainers", "bank", "quest_givers", "respawn_point"],
        levelRequirement: 1
      },
      {
        id: "forest_edge",
        displayName: "Whispering Woods Edge",
        description: "The border between civilization and the wild forest. Ancient trees tower overhead, their branches swaying in the breeze.",
        coordinates: { x: 0, y: 100 },
        boundaries: { minX: -50, maxX: 50, minY: 50, maxY: 150 },
        exits: { south: "starter_city", north: "deep_forest", east: "goblin_camp" },
        type: "normal",
        features: ["monsters", "gathering_nodes", "herbs"],
        levelRequirement: 2
      },
      {
        id: "trade_road",
        displayName: "Merchant's Highway",
        description: "A well-traveled road connecting major settlements. Caravans frequently pass through here.",
        coordinates: { x: 100, y: 0 },
        boundaries: { minX: 50, maxX: 150, minY: -50, maxY: 50 },
        exits: { west: "starter_city", north: "crossroads", east: "mining_outpost" },
        type: "normal",
        features: ["merchants", "caravans", "safe_travel"],
        levelRequirement: 1
      },
      {
        id: "deep_forest",
        displayName: "Shadowheart Grove",
        description: "Deep within the forest where sunlight barely penetrates. Dangerous creatures lurk in the shadows.",
        coordinates: { x: 0, y: 200 },
        boundaries: { minX: -75, maxX: 75, minY: 150, maxY: 275 },
        exits: { south: "forest_edge", east: "ancient_ruins" },
        type: "normal",
        features: ["elite_monsters", "rare_herbs", "hidden_treasures"],
        levelRequirement: 5
      },
      {
        id: "goblin_camp",
        displayName: "Ragtooth Goblin Camp",
        description: "A crude settlement of goblins with wooden palisades and smoking fires. Proceed with caution.",
        coordinates: { x: 100, y: 100 },
        boundaries: { minX: 50, maxX: 150, minY: 50, maxY: 150 },
        exits: { west: "forest_edge", south: "crossroads", north: "ancient_ruins" },
        type: "normal",
        features: ["goblin_monsters", "loot_chests", "quest_objectives"],
        levelRequirement: 3
      },
      {
        id: "mining_outpost",
        displayName: "Ironpeak Mining Outpost",
        description: "A frontier mining settlement carved into the mountainside. The sound of pickaxes echoes from the tunnels.",
        coordinates: { x: 200, y: 0 },
        boundaries: { minX: 150, maxX: 250, minY: -50, maxY: 50 },
        exits: { west: "trade_road", north: "mountain_pass" },
        type: "normal",
        features: ["mining_nodes", "blacksmith", "ore_traders", "cave_entrance"],
        levelRequirement: 4
      },
      {
        id: "crossroads",
        displayName: "Four Winds Crossroads",
        description: "Where four major paths converge. A weathered signpost points toward distant lands.",
        coordinates: { x: 100, y: 50 },
        boundaries: { minX: 75, maxX: 125, minY: 25, maxY: 75 },
        exits: { west: "forest_edge", south: "trade_road", north: "goblin_camp", east: "eastern_plains" },
        type: "normal",
        features: ["travelers", "crossroad_shrine", "direction_signs"],
        levelRequirement: 2
      },
      {
        id: "ancient_ruins",
        displayName: "Forgotten Temple Ruins",
        description: "Ancient stone structures overgrown with vines. Magic still lingers in these crumbling halls.",
        coordinates: { x: 150, y: 200 },
        boundaries: { minX: 100, maxX: 200, minY: 150, maxY: 250 },
        exits: { west: "deep_forest", south: "goblin_camp" },
        type: "dungeon",
        features: ["ancient_magic", "puzzle_doors", "boss_chambers", "legendary_loot"],
        levelRequirement: 8,
        locked: false
      }
    ];

    // Store zones in map for fast lookup
    mockZones.forEach(zone => {
      this.zones.set(zone.id, zone);
    });

    // Initialize some character positions
    this.initializeMockPositions();
  }

  /**
   * Initialize mock character positions
   */
  private initializeMockPositions(): void {
    const mockPositions: CharacterPosition[] = [
      {
        characterId: "char_001",
        zoneId: "starter_city",
        coordinates: { x: 0, y: 0 },
        lastMovement: Date.now() - 10000 // 10 seconds ago
      },
      {
        characterId: "test_player",
        zoneId: "starter_city",
        coordinates: { x: 5, y: 5 },
        lastMovement: Date.now() - 5000 // 5 seconds ago
      }
    ];

    mockPositions.forEach(position => {
      this.characterPositions.set(position.characterId, position);
    });
  }

  /**
   * Get all zones
   */
  async getAllZones(): Promise<ZoneListResponse> {
    const zones = Array.from(this.zones.values());
    return {
      zones,
      total: zones.length
    };
  }

  /**
   * Get zone by ID
   */
  async getZoneById(zoneId: string): Promise<Zone | null> {
    return this.zones.get(zoneId) || null;
  }

  /**
   * Get zone details with character position
   */
  async getZoneDetails(zoneId: string, characterId?: string): Promise<ZoneDetailsResponse | null> {
    const zone = this.zones.get(zoneId);
    if (!zone) return null;

    const characterPosition = characterId ? this.characterPositions.get(characterId) : undefined;
    const availableExits = Object.values(zone.exits).filter(Boolean) as string[];

    return {
      zone,
      characterPosition,
      availableExits
    };
  }

  /**
   * Check if zone exists
   */
  async zoneExists(zoneId: string): Promise<boolean> {
    return this.zones.has(zoneId);
  }

  /**
   * Get character's current position
   */
  async getCharacterPosition(characterId: string): Promise<CharacterPosition | null> {
    return this.characterPositions.get(characterId) || null;
  }

  /**
   * Update character position
   */
  async updateCharacterPosition(characterId: string, zoneId: string, coordinates?: { x: number; y: number }): Promise<void> {
    const zone = this.zones.get(zoneId);
    if (!zone) {
      throw new Error(`Zone ${zoneId} not found`);
    }

    // Use zone center if no coordinates provided
    const newCoordinates = coordinates || {
      x: (zone.boundaries.minX + zone.boundaries.maxX) / 2,
      y: (zone.boundaries.minY + zone.boundaries.maxY) / 2
    };

    const position: CharacterPosition = {
      characterId,
      zoneId,
      coordinates: newCoordinates,
      lastMovement: Date.now()
    };

    this.characterPositions.set(characterId, position);
    logger.info(`Character ${characterId} moved to zone ${zoneId} at coordinates (${newCoordinates.x}, ${newCoordinates.y})`);
  }

  /**
   * Check if character meets zone requirements
   */
  async meetsZoneRequirements(_characterId: string, zoneId: string, characterLevel: number = 1): Promise<boolean> {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;

    // Check level requirement
    if (zone.levelRequirement && characterLevel < zone.levelRequirement) {
      return false;
    }

    // Check if zone is locked
    if (zone.locked) {
      return false;
    }

    return true;
  }

  /**
   * Validate zone boundaries
   */
  isWithinBoundaries(zoneId: string, coordinates: { x: number; y: number }): boolean {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;

    const { boundaries } = zone;
    return (
      coordinates.x >= boundaries.minX &&
      coordinates.x <= boundaries.maxX &&
      coordinates.y >= boundaries.minY &&
      coordinates.y <= boundaries.maxY
    );
  }

  /**
   * Get zone exit in specific direction
   */
  getZoneExit(zoneId: string, direction: 'north' | 'south' | 'east' | 'west'): string | null {
    const zone = this.zones.get(zoneId);
    if (!zone) return null;

    return zone.exits[direction] || null;
  }
}