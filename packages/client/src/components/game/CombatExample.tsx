import React, { useEffect, useState } from 'react';
import { useCombat, useWebSocketStatus, useOfflineQueue } from '../../providers/ServiceProvider';
import { CombatActionRequest } from '@aeturnis/shared';

export function CombatExample() {
  const { 
    activeCombat, 
    combatStats, 
    startCombat, 
    processAction, 
    fleeCombat 
  } = useCombat();
  
  const wsStatus = useWebSocketStatus();
  const { queueSize } = useOfflineQueue();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Example: Start combat with a monster
  const handleStartCombat = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await startCombat('character-123', {
        targetId: 'monster-456',
        targetType: 'monster',
        initiatorPosition: { x: 10, y: 20, z: 0 }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start combat');
    } finally {
      setIsLoading(false);
    }
  };

  // Example: Process a combat action
  const handleAttack = async () => {
    if (!activeCombat) return;
    
    const action: CombatActionRequest = {
      action: 'attack',
      targetId: activeCombat.participants.find(p => p.id !== 'character-123')?.id
    };

    try {
      await processAction(activeCombat.sessionId, 'character-123', action);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform action');
    }
  };

  // Example: Flee from combat
  const handleFlee = async () => {
    if (!activeCombat) return;
    
    try {
      const success = await fleeCombat(activeCombat.sessionId, 'user-123');
      if (!success) {
        setError('Failed to flee from combat');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to flee');
    }
  };

  return (
    <div className="p-4">
      {/* Connection Status */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${wsStatus.connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm">
            {wsStatus.connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        {queueSize > 0 && (
          <div className="text-sm text-yellow-500">
            {queueSize} actions queued for sync
          </div>
        )}
      </div>

      {/* Combat Status */}
      {activeCombat ? (
        <div className="bg-gray-800 rounded p-4">
          <h3 className="text-lg font-bold mb-2">In Combat!</h3>
          
          {/* Participants */}
          <div className="mb-4">
            {activeCombat.participants.map(participant => (
              <div key={participant.id} className="flex justify-between">
                <span>{participant.name}</span>
                <span>{participant.currentHp}/{participant.maxHp} HP</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleAttack}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              disabled={isLoading}
            >
              Attack
            </button>
            <button
              onClick={handleFlee}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              disabled={isLoading}
            >
              Flee
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={handleStartCombat}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Starting...' : 'Start Combat'}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-2 bg-red-900 text-red-200 rounded">
          {error}
        </div>
      )}
    </div>
  );
}