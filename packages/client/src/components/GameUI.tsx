import { useGame } from '../stores/gameStore';
import styles from './GameUI.module.css';

export function GameUI() {
  const { isConnected } = useGame();
  
  const handleAction = (action: string) => {
    // Here you would typically send the action to the game server
    console.warn(`Game action: ${action}`);
  };

  return (
    <div className={styles.gameUI}>
      {/* Character stats moved to Character Info panel */}

      <div className={`${styles.uiPanel} ${styles.bottomCenter}`}>
        <div className={styles.actionButtons}>
          <button onClick={() => handleAction('move_north')}>↑</button>
          <button onClick={() => handleAction('move_west')}>←</button>
          <button onClick={() => handleAction('move_south')}>↓</button>
          <button onClick={() => handleAction('move_east')}>→</button>
          <button onClick={() => handleAction('attack')}>Attack</button>
          <button onClick={() => handleAction('defend')}>Defend</button>
        </div>
      </div>

      <div className={`${styles.uiPanel} ${styles.topRight}`}>
        <h4>Game Status</h4>
        <div className={styles.statusInfo}>
          <p>Connection: {isConnected ? '🟢 Online' : '🔴 Offline'}</p>
          <p>Players Online: 1</p>
          <p>Current Zone: Tutorial Area</p>
        </div>
      </div>
    </div>
  );
}