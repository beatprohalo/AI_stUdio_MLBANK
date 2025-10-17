import React from 'react';
import { ChipIcon } from './icons';
import type { ApiConfig } from '../types';

interface StatusPanelCardProps {
  sessionFileCount: number;
  lastActivity: Date | null;
  learningStatus: boolean;
  apiConfig: ApiConfig;
  onApiConfigChange: (config: ApiConfig) => void;
  connectionStatus: 'unknown' | 'success' | 'failure';
  onTestConnection: () => void;
}

const StatusItem: React.FC<{ label: string; value: React.ReactNode; color?: string }> = ({ label, value, color = 'text-green-400' }) => (
  <div>
    <span className="text-on-surface-muted">{label.padEnd(16, '.')}:</span>
    <span className={`font-bold ${color}`}>{value}</span>
  </div>
);

const StatusPanelCard: React.FC<StatusPanelCardProps> = ({ 
  sessionFileCount, 
  lastActivity, 
  learningStatus,
  apiConfig,
  onApiConfigChange,
  connectionStatus,
  onTestConnection
}) => {
  const handleEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onApiConfigChange({ ...apiConfig, endpoint: e.target.value });
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onApiConfigChange({ ...apiConfig, apiKey: e.target.value });
  };

  return (
    <div className="bg-black border-2 border-surface-border rounded-lg p-4 mb-6 shadow-lg font-mono text-sm">
      <div className="flex items-center mb-3">
        <ChipIcon className="h-5 w-5 text-green-400 mr-2" />
        <h2 className="text-base font-bold text-green-400 tracking-widest">SYSTEM STATUS</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
        <StatusItem label="SYSTEM" value="ONLINE" />
        <StatusItem label="SESSION FILES" value={sessionFileCount.toString().padStart(3, '0')} />
        <StatusItem 
          label="LEARNING" 
          value={learningStatus ? 'ACTIVE' : 'INACTIVE'} 
          color={learningStatus ? 'text-green-400' : 'text-yellow-400'} 
        />
        <StatusItem 
          label="LAST ACTIVITY" 
          value={lastActivity ? lastActivity.toLocaleTimeString() : 'N/A'} 
        />
        <div>
          <label htmlFor="api-key-input" className="text-on-surface-muted">API KEY.........:</label>
          <input
            id="api-key-input"
            type="password"
            value={apiConfig.apiKey}
            onChange={handleApiKeyChange}
            className="bg-black text-green-400 font-bold font-mono border-0 focus:ring-0 ml-2 p-0 w-32"
            placeholder="Enter API Key"
          />
        </div>
        <div>
          <label htmlFor="endpoint-input" className="text-on-surface-muted">ENDPOINT........:</label>
          <input
            id="endpoint-input"
            type="text"
            value={apiConfig.endpoint}
            onChange={handleEndpointChange}
            className="bg-black text-green-400 font-bold font-mono border-0 focus:ring-0 ml-2 p-0 w-32"
            placeholder="google or http://..."
          />
        </div>
        <div>
          <span className="text-on-surface-muted">CONNECTION......:</span>
          <span className={`font-bold ml-2 ${
            connectionStatus === 'success' ? 'text-green-400' :
            connectionStatus === 'failure' ? 'text-red-500' : 'text-yellow-400'
          }`}>
            {connectionStatus.toUpperCase()}
          </span>
          <button onClick={onTestConnection} className="ml-4 text-green-400 hover:text-white">[Test]</button>
        </div>
      </div>
    </div>
  );
};

export default StatusPanelCard;