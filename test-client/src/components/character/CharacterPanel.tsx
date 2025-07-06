import React, { useState } from 'react';
import { TestButton } from '../common/TestButton';
import { ResponseViewer } from '../common/ResponseViewer';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';

interface TestState {
  loading: boolean;
  response: string;
  success: boolean;
}

export const CharacterPanel: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const api = useApi(token);
  const [characterTest, setCharacterTest] = useState<TestState>({ loading: false, response: '', success: false });

  const testCharacter = async (action: 'test' | 'validate') => {
    if (!isAuthenticated) {
      setCharacterTest({ loading: false, response: 'Need to login first', success: false });
      return;
    }

    setCharacterTest({ loading: true, response: '', success: false });
    
    try {
      let url = '';
      if (action === 'test') {
        url = '/api/v1/characters/test';
      } else if (action === 'validate') {
        url = '/api/v1/characters/validate-name/TestHero';
      }

      const result = await api.get(url);
      
      setCharacterTest({
        loading: false,
        response: JSON.stringify(result, null, 2),
        success: result.success
      });
    } catch (error) {
      setCharacterTest({
        loading: false,
        response: `Error: ${error}`,
        success: false
      });
    }
  };

  return (
    <div className="tab-content">
      <div className="section">
        <h2>⚔️ Character System</h2>
        <p>Test character creation, validation, and management with the Aeturnis Infinite Progression Engine (AIPE).</p>
        
        {!isAuthenticated && (
          <div className="warning">
            ⚠️ Authentication required to test character endpoints
          </div>
        )}
      </div>

      <div className="test-section">
        <h3>Character Operations</h3>
        <div className="button-grid">
          <TestButton
            onClick={() => testCharacter('test')}
            loading={characterTest.loading}
            disabled={!isAuthenticated}
            variant="primary"
          >
            Test Character System
          </TestButton>
          
          <TestButton
            onClick={() => testCharacter('validate')}
            loading={characterTest.loading}
            disabled={!isAuthenticated}
            variant="secondary"
          >
            Validate Character Name
          </TestButton>
        </div>

        <div className="info-section">
          <h4>Character System Features:</h4>
          <ul>
            <li>6 Character Races (Human, Elf, Dwarf, Orc, Halfling, Dragonborn)</li>
            <li>6 Character Classes (Warrior, Mage, Rogue, Paladin, Ranger, Necromancer)</li>
            <li>Infinite Progression Engine with stat tiers and paragon points</li>
            <li>Character name validation with forbidden word detection</li>
            <li>Base stats: STR, DEX, INT, WIS, CON, CHA</li>
          </ul>
        </div>
      </div>

      <ResponseViewer
        response={characterTest.response}
        success={characterTest.success}
        loading={characterTest.loading}
        title="Character System Response"
      />
    </div>
  );
};