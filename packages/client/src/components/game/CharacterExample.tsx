import React, { useEffect, useState } from 'react';
import { useCharacter } from '../../hooks/useServices';
import { Character, Position, StatsAllocation } from '@aeturnis/shared';

export const CharacterExample: React.FC = () => {
  const { 
    currentCharacter, 
    characterList, 
    getCharacter, 
    getCharacters, 
    updatePosition,
    addExperience,
    allocateStats,
    service 
  } = useCharacter();
  
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load all characters on mount
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      setError(null);
      await getCharacters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load characters');
    } finally {
      setLoading(false);
    }
  };

  const loadCharacter = async (characterId: string) => {
    try {
      setLoading(true);
      setError(null);
      await getCharacter(characterId);
      setSelectedCharacterId(characterId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load character');
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (direction: 'north' | 'south' | 'east' | 'west') => {
    if (!currentCharacter) return;

    const newPosition: Position = { ...currentCharacter.position };
    switch (direction) {
      case 'north': newPosition.y += 1; break;
      case 'south': newPosition.y -= 1; break;
      case 'east': newPosition.x += 1; break;
      case 'west': newPosition.x -= 1; break;
    }

    try {
      await updatePosition(currentCharacter.id, newPosition);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move character');
    }
  };

  const handleAddExperience = async () => {
    if (!currentCharacter) return;

    try {
      const result = await addExperience(currentCharacter.id, 100);
      if (result.leveledUp) {
        alert(`Level up! You are now level ${result.newLevel}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add experience');
    }
  };

  const handleAllocateStats = async () => {
    if (!currentCharacter) return;

    const allocation: StatsAllocation = {
      strength: 1,
      dexterity: 1,
      vitality: 1
    };

    try {
      await allocateStats(currentCharacter.id, allocation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to allocate stats');
    }
  };

  // Subscribe to character updates
  useEffect(() => {
    if (!selectedCharacterId) return;

    const unsubscribe = service.subscribeToCharacterUpdates(
      selectedCharacterId,
      (update) => {
        console.log('Character updated:', update);
      }
    );

    return unsubscribe;
  }, [selectedCharacterId, service]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Character Service Example</h2>

      {/* Character List */}
      <div className="border rounded p-4">
        <h3 className="text-xl font-semibold mb-2">Character List</h3>
        <div className="grid grid-cols-2 gap-2">
          {characterList && Array.from(characterList.values()).map((char: Character) => (
            <button
              key={char.id}
              onClick={() => loadCharacter(char.id)}
              className={`p-2 border rounded ${selectedCharacterId === char.id ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              {char.name} (Level {char.level})
            </button>
          ))}
        </div>
      </div>

      {/* Current Character */}
      {currentCharacter && (
        <div className="border rounded p-4">
          <h3 className="text-xl font-semibold mb-2">Current Character</h3>
          <div className="space-y-2">
            <p><strong>Name:</strong> {currentCharacter.name}</p>
            <p><strong>Race:</strong> {currentCharacter.race}</p>
            <p><strong>Level:</strong> {currentCharacter.level}</p>
            <p><strong>Experience:</strong> {currentCharacter.experience}</p>
            <p><strong>Health:</strong> {currentCharacter.health}/{currentCharacter.maxHealth}</p>
            <p><strong>Mana:</strong> {currentCharacter.mana}/{currentCharacter.maxMana}</p>
            <p><strong>Position:</strong> {currentCharacter.position.x}, {currentCharacter.position.y} ({currentCharacter.position.zone})</p>
          </div>

          {/* Stats */}
          <div className="mt-4">
            <h4 className="font-semibold">Stats:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p>Strength: {currentCharacter.stats.strength}</p>
              <p>Intelligence: {currentCharacter.stats.intelligence}</p>
              <p>Vitality: {currentCharacter.stats.vitality}</p>
              <p>Dexterity: {currentCharacter.stats.dexterity}</p>
              <p>Wisdom: {currentCharacter.stats.wisdom}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold">Actions:</h4>
            
            {/* Movement */}
            <div className="flex gap-2">
              <button 
                onClick={() => handleMove('north')} 
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Move North
              </button>
              <button 
                onClick={() => handleMove('south')} 
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Move South
              </button>
              <button 
                onClick={() => handleMove('east')} 
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Move East
              </button>
              <button 
                onClick={() => handleMove('west')} 
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Move West
              </button>
            </div>

            {/* Experience & Stats */}
            <div className="flex gap-2">
              <button 
                onClick={handleAddExperience} 
                className="px-3 py-1 bg-green-500 text-white rounded"
              >
                Add 100 Experience
              </button>
              <button 
                onClick={handleAllocateStats} 
                className="px-3 py-1 bg-purple-500 text-white rounded"
              >
                Allocate Stats (STR+1, DEX+1, VIT+1)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};