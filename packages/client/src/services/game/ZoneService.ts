/**
 * Zone service implementation for managing world zones and character movement
 */

import { Zone, Direction, CharacterPosition, ZoneListResponse, ZoneDetailsResponse } from '@aeturnis/shared';
import { BaseService } from '../base/BaseService';
import { BaseHttpService } from '../base/BaseHttpService';
import { BaseRealtimeService } from '../base/BaseRealtimeService';
import { IZoneService } from '../provider/interfaces/IZoneService';
import { ServiceError } from '../base/ServiceError';
import { ServiceDependencies } from '../provider/ServiceProvider';

// HTTP service for zone API calls
class ZoneHttpService extends BaseHttpService {
  async getZones(): Promise<ZoneListResponse> {
    const response = await this.http.get<ZoneListResponse>('/api/v1/zones');
    return response.data;
  }

  async getZone(zoneId: string): Promise<Zone> {
    const response = await this.http.get<{ data: Zone }>(`/api/v1/zones/${zoneId}`);
    return response.data.data;
  }

  async getCharacterPosition(characterId: string): Promise<CharacterPosition> {
    const response = await this.http.get<{ data: CharacterPosition }>(
      `/api/v1/characters/${characterId}/position`
    );
    return response.data.data;
  }

  async updateCharacterPosition(characterId: string, x: number, y: number): Promise<CharacterPosition> {
    const response = await this.http.patch<{ data: CharacterPosition }>(
      `/api/v1/characters/${characterId}/position`,
      { x, y }
    );
    return response.data.data;
  }

  async moveToZone(characterId: string, zoneId: string): Promise<CharacterPosition> {
    const response = await this.http.post<{ data: CharacterPosition }>(
      `/api/v1/characters/${characterId}/move`,
      { zoneId }
    );
    return response.data.data;
  }

  async moveInDirection(characterId: string, direction: Direction): Promise<CharacterPosition> {
    const response = await this.http.post<{ data: CharacterPosition }>(
      `/api/v1/characters/${characterId}/move`,
      { direction }
    );
    return response.data.data;
  }

  async canMoveToZone(characterId: string, targetZoneId: string): Promise<boolean> {
    const response = await this.http.get<{ data: { canMove: boolean } }>(
      `/api/v1/characters/${characterId}/can-move-to/${targetZoneId}`
    );
    return response.data.data.canMove;
  }
}

// Realtime service for zone WebSocket events
class ZoneRealtimeService extends BaseRealtimeService {
  constructor(dependencies: ServiceDependencies) {
    super(dependencies);

    // Listen for zone events
    this.on('zone:update', this.handleZoneUpdate.bind(this));
    this.on('position:update', this.handlePositionUpdate.bind(this));
    this.on('zone:activity', this.handleZoneActivity.bind(this));
  }

  private handleZoneUpdate(data: { zoneId: string; zone: Zone }) {
    this.emit(`zone:${data.zoneId}:update`, data.zone);
  }

  private handlePositionUpdate(data: { characterId: string; position: CharacterPosition }) {
    this.emit(`character:${data.characterId}:position`, data.position);
  }

  private handleZoneActivity(data: { zoneId: string; activity: any }) {
    this.emit(`zone:${data.zoneId}:activity`, data.activity);
  }

  subscribeToZone(zoneId: string) {
    this.socket.emit('zone:subscribe', { zoneId });
  }

  unsubscribeFromZone(zoneId: string) {
    this.socket.emit('zone:unsubscribe', { zoneId });
  }

  subscribeToCharacterPosition(characterId: string) {
    this.socket.emit('character:position:subscribe', { characterId });
  }

  unsubscribeFromCharacterPosition(characterId: string) {
    this.socket.emit('character:position:unsubscribe', { characterId });
  }
}

// Main zone service
export class ZoneService extends BaseService implements IZoneService {
  private http: ZoneHttpService;
  private realtime: ZoneRealtimeService;
  private subscribedZones: Set<string> = new Set();
  private subscribedCharacters: Set<string> = new Set();

  constructor(dependencies: ServiceDependencies) {
    super(dependencies);
    this.http = new ZoneHttpService(dependencies);
    this.realtime = new ZoneRealtimeService(dependencies);
  }

  async initialize(): Promise<void> {
    await super.initialize();

    // Initialize state keys
    this.stateManager.initialize('zone:list', []);
    this.stateManager.initialize('zone:current', null);
    this.stateManager.initialize('zone:positions', new Map());

    // Load initial data
    await this.loadZones();
  }

  private async loadZones(): Promise<void> {
    try {
      const response = await this.http.getZones();
      const zoneMap = new Map(response.zones.map(zone => [zone.id, zone]));
      await this.stateManager.update('zone:list', zoneMap);
    } catch (error) {
      console.error('Failed to load zones:', error);
      throw new ServiceError('Failed to load zones', 'ZONE_LOAD_ERROR', error);
    }
  }

  async getZones(): Promise<Zone[]> {
    const zoneMap = this.stateManager.getState<Map<string, Zone>>('zone:list');
    return zoneMap ? Array.from(zoneMap.values()) : [];
  }

  async getZone(zoneId: string): Promise<Zone | null> {
    const zoneMap = this.stateManager.getState<Map<string, Zone>>('zone:list');
    if (zoneMap?.has(zoneId)) {
      return zoneMap.get(zoneId) || null;
    }

    // Try to fetch from server
    try {
      const zone = await this.http.getZone(zoneId);
      
      // Update cache
      const updatedMap = new Map(zoneMap);
      updatedMap.set(zone.id, zone);
      await this.stateManager.update('zone:list', updatedMap);
      
      return zone;
    } catch (error) {
      console.error(`Failed to fetch zone ${zoneId}:`, error);
      return null;
    }
  }

  async getCurrentZone(): Promise<Zone | null> {
    return this.stateManager.getState<Zone>('zone:current');
  }

  async getCharacterPosition(characterId: string): Promise<CharacterPosition | null> {
    const positions = this.stateManager.getState<Map<string, CharacterPosition>>('zone:positions');
    if (positions?.has(characterId)) {
      return positions.get(characterId) || null;
    }

    // Try to fetch from server
    try {
      const position = await this.http.getCharacterPosition(characterId);
      
      // Update cache
      const updatedPositions = new Map(positions);
      updatedPositions.set(characterId, position);
      await this.stateManager.update('zone:positions', updatedPositions);
      
      // Update current zone if this is the current character
      const currentCharacter = this.stateManager.getState<any>('character:current');
      if (currentCharacter?.id === characterId) {
        const zone = await this.getZone(position.zoneId);
        if (zone) {
          await this.stateManager.update('zone:current', zone);
        }
      }
      
      return position;
    } catch (error) {
      console.error(`Failed to fetch position for character ${characterId}:`, error);
      return null;
    }
  }

  async updateCharacterPosition(characterId: string, x: number, y: number): Promise<CharacterPosition> {
    try {
      const position = await this.http.updateCharacterPosition(characterId, x, y);
      
      // Update cache
      const positions = this.stateManager.getState<Map<string, CharacterPosition>>('zone:positions') || new Map();
      positions.set(characterId, position);
      await this.stateManager.update('zone:positions', positions);
      
      return position;
    } catch (error) {
      throw new ServiceError('Failed to update character position', 'POSITION_UPDATE_ERROR', error);
    }
  }

  async moveToZone(characterId: string, zoneId: string): Promise<CharacterPosition> {
    try {
      const position = await this.http.moveToZone(characterId, zoneId);
      
      // Update cache
      const positions = this.stateManager.getState<Map<string, CharacterPosition>>('zone:positions') || new Map();
      positions.set(characterId, position);
      await this.stateManager.update('zone:positions', positions);
      
      // Update current zone if this is the current character
      const currentCharacter = this.stateManager.getState<any>('character:current');
      if (currentCharacter?.id === characterId) {
        const zone = await this.getZone(position.zoneId);
        if (zone) {
          await this.stateManager.update('zone:current', zone);
        }
      }
      
      return position;
    } catch (error) {
      throw new ServiceError('Failed to move to zone', 'ZONE_MOVE_ERROR', error);
    }
  }

  async moveInDirection(characterId: string, direction: Direction): Promise<CharacterPosition> {
    try {
      const position = await this.http.moveInDirection(characterId, direction);
      
      // Update cache
      const positions = this.stateManager.getState<Map<string, CharacterPosition>>('zone:positions') || new Map();
      positions.set(characterId, position);
      await this.stateManager.update('zone:positions', positions);
      
      // Update current zone if this is the current character
      const currentCharacter = this.stateManager.getState<any>('character:current');
      if (currentCharacter?.id === characterId && position.zoneId !== currentCharacter.currentZone) {
        const zone = await this.getZone(position.zoneId);
        if (zone) {
          await this.stateManager.update('zone:current', zone);
        }
      }
      
      return position;
    } catch (error) {
      throw new ServiceError('Failed to move in direction', 'DIRECTION_MOVE_ERROR', error);
    }
  }

  async canMoveToZone(characterId: string, targetZoneId: string): Promise<boolean> {
    try {
      return await this.http.canMoveToZone(characterId, targetZoneId);
    } catch (error) {
      console.error('Failed to check zone access:', error);
      return false;
    }
  }

  async getZoneFeatures(zoneId: string): Promise<string[]> {
    const zone = await this.getZone(zoneId);
    return zone?.features || [];
  }

  async isZoneLocked(zoneId: string): Promise<boolean> {
    const zone = await this.getZone(zoneId);
    return zone?.locked || false;
  }

  subscribeToZoneUpdates(zoneId: string, handler: (zone: Zone) => void): () => void {
    const eventName = `zone:${zoneId}:update`;
    
    // Subscribe to realtime updates if not already subscribed
    if (!this.subscribedZones.has(zoneId)) {
      this.realtime.subscribeToZone(zoneId);
      this.subscribedZones.add(zoneId);
    }
    
    this.realtime.on(eventName, handler);
    
    return () => {
      this.realtime.off(eventName, handler);
      
      // Check if we should unsubscribe from realtime
      if (!this.realtime.listeners(eventName).length) {
        this.realtime.unsubscribeFromZone(zoneId);
        this.subscribedZones.delete(zoneId);
      }
    };
  }

  subscribeToPositionUpdates(characterId: string, handler: (position: CharacterPosition) => void): () => void {
    const eventName = `character:${characterId}:position`;
    
    // Subscribe to realtime updates if not already subscribed
    if (!this.subscribedCharacters.has(characterId)) {
      this.realtime.subscribeToCharacterPosition(characterId);
      this.subscribedCharacters.add(characterId);
    }
    
    this.realtime.on(eventName, handler);
    
    return () => {
      this.realtime.off(eventName, handler);
      
      // Check if we should unsubscribe from realtime
      if (!this.realtime.listeners(eventName).length) {
        this.realtime.unsubscribeFromCharacterPosition(characterId);
        this.subscribedCharacters.delete(characterId);
      }
    };
  }

  subscribeToZoneActivity(zoneId: string, handler: (activity: any) => void): () => void {
    const eventName = `zone:${zoneId}:activity`;
    
    // Subscribe to zone if not already subscribed
    if (!this.subscribedZones.has(zoneId)) {
      this.realtime.subscribeToZone(zoneId);
      this.subscribedZones.add(zoneId);
    }
    
    this.realtime.on(eventName, handler);
    
    return () => {
      this.realtime.off(eventName, handler);
    };
  }

  async destroy(): Promise<void> {
    // Unsubscribe from all zones
    for (const zoneId of this.subscribedZones) {
      this.realtime.unsubscribeFromZone(zoneId);
    }
    
    // Unsubscribe from all character positions
    for (const characterId of this.subscribedCharacters) {
      this.realtime.unsubscribeFromCharacterPosition(characterId);
    }
    
    this.subscribedZones.clear();
    this.subscribedCharacters.clear();
    
    await super.destroy();
  }
}