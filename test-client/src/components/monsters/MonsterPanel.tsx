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
      const result = await api.get(`/api/v1/monsters/zone/${selectedZone}`);
      console.log('Monsters API response:', result);
      console.log('Full monsters result:', JSON.stringify(result, null, 2));
      
      if (result && result.success && result.data && result.data.monsters) {
        const monstersData = result.data.monsters;
        console.log('Extracted monsters:', monstersData);
        console.log('Is array?', Array.isArray(monstersData));
        setMonsters(Array.isArray(monstersData) ? monstersData : []);
      } else {
        console.log('No monsters data found in response');
        setMonsters([]);
      }
    } catch (error) {
      console.error('Failed to fetch monsters:', error);
      setMonsters([]);
    }
  };

  const fetchSpawnPoints = async () => {
    try {
      const result = await api.get(`/api/v1/monsters/spawn-points/${selectedZone}`);
      console.log('Spawn points API response:', result);
      console.log('Full result object:', JSON.stringify(result, null, 2));
      
      if (result && result.success && result.data && result.data.spawnPoints) {
        const spawnPointsData = result.data.spawnPoints;
        console.log('Extracted spawn points:', spawnPointsData);
        console.log('Is array?', Array.isArray(spawnPointsData));
        setSpawnPoints(Array.isArray(spawnPointsData) ? spawnPointsData : []);
      } else {
        console.log('No spawn points data found in response');
        setSpawnPoints([]);
      }
    } catch (error) {
      console.error('Failed to fetch spawn points:', error);
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
              currentHp: monster.hp || monster.stats?.hp || 0,
              maxHp: monster.maxHp || monster.stats?.maxHp || 1
            }))}
            onAction={handleMonsterAction}
            loading={monsterTest.loading}
            isAuthenticated={isAuthenticated}
          />
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