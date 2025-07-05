import React, { useState } from 'react';
import { useDevMode } from './hooks/useDevMode';
import { CharacterInspector } from './components/CharacterInspector';
import { StatCalculator } from './components/StatCalculator';
import { MockDataInjector } from './components/MockDataInjector';
import { FormulaVisualizer } from './components/FormulaVisualizer';
import './styles/dev-panel.css';

// Import character types from server package
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

export const DevPanel: React.FC = () => {
  const { isEnabled, currentPhase } = useDevMode();
  const [activeTab, setActiveTab] = useState<'inspector' | 'calculator' | 'injector' | 'formulas'>('inspector');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  
  if (!isEnabled) return null;

  return (
    <div className="dev-panel" data-testid="dev-panel">
      <div className="dev-panel-header">
        <h3>🛠️ Aeturnis Dev Tools - Phase {currentPhase}</h3>
        <button 
          className="dev-panel-toggle"
          onClick={() => document.querySelector('.dev-panel')?.classList.toggle('minimized')}
        >
          _
        </button>
      </div>
      
      <div className="dev-panel-tabs">
        <button 
          className={activeTab === 'inspector' ? 'active' : ''}
          onClick={() => setActiveTab('inspector')}
        >
          Character Inspector
        </button>
        <button 
          className={activeTab === 'calculator' ? 'active' : ''}
          onClick={() => setActiveTab('calculator')}
        >
          Stat Calculator
        </button>
        <button 
          className={activeTab === 'injector' ? 'active' : ''}
          onClick={() => setActiveTab('injector')}
        >
          Mock Data
        </button>
        <button 
          className={activeTab === 'formulas' ? 'active' : ''}
          onClick={() => setActiveTab('formulas')}
        >
          Formulas
        </button>
      </div>
      
      <div className="dev-panel-content">
        {activeTab === 'inspector' && (
          <CharacterInspector 
            character={selectedCharacter}
            onCharacterChange={setSelectedCharacter}
          />
        )}
        {activeTab === 'calculator' && (
          <StatCalculator character={selectedCharacter} />
        )}
        {activeTab === 'injector' && (
          <MockDataInjector onInject={setSelectedCharacter} />
        )}
        {activeTab === 'formulas' && (
          <FormulaVisualizer character={selectedCharacter} />
        )}
      </div>
    </div>
  );
};