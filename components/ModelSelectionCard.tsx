import React from 'react';
import { ModelProvider, ApiConfig } from '../types';
import { ChipIcon } from './icons';

interface ModelSelectionCardProps {
  apiConfig: ApiConfig;
  onApiConfigChange: (config: ApiConfig) => void;
  connectionStatus: 'unknown' | 'success' | 'failure';
  onTestConnection: () => void;
}

const ModelSelectionCard: React.FC<ModelSelectionCardProps> = ({
  apiConfig,
  onApiConfigChange,
  connectionStatus,
  onTestConnection
}) => {
  const handleProviderChange = (provider: ModelProvider) => {
    let endpoint = '';
    let modelName = '';
    
    switch (provider) {
      case ModelProvider.GOOGLE:
        endpoint = 'google';
        break;
      case ModelProvider.LOCAL_GEMMA:
        endpoint = 'http://localhost:11434'; // Ollama default
        modelName = 'gemma3n:e4b';
        break;
      case ModelProvider.LOCAL_LLAMA:
        endpoint = 'http://localhost:11434';
        modelName = 'llama3:latest';
        break;
      case ModelProvider.LOCAL_OLLAMA:
        endpoint = 'http://localhost:11434';
        modelName = 'llama3:latest';
        break;
      case ModelProvider.CUSTOM:
        endpoint = 'http://localhost:8000';
        break;
    }
    
    onApiConfigChange({
      ...apiConfig,
      provider,
      endpoint,
      modelName
    });
  };

  const handleEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onApiConfigChange({ ...apiConfig, endpoint: e.target.value });
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onApiConfigChange({ ...apiConfig, apiKey: e.target.value });
  };

  const handleModelNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onApiConfigChange({ ...apiConfig, modelName: e.target.value });
  };

  const getProviderDisplayName = (provider: ModelProvider) => {
    switch (provider) {
      case ModelProvider.GOOGLE: return 'Google Gemini';
      case ModelProvider.LOCAL_GEMMA: return 'Local Gemma';
      case ModelProvider.LOCAL_LLAMA: return 'Local Llama';
      case ModelProvider.LOCAL_OLLAMA: return 'Local Ollama';
      case ModelProvider.CUSTOM: return 'Custom Endpoint';
      default: return 'Unknown';
    }
  };

  const getProviderDescription = (provider: ModelProvider) => {
    switch (provider) {
      case ModelProvider.GOOGLE: return 'Cloud-based Google Gemini API';
      case ModelProvider.LOCAL_GEMMA: return 'Local Gemma model via Ollama';
      case ModelProvider.LOCAL_LLAMA: return 'Local Llama model via Ollama';
      case ModelProvider.LOCAL_OLLAMA: return 'Local model via Ollama';
      case ModelProvider.CUSTOM: return 'Custom local or remote endpoint';
      default: return '';
    }
  };

  return (
    <div className="bg-black border-2 border-surface-border rounded-lg p-6 mb-6 shadow-lg font-mono text-sm">
      <div className="flex items-center mb-4">
        <ChipIcon className="h-6 w-6 text-primary mr-3" />
        <h2 className="text-lg font-bold text-primary tracking-widest">MODEL CONFIGURATION</h2>
      </div>
      
      {/* Model Provider Selection */}
      <div className="mb-6">
        <label className="block text-on-surface-muted mb-3 font-semibold">MODEL PROVIDER</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.values(ModelProvider).map((provider) => (
            <button
              key={provider}
              onClick={() => handleProviderChange(provider)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                apiConfig.provider === provider
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-surface-border bg-surface hover:border-primary/50 hover:bg-primary/5'
              }`}
            >
              <div className="font-semibold text-on-surface mb-1">
                {getProviderDisplayName(provider)}
              </div>
              <div className="text-xs text-on-surface-muted">
                {getProviderDescription(provider)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Key (for Google) */}
        {apiConfig.provider === ModelProvider.GOOGLE && (
          <div>
            <label htmlFor="api-key-input" className="block text-on-surface-muted mb-2 font-semibold">
              API KEY
            </label>
            <input
              id="api-key-input"
              type="password"
              value={apiConfig.apiKey}
              onChange={handleApiKeyChange}
              className="w-full bg-input-bg border-2 border-surface-border text-on-surface rounded-md px-3 py-2 focus:ring-2 focus:border-primary transition-all"
              placeholder="Enter Google API Key"
            />
          </div>
        )}

        {/* Endpoint */}
        <div>
          <label htmlFor="endpoint-input" className="block text-on-surface-muted mb-2 font-semibold">
            ENDPOINT URL
          </label>
          <input
            id="endpoint-input"
            type="text"
            value={apiConfig.endpoint}
            onChange={handleEndpointChange}
            className="w-full bg-input-bg border-2 border-surface-border text-on-surface rounded-md px-3 py-2 focus:ring-2 focus:border-primary transition-all"
            placeholder="http://localhost:11434"
          />
        </div>

        {/* Model Name (for local models) */}
        {(apiConfig.provider === ModelProvider.LOCAL_GEMMA || 
          apiConfig.provider === ModelProvider.LOCAL_LLAMA || 
          apiConfig.provider === ModelProvider.LOCAL_OLLAMA) && (
          <div>
            <label htmlFor="model-name-input" className="block text-on-surface-muted mb-2 font-semibold">
              MODEL NAME
            </label>
            <input
              id="model-name-input"
              type="text"
              value={apiConfig.modelName || ''}
              onChange={handleModelNameChange}
              className="w-full bg-input-bg border-2 border-surface-border text-on-surface rounded-md px-3 py-2 focus:ring-2 focus:border-primary transition-all"
              placeholder="gemma:2b, llama2:7b, etc."
            />
          </div>
        )}

        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-on-surface-muted font-semibold">STATUS:</span>
            <span className={`ml-2 font-bold ${
              connectionStatus === 'success' ? 'text-green-400' :
              connectionStatus === 'failure' ? 'text-red-500' : 'text-yellow-400'
            }`}>
              {connectionStatus.toUpperCase()}
            </span>
          </div>
          <button 
            onClick={onTestConnection}
            className="px-4 py-2 bg-primary text-bkg font-semibold rounded-full hover:bg-primary/90 transition-colors"
          >
            Test Connection
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-surface/50 rounded-md">
        <div className="text-xs text-on-surface-muted">
          <strong>Local Setup:</strong> For local models, ensure Ollama is running with your desired model installed.
          <br />
          <strong>Example:</strong> <code>ollama pull llama3:latest</code> then select "Local Llama" above.
        </div>
      </div>
    </div>
  );
};

export default ModelSelectionCard;
