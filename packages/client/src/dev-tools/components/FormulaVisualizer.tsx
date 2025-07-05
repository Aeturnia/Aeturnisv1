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

export const FormulaVisualizer: React.FC<Props> = ({ character }) => {
  if (!character) {
    return <div className="empty-state">Select a character to visualize formulas</div>;
  }

  // Calculate components for formula breakdown
  const calculateEffectiveStat = (
    base: number,
    tier: number,
    bonus: bigint,
    paragonPoints: bigint = BigInt(0),
    prestigeLevel: number = 0
  ) => {
    const cappedBase = Math.min(base, 100);
    const tierBonus = tier * 50;
    const bonusEffect = bonus > BigInt(0) ? Math.log10(Number(bonus) + 1) * 20 : 0;
    const paragonEffect = paragonPoints > BigInt(0) ? Math.log10(Number(paragonPoints) + 1) * 10 : 0;
    const prestigeMultiplier = 1 + (prestigeLevel * 0.1);
    
    return {
      cappedBase,
      tierBonus,
      bonusEffect,
      paragonEffect,
      prestigeMultiplier,
      total: (cappedBase + tierBonus + bonusEffect + paragonEffect) * prestigeMultiplier
    };
  };

  const strBreakdown = calculateEffectiveStat(
    character.baseStrength,
    character.strengthTier,
    character.bonusStrength,
    character.paragonDistribution.strength || BigInt(0),
    character.prestigeLevel
  );

  const dexBreakdown = calculateEffectiveStat(
    character.baseDexterity,
    character.dexterityTier,
    character.bonusDexterity,
    character.paragonDistribution.dexterity || BigInt(0),
    character.prestigeLevel
  );

  const intBreakdown = calculateEffectiveStat(
    character.baseIntelligence,
    character.intelligenceTier,
    character.bonusIntelligence,
    character.paragonDistribution.intelligence || BigInt(0),
    character.prestigeLevel
  );

  const wisBreakdown = calculateEffectiveStat(
    character.baseWisdom,
    character.wisdomTier,
    character.bonusWisdom,
    character.paragonDistribution.wisdom || BigInt(0),
    character.prestigeLevel
  );

  const conBreakdown = calculateEffectiveStat(
    character.baseConstitution,
    character.constitutionTier,
    character.bonusConstitution,
    character.paragonDistribution.constitution || BigInt(0),
    character.prestigeLevel
  );

  // Combat calculations
  const physicalDamage = Math.floor(strBreakdown.total * 2 + dexBreakdown.total * 0.5 + character.level * 3);
  const magicalDamage = Math.floor(intBreakdown.total * 2 + wisBreakdown.total * 0.5 + character.level * 3);
  const criticalChance = Math.min(5 + (dexBreakdown.total * 0.02) + (intBreakdown.total * 0.01), 75);

  // Resource calculations
  const maxHpCalc = Math.floor(100 + (conBreakdown.total * 20) + (character.level * 50) + (strBreakdown.total * 5)) * (character.prestigeLevel + 1);
  const maxMpCalc = Math.floor(50 + (intBreakdown.total * 15) + (character.level * 20) + (wisBreakdown.total * 10)) * (character.prestigeLevel + 1);

  return (
    <div className="formula-visualizer">
      <h4>Stat Calculation Breakdown</h4>
      
      <div className="formula-section">
        <h5>Effective Strength Calculation</h5>
        <code>
          (min(base, 100) + tier × 50 + log10(bonus + 1) × 20 + log10(paragon + 1) × 10) × prestige_multiplier
          <br />
          = ({character.baseStrength} + {character.strengthTier} × 50 + {character.bonusStrength > BigInt(0) ? `log10(${character.bonusStrength} + 1) × 20` : '0'} + {character.paragonDistribution.strength ? `log10(${character.paragonDistribution.strength} + 1) × 10` : '0'}) × {strBreakdown.prestigeMultiplier}
          <br />
          = ({strBreakdown.cappedBase} + {strBreakdown.tierBonus} + {strBreakdown.bonusEffect.toFixed(1)} + {strBreakdown.paragonEffect.toFixed(1)}) × {strBreakdown.prestigeMultiplier}
          <br />
          = <strong>{strBreakdown.total.toFixed(1)}</strong>
        </code>
      </div>
      
      <div className="formula-section">
        <h5>Physical Damage</h5>
        <code>
          effectiveStr × 2 + effectiveDex × 0.5 + level × 3
          <br />
          = {strBreakdown.total.toFixed(1)} × 2 + {dexBreakdown.total.toFixed(1)} × 0.5 + {character.level} × 3
          <br />
          = {(strBreakdown.total * 2).toFixed(1)} + {(dexBreakdown.total * 0.5).toFixed(1)} + {character.level * 3}
          <br />
          = <strong>{physicalDamage}</strong>
        </code>
      </div>

      <div className="formula-section">
        <h5>Magical Damage</h5>
        <code>
          effectiveInt × 2 + effectiveWis × 0.5 + level × 3
          <br />
          = {intBreakdown.total.toFixed(1)} × 2 + {wisBreakdown.total.toFixed(1)} × 0.5 + {character.level} × 3
          <br />
          = {(intBreakdown.total * 2).toFixed(1)} + {(wisBreakdown.total * 0.5).toFixed(1)} + {character.level * 3}
          <br />
          = <strong>{magicalDamage}</strong>
        </code>
      </div>
      
      <div className="formula-section">
        <h5>Max HP (BigInt)</h5>
        <code>
          (100 + effectiveCon × 20 + level × 50 + effectiveStr × 5) × (prestigeLevel + 1)
          <br />
          = (100 + {conBreakdown.total.toFixed(1)} × 20 + {character.level} × 50 + {strBreakdown.total.toFixed(1)} × 5) × {character.prestigeLevel + 1}
          <br />
          = (100 + {(conBreakdown.total * 20).toFixed(1)} + {character.level * 50} + {(strBreakdown.total * 5).toFixed(1)}) × {character.prestigeLevel + 1}
          <br />
          = <strong>{maxHpCalc.toString()}</strong>
        </code>
      </div>

      <div className="formula-section">
        <h5>Max MP (BigInt)</h5>
        <code>
          (50 + effectiveInt × 15 + level × 20 + effectiveWis × 10) × (prestigeLevel + 1)
          <br />
          = (50 + {intBreakdown.total.toFixed(1)} × 15 + {character.level} × 20 + {wisBreakdown.total.toFixed(1)} × 10) × {character.prestigeLevel + 1}
          <br />
          = (50 + {(intBreakdown.total * 15).toFixed(1)} + {character.level * 20} + {(wisBreakdown.total * 10).toFixed(1)}) × {character.prestigeLevel + 1}
          <br />
          = <strong>{maxMpCalc.toString()}</strong>
        </code>
      </div>
      
      <div className="formula-section">
        <h5>Critical Chance</h5>
        <code>
          min(5 + effectiveDex × 0.02 + effectiveInt × 0.01, 75)
          <br />
          = min(5 + {dexBreakdown.total.toFixed(1)} × 0.02 + {intBreakdown.total.toFixed(1)} × 0.01, 75)
          <br />
          = min(5 + {(dexBreakdown.total * 0.02).toFixed(2)} + {(intBreakdown.total * 0.01).toFixed(2)}, 75)
          <br />
          = <strong>{criticalChance.toFixed(2)}%</strong>
        </code>
      </div>

      <div className="formula-section">
        <h5>Tier System Explanation</h5>
        <div style={{fontSize: '11px', color: '#ccc', marginTop: '10px'}}>
          <p><strong>Base Stats:</strong> Soft-capped at 100 points</p>
          <p><strong>Tier Bonus:</strong> Each tier adds 50 effective points (infinite scaling)</p>
          <p><strong>Gear Bonus:</strong> Logarithmic scaling: log10(bonus + 1) × 20</p>
          <p><strong>Paragon Bonus:</strong> Logarithmic scaling: log10(paragon + 1) × 10</p>
          <p><strong>Prestige Multiplier:</strong> 1 + (prestigeLevel × 0.1)</p>
          <p><strong>Infinite Scaling:</strong> No hard caps, tiers provide exponential growth</p>
        </div>
      </div>
    </div>
  );
};