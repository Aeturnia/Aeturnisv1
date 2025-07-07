import React, { useState } from 'react';
import { TestButton } from '../common/TestButton';
import { ResponseViewer } from '../common/ResponseViewer';
import { useApi } from '../../hooks/useApi';

export const ProgressionPanel: React.FC = () => {
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [characterId, setCharacterId] = useState('test_player');
  const [expAmount, setExpAmount] = useState('1000');
  const [expSource, setExpSource] = useState('quest');
  const [statType, setStatType] = useState('strength');
  const [statAmount, setStatAmount] = useState('1');
  const api = useApi();

  const testProgressionEndpoints = async (action: string) => {
    setLoading(true);
    try {
      let result: any;
      
      switch (action) {
        case 'progression-test':
          result = await api.get('/api/v1/progression/test');
          break;
        case 'character-progression':
          result = await api.get(`/api/v1/progression/${characterId}`);
          break;
        case 'award-experience':
          result = await api.post('/api/v1/progression/award-xp', {
            characterId,
            amount: expAmount,
            source: expSource
          });
          break;
        case 'allocate-stat':
          result = await api.post('/api/v1/progression/allocate-stat', {
            characterId,
            stat: statType,
            amount: parseInt(statAmount)
          });
          break;
        case 'power-score':
          result = await api.get(`/api/v1/progression/power-score/${characterId}`);
          break;
        default:
          result = { success: false, message: 'Unknown action' };
      }
      
      setResponse(result || { success: false, message: 'No response received' });
    } catch (error) {
      console.error('Progression endpoint error:', error);
      setResponse({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        error: String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const expSources = [
    { value: 'quest', label: 'Quest Completion' },
    { value: 'combat', label: 'Combat Victory' },
    { value: 'exploration', label: 'Exploration' },
    { value: 'crafting', label: 'Crafting' },
    { value: 'gathering', label: 'Resource Gathering' },
    { value: 'admin', label: 'Admin Award' }
  ];

  const statTypes = [
    { value: 'strength', label: 'Strength (STR)' },
    { value: 'agility', label: 'Agility (AGI)' },
    { value: 'intelligence', label: 'Intelligence (INT)' },
    { value: 'stamina', label: 'Stamina (STA)' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-cyan-400 mb-4">Progression System Testing</h2>
        <p className="text-gray-300 mb-6">
          Test the Aeturnis Infinite Progression Engine (AIPE) with BigInt experience, stat allocation, and power scoring.
        </p>

        {/* Character Selection */}
        <div className="mb-6">
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

        {/* Experience Award Configuration */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Experience Amount:
            </label>
            <input
              type="number"
              value={expAmount}
              onChange={(e) => setExpAmount(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-cyan-400"
              placeholder="1000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Experience Source:
            </label>
            <select
              value={expSource}
              onChange={(e) => setExpSource(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-cyan-400"
            >
              {expSources.map((source) => (
                <option key={source.value} value={source.value}>
                  {source.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stat Allocation Configuration */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stat Type:
            </label>
            <select
              value={statType}
              onChange={(e) => setStatType(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-cyan-400"
            >
              {statTypes.map((stat) => (
                <option key={stat.value} value={stat.value}>
                  {stat.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stat Points:
            </label>
            <input
              type="number"
              value={statAmount}
              onChange={(e) => setStatAmount(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white focus:border-cyan-400"
              placeholder="1"
              min="1"
              max="10"
            />
          </div>
        </div>

        {/* Progression Testing Actions */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <TestButton
            onClick={() => testProgressionEndpoints('progression-test')}
            loading={loading}
            variant="primary"
          >
            Progression Test
          </TestButton>
          
          <TestButton
            onClick={() => testProgressionEndpoints('character-progression')}
            loading={loading}
            variant="secondary"
          >
            Get Progression
          </TestButton>
          
          <TestButton
            onClick={() => testProgressionEndpoints('power-score')}
            loading={loading}
            variant="secondary"
          >
            Power Score
          </TestButton>
          
          <TestButton
            onClick={() => testProgressionEndpoints('award-experience')}
            loading={loading}
            variant="success"
          >
            Award Experience
          </TestButton>
          
          <TestButton
            onClick={() => testProgressionEndpoints('allocate-stat')}
            loading={loading}
            variant="success"
          >
            Allocate Stat Points
          </TestButton>
        </div>

        {/* AIPE Information */}
        <div className="bg-gray-700 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-cyan-300 mb-2">AIPE Features</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Infinite character progression with BigInt experience support</li>
            <li>• Dynamic experience formulas: baseExp × level × growthFactor</li>
            <li>• Stat allocation system with tier progression and soft caps</li>
            <li>• Power score calculation for character comparison</li>
            <li>• Paragon points (level 100+) and prestige mechanics (level 500+)</li>
          </ul>
        </div>

        <ResponseViewer 
          response={response ? JSON.stringify(response, null, 2) : ''} 
          success={!response || response.success !== false} 
          loading={loading} 
          title="Progression System Response" 
        />
      </div>
    </div>
  );
};