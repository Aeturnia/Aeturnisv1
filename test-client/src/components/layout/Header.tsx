import React from 'react';

interface HeaderProps {
  apiStatus: any;
}

export const Header: React.FC<HeaderProps> = ({ apiStatus }) => {
  const getStatusColor = () => {
    if (apiStatus?.status === 'healthy') return '#4caf50';
    if (apiStatus?.status === 'degraded') return '#ff9800';
    return '#f44336';
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="title-section">
          <h1>🎮 Aeturnis Online - Backend Testing Environment</h1>
          <p>Production MMORPG Development Platform</p>
        </div>
        <div className="status-indicator">
          <div 
            className="status-dot" 
            style={{ backgroundColor: getStatusColor() }}
            title={`API Status: ${apiStatus?.status || 'unknown'}`}
          ></div>
          <span className="status-text">
            {apiStatus?.status || 'Loading...'}
          </span>
        </div>
      </div>
    </header>
  );
};