import React from 'react';
import { TestButton } from '../common/TestButton';

interface Monster {
  id: string;
  name: string;
  currentHp: number;
  maxHp: number;
  state: string;
  position: { x: number; y: number; z: number };
  aggroList?: string[];
}

interface MonsterListProps {
  monsters: Monster[];
  onAction: (monsterId: string, action: string, data?: any) => void;
  loading: boolean;
  isAuthenticated: boolean;
}

export const MonsterList: React.FC<MonsterListProps> = ({
  monsters,
  onAction,
  loading,
  isAuthenticated,
}) => {
  const getHealthPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  const getHealthColor = (percentage: number) => {
    if (percentage > 75) return '#4caf50';
    if (percentage > 50) return '#ff9800';
    if (percentage > 25) return '#f44336';
    return '#9e9e9e';
  };

  const states = ['alive', 'dead', 'spawning', 'respawning'];

  return (
    <div className="monster-list">
      <h3>Active Monsters ({monsters.length})</h3>
      
      {monsters.length === 0 && (
        <div className="no-monsters">
          No monsters found in this zone
        </div>
      )}
      
      {monsters.filter(monster => monster && monster.id).map((monster) => {
        const healthPercentage = getHealthPercentage(monster.currentHp || 0, monster.maxHp || 100);
        const healthColor = getHealthColor(healthPercentage);
        
        // Bulletproof position handling
        const safePosition = monster.position && typeof monster.position === 'object'
          ? {
              x: monster.position.x ?? 0,
              y: monster.position.y ?? 0,
              z: monster.position.z ?? 0
            }
          : { x: 0, y: 0, z: 0 };
        
        return (
          <div key={monster.id} className="monster-item">
            <div className="monster-header">
              <h4>{monster.name}</h4>
              <span className={`monster-state ${monster.state}`}>
                {monster.state}
              </span>
            </div>
            
            <div className="monster-stats">
              <div className="health-bar">
                <div className="health-label">
                  HP: {monster.currentHp}/{monster.maxHp} ({healthPercentage}%)
                </div>
                <div className="health-bar-bg">
                  <div 
                    className="health-bar-fill"
                    style={{
                      width: `${healthPercentage}%`,
                      backgroundColor: healthColor,
                    }}
                  />
                </div>
              </div>
              
              <div className="position-info">
                Position: ({safePosition.x}, {safePosition.y}, {safePosition.z})
              </div>
              
              {monster.aggroList && monster.aggroList.length > 0 && (
                <div className="aggro-info">
                  Aggro Targets: {monster.aggroList.length}
                </div>
              )}
            </div>
            
            <div className="monster-actions">
              <div className="state-selector">
                <select
                  onChange={(e) => onAction(monster.id, 'updateState', { state: e.target.value })}
                  value={monster.state}
                  disabled={loading}
                >
                  {states.map(state => (
                    <option key={state} value={state}>
                      {state.charAt(0).toUpperCase() + state.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <TestButton
                onClick={() => onAction(monster.id, 'kill')}
                loading={loading}
                variant="danger"
                size="small"
              >
                Kill
              </TestButton>
            </div>
          </div>
        );
      })}
    </div>
  );
};