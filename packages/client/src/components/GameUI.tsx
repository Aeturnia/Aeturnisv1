import { useGame } from '../stores/gameStore';
import styles from './GameUI.module.css';

export function GameUI() {
  const game = useGame();
  
  const handleAction = (action: string) => {
    console.log(`Performing action: ${action}`);
    // Here you would typically send the action to the game server
  };

  const currentCharacter = game?.currentCharacter || null;
  const isConnected = game?.isConnected || false;

  return (
    <div className={styles.gameUI}>
      <div className={`${styles.uiPanel} ${styles.topLeft}`}>
        <h4>Character Stats</h4>
        {currentCharacter && (
          <div className="stats">
            <div className={styles.statBar}>
              <label>Health</label>
              <div className={styles.bar}>
                <div 
                  className={`${styles.barFill} ${styles.health}`}
                  style={{ width: `${(currentCharacter.health / currentCharacter.maxHealth) * 100}%` }}
                />
              </div>
              <span>{currentCharacter.health}/{currentCharacter.maxHealth}</span>
            </div>
            <div className={styles.statBar}>
              <label>Mana</label>
              <div className={styles.bar}>
                <div 
                  className={`${styles.barFill} ${styles.mana}`}
                  style={{ width: `${(currentCharacter.mana / currentCharacter.maxMana) * 100}%` }}
                />
              </div>
              <span>{currentCharacter.mana}/{currentCharacter.maxMana}</span>
            </div>
          </div>
        )}
      </div>

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