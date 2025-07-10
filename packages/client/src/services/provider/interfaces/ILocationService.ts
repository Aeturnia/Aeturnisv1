import { IService } from './IService';

export interface ILocationService extends IService {
  /**
   * Get all available locations
   */
  getLocations(): Promise<any[]>;

  /**
   * Get specific location details
   */
  getLocation(locationId: string): Promise<any>;

  /**
   * Move to a location
   */
  moveToLocation(locationId: string): Promise<any>;

  /**
   * Get current location
   */
  getCurrentLocation(): Promise<any>;

  /**
   * Discover a new location
   */
  discoverLocation(locationId: string): Promise<any>;

  /**
   * Subscribe to location updates
   */
  onLocationUpdate(callback: (location: any) => void): () => void;
}