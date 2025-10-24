import React, { useState } from 'react';
import { ChipIcon } from './icons';
import type { ApiConfig } from '../types';
import { ModelProvider, GeminiModel } from '../types';

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
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showGeminiModelMenu, setShowGeminiModelMenu] = useState(false);

  const handleEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onApiConfigChange({ ...apiConfig, endpoint: e.target.value });
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onApiConfigChange({ ...apiConfig, apiKey: e.target.value });
  };

  const handleProviderChange = (provider: ModelProvider) => {
    let endpoint = '';
    let modelName = '';
    let geminiModel = GeminiModel.GEMINI_2_0_FLASH; // Default to latest
    
    switch (provider) {
      case ModelProvider.GOOGLE:
        endpoint = 'google';
        break;
      case ModelProvider.LOCAL_GEMMA:
        endpoint = 'http://localhost:11434';
        modelName = 'gemma3n:e4b';
        break;
      case ModelProvider.LOCAL_LLAMA:
        endpoint = 'http://localhost:11434';
        modelName = 'llama2:7b';
        break;
      case ModelProvider.LOCAL_OLLAMA:
        endpoint = 'http://localhost:11434';
        modelName = 'llama2:7b';
        break;
      case ModelProvider.CUSTOM:
        endpoint = 'http://localhost:8000';
        break;
    }
    
    onApiConfigChange({
      ...apiConfig,
      provider,
      endpoint,
      modelName,
      geminiModel
    });
    setShowModelMenu(false);
  };

  const handleGeminiModelChange = (geminiModel: GeminiModel) => {
    onApiConfigChange({
      ...apiConfig,
      geminiModel
    });
    setShowGeminiModelMenu(false);
  };

  const getProviderDisplayName = (provider: ModelProvider) => {
    switch (provider) {
      case ModelProvider.GOOGLE: return 'GOOGLE GEMINI';
      case ModelProvider.LOCAL_GEMMA: return 'LOCAL GEMMA';
      case ModelProvider.LOCAL_LLAMA: return 'LOCAL LLAMA';
      case ModelProvider.LOCAL_OLLAMA: return 'LOCAL OLLAMA';
      case ModelProvider.CUSTOM: return 'CUSTOM ENDPOINT';
      default: return 'UNKNOWN';
    }
  };

  const getGeminiModelDisplayName = (model: GeminiModel) => {
    switch (model) {
      case GeminiModel.GEMINI_2_0_FLASH: return 'GEMINI 2.0 FLASH';
      case GeminiModel.GEMINI_1_5_PRO: return 'GEMINI 1.5 PRO';
      case GeminiModel.GEMINI_1_5_FLASH: return 'GEMINI 1.5 FLASH';
      case GeminiModel.GEMINI_1_0_PRO: return 'GEMINI 1.0 PRO';
      default: return 'UNKNOWN';
    }
  };

  return (
    <div className="bg-black border-2 border-green-400 rounded-lg p-4 mb-6 shadow-xl font-mono text-sm">
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
        
        {/* Model Provider Selection - OLED Style */}
        <div className="relative">
          <span className="text-on-surface-muted">MODEL PROVIDER..:</span>
          <button
            onClick={() => setShowModelMenu(!showModelMenu)}
            className="bg-black text-green-400 font-bold font-mono border-0 focus:ring-0 ml-2 p-0 w-32 text-left hover:text-white transition-colors"
          >
            {getProviderDisplayName(apiConfig.provider)}
          </button>
          {showModelMenu && (
            <div className="absolute top-6 left-0 bg-black border border-green-400 rounded shadow-xl z-50 min-w-48">
              {Object.values(ModelProvider).map((provider) => (
                <button
                  key={provider}
                  onClick={() => handleProviderChange(provider)}
                  className={`block w-full text-left px-3 py-2 text-sm font-mono hover:bg-green-400/10 transition-colors ${
                    apiConfig.provider === provider ? 'text-green-400 bg-green-400/10' : 'text-green-400'
                  }`}
                >
                  {getProviderDisplayName(provider)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* API Key (for Google) */}
        {apiConfig.provider === ModelProvider.GOOGLE && (
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
        )}

        {/* Gemini Model Selection (for Google) */}
        {apiConfig.provider === ModelProvider.GOOGLE && (
          <div className="relative">
            <span className="text-on-surface-muted">GEMINI MODEL....:</span>
            <button
              onClick={() => setShowGeminiModelMenu(!showGeminiModelMenu)}
              className="bg-black text-green-400 font-bold font-mono border-0 focus:ring-0 ml-2 p-0 w-32 text-left hover:text-white transition-colors"
            >
              {getGeminiModelDisplayName(apiConfig.geminiModel || GeminiModel.GEMINI_2_0_FLASH)}
            </button>
            {showGeminiModelMenu && (
              <div className="absolute top-6 left-0 bg-black border border-green-400 rounded shadow-xl z-50 min-w-48">
                {Object.values(GeminiModel).map((model) => (
                  <button
                    key={model}
                    onClick={() => handleGeminiModelChange(model)}
                    className={`block w-full text-left px-3 py-2 text-sm font-mono hover:bg-green-400/10 transition-colors ${
                      (apiConfig.geminiModel || GeminiModel.GEMINI_2_0_FLASH) === model ? 'text-green-400 bg-green-400/10' : 'text-green-400'
                    }`}
                  >
                    {getGeminiModelDisplayName(model)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Endpoint */}
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

        {/* Model Name (for local models) */}
        {(apiConfig.provider === ModelProvider.LOCAL_GEMMA || 
          apiConfig.provider === ModelProvider.LOCAL_LLAMA || 
          apiConfig.provider === ModelProvider.LOCAL_OLLAMA) && (
          <div>
            <label htmlFor="model-name-input" className="text-on-surface-muted">MODEL NAME......:</label>
            <input
              id="model-name-input"
              type="text"
              value={apiConfig.modelName || ''}
              onChange={(e) => onApiConfigChange({ ...apiConfig, modelName: e.target.value })}
              className="bg-black text-green-400 font-bold font-mono border-0 focus:ring-0 ml-2 p-0 w-32"
              placeholder="gemma:2b, llama2:7b"
            />
          </div>
        )}

        {/* Connection Status */}
        <div>
          <span className="text-on-surface-muted">CONNECTION......:</span>
          <span className={`font-bold ml-2 ${
            connectionStatus === 'success' ? 'text-green-400' :
            connectionStatus === 'failure' ? 'text-red-500' : 'text-yellow-400'
          }`}>
            {connectionStatus.toUpperCase()}
          </span>
          <button onClick={onTestConnection} className="ml-4 text-green-400 hover:text-white transition-colors">[Test]</button>
        </div>

        {/* Ollama Setup Help */}
        {(apiConfig.provider === ModelProvider.LOCAL_GEMMA || 
          apiConfig.provider === ModelProvider.LOCAL_LLAMA || 
          apiConfig.provider === ModelProvider.LOCAL_OLLAMA) && connectionStatus === 'failure' && (
          <div className="col-span-2 mt-2 p-2 bg-yellow-400/10 border border-yellow-400/30 rounded text-xs">
            <div className="text-yellow-400 font-bold mb-1">OLLAMA SETUP REQUIRED:</div>
            <div className="text-yellow-300/80">
              1. Install Ollama: <span className="text-green-400">ollama.ai</span><br/>
              2. Pull a model: <span className="text-green-400">ollama pull llama2:7b</span><br/>
              3. Start Ollama: <span className="text-green-400">ollama serve</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusPanelCard;