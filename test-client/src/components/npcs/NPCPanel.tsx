import React, { useState, useEffect } from 'react';
import { TestButton } from '../common/TestButton';
import { ResponseViewer } from '../common/ResponseViewer';
import { NPCList } from './NPCList';
import { DialogueViewer } from './DialogueViewer';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';

interface TestState {
  loading: boolean;
  response: string;
  success: boolean;
}

export const NPCPanel: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const api = useApi(token);
  
  const [npcTest, setNpcTest] = useState<TestState>({ loading: false, response: '', success: false });
  const [selectedZone, setSelectedZone] = useState<string>('tutorial_area');
  const [npcs, setNpcs] = useState<any[]>([]);
  const [selectedNpc, setSelectedNpc] = useState<any>(null);
  const [dialogueState, setDialogueState] = useState<any>(null);
  const [npcTypeFilter, setNpcTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (selectedZone) {
      fetchNPCsInZone();
    }
  }, [selectedZone]);

  const fetchNPCsInZone = async () => {
    try {
      console.log('=== DEBUG: Fetching NPCs for zone:', selectedZone);
      const result = await api.get(`/api/v1/npcs/zone/${selectedZone}`);
      console.log('=== DEBUG: NPCs API raw response:', result);
      
      if (result && result.success && result.data && result.data.npcs) {
        const rawNpcs = result.data.npcs;
        console.log('=== DEBUG: Raw NPCs before transformation:', rawNpcs);
        
        // Transform NPCs to match NPCList interface  
        const transformedNpcs = rawNpcs.map((npc: any) => {
          console.log('=== DEBUG: Processing NPC:', npc);
          console.log('=== DEBUG: NPC position:', npc.position);
          
          // Ensure position exists with robust fallback
          const safePosition = npc.position && typeof npc.position === 'object' 
            ? {
                x: npc.position.x || 0,
                y: npc.position.y || 0,
                z: npc.position.z || 0
              }
            : { x: 0, y: 0, z: 0 };
          
          const result = {
            id: npc.id || 'unknown',
            name: npc.displayName || npc.name || 'Unknown NPC',
            display_name: npc.displayName || npc.name || 'Unknown NPC',
            npcType: npc.type || 'merchant',
            position: safePosition,
            dialogue_tree: npc.dialogueTreeId,
            services: npc.metadata?.shopkeeper ? { trade: true } : undefined
          };
          
          console.log('=== DEBUG: Transformed NPC:', result);
          return result;
        });
        
        console.log('=== DEBUG: Transformed NPCs:', transformedNpcs);
        setNpcs(transformedNpcs);
      } else {
        console.log('=== DEBUG: No NPCs data found, clearing array');
        setNpcs([]);
      }
    } catch (error) {
      console.error('=== DEBUG: Failed to fetch NPCs:', error);
      setNpcs([]);
    }
  };

  const testNPCSystem = async () => {
    setNpcTest({ loading: true, response: '', success: false });
    
    try {
      const result = await api.get(`/api/v1/npcs/zone/${selectedZone}`);
      setNpcTest({
        loading: false,
        response: JSON.stringify(result, null, 2),
        success: result.success
      });
      
      if (result.success && result.data?.npcs) {
        setNpcs(result.data.npcs);
      }
    } catch (error) {
      setNpcTest({
        loading: false,
        response: `Error: ${error}`,
        success: false
      });
    }
  };

  const startInteraction = async (npcId: string) => {
    setNpcTest({ loading: true, response: '', success: false });
    
    try {
      const result = await api.post(`/api/v1/npcs/${npcId}/interact`, {
        characterId: 'player-test-001'
      });
      
      setNpcTest({
        loading: false,
        response: JSON.stringify(result, null, 2),
        success: result.success
      });
      
      if (result.success && result.data) {
        setDialogueState(result.data);
        const npc = npcs.find(n => n.id === npcId);
        setSelectedNpc(npc);
      }
    } catch (error) {
      setNpcTest({
        loading: false,
        response: `Error starting interaction: ${error}`,
        success: false
      });
    }
  };

  const advanceDialogue = async (choice: number) => {
    if (!selectedNpc) return;
    
    setNpcTest({ loading: true, response: '', success: false });
    
    try {
      const result = await api.post(`/api/v1/npcs/${selectedNpc.id}/dialogue/advance`, {
        characterId: 'player-test-001',
        choice
      });
      
      setNpcTest({
        loading: false,
        response: JSON.stringify(result, null, 2),
        success: result.success
      });
      
      if (result.success && result.data) {
        setDialogueState(result.data);
      }
    } catch (error) {
      setNpcTest({
        loading: false,
        response: `Error advancing dialogue: ${error}`,
        success: false
      });
    }
  };

  const filteredNPCs = npcs.filter(npc => {
    if (npcTypeFilter === 'all') return true;
    return npc.npcType === npcTypeFilter || npc.npcType === npcTypeFilter.replace('_', '');
  });

  const zones = [
    { id: 'tutorial_area', name: 'Tutorial Area' },
    { id: 'forest_grove', name: 'Forest Grove' },
    { id: 'mountain_peak', name: 'Mountain Peak' },
    { id: 'town_center', name: 'Town Center' },
  ];

  const npcTypes = [
    { id: 'all', name: 'All NPCs' },
    { id: 'quest_giver', name: 'Quest Givers' },
    { id: 'merchant', name: 'Merchants' },
    { id: 'trainer', name: 'Trainers' },
    { id: 'guard', name: 'Guards' },
  ];

  return (
    <div className="tab-content">
      <div className="section">
        <h2>🧙 NPC System</h2>
        <p>Test NPC interactions, dialogue trees, and quest systems.</p>
        
        {!isAuthenticated && (
          <div className="warning">
            ⚠️ Authentication required to access NPC interactions
          </div>
        )}
      </div>

      <div className="controls-row">
        <div className="zone-selector">
          <label>Zone:</label>
          <select 
            value={selectedZone} 
            onChange={(e) => setSelectedZone(e.target.value)}
          >
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="type-filter">
          <label>Type:</label>
          <select 
            value={npcTypeFilter} 
            onChange={(e) => setNpcTypeFilter(e.target.value)}
          >
            {npcTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        
        <TestButton
          onClick={testNPCSystem}
          loading={npcTest.loading}
          disabled={!isAuthenticated}
          variant="primary"
          size="small"
        >
          Refresh NPCs
        </TestButton>
      </div>

      <div className="grid-container">
        <div className="test-section">
          <NPCList
            npcs={filteredNPCs}
            onInteract={startInteraction}
            loading={npcTest.loading}
            selectedNpcId={selectedNpc?.id}
          />
        </div>

        <div className="test-section">
          <DialogueViewer
            npc={selectedNpc}
            dialogueState={dialogueState}
            onAdvance={advanceDialogue}
            loading={npcTest.loading}
          />
        </div>
      </div>

      <ResponseViewer
        response={npcTest.response}
        success={npcTest.success}
        loading={npcTest.loading}
        title="NPC System Response"
      />
    </div>
  );
};