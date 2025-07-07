import React, { useState, useEffect, useRef } from 'react';
import { TestButton } from '../common/TestButton';
import { socketService } from '../../services/socket';
import { useAuth } from '../../hooks/useAuth';

interface LogEvent {
  id: string;
  type: string;
  event: string;
  data: any;
  timestamp: Date;
}

export const LogsPanel: React.FC = () => {
  const { token, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Setup event listeners for all socket events
    const handleSocketEvent = (eventName: string) => (data: any) => {
      const newEvent: LogEvent = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: getEventType(eventName),
        event: eventName,
        data,
        timestamp: data.timestamp || new Date(),
      };
      
      setEvents(prev => [...prev, newEvent].slice(-100)); // Keep last 100 events
    };

    // Connection events
    socketService.on('socket:connected', handleSocketEvent('socket:connected'));
    socketService.on('socket:disconnected', handleSocketEvent('socket:disconnected'));
    socketService.on('socket:error', handleSocketEvent('socket:error'));

    // Monster events
    socketService.on('monster:spawned', handleSocketEvent('monster:spawned'));
    socketService.on('monster:killed', handleSocketEvent('monster:killed'));
    socketService.on('monster:state-changed', handleSocketEvent('monster:state-changed'));

    // NPC events
    socketService.on('npc:dialogue-started', handleSocketEvent('npc:dialogue-started'));
    socketService.on('npc:dialogue-updated', handleSocketEvent('npc:dialogue-updated'));
    socketService.on('npc:trade-started', handleSocketEvent('npc:trade-started'));

    // Combat events
    socketService.on('combat:started', handleSocketEvent('combat:started'));
    socketService.on('combat:action', handleSocketEvent('combat:action'));
    socketService.on('combat:ended', handleSocketEvent('combat:ended'));

    // Death events
    socketService.on('death:occurred', handleSocketEvent('death:occurred'));
    socketService.on('death:respawned', handleSocketEvent('death:respawned'));

    // Loot events
    socketService.on('loot:dropped', handleSocketEvent('loot:dropped'));
    socketService.on('loot:picked-up', handleSocketEvent('loot:picked-up'));

    // Zone events
    socketService.on('zone:subscribed', handleSocketEvent('zone:subscribed'));
    socketService.on('zone:unsubscribed', handleSocketEvent('zone:unsubscribed'));

    // Update connection status
    const updateConnectionStatus = () => {
      const status = socketService.getConnectionStatus();
      setIsConnected(status.isConnected);
    };

    const interval = setInterval(updateConnectionStatus, 1000);
    updateConnectionStatus();

    return () => {
      clearInterval(interval);
      // Clean up event listeners
      socketService.off('socket:connected');
      socketService.off('socket:disconnected');
      socketService.off('socket:error');
      socketService.off('monster:spawned');
      socketService.off('monster:killed');
      socketService.off('monster:state-changed');
      socketService.off('npc:dialogue-started');
      socketService.off('npc:dialogue-updated');
      socketService.off('npc:trade-started');
      socketService.off('combat:started');
      socketService.off('combat:action');
      socketService.off('combat:ended');
      socketService.off('death:occurred');
      socketService.off('death:respawned');
      socketService.off('loot:dropped');
      socketService.off('loot:picked-up');
      socketService.off('zone:subscribed');
      socketService.off('zone:unsubscribed');
    };
  }, []);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events, autoScroll]);

  const getEventType = (eventName: string): string => {
    if (eventName.startsWith('socket:')) return 'socket';
    if (eventName.startsWith('monster:')) return 'monster';
    if (eventName.startsWith('npc:')) return 'npc';
    if (eventName.startsWith('combat:')) return 'combat';
    if (eventName.startsWith('death:')) return 'death';
    if (eventName.startsWith('loot:')) return 'loot';
    if (eventName.startsWith('zone:')) return 'zone';
    return 'system';
  };

  const getEventIcon = (type: string): string => {
    switch (type) {
      case 'socket': return '🔌';
      case 'monster': return '👹';
      case 'npc': return '🧙';
      case 'combat': return '⚔️';
      case 'death': return '💀';
      case 'loot': return '🎁';
      case 'zone': return '🗺️';
      default: return '📡';
    }
  };

  const getEventColor = (type: string): string => {
    switch (type) {
      case 'socket': return '#00bcd4';
      case 'monster': return '#f44336';
      case 'npc': return '#9c27b0';
      case 'combat': return '#ff9800';
      case 'death': return '#795548';
      case 'loot': return '#4caf50';
      case 'zone': return '#2196f3';
      default: return '#757575';
    }
  };

  const filteredEvents = eventFilter === 'all' 
    ? events 
    : events.filter(event => event.type === eventFilter);

  const connectSocket = () => {
    socketService.connect(token);
  };

  const disconnectSocket = () => {
    socketService.disconnect();
  };

  const sendTestPing = () => {
    socketService.sendTestPing();
  };

  const subscribeToZone = () => {
    socketService.subscribeToZone('tutorial_area');
  };

  const clearLogs = () => {
    setEvents([]);
  };

  const eventTypes = [
    { id: 'all', name: 'All Events' },
    { id: 'socket', name: 'Socket' },
    { id: 'monster', name: 'Monsters' },
    { id: 'npc', name: 'NPCs' },
    { id: 'combat', name: 'Combat' },
    { id: 'death', name: 'Death' },
    { id: 'loot', name: 'Loot' },
    { id: 'zone', name: 'Zone' },
  ];

  return (
    <div className="tab-content">
      <div className="section">
        <h2>📊 Real-Time Event Monitor</h2>
        <p>Monitor Socket.IO events for monsters, NPCs, combat, and other game systems.</p>
        
        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot"></div>
            <span>Socket.IO: {isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      <div className="controls-section">
        <div className="socket-controls">
          <TestButton
            onClick={connectSocket}
            disabled={isConnected}
            variant="success"
            size="small"
          >
            Connect
          </TestButton>
          
          <TestButton
            onClick={disconnectSocket}
            disabled={!isConnected}
            variant="danger"
            size="small"
          >
            Disconnect
          </TestButton>
          
          <TestButton
            onClick={sendTestPing}
            disabled={!isConnected}
            variant="primary"
            size="small"
          >
            Test Ping
          </TestButton>
          
          <TestButton
            onClick={subscribeToZone}
            disabled={!isConnected}
            variant="secondary"
            size="small"
          >
            Subscribe to Tutorial Area
          </TestButton>
        </div>

        <div className="log-controls">
          <div className="filter-section">
            <label>Filter:</label>
            <select 
              value={eventFilter} 
              onChange={(e) => setEventFilter(e.target.value)}
            >
              {eventTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="auto-scroll-toggle">
            <label>
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
              />
              Auto-scroll
            </label>
          </div>
          
          <TestButton
            onClick={clearLogs}
            variant="warning"
            size="small"
          >
            Clear Logs
          </TestButton>
        </div>
      </div>

      <div className="events-container">
        <div className="events-header">
          <h3>Live Events ({filteredEvents.length})</h3>
          {!isConnected && (
            <div className="connection-warning">
              ⚠️ Connect to Socket.IO to see real-time events
            </div>
          )}
        </div>
        
        <div className="events-list">
          {filteredEvents.length === 0 && (
            <div className="no-events">
              <p>No events yet...</p>
              <p><em>Events will appear here when Socket.IO is connected and active</em></p>
            </div>
          )}
          
          {filteredEvents.map((event) => (
            <div 
              key={event.id} 
              className="event-item"
              style={{ borderLeftColor: getEventColor(event.type) }}
            >
              <div className="event-header">
                <span className="event-icon">{getEventIcon(event.type)}</span>
                <span className="event-name">{event.event}</span>
                <span className="event-time">
                  {event.timestamp.toLocaleTimeString()}
                </span>
              </div>
              
              <div className="event-data">
                <pre>{JSON.stringify(event.data, null, 2)}</pre>
              </div>
            </div>
          ))}
          
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};