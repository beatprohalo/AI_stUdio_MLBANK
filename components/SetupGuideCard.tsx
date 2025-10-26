import React from 'react';
import { CheckIcon, ExclamationTriangleIcon, InformationCircleIcon } from './icons';

interface SetupGuideCardProps {
  apiConfig: any;
  connectionStatus: 'unknown' | 'success' | 'failure';
}

const SetupGuideCard: React.FC<SetupGuideCardProps> = ({ apiConfig, connectionStatus }) => {
  const isLocalSetup = apiConfig.provider !== 'google';
  const hasApiKey = apiConfig.apiKey && apiConfig.apiKey.length > 0;
  
  return (
    <div className="bg-surface border border-surface-border rounded-lg p-6 mb-6 shadow-lg">
      <div className="flex items-center mb-4">
        <InformationCircleIcon className="h-6 w-6 text-primary mr-3" />
        <h2 className="text-xl font-bold text-secondary">Setup Guide</h2>
      </div>
      
      <div className="space-y-4">
        {/* Google Gemini Setup */}
        {apiConfig.provider === 'google' && (
          <div className="p-4 bg-bkg/50 rounded-md">
            <h3 className="font-semibold text-on-surface mb-2">Google Gemini Setup</h3>
            <div className="space-y-2 text-sm text-on-surface-muted">
              <p>1. Get a Google AI API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a></p>
              <p>2. Enter your API key in the Model Configuration section above</p>
              <p>3. Click "Test Connection" to verify</p>
            </div>
            <div className="mt-3 flex items-center">
              {hasApiKey ? (
                <CheckIcon className="h-4 w-4 text-green-400 mr-2" />
              ) : (
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400 mr-2" />
              )}
              <span className={`text-sm ${hasApiKey ? 'text-green-400' : 'text-yellow-400'}`}>
                {hasApiKey ? 'API Key configured' : 'API Key required'}
              </span>
            </div>
          </div>
        )}
        
        {/* Local Ollama Setup */}
        {isLocalSetup && (
          <div className="p-4 bg-bkg/50 rounded-md">
            <h3 className="font-semibold text-on-surface mb-2">Local Ollama Setup</h3>
            <div className="space-y-2 text-sm text-on-surface-muted">
              <p>1. Ensure Ollama is running: <code className="bg-surface px-2 py-1 rounded">ollama serve</code></p>
              <p>2. Install a model: <code className="bg-surface px-2 py-1 rounded">ollama pull llama3:latest</code></p>
              <p>3. Select "Local Llama" in Model Configuration above</p>
              <p>4. Click "Test Connection" to verify</p>
            </div>
            <div className="mt-3 flex items-center">
              {connectionStatus === 'success' ? (
                <CheckIcon className="h-4 w-4 text-green-400 mr-2" />
              ) : (
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400 mr-2" />
              )}
              <span className={`text-sm ${connectionStatus === 'success' ? 'text-green-400' : 'text-yellow-400'}`}>
                {connectionStatus === 'success' ? 'Ollama connected' : 'Ollama connection needed'}
              </span>
            </div>
          </div>
        )}
        
        {/* Quick Start */}
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-md">
          <h3 className="font-semibold text-primary mb-2">Quick Start</h3>
          <div className="text-sm text-on-surface-muted">
            <p>1. Upload an audio file to analyze its musical characteristics</p>
            <p>2. Generate new music based on your analysis or custom prompts</p>
            <p>3. Enable the learning system to improve suggestions over time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupGuideCard;

