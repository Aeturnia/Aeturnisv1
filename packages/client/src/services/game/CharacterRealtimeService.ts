import { BaseRealtimeService } from '../base/BaseRealtimeService';
import { Character, Position } from '@aeturnis/shared';

export class CharacterRealtimeService extends BaseRealtimeService {
  private characterSubscriptions: Map<string, string> = new Map();
  private allCharactersSubscription: string | null = null;

  public subscribeToCharacter(characterId: string): string {
    const subscriptionId = this.subscribe(`character:${characterId}`, (event, data) => {
      this.emit(`character:${event}`, data);
    });

    this.characterSubscriptions.set(characterId, subscriptionId);
    return subscriptionId;
  }

  public unsubscribeCharacter(subscriptionId: string): void {
    this.unsubscribe(subscriptionId);
    
    // Remove from tracking
    for (const [characterId, subId] of this.characterSubscriptions) {
      if (subId === subscriptionId) {
        this.characterSubscriptions.delete(characterId);
        break;
      }
    }
  }

  public subscribeToAllCharacters(): string {
    if (this.allCharactersSubscription) {
      return this.allCharactersSubscription;
    }

    const subscriptionId = this.subscribe('character:*', (event, data) => {
      this.emit(`character:${event}`, data);
    });

    this.allCharactersSubscription = subscriptionId;
    return subscriptionId;
  }

  public unsubscribeAllCharacters(subscriptionId: string): void {
    if (this.allCharactersSubscription === subscriptionId) {
      this.unsubscribe(subscriptionId);
      this.allCharactersSubscription = null;
    }
  }

  public async updatePosition(characterId: string, position: Position): Promise<Character> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Position update timeout'));
      }, 5000);

      // Listen for response
      const responseHandler = (data: Character) => {
        clearTimeout(timeout);
        this.off(`character:${characterId}:position:response`, responseHandler);
        resolve(data);
      };

      this.on(`character:${characterId}:position:response`, responseHandler);

      // Send position update
      this.send('character:updatePosition', {
        characterId,
        position
      });
    });
  }

  public destroy(): void {
    this.characterSubscriptions.clear();
    if (this.allCharactersSubscription) {
      this.unsubscribe(this.allCharactersSubscription);
      this.allCharactersSubscription = null;
    }
    super.destroy();
  }
}