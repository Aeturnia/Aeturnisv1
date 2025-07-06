import React from 'react';
import { TestButton } from '../common/TestButton';

interface NPC {
  id: string;
  name: string;
  display_name?: string;
  type: string;
  position: { x: number; y: number; z: number };
  dialogue_tree?: any;
  services?: any;
}

interface NPCListProps {
  npcs: NPC[];
  onInteract: (npcId: string) => void;
  loading: boolean;
  isAuthenticated: boolean;
  selectedNpcId?: string;
}

export const NPCList: React.FC<NPCListProps> = ({
  npcs,
  onInteract,
  loading,
  isAuthenticated,
  selectedNpcId,
}) => {
  const getNPCIcon = (type: string) => {
    switch (type) {
      case 'quest_giver': return '📜';
      case 'merchant': return '🛒';
      case 'trainer': return '🎯';
      case 'guard': return '🛡️';
      default: return '🧙';
    }
  };

  const formatNPCType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="npc-list">
      <h3>NPCs in Zone ({npcs.length})</h3>
      
      {!isAuthenticated && (
        <div className="warning">
          🔒 Login required to view NPCs
        </div>
      )}
      
      {isAuthenticated && npcs.length === 0 && (
        <div className="no-npcs">
          <p>No NPCs found in this zone</p>
          <p><em>Mock NPCs are displayed below for testing:</em></p>
        </div>
      )}
      
      {/* Mock NPCs for testing when none exist */}
      {isAuthenticated && npcs.length === 0 && (
        <div className="mock-npcs">
          {[
            {
              id: 'mock-npc-1',
              name: 'elder_sage',
              display_name: 'Elder Sage',
              type: 'quest_giver',
              position: { x: 50, y: 0, z: 50 },
              dialogue_tree: { greeting: 'Welcome, traveler!' },
              services: ['quests', 'lore']
            },
            {
              id: 'mock-npc-2',
              name: 'weapon_merchant',
              display_name: 'Weapon Merchant',
              type: 'merchant',
              position: { x: 75, y: 0, z: 30 },
              dialogue_tree: { greeting: 'Looking for fine weapons?' },
              services: ['shop', 'repair']
            }
          ].map((npc) => (
            <div 
              key={npc.id} 
              className={`npc-item mock-item ${selectedNpcId === npc.id ? 'selected' : ''}`}
            >
              <div className="npc-header">
                <div className="npc-icon">{getNPCIcon(npc.type)}</div>
                <div className="npc-info">
                  <h4>{npc.display_name} <em>(Mock)</em></h4>
                  <span className="npc-type">{formatNPCType(npc.type)}</span>
                </div>
              </div>
              
              <div className="npc-details">
                <div className="position">
                  Position: ({npc.position.x}, {npc.position.y}, {npc.position.z})
                </div>
                
                {npc.services && (
                  <div className="services">
                    Services: {npc.services.join(', ')}
                  </div>
                )}
                
                {npc.type === 'quest_giver' && (
                  <div className="quest-indicator">
                    ❗ Has quests available
                  </div>
                )}
              </div>
              
              <TestButton
                onClick={() => onInteract(npc.id)}
                loading={loading}
                variant="primary"
                size="small"
              >
                Start Dialogue
              </TestButton>
            </div>
          ))}
        </div>
      )}
      
      {/* Real NPCs */}
      {isAuthenticated && npcs.map((npc) => (
        <div 
          key={npc.id} 
          className={`npc-item ${selectedNpcId === npc.id ? 'selected' : ''}`}
        >
          <div className="npc-header">
            <div className="npc-icon">{getNPCIcon(npc.type)}</div>
            <div className="npc-info">
              <h4>{npc.display_name || npc.name}</h4>
              <span className="npc-type">{formatNPCType(npc.type)}</span>
            </div>
          </div>
          
          <div className="npc-details">
            <div className="position">
              Position: ({npc.position.x}, {npc.position.y}, {npc.position.z})
            </div>
            
            {npc.services && (
              <div className="services">
                Services: {Object.keys(npc.services).join(', ')}
              </div>
            )}
            
            {npc.type === 'quest_giver' && (
              <div className="quest-indicator">
                ❗ Has quests available
              </div>
            )}
          </div>
          
          <TestButton
            onClick={() => onInteract(npc.id)}
            loading={loading}
            variant="primary"
            size="small"
          >
            Start Dialogue
          </TestButton>
        </div>
      ))}
    </div>
  );
};