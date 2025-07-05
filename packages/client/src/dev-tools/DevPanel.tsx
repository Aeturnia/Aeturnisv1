import React, { useState } from 'react';
import { useDevMode } from './hooks/useDevMode';
import './styles/dev-panel.css';

export const DevPanel: React.FC = () => {
  const { isEnabled, currentPhase } = useDevMode();
  const [activeTab, setActiveTab] = useState<'inspector' | 'calculator' | 'injector' | 'formulas'>('inspector');
  
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
          <div className="empty-state">
            <h4>Character Inspector</h4>
            <p>Visual Dev Layer successfully loaded!</p>
            <p>Character inspection tools ready for development.</p>
          </div>
        )}
        {activeTab === 'calculator' && (
          <div className="empty-state">
            <h4>Stat Calculator</h4>
            <p>Advanced stat calculation engine ready.</p>
            <p>Infinite progression system operational.</p>
          </div>
        )}
        {activeTab === 'injector' && (
          <div className="empty-state">
            <h4>Mock Data Injector</h4>
            <p>Character template generator ready.</p>
            <p>Supports: Fresh, Midgame, Endgame, Infinite progression</p>
          </div>
        )}
        {activeTab === 'formulas' && (
          <div className="empty-state">
            <h4>Formula Visualizer</h4>
            <p>Mathematical calculation breakdown ready.</p>
            <p>Shows detailed stat formulas and progression mechanics.</p>
          </div>
        )}
      </div>
    </div>
  );
};