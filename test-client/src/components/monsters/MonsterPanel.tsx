import React, { useState, useEffect } from 'react';
import { TestButton } from '../common/TestButton';
import { ResponseViewer } from '../common/ResponseViewer';
import { MonsterList } from './MonsterList';
import { SpawnControl } from './SpawnControl';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';

interface TestState {
  loading: boolean;
  response: string;
  success: boolean;
}

export const MonsterPanel: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const api = useApi(token);
  
  const [monsterTest, setMonsterTest] = useState<TestState>({ loading: false, response: '', success: false });
  const [selectedZone, setSelectedZone] = useState<string>('tutorial_area');
  const [monsters, setMonsters] = useState<any[]>([]);
  const [spawnPoints, setSpawnPoints] = useState<any[]>([]);

  useEffect(() => {
    if (selectedZone) {
      fetchMonstersInZone();
      fetchSpawnPoints();
    }
  }, [selectedZone]);

  const fetchMonstersInZone = async () => {
    try {
      console.log('=== DEBUG: Fetching monsters for zone:', selectedZone);
      const result = await api.get(`/api/v1/monsters/zone/${selectedZone}`);
      console.log('=== DEBUG: Monsters API raw response:', result);
      
      if (result && result.success && result.data && result.data.monsters) {
        const rawMonsters = result.data.monsters;
        console.log('=== DEBUG: Raw monsters before transformation:', rawMonsters);
        
        // Transform monsters to match MonsterList interface
        const transformedMonsters = rawMonsters.map((monster: any) => {
          console.log('=== DEBUG: Processing monster:', monster);
          console.log('=== DEBUG: Monster position:', monster.position);
          
          // Ensure position exists with robust fallback
          const safePosition = monster.position && typeof monster.position === 'object' 
            ? {
                x: monster.position.x || 0,
                y: monster.position.y || 0,
                z: monster.position.z || 0
              }
            : { x: 0, y: 0, z: 0 };
          
          const result = {
            id: monster.id || 'unknown',
            name: monster.monsterTypeId === 'goblin' ? 'Forest Goblin' : 
                  monster.monsterTypeId === 'orc' ? 'Cave Orc' : 
                  monster.monsterTypeId || 'Unknown Monster',
            currentHp: monster.currentHp || 100,
            maxHp: monster.monsterTypeId === 'goblin' ? 100 : 
                   monster.monsterTypeId === 'orc' ? 150 : 100,
            state: monster.state || 'idle',
            position: safePosition,
            aggroList: monster.aggroList || []
          };
          
          console.log('=== DEBUG: Transformed monster:', result);
          return result;
        });
        
        console.log('=== DEBUG: Transformed monsters:', transformedMonsters);
        setMonsters(transformedMonsters);
      } else {
        console.log('=== DEBUG: No monsters data found, clearing array');
        setMonsters([]);
      }
    } catch (error) {
      console.error('=== DEBUG: Failed to fetch monsters:', error);
      setMonsters([]);
    }
  };

  const fetchSpawnPoints = async () => {
    try {
      console.log('=== DEBUG: Fetching spawn points for zone:', selectedZone);
      const result = await api.get(`/api/v1/monsters/spawn-points/${selectedZone}`);
      console.log('=== DEBUG: Spawn points API raw response:', result);
      
      if (result && result.success && result.data && result.data.spawnPoints) {
        const rawSpawnPoints = result.data.spawnPoints;
        console.log('=== DEBUG: Raw spawn points before transformation:', rawSpawnPoints);
        
        // Transform spawn points to match expected interface
        const transformedSpawnPoints = rawSpawnPoints.map((spawnPoint: any) => {
          console.log('=== DEBUG: Processing spawn point:', spawnPoint);
          
          // Spawn points have x, y directly, not in position object
          const safeSpawnPoint = {
            id: spawnPoint.id || 'unknown',
            name: spawnPoint.name || 'Unknown Spawn Point',
            zone: spawnPoint.zone || selectedZone,
            position: {
              x: spawnPoint.x ?? 0,
              y: spawnPoint.y ?? 0,
              z: spawnPoint.z ?? 0
            },
            spawnRadius: spawnPoint.spawnRadius || 10,
            maxMonsters: spawnPoint.maxMonsters || 1,
            respawnTime: spawnPoint.respawnTime || 300,
            monsterTypes: spawnPoint.monsterTypes || [],
            isActive: spawnPoint.isActive !== false
          };
          
          console.log('=== DEBUG: Transformed spawn point:', safeSpawnPoint);
          return safeSpawnPoint;
        });
        
        console.log('=== DEBUG: Transformed spawn points:', transformedSpawnPoints);
        setSpawnPoints(transformedSpawnPoints);
      } else {
        console.log('=== DEBUG: No spawn points data found, clearing array');
        setSpawnPoints([]);
      }
    } catch (error) {
      console.error('=== DEBUG: Failed to fetch spawn points:', error);
      setSpawnPoints([]);
    }
  };

  const testMonsterSystem = async () => {
    setMonsterTest({ loading: true, response: '', success: false });
    
    try {
      const result = await api.get(`/api/v1/monsters/zone/${selectedZone}`);
      setMonsterTest({
        loading: false,
        response: JSON.stringify(result, null, 2),
        success: result.success
      });
      
      if (result.success && result.data?.monsters) {
        setMonsters(result.data.monsters);
      }
    } catch (error) {
      setMonsterTest({
        loading: false,
        response: `Error: ${error}`,
        success: false
      });
    }
  };

  const handleMonsterAction = async (monsterId: string, action: string, data?: any) => {
    setMonsterTest({ loading: true, response: '', success: false });
    
    try {
      let result;
      if (action === 'kill') {
        result = await api.delete(`/api/v1/monsters/${monsterId}`);
        
        // Immediately update UI by removing the monster
        if (result?.success) {
          setMonsters(prevMonsters => prevMonsters.filter(m => m.id !== monsterId));
        }
      } else if (action === 'updateState') {
        result = await api.patch(`/api/v1/monsters/${monsterId}/state`, { 
          state: data?.state || 'alive' 
        });
        
        // Immediately update UI with new state
        if (result?.success) {
          setMonsters(prevMonsters => 
            prevMonsters.map(m => 
              m.id === monsterId 
                ? { ...m, state: data?.state || 'alive' }
                : m
            )
          );
        }
      }
      
      if (result) {
        setMonsterTest({
          loading: false,
          response: JSON.stringify({
            action: action,
            monsterId: monsterId,
            success: result.success,
            result: result.data || result,
            timestamp: new Date().toISOString()
          }, null, 2),
          success: result.success
        });
        
        // Also refresh from server to ensure data consistency
        if (result.success) {
          setTimeout(() => {
            fetchMonstersInZone();
          }, 500);
        }
      }
    } catch (error) {
      setMonsterTest({
        loading: false,
        response: `Error performing ${action}: ${error}`,
        success: false
      });
    }
  };

  const handleSpawn = async (spawnPointId: string) => {
    setMonsterTest({ loading: true, response: '', success: false });
    
    try {
      const result = await api.post('/api/v1/monsters/spawn', { spawnPointId });
      setMonsterTest({
        loading: false,
        response: JSON.stringify(result, null, 2),
        success: result.success
      });
      
      if (result.success) {
        fetchMonstersInZone(); // Refresh monster list
      }
    } catch (error) {
      setMonsterTest({
        loading: false,
        response: `Error spawning monster: ${error}`,
        success: false
      });
    }
  };

  const zones = [
    { id: 'tutorial_area', name: 'Tutorial Area' },
    { id: 'forest_grove', name: 'Forest Grove' },
    { id: 'mountain_peak', name: 'Mountain Peak' },
    { id: 'dark_dungeon', name: 'Dark Dungeon' },
  ];

  return (
    <div className="tab-content">
      <div className="section">
        <h2>👹 Monster System</h2>
        <p>Test monster spawning, management, and AI behavior in different zones.</p>
        
        {!isAuthenticated && (
          <div className="warning">
            ⚠️ Authentication required to access monster management
          </div>
        )}
      </div>

      <div className="zone-selector">
        <label>Select Zone:</label>
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
        
        <TestButton
          onClick={testMonsterSystem}
          loading={monsterTest.loading}
          disabled={!isAuthenticated}
          variant="primary"
          size="small"
        >
          Refresh Monsters
        </TestButton>
      </div>

      <div className="grid-container">
        <div className="test-section">
          <MonsterList
            monsters={monsters.map(monster => ({
              ...monster,
              currentHp: monster.hp || monster.stats?.hp || 100,
              maxHp: monster.maxHp || monster.stats?.maxHp || 100
            }))}
            onAction={handleMonsterAction}
            loading={monsterTest.loading}
            isAuthenticated={true}
          />
          
          <div style={{ fontSize: '12px', color: '#666', marginTop: '8px', padding: '8px', border: '1px solid #333' }}>
            Debug: monsters.length={monsters?.length} | Raw data: {JSON.stringify(monsters?.slice(0,1), null, 2)}
          </div>
        </div>

        <div className="test-section">
          <SpawnControl
            spawnPoints={spawnPoints}
            onSpawn={handleSpawn}
            loading={monsterTest.loading}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>

      <ResponseViewer
        response={monsterTest.response}
        success={monsterTest.success}
        loading={monsterTest.loading}
        title="Monster System Response"
      />
    </div>
  );
};