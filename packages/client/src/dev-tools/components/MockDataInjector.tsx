import React, { useState } from 'react';

type Character = {
  id: string;
  accountId: string;
  name: string;
  race: string;
  class: string;
  gender: string;
  level: number;
  experience: bigint;
  
  // Base stats (soft cap at 100)
  baseStrength: number;
  baseDexterity: number;
  baseIntelligence: number;
  baseWisdom: number;
  baseConstitution: number;
  baseCharisma: number;
  
  // Infinite progression tiers
  strengthTier: number;
  dexterityTier: number;
  intelligenceTier: number;
  wisdomTier: number;
  constitutionTier: number;
  charismaTier: number;
  
  // Bonus stats (from gear, buffs, etc.)
  bonusStrength: bigint;
  bonusDexterity: bigint;
  bonusIntelligence: bigint;
  bonusWisdom: bigint;
  bonusConstitution: bigint;
  bonusCharisma: bigint;
  
  // Prestige and Paragon systems
  prestigeLevel: number;
  paragonPoints: bigint;
  paragonDistribution: Record<string, bigint>;
  
  // Resources
  currentHp: bigint;
  maxHp: bigint;
  currentMp: bigint;
  maxMp: bigint;
  currentStamina: bigint;
  maxStamina: bigint;
  
  // Appearance and other data
  appearance: Record<string, unknown>;
  currentZone: string;
  position: { x: number; y: number; z: number };
  isDeleted: boolean;
  lastPlayedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

interface Props {
  onInject: (character: Character) => void;
}

export const MockDataInjector: React.FC<Props> = ({ onInject }) => {
  const [template, setTemplate] = useState<'fresh' | 'midgame' | 'endgame' | 'infinite'>('fresh');
  
  const generateMockCharacter = (): Character => {
    const baseChar: Character = {
      id: `test-char-${Date.now()}`,
      accountId: `test-account-${Date.now()}`,
      name: `TestChar_${Date.now()}`,
      race: 'human',
      class: 'warrior',
      gender: 'male',
      level: 1,
      experience: BigInt(0),
      baseStrength: 10,
      baseDexterity: 10,
      baseIntelligence: 10,
      baseWisdom: 10,
      baseConstitution: 10,
      baseCharisma: 10,
      strengthTier: 0,
      dexterityTier: 0,
      intelligenceTier: 0,
      wisdomTier: 0,
      constitutionTier: 0,
      charismaTier: 0,
      bonusStrength: BigInt(0),
      bonusDexterity: BigInt(0),
      bonusIntelligence: BigInt(0),
      bonusWisdom: BigInt(0),
      bonusConstitution: BigInt(0),
      bonusCharisma: BigInt(0),
      prestigeLevel: 0,
      paragonPoints: BigInt(0),
      paragonDistribution: {},
      currentHp: BigInt(100),
      maxHp: BigInt(100),
      currentMp: BigInt(50),
      maxMp: BigInt(50),
      currentStamina: BigInt(100),
      maxStamina: BigInt(100),
      appearance: { hairColor: 'brown', skinTone: 'fair', height: 'average' },
      currentZone: 'tutorial-zone',
      position: { x: 0, y: 0, z: 0 },
      isDeleted: false,
      lastPlayedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Apply template modifications
    switch (template) {
      case 'midgame':
        return {
          ...baseChar,
          name: 'MidgameWarrior',
          level: 50,
          experience: BigInt(1000000),
          baseStrength: 50,
          baseDexterity: 45,
          baseIntelligence: 30,
          baseWisdom: 25,
          baseConstitution: 55,
          baseCharisma: 20,
          bonusStrength: BigInt(200),
          bonusDexterity: BigInt(150),
          bonusConstitution: BigInt(300),
          currentHp: BigInt(2500),
          maxHp: BigInt(2500),
          currentMp: BigInt(800),
          maxMp: BigInt(800),
          currentStamina: BigInt(1800),
          maxStamina: BigInt(1800),
          currentZone: 'forest-depths'
        };
        
      case 'endgame':
        return {
          ...baseChar,
          name: 'EndgameChampion',
          level: 100,
          experience: BigInt(100000000),
          baseStrength: 100,
          baseDexterity: 85,
          baseIntelligence: 60,
          baseWisdom: 70,
          baseConstitution: 100,
          baseCharisma: 50,
          strengthTier: 2,
          dexterityTier: 1,
          constitutionTier: 2,
          bonusStrength: BigInt(5000),
          bonusDexterity: BigInt(3000),
          bonusConstitution: BigInt(8000),
          prestigeLevel: 1,
          paragonPoints: BigInt(100),
          paragonDistribution: {
            strength: BigInt(50),
            constitution: BigInt(50)
          },
          currentHp: BigInt(15000),
          maxHp: BigInt(15000),
          currentMp: BigInt(5000),
          maxMp: BigInt(5000),
          currentStamina: BigInt(8000),
          maxStamina: BigInt(8000),
          currentZone: 'dragon-peaks'
        };
        
      case 'infinite':
        return {
          ...baseChar,
          name: 'InfiniteAscendant',
          level: 500,
          experience: BigInt(999999999999),
          baseStrength: 100,
          baseDexterity: 100,
          baseIntelligence: 100,
          baseWisdom: 100,
          baseConstitution: 100,
          baseCharisma: 100,
          strengthTier: 10,
          dexterityTier: 8,
          intelligenceTier: 5,
          wisdomTier: 6,
          constitutionTier: 12,
          charismaTier: 3,
          bonusStrength: BigInt(999999),
          bonusDexterity: BigInt(500000),
          bonusIntelligence: BigInt(250000),
          bonusWisdom: BigInt(300000),
          bonusConstitution: BigInt(1500000),
          bonusCharisma: BigInt(100000),
          prestigeLevel: 5,
          paragonPoints: BigInt(50000),
          paragonDistribution: {
            strength: BigInt(20000),
            dexterity: BigInt(10000),
            constitution: BigInt(20000)
          },
          currentHp: BigInt(999999999),
          maxHp: BigInt(999999999),
          currentMp: BigInt(50000000),
          maxMp: BigInt(50000000),
          currentStamina: BigInt(100000000),
          maxStamina: BigInt(100000000),
          currentZone: 'void-nexus'
        };
        
      default:
        return baseChar;
    }
  };
  
  return (
    <div className="mock-injector">
      <h4>Generate Test Character</h4>
      
      <div className="template-selector">
        <label>Template:</label>
        <select value={template} onChange={(e) => setTemplate(e.target.value as any)}>
          <option value="fresh">Fresh Character (Lvl 1)</option>
          <option value="midgame">Mid-Game (Lvl 50)</option>
          <option value="endgame">End-Game (Lvl 100)</option>
          <option value="infinite">Infinite Progression (Lvl 500+)</option>
        </select>
      </div>
      
      <button 
        className="inject-button"
        onClick={() => onInject(generateMockCharacter())}
      >
        Generate & Load Character
      </button>

      <div className="template-info">
        <h5>Template Info:</h5>
        <div className="info-text">
          {template === 'fresh' && (
            <p>Basic level 1 character with starting stats. Good for testing early game mechanics.</p>
          )}
          {template === 'midgame' && (
            <p>Level 50 character with moderate gear bonuses. Tests mid-level progression systems.</p>
          )}
          {template === 'endgame' && (
            <p>Level 100 character with tier progression and prestige. Tests endgame systems and paragon points.</p>
          )}
          {template === 'infinite' && (
            <p>Level 500+ character with massive stats. Tests infinite progression and tier scaling limits.</p>
          )}
        </div>
      </div>
      
      <div className="json-editor">
        <h5>Custom JSON (Advanced)</h5>
        <textarea 
          placeholder="Paste character JSON here..."
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              // Convert numeric strings back to BigInt for bigint fields
              const bigintFields = [
                'experience', 'bonusStrength', 'bonusDexterity', 'bonusIntelligence', 
                'bonusWisdom', 'bonusConstitution', 'bonusCharisma', 'paragonPoints',
                'currentHp', 'maxHp', 'currentMp', 'maxMp', 'currentStamina', 'maxStamina'
              ];
              
              bigintFields.forEach(field => {
                if (parsed[field] !== undefined) {
                  parsed[field] = BigInt(parsed[field]);
                }
              });
              
              // Convert paragon distribution values to BigInt
              if (parsed.paragonDistribution) {
                Object.keys(parsed.paragonDistribution).forEach(key => {
                  parsed.paragonDistribution[key] = BigInt(parsed.paragonDistribution[key]);
                });
              }
              
              onInject(parsed);
            } catch (err) {
              console.error('Invalid JSON:', err);
            }
          }}
        />
      </div>
    </div>
  );
};