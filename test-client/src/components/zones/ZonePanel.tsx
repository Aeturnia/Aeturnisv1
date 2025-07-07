import React, { useState } from 'react';
import { TestButton } from '../common/TestButton';
import { ResponseViewer } from '../common/ResponseViewer';
import { useApi } from '../../hooks/useApi';

export const ZonePanel: React.FC = () => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedZone, setSelectedZone] = useState('starter_city');
  const api = useApi();

  const testZoneEndpoints = async (action: string) => {
    setLoading(true);
    try {
      let result: any;
      
      switch (action) {
        case 'all-zones':
          result = await api.get('/api/v1/zones');
          break;
        case 'zone-test':
          result = await api.get('/api/v1/zones/test');
          break;
        case 'zone-details':
          result = await api.get(`/api/v1/zones/${selectedZone}`);
          break;
        case 'zone-details-with-char':
          result = await api.get(`/api/v1/zones/${selectedZone}/character/test_player`);
          break;
        default:
          result = { success: false, message: 'Unknown action' };
      }
      
      setResponse(result || { success: false, message: 'No response received' });
    } catch (error) {
      console.error('Zone endpoint error:', error);
      setResponse({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        error: String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const zones = [
    { id: 'starter_city', name: "Haven's Rest (Starter City)" },
    { id: 'forest_edge', name: 'Whispering Woods Edge' },
    { id: 'trade_road', name: "Merchant's Highway" },
    { id: 'deep_forest', name: 'Shadowheart Grove' },
    { id: 'goblin_camp', name: 'Ragtooth Goblin Camp' },
    { id: 'mining_outpost', name: 'Ironpeak Mining Outpost' },
    { id: 'crossroads', name: 'Four Winds Crossroads' },
    { id: 'ancient_ruins', name: 'Forgotten Temple Ruins' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-cyan-400 mb-4">Zone System Testing</h2>
        <p className="text-gray-300 mb-6">
          Test the comprehensive zone system with 8 interconnected zones, level requirements, and navigation paths.
        </p>

        {/* Zone Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Zone for Testing:
          </label>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-cyan-400"
          >
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </select>
        </div>

        {/* Zone Testing Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <TestButton
            onClick={() => testZoneEndpoints('zone-test')}
            loading={loading}
            variant="primary"
          >
            Zone System Test
          </TestButton>
          
          <TestButton
            onClick={() => testZoneEndpoints('all-zones')}
            loading={loading}
            variant="secondary"
          >
            Get All Zones
          </TestButton>
          
          <TestButton
            onClick={() => testZoneEndpoints('zone-details')}
            loading={loading}
            variant="secondary"
          >
            Get Zone Details
          </TestButton>
          
          <TestButton
            onClick={() => testZoneEndpoints('zone-details-with-char')}
            loading={loading}
            variant="secondary"
          >
            Zone with Character
          </TestButton>
        </div>

        {/* Zone Information */}
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-cyan-300 mb-2">Zone Features</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• 8 interconnected zones with directional exits</li>
            <li>• Level requirements (1-8) and zone types (city, normal, dungeon)</li>
            <li>• Coordinate boundaries and navigation validation</li>
            <li>• Rich zone features (shops, monsters, gathering, quests)</li>
            <li>• Character position tracking within zones</li>
          </ul>
        </div>

        <ResponseViewer 
          response={response ? JSON.stringify(response, null, 2) : ''} 
          success={!response || response.success !== false} 
          loading={loading} 
          title="Zone System Response" 
        />
      </div>
    </div>
  );
};