import React, { useState, useCallback, useEffect } from 'react';
import FileUploadCard from './components/FileUploadCard';
import GenerationCard from './components/GenerationCard';
import LearningSystemCard from './components/LearningSystemCard';
import BulkImportCard from './components/BulkImportCard';
import RealtimeAnalysisCard from './components/RealtimeAnalysisCard';
import PreferencesModal from './components/PreferencesModal';
import SessionLibraryCard from './components/SessionLibraryCard';
import StatusPanelCard from './components/StatusPanelCard';
import ModelSelectionCard from './components/ModelSelectionCard';
import DataManagementCard from './components/DataManagementCard';
import SetupGuideCard from './components/SetupGuideCard';
import { useLearningSystem } from './hooks/useLearningSystem';
import { testConnection } from './services/geminiService';
import { createLLMService } from './services/localLLMService';
import type { AnalysisResult, MidiGenerationResult, FeedbackAction, LibraryItem, SnippetAnalysisResult, ApiConfig } from './types';

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>(() => {
    // Load session library from localStorage on app start
    try {
      const saved = localStorage.getItem('aiMusicStudioSessionLibrary');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        return parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load session library:', error);
    }
    return [];
  });
  const [lastActivity, setLastActivity] = useState<Date | null>(() => {
    // Load last activity from localStorage
    try {
      const saved = localStorage.getItem('aiMusicStudioLastActivity');
      return saved ? new Date(saved) : null;
    } catch (error) {
      console.error('Failed to load last activity:', error);
      return null;
    }
  });
  const [processedFiles, setProcessedFiles] = useState<Set<string>>(() => {
    // Load processed files from localStorage
    try {
      const saved = localStorage.getItem('aiMusicStudioProcessedFiles');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (error) {
      console.error('Failed to load processed files:', error);
      return new Set();
    }
  });
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    // Load API key from localStorage on app start
    const savedApiKey = localStorage.getItem('aiMusicStudioApiKey');
    const savedEndpoint = localStorage.getItem('aiMusicStudioEndpoint') || 'google';
    const savedProvider = localStorage.getItem('aiMusicStudioProvider') || 'google';
    const savedModelName = localStorage.getItem('aiMusicStudioModelName') || '';
    const savedGeminiModel = localStorage.getItem('aiMusicStudioGeminiModel') || 'gemini-2.0-flash-exp';
    
    // If no API key is set, default to Google Gemini
    if (!savedApiKey) {
      return { 
        apiKey: '', 
        endpoint: 'google',
        provider: 'google' as any,
        modelName: undefined,
        geminiModel: savedGeminiModel as any
      };
    }
    
    return { 
      apiKey: savedApiKey || '', 
      endpoint: savedEndpoint as 'google' | string,
      provider: savedProvider as any,
      modelName: savedModelName || undefined,
      geminiModel: savedGeminiModel as any
    };
  });
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'failure'>('unknown');

  const learningSystem = useLearningSystem();

  // Save session library to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('aiMusicStudioSessionLibrary', JSON.stringify(libraryItems));
    } catch (error) {
      console.error('Failed to save session library:', error);
    }
  }, [libraryItems]);

  // Save last activity to localStorage whenever it changes
  useEffect(() => {
    if (lastActivity) {
      try {
        localStorage.setItem('aiMusicStudioLastActivity', lastActivity.toISOString());
      } catch (error) {
        console.error('Failed to save last activity:', error);
      }
    }
  }, [lastActivity]);

  // Save processed files to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('aiMusicStudioProcessedFiles', JSON.stringify([...processedFiles]));
    } catch (error) {
      console.error('Failed to save processed files:', error);
    }
  }, [processedFiles]);

  const handleApiConfigChange = useCallback((newConfig: ApiConfig) => {
    setApiConfig(newConfig);
    // Save to localStorage
    localStorage.setItem('aiMusicStudioApiKey', newConfig.apiKey);
    localStorage.setItem('aiMusicStudioEndpoint', newConfig.endpoint);
    localStorage.setItem('aiMusicStudioProvider', newConfig.provider);
    if (newConfig.modelName) {
      localStorage.setItem('aiMusicStudioModelName', newConfig.modelName);
    }
    if (newConfig.geminiModel) {
      localStorage.setItem('aiMusicStudioGeminiModel', newConfig.geminiModel);
    }
  }, []);

  const handleTestConnection = useCallback(async () => {
    try {
      setConnectionStatus('unknown');
      
      if (apiConfig.provider === 'google') {
        const success = await testConnection(apiConfig);
        setConnectionStatus(success ? 'success' : 'failure');
      } else {
        // Test local LLM connection
        const localService = createLLMService(apiConfig);
        if (localService) {
          const success = await localService.testConnection();
          setConnectionStatus(success ? 'success' : 'failure');
        } else {
          setConnectionStatus('failure');
        }
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('failure');
    }
  }, [apiConfig]);

  const handleFeedback = (result: MidiGenerationResult, action: FeedbackAction) => {
    learningSystem.handleFeedback(result.description, action);
  };

  const handleAnalysisComplete = (result: AnalysisResult, fileName: string) => {
    // Check for duplicate file name
    if (processedFiles.has(fileName)) {
      alert(`File Already Processed\n\n"${fileName}" has already been analyzed and learned from. Please choose a different file.`);
      return;
    }

    const existingItem = libraryItems.find(item => 
      item.type === 'analysis' && item.result.fingerprint === result.fingerprint
    );
    if (existingItem) {
      alert(`Duplicate Sample Detected\n\nThis file appears to be identical to "${existingItem.name}" which is already in your session library.`);
      return;
    }

    // Add file to processed set
    setProcessedFiles(prev => new Set(prev).add(fileName));

    setAnalysisResult(result);
    const newItem: LibraryItem = {
        id: `analysis-${Date.now()}`,
        type: 'analysis',
        name: fileName,
        timestamp: new Date(),
        result,
    };
    setLibraryItems(prev => [newItem, ...prev]);
    setLastActivity(new Date());
  };

  const handleGenerationComplete = (result: MidiGenerationResult, prompt: string) => {
    const newItem: LibraryItem = {
        id: `generation-${Date.now()}`,
        type: 'generation',
        name: result.description,
        prompt,
        timestamp: new Date(),
        result,
    };
    setLibraryItems(prev => [newItem, ...prev]);
    setLastActivity(new Date());
  };
  
  const handleLearnFromSnippet = (result: SnippetAnalysisResult) => {
    learningSystem.learnFromSnippetAnalysis(result);
  };

  const handleMidiLearning = (description: string) => {
    if (learningSystem.isEnabled) {
      // Treat MIDI description as a "like" feedback for learning
      learningSystem.handleFeedback(description, 'like' as any);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-bkg text-on-surface flex flex-col items-center p-4 sm:p-6">
        <main className="w-full max-w-3xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary">AI Music Studio</h1>
            <p className="text-on-surface-muted mt-2">Analyze audio and generate new musical ideas with AI.</p>
          </header>
          
          <StatusPanelCard
            sessionFileCount={libraryItems.length}
            lastActivity={lastActivity}
            learningStatus={learningSystem.isEnabled}
            apiConfig={apiConfig}
            onApiConfigChange={handleApiConfigChange}
            connectionStatus={connectionStatus}
            onTestConnection={handleTestConnection}
          />

          <SetupGuideCard 
            apiConfig={apiConfig}
            connectionStatus={connectionStatus}
          />

          <LearningSystemCard 
            isEnabled={learningSystem.isEnabled}
            confidence={learningSystem.confidence}
            sampleCount={learningSystem.sampleCount}
            onToggle={learningSystem.toggleLearning}
            onReset={learningSystem.resetLearning}
            onView={() => setIsPreferencesModalOpen(true)}
          />
          
          <BulkImportCard
            isEnabled={learningSystem.isEnabled}
            onBulkLearn={learningSystem.handleBulkFeedback}
            processedFiles={processedFiles}
          />

          <FileUploadCard 
            onAnalysisComplete={handleAnalysisComplete}
            onMidiLearning={handleMidiLearning}
            analysisResult={analysisResult} 
            apiConfig={apiConfig}
          />
          
          <RealtimeAnalysisCard 
            onLearn={handleLearnFromSnippet}
            isEnabled={learningSystem.isEnabled}
          />

          <GenerationCard 
            analysisResult={analysisResult}
            learningIsEnabled={learningSystem.isEnabled}
            preferences={learningSystem.preferences}
            onFeedback={handleFeedback}
            onGenerationComplete={handleGenerationComplete}
            apiConfig={apiConfig}
          />
          
          <SessionLibraryCard items={libraryItems} analysisResult={analysisResult} />

          <DataManagementCard />

          <footer className="text-center mt-8 text-on-surface-muted text-sm">
            <p>Powered by Google Gemini</p>
          </footer>
        </main>
      </div>

      <PreferencesModal 
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
        preferences={learningSystem.preferences}
      />
    </>
  );
};

export default App;