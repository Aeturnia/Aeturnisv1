import React from 'react';

export type TabType = 'auth' | 'character' | 'combat' | 'monsters' | 'npcs' | 'death' | 'loot' | 'logs';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  badges?: Partial<Record<TabType, string | number>>;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  badges = {},
}) => {
  const tabs: { id: TabType; label: string; emoji: string }[] = [
    { id: 'auth', label: 'Auth', emoji: '🔐' },
    { id: 'character', label: 'Character', emoji: '⚔️' },
    { id: 'combat', label: 'Combat', emoji: '⚡' },
    { id: 'monsters', label: 'Monsters', emoji: '👹' },
    { id: 'npcs', label: 'NPCs', emoji: '🧙' },
    { id: 'death', label: 'Death', emoji: '💀' },
    { id: 'loot', label: 'Loot', emoji: '🎁' },
    { id: 'logs', label: 'Logs', emoji: '📊' },
  ];

  return (
    <nav className="tab-navigation">
      <div className="tab-list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="tab-emoji">{tab.emoji}</span>
            <span className="tab-label">{tab.label}</span>
            {badges[tab.id] && (
              <span className="tab-badge">{badges[tab.id]}</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};