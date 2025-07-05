import React from 'react';

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
  character: Character | null;
  onCharacterChange: (character: Character) => void;
}

export const CharacterInspector: React.FC<Props> = ({ character, onCharacterChange }) => {
  if (!character) {
    return <div className="empty-state">No character selected. Use Mock Data tab to create one.</div>;
  }

  const handleStatChange = (statName: string, value: number) => {
    const updatedCharacter = { ...character, [statName]: value };
    onCharacterChange(updatedCharacter);
  };

  return (
    <div className="character-inspector">
      <section className="basic-info">
        <h4>Basic Information</h4>
        <div className="info-grid">
          <label>Name:</label><span>{character.name}</span>
          <label>Level:</label><span>{character.level}</span>
          <label>Race:</label><span>{character.race}</span>
          <label>Class:</label><span>{character.class}</span>
          <label>Experience:</label><span>{character.experience.toString()}</span>
          <label>Prestige:</label><span>{character.prestigeLevel}</span>
        </div>
      </section>
      
      <section className="base-stats">
        <h4>Base Stats (Soft Cap: 100)</h4>
        <div className="stat-grid">
          {[
            { name: 'strength', base: character.baseStrength, tier: character.strengthTier },
            { name: 'dexterity', base: character.baseDexterity, tier: character.dexterityTier },
            { name: 'intelligence', base: character.baseIntelligence, tier: character.intelligenceTier },
            { name: 'wisdom', base: character.baseWisdom, tier: character.wisdomTier },
            { name: 'constitution', base: character.baseConstitution, tier: character.constitutionTier },
            { name: 'charisma', base: character.baseCharisma, tier: character.charismaTier }
          ].map(stat => (
            <div key={stat.name} className="stat-row">
              <label>{stat.name}:</label>
              <input 
                type="number" 
                value={stat.base} 
                min={1} 
                max={100}
                onChange={(e) => {
                  const statKey = `base${stat.name.charAt(0).toUpperCase() + stat.name.slice(1)}`;
                  handleStatChange(statKey, Number(e.target.value));
                }}
              />
              <span className="tier-badge">Tier {stat.tier}</span>
            </div>
          ))}
        </div>
      </section>
      
      <section className="resources">
        <h4>Resources</h4>
        <div className="derived-grid">
          <label>Current HP:</label><span>{character.currentHp.toString()}</span>
          <label>Max HP:</label><span>{character.maxHp.toString()}</span>
          <label>Current MP:</label><span>{character.currentMp.toString()}</span>
          <label>Max MP:</label><span>{character.maxMp.toString()}</span>
          <label>Current Stamina:</label><span>{character.currentStamina.toString()}</span>
          <label>Max Stamina:</label><span>{character.maxStamina.toString()}</span>
        </div>
      </section>
      
      <section className="progression">
        <h4>Progression Systems</h4>
        <div className="derived-grid">
          <label>Prestige Level:</label><span>{character.prestigeLevel}</span>
          <label>Paragon Points:</label><span>{character.paragonPoints.toString()}</span>
          <label>Current Zone:</label><span>{character.currentZone}</span>
          <label>Position:</label><span>{character.position.x}, {character.position.y}, {character.position.z}</span>
        </div>
      </section>
    </div>
  );
};