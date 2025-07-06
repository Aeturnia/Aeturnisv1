import React from 'react';

interface StatusPanelProps {
  apiStatus: any;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ apiStatus }) => {
  const services = apiStatus?.services || {};
  
  const getServiceStatus = (service: string) => {
    const status = services[service];
    if (!status) return { color: '#757575', text: 'Unknown' };
    
    if (status.includes('connected') || status.includes('operational')) {
      return { color: '#4caf50', text: 'Online' };
    }
    if (status.includes('disabled') || status.includes('unavailable')) {
      return { color: '#ff9800', text: 'Disabled' };
    }
    return { color: '#f44336', text: 'Error' };
  };

  const servicesList = [
    { key: 'database', label: 'Database', icon: '🗄️' },
    { key: 'redis', label: 'Redis', icon: '📦' },
    { key: 'socket_io', label: 'Socket.IO', icon: '🔌' },
  ];

  return (
    <div className="status-panel">
      <h3>System Status</h3>
      <div className="service-list">
        {servicesList.map(({ key, label, icon }) => {
          const status = getServiceStatus(key);
          return (
            <div key={key} className="service-item">
              <span className="service-icon">{icon}</span>
              <span className="service-label">{label}</span>
              <span 
                className="service-status"
                style={{ color: status.color }}
              >
                {status.text}
              </span>
            </div>
          );
        })}
      </div>
      
      {apiStatus?.version && (
        <div className="version-info">
          <small>Version: {apiStatus.version}</small>
        </div>
      )}
      
      {apiStatus?.uptime && (
        <div className="uptime-info">
          <small>Uptime: {Math.floor(apiStatus.uptime / 1000)}s</small>
        </div>
      )}
    </div>
  );
};