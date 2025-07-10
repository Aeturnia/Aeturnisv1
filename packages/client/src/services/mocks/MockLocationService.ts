import { MockService } from './base/MockService';
import { ILocationService } from '../provider/interfaces/ILocationService';
import { StateManager } from '../state/StateManager';
import { ServiceLayerConfig } from '../index';

const mockLocations = [
  {
    id: '1',
    name: 'Mistwood Forest',
    x: 100,
    y: 200,
    type: 'forest',
    level: '1-10',
    discovered: true,
    completed: false,
    description: 'A mystical forest shrouded in perpetual mist',
    npcs: ['Elder Tree Guardian', 'Mystic Merchant'],
    monsters: ['Forest Sprites', 'Shadow Wolves'],
    resources: ['Mystic Herbs', 'Ancient Wood']
  },
  {
    id: '2',
    name: 'Crystal Caverns',
    x: 300,
    y: 150,
    type: 'dungeon',
    level: '15-25',
    discovered: true,
    completed: true,
    description: 'Deep caverns filled with luminescent crystals',
    npcs: ['Cave Hermit'],
    monsters: ['Crystal Golems', 'Cave Bats'],
    resources: ['Crystal Shards', 'Rare Ores']
  },
  {
    id: '3',
    name: 'Skyreach Tower',
    x: 250,
    y: 400,
    type: 'tower',
    level: '30-40',
    discovered: true,
    completed: false,
    description: 'An ancient tower that pierces the clouds',
    npcs: ['Archmage Stellaris'],
    monsters: ['Elemental Guardians', 'Sky Serpents'],
    resources: ['Arcane Essences', 'Star Fragments']
  },
  {
    id: '4',
    name: 'Shadowmere Swamp',
    x: 150,
    y: 350,
    type: 'swamp',
    level: '20-30',
    discovered: false,
    completed: false,
    description: 'A treacherous swamp filled with dark secrets',
    npcs: [],
    monsters: ['Bog Creatures', 'Venomous Serpents'],
    resources: ['Swamp Herbs', 'Toxic Sacs']
  },
  {
    id: '5',
    name: 'Golden Plains',
    x: 400,
    y: 300,
    type: 'plains',
    level: '5-15',
    discovered: true,
    completed: false,
    description: 'Vast golden grasslands under endless skies',
    npcs: ['Nomad Traders', 'Plains Ranger'],
    monsters: ['Wild Boars', 'Prairie Wolves'],
    resources: ['Wild Grains', 'Leather']
  }
];

export class MockLocationService extends MockService implements ILocationService {
  private stateManager: StateManager;
  private locations: any[];
  private currentLocationId: string = '1'; // Start in Mistwood Forest

  constructor(
    dependencies: {
      stateManager: StateManager;
    },
    config?: ServiceLayerConfig['mockConfig']
  ) {
    super(config);
    this.stateManager = dependencies.stateManager;
    this.locations = [...mockLocations];
  }

  async initialize(): Promise<void> {
    await super.initialize();
    
    // Initialize location state slice
    this.stateManager.createSlice('location', {
      locations: this.locations,
      currentLocation: this.locations.find(l => l.id === this.currentLocationId),
      isLoading: false,
      error: null
    });
  }

  async getLocations(): Promise<any[]> {
    this.stateManager.updateSlice('location', { isLoading: true });

    try {
      // Only return discovered locations
      const discoveredLocations = this.locations.filter(l => l.discovered);
      const locations = await this.getMockData(discoveredLocations);
      
      this.stateManager.updateSlice('location', { 
        locations,
        isLoading: false,
        error: null 
      });

      return locations;
    } catch (error) {
      this.stateManager.updateSlice('location', { 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  async getLocation(locationId: string): Promise<any> {
    const location = this.locations.find(l => l.id === locationId);
    if (!location) {
      throw new Error('Location not found');
    }
    
    if (!location.discovered) {
      throw new Error('Location not yet discovered');
    }

    return this.getMockData(location);
  }

  async moveToLocation(locationId: string): Promise<any> {
    this.stateManager.updateSlice('location', { isLoading: true });

    try {
      const location = this.locations.find(l => l.id === locationId);
      if (!location) {
        throw new Error('Location not found');
      }

      if (!location.discovered) {
        throw new Error('Cannot travel to undiscovered location');
      }

      // Calculate travel time based on distance
      const currentLocation = this.locations.find(l => l.id === this.currentLocationId);
      const distance = Math.sqrt(
        Math.pow(location.x - currentLocation!.x, 2) + 
        Math.pow(location.y - currentLocation!.y, 2)
      );
      const travelTime = Math.round(distance / 50) * 1000; // ms

      // Simulate travel time
      await new Promise(resolve => setTimeout(resolve, Math.min(travelTime, 3000)));

      this.currentLocationId = locationId;
      
      const result = await this.getMockData({
        success: true,
        locationId,
        location,
        travelTime: travelTime / 1000 // convert to seconds
      });

      this.stateManager.updateSlice('location', { 
        currentLocation: location,
        isLoading: false 
      });

      this.emit('location:changed', location);
      return result;
    } catch (error) {
      this.stateManager.updateSlice('location', { 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  async getCurrentLocation(): Promise<any> {
    const location = this.locations.find(l => l.id === this.currentLocationId);
    return this.getMockData(location);
  }

  async discoverLocation(locationId: string): Promise<any> {
    this.stateManager.updateSlice('location', { isLoading: true });

    try {
      const locationIndex = this.locations.findIndex(l => l.id === locationId);
      if (locationIndex === -1) {
        throw new Error('Location not found');
      }

      const location = this.locations[locationIndex];
      
      if (location.discovered) {
        throw new Error('Location already discovered');
      }

      // Check if player is close enough to discover
      const currentLocation = this.locations.find(l => l.id === this.currentLocationId);
      const distance = Math.sqrt(
        Math.pow(location.x - currentLocation!.x, 2) + 
        Math.pow(location.y - currentLocation!.y, 2)
      );

      if (distance > 150) {
        throw new Error('Too far away to discover this location');
      }

      location.discovered = true;

      const result = await this.getMockData({
        success: true,
        location,
        reward: {
          experience: 100,
          achievement: 'Explorer'
        }
      });

      this.stateManager.updateSlice('location', { 
        locations: this.locations,
        isLoading: false 
      });

      this.emit('location:discovered', location);
      return result;
    } catch (error) {
      this.stateManager.updateSlice('location', { 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  onLocationUpdate(callback: (location: any) => void): () => void {
    const handleUpdate = (data: any) => callback(data);
    this.on('location:changed', handleUpdate);
    this.on('location:discovered', handleUpdate);
    return () => {
      this.off('location:changed', handleUpdate);
      this.off('location:discovered', handleUpdate);
    };
  }

  destroy(): void {
    super.destroy();
  }
}