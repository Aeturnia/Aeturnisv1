import React, { useState } from 'react';
import { TestButton } from '../common/TestButton';
import { ResponseViewer } from '../common/ResponseViewer';
import { useApi } from '../../hooks/useApi';

export const MovementPanel: React.FC = () => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [characterId, setCharacterId] = useState('test_player');
  const [currentZone, setCurrentZone] = useState('starter_city');
  const [direction, setDirection] = useState('north');
  const api = useApi();

  const testMovementEndpoints = async (action: string) => {
    setLoading(true);
    try {
      let result;
      
      switch (action) {
        case 'movement-test':
          result = await api.get('/api/v1/movement/test');
          break;
        case 'validate-movement':
          result = await api.post('/api/v1/movement/validate', {
            characterId,
            currentZoneId: currentZone,
            direction
          });
          break;
        case 'execute-movement':
          result = await api.post('/api/v1/movement/move', {
            characterId,
            currentZoneId: currentZone,
            direction
          });
          break;
        case 'cooldown-status':
          result = await api.get(`/api/v1/movement/cooldown/${characterId}`);
          break;
        case 'movement-history':
          result = await api.get(`/api/v1/movement/history/${characterId}`);
          break;
        default:
          result = { success: false, message: 'Unknown action' };
      }
      
      setResponse(result);
    } catch (error) {
      setResponse({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const zones = [
    { id: 'starter_city', name: "Haven's Rest" },
    { id: 'forest_edge', name: 'Whispering Woods Edge' },
    { id: 'trade_road', name: "Merchant's Highway" },
    { id: 'deep_forest', name: 'Shadowheart Grove' },
    { id: 'goblin_camp', name: 'Ragtooth Goblin Camp' },
    { id: 'mining_outpost', name: 'Ironpeak Mining Outpost' },
    { id: 'crossroads', name: 'Four Winds Crossroads' },
    { id: 'ancient_ruins', name: 'Forgotten Temple Ruins' }
  ];

  const directions = [
    { value: 'north', label: 'North ⬆️' },
    { value: 'south', label: 'South ⬇️' },
    { value: 'east', label: 'East ➡️' },
    { value: 'west', label: 'West ⬅️' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-cyan-400 mb-4">Movement System Testing</h2>
        <p className="text-gray-300 mb-6">
          Test character movement validation, cooldowns, and zone transitions with 2-second movement delays.
        </p>

        {/* Movement Configuration */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Character ID:
            </label>
            <input
              type="text"
              value={characterId}
              onChange={(e) => setCharacterId(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-cyan-400"
              placeholder="test_player"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Zone:
            </label>
            <select
              value={currentZone}
              onChange={(e) => setCurrentZone(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-cyan-400"
            >
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Direction:
            </label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-cyan-400"
            >
              {directions.map((dir) => (
                <option key={dir.value} value={dir.value}>
                  {dir.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Movement Testing Actions */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <TestButton
            onClick={() => testMovementEndpoints('movement-test')}
            loading={loading}
            variant="primary"
          >
            Movement Test
          </TestButton>
          
          <TestButton
            onClick={() => testMovementEndpoints('validate-movement')}
            loading={loading}
            variant="secondary"
          >
            Validate Movement
          </TestButton>
          
          <TestButton
            onClick={() => testMovementEndpoints('execute-movement')}
            loading={loading}
            variant="success"
          >
            Execute Movement
          </TestButton>
          
          <TestButton
            onClick={() => testMovementEndpoints('cooldown-status')}
            loading={loading}
            variant="secondary"
          >
            Cooldown Status
          </TestButton>
          
          <TestButton
            onClick={() => testMovementEndpoints('movement-history')}
            loading={loading}
            variant="secondary"
          >
            Movement History
          </TestButton>
        </div>

        {/* Movement Information */}
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-cyan-300 mb-2">Movement Features</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• 2-second movement cooldown between zone transitions</li>
            <li>• Directional validation (north, south, east, west)</li>
            <li>• Level requirement checking for restricted zones</li>
            <li>• Movement history tracking for analytics</li>
            <li>• Real-time cooldown management and validation</li>
          </ul>
        </div>

        <ResponseViewer response={response} />
      </div>
    </div>
  );
};