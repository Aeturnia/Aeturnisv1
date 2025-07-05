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
}

export const StatCalculator: React.FC<Props> = ({ character }) => {
  if (!character) {
    return <div className="empty-state">No character selected. Use Mock Data tab to create one.</div>;
  }

  // Basic stat calculations (simplified version of StatsService)
  const calculateEffectiveStat = (
    base: number,
    tier: number,
    bonus: bigint,
    paragonPoints: bigint = BigInt(0),
    prestigeLevel: number = 0
  ): number => {
    const cappedBase = Math.min(base, 100);
    const tierBonus = tier * 50;
    const bonusEffect = bonus > BigInt(0) ? Math.log10(Number(bonus) + 1) * 20 : 0;
    const paragonEffect = paragonPoints > BigInt(0) ? Math.log10(Number(paragonPoints) + 1) * 10 : 0;
    const prestigeMultiplier = 1 + (prestigeLevel * 0.1);
    
    return (cappedBase + tierBonus + bonusEffect + paragonEffect) * prestigeMultiplier;
  };

  const effectiveStr = calculateEffectiveStat(
    character.baseStrength,
    character.strengthTier,
    character.bonusStrength,
    character.paragonDistribution.strength || BigInt(0),
    character.prestigeLevel
  );

  const effectiveDex = calculateEffectiveStat(
    character.baseDexterity,
    character.dexterityTier,
    character.bonusDexterity,
    character.paragonDistribution.dexterity || BigInt(0),
    character.prestigeLevel
  );

  const effectiveInt = calculateEffectiveStat(
    character.baseIntelligence,
    character.intelligenceTier,
    character.bonusIntelligence,
    character.paragonDistribution.intelligence || BigInt(0),
    character.prestigeLevel
  );

  const effectiveWis = calculateEffectiveStat(
    character.baseWisdom,
    character.wisdomTier,
    character.bonusWisdom,
    character.paragonDistribution.wisdom || BigInt(0),
    character.prestigeLevel
  );

  const effectiveCon = calculateEffectiveStat(
    character.baseConstitution,
    character.constitutionTier,
    character.bonusConstitution,
    character.paragonDistribution.constitution || BigInt(0),
    character.prestigeLevel
  );

  const effectiveCha = calculateEffectiveStat(
    character.baseCharisma,
    character.charismaTier,
    character.bonusCharisma,
    character.paragonDistribution.charisma || BigInt(0),
    character.prestigeLevel
  );

  // Derived stats calculations
  const physicalDamage = Math.floor(effectiveStr * 2 + effectiveDex * 0.5 + character.level * 3);
  const magicalDamage = Math.floor(effectiveInt * 2 + effectiveWis * 0.5 + character.level * 3);
  const physicalDefense = Math.floor(effectiveCon * 1.5 + effectiveStr * 0.5 + character.level * 2);
  const magicalDefense = Math.floor(effectiveWis * 1.5 + effectiveInt * 0.5 + character.level * 2);
  const criticalChance = Math.min(5 + (effectiveDex * 0.02) + (effectiveInt * 0.01), 75);
  const dodgeChance = Math.min((effectiveDex * 0.03) + (character.level * 0.01), 50);

  return (
    <div className="stat-calculator">
      <section className="effective-stats">
        <h4>Effective Stats (With Bonuses)</h4>
        <div className="derived-grid">
          <label>Effective Strength:</label><span>{Math.floor(effectiveStr)}</span>
          <label>Effective Dexterity:</label><span>{Math.floor(effectiveDex)}</span>
          <label>Effective Intelligence:</label><span>{Math.floor(effectiveInt)}</span>
          <label>Effective Wisdom:</label><span>{Math.floor(effectiveWis)}</span>
          <label>Effective Constitution:</label><span>{Math.floor(effectiveCon)}</span>
          <label>Effective Charisma:</label><span>{Math.floor(effectiveCha)}</span>
        </div>
      </section>

      <section className="combat-stats">
        <h4>Combat Stats</h4>
        <div className="derived-grid">
          <label>Physical Damage:</label><span>{physicalDamage}</span>
          <label>Magical Damage:</label><span>{magicalDamage}</span>
          <label>Physical Defense:</label><span>{physicalDefense}</span>
          <label>Magical Defense:</label><span>{magicalDefense}</span>
          <label>Critical Chance:</label><span>{criticalChance.toFixed(2)}%</span>
          <label>Dodge Chance:</label><span>{dodgeChance.toFixed(2)}%</span>
        </div>
      </section>

      <section className="progression-breakdown">
        <h4>Progression Breakdown</h4>
        <div className="derived-grid">
          <label>Base Contribution:</label><span>{Math.min(character.baseStrength, 100)} points</span>
          <label>Tier Bonus:</label><span>{character.strengthTier * 50} points</span>
          <label>Gear Bonus:</label><span>{character.bonusStrength > BigInt(0) ? Math.log10(Number(character.bonusStrength) + 1) * 20 : 0} points</span>
          <label>Paragon Bonus:</label><span>{character.paragonPoints > BigInt(0) ? Math.log10(Number(character.paragonPoints) + 1) * 10 : 0} points</span>
          <label>Prestige Multiplier:</label><span>{(1 + (character.prestigeLevel * 0.1)).toFixed(1)}x</span>
        </div>
      </section>

      <section className="tier-progression">
        <h4>Tier Progression Info</h4>
        <div className="derived-grid">
          <label>Tier System:</label><span>Each tier = +50 effective points</span>
          <label>Soft Cap:</label><span>Base stats capped at 100</span>
          <label>Hard Cap:</label><span>Effective stats soft-capped at 1000</span>
          <label>Prestige Bonus:</label><span>+10% per prestige level</span>
        </div>
      </section>
    </div>
  );
};