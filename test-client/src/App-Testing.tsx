import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Navigation, TabType } from './components/layout/Navigation';
import { StatusPanel } from './components/layout/StatusPanel';
import { AuthPanel } from './components/auth/AuthPanel';
import { CharacterPanel } from './components/character/CharacterPanel';
import { CombatPanel } from './components/combat/CombatPanel';
import { MonsterPanel } from './components/monsters/MonsterPanel';
import { NPCPanel } from './components/npcs/NPCPanel';
import { DeathPanel } from './components/death/DeathPanel';
import { LootPanel } from './components/loot/LootPanel';
import { ZonePanel } from './components/zones/ZonePanel';
import { MovementPanel } from './components/movement/MovementPanel';
import { ProgressionPanel } from './components/progression/ProgressionPanel';
import { LogsPanel } from './components/logs/LogsPanel';
import { useApi } from './hooks/useApi';

interface ApiResponse {
  status?: string;
  message?: string;
  version?: string;
  architecture?: string;
  uptime?: number;
  timestamp?: string;
  endpoints?: Record<string, string>;
  services?: Record<string, string>;
}

function AppTesting() {
  const [activeTab, setActiveTab] = useState<TabType>('auth');
  const [apiStatus, setApiStatus] = useState<ApiResponse>({});
  const api = useApi();

  useEffect(() => {
    fetchApiStatus();
  }, []);

  const fetchApiStatus = async () => {
    try {
      const result = await api.get('/api/status');
      if (result.success) {
        setApiStatus(result.data);
      } else {
        console.error('API status error:', result.message);
      }
    } catch (error) {
      console.error('Failed to fetch API status:', error);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'auth':
        return <AuthPanel />;
      case 'character':
        return <CharacterPanel />;
      case 'combat':
        return <CombatPanel />;
      case 'monsters':
        return <MonsterPanel />;
      case 'npcs':
        return <NPCPanel />;
      case 'death':
        return <DeathPanel />;
      case 'loot':
        return <LootPanel />;
      case 'zones':
        return <ZonePanel />;
      case 'movement':
        return <MovementPanel />;
      case 'progression':
        return <ProgressionPanel />;
      case 'logs':
        return <LogsPanel />;
      default:
        return <AuthPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      <StatusPanel apiStatus={apiStatus} />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderActiveTab()}
      </main>
    </div>
  );
}

export default AppTesting;