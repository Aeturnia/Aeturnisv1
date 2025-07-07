import React from 'react';
import { TestButton } from '../common/TestButton';

interface NPC {
  id: string;
  name: string;
  display_name?: string;
  npcType: string;
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
      
      {npcs.length === 0 && (
        <div className="no-npcs">
          <p>No NPCs found in this zone</p>
        </div>
      )}
      
      {/* Real NPCs */}
      {npcs.filter(npc => npc && npc.id).map((npc) => {
        // Bulletproof position handling
        const safePosition = npc.position && typeof npc.position === 'object'
          ? {
              x: npc.position.x ?? 0,
              y: npc.position.y ?? 0,
              z: npc.position.z ?? 0
            }
          : { x: 0, y: 0, z: 0 };
        
        return (
        <div 
          key={npc.id} 
          className={`npc-item ${selectedNpcId === npc.id ? 'selected' : ''}`}
        >
          <div className="npc-header">
            <div className="npc-icon">{getNPCIcon(npc.npcType)}</div>
            <div className="npc-info">
              <h4>{npc.display_name || npc.name}</h4>
              <span className="npc-type">{formatNPCType(npc.npcType)}</span>
            </div>
          </div>
          
          <div className="npc-details">
            <div className="position">
              Position: ({safePosition.x}, {safePosition.y}, {safePosition.z})
            </div>
            
            {npc.services && (
              <div className="services">
                Services: {Object.keys(npc.services).join(', ')}
              </div>
            )}
            
            {npc.npcType === 'quest_giver' && (
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
        );
      })}
    </div>
  );
};