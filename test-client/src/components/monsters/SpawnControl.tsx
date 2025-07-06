import React from 'react';
import { TestButton } from '../common/TestButton';

interface SpawnPoint {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  maxSpawns: number;
  currentSpawns: number;
  respawnTime: number;
  monsterTypeId: string;
}

interface SpawnControlProps {
  spawnPoints: SpawnPoint[];
  onSpawn: (spawnPointId: string) => void;
  loading: boolean;
  isAuthenticated: boolean;
}

export const SpawnControl: React.FC<SpawnControlProps> = ({
  spawnPoints,
  onSpawn,
  loading,
  isAuthenticated,
}) => {
  return (
    <div className="spawn-control">
      <h3>Spawn Points ({spawnPoints.length})</h3>
      
      {!isAuthenticated && (
        <div className="warning">
          🔒 Admin access required for spawn control
        </div>
      )}
      
      {isAuthenticated && spawnPoints.length === 0 && (
        <div className="no-spawn-points">
          <p>Loading spawn points from database...</p>
          <p><em>If no spawn points appear, check the database connection.</em></p>
        </div>
      )}
      
      {/* Real spawn points */}
      {isAuthenticated && spawnPoints.map((spawnPoint) => (
        <div key={spawnPoint.id} className="spawn-point-item">
          <div className="spawn-point-header">
            <h4>{spawnPoint.name}</h4>
            <span className="spawn-capacity">
              {spawnPoint.currentSpawns}/{spawnPoint.maxSpawns}
            </span>
          </div>
          
          <div className="spawn-point-info">
            <div className="position">
              Position: ({spawnPoint.position.x}, {spawnPoint.position.y}, {spawnPoint.position.z})
            </div>
            <div className="respawn-time">
              Respawn: {spawnPoint.respawnTime}s
            </div>
            <div className="monster-type">
              Type: {spawnPoint.monsterTypeId}
            </div>
          </div>
          
          <TestButton
            onClick={() => onSpawn(spawnPoint.id)}
            loading={loading}
            variant="success"
            size="small"
            disabled={spawnPoint.currentSpawns >= spawnPoint.maxSpawns}
          >
            Spawn Monster
          </TestButton>
        </div>
      ))}
    </div>
  );
};