import { eq } from 'drizzle-orm';
import { characters } from '../database/schema/index';
import { Character, CreateCharacterDTO, CharacterListItem } from '../types/character.types';
import { db } from '../database/config';

export class CharacterRepository {
  async create(_accountId: string, _data: CreateCharacterDTO): Promise<Character> {
    throw new Error('Character creation temporarily disabled due to schema type issues');
  }

  async findById(id: string): Promise<Character | null> {
    const result = await db
      .select()
      .from(characters)
      .where(eq(characters.id, id))
      .limit(1);

    return result.length > 0 ? (result[0] as Character) : null;
  }

  async findByAccountId(accountId: string): Promise<CharacterListItem[]> {
    const result = await db
      .select({
        id: characters.id,
        name: characters.name,
        race: characters.race,
        class: characters.class,
      })
      .from(characters)
      .where(eq(characters.accountId, accountId));

    return result as CharacterListItem[];
  }

  async findByName(name: string): Promise<Character | null> {
    const result = await db
      .select()
      .from(characters)
      .where(eq(characters.name, name))
      .limit(1);

    return result.length > 0 ? (result[0] as Character) : null;
  }

  async validateCharacterName(name: string): Promise<boolean> {
    const existing = await this.findByName(name);
    return existing === null;
  }

  async isNameTaken(name: string): Promise<boolean> {
    const existing = await this.findByName(name);
    return existing !== null;
  }

  async getCharacterCount(accountId: string): Promise<number> {
    const result = await db
      .select()
      .from(characters)
      .where(eq(characters.accountId, accountId));
    return result.length;
  }

  async updateExperience(_id: string, _experience: number): Promise<Character | null> {
    // TODO: Implement when schema types are fixed
    throw new Error('updateExperience disabled due to schema type issues');
  }

  async updateStats(_id: string, _stats: any): Promise<Character | null> {
    // TODO: Implement when schema types are fixed
    throw new Error('updateStats disabled due to schema type issues');
  }

  async updatePosition(_id: string, _position: any): Promise<Character | null> {
    // TODO: Implement when schema types are fixed
    throw new Error('updatePosition disabled due to schema type issues');
  }

  async updateResources(_id: string, _resources: any): Promise<Character | null> {
    // TODO: Implement when schema types are fixed
    throw new Error('updateResources disabled due to schema type issues');
  }

  async updatePrestige(_id: string, _prestigeLevel: number): Promise<Character | null> {
    // TODO: Implement when schema types are fixed
    throw new Error('updatePrestige disabled due to schema type issues');
  }

  async updateParagon(_id: string, _paragonData: any): Promise<Character | null> {
    // TODO: Implement when schema types are fixed
    throw new Error('updateParagon disabled due to schema type issues');
  }

  async softDelete(_id: string): Promise<boolean> {
    // TODO: Implement when schema types are fixed
    throw new Error('softDelete disabled due to schema type issues');
  }

  async updateLastPlayed(_id: string): Promise<boolean> {
    // TODO: Implement when schema types are fixed
    throw new Error('updateLastPlayed disabled due to schema type issues');
  }

  async update(_id: string, _updates: Partial<Character>): Promise<Character | null> {
    // TODO: Implement when schema types are fixed
    throw new Error('update disabled due to schema type issues');
  }
}