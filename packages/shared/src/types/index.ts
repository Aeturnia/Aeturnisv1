// Export type modules
export * from './monster.types';
export * from './npc.types';
export * from './affinity.types';
export * from './tutorial.types';
export * from './zone.types';
export * from './movement.types';
export * from './progression.types';

// Game-wide type definitions
export type CharacterRace = 'human' | 'elf' | 'dwarf' | 'orc' | 'halfling' | 'gnome' | 'darkelf' | 'lizardman';

export type DamageType = 'physical' | 'fire' | 'ice' | 'lightning' | 'holy' | 'dark';

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Position {
  x: number;
  y: number;
  zone: string;
}

export interface Stats {
  strength: number;
  intelligence: number;
  vitality: number;
  dexterity: number;
  wisdom: number;
}

export type GameEvent = 
  | 'character.created'
  | 'character.levelup' 
  | 'combat.started'
  | 'combat.ended'
  | 'item.equipped'
  | 'item.dropped'
  | 'movement.started'
  | 'movement.completed';