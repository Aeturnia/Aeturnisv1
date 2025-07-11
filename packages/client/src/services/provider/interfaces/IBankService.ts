import { IService } from './IService';
import { 
  PersonalBank, 
  SharedBank, 
  GuildBank, 
  TransferRequest, 
  BankType,
  BankItem 
} from '@aeturnis/shared';

export interface IBankService extends IService {
  getPersonalBank(characterId: string): Promise<PersonalBank>;
  getSharedBank(userId: string): Promise<SharedBank>;
  getGuildBank(guildId: string): Promise<GuildBank | null>;
  
  addItemToBank(
    characterId: string, 
    slot: number, 
    itemId: string, 
    quantity?: number, 
    bankType?: BankType
  ): Promise<boolean>;
  
  removeItemFromBank(
    characterId: string, 
    slot: number, 
    quantity?: number, 
    bankType?: BankType
  ): Promise<boolean>;
  
  transferItem(
    characterId: string, 
    userId: string, 
    request: TransferRequest
  ): Promise<boolean>;
  
  subscribeToPersonalBank(characterId: string, handler: (bank: PersonalBank) => void): () => void;
  subscribeToSharedBank(userId: string, handler: (bank: SharedBank) => void): () => void;
  subscribeToGuildBank(guildId: string, handler: (bank: GuildBank) => void): () => void;
}