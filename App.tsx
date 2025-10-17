
import React, { useState } from 'react';
import FileUploadCard from './components/FileUploadCard';
import GenerationCard from './components/GenerationCard';
import LearningSystemCard from './components/LearningSystemCard';
import BulkImportCard from './components/BulkImportCard';
import RealtimeAnalysisCard from './components/RealtimeAnalysisCard';
import PreferencesModal from './components/PreferencesModal';
import SessionLibraryCard from './components/SessionLibraryCard';
import StatusPanelCard from './components/StatusPanelCard';
import { useLearningSystem } from './hooks/useLearningSystem';
import type { AnalysisResult, MidiGenerationResult, FeedbackAction, LibraryItem, SnippetAnalysisResult } from './types';

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [aiCoreModel, setAiCoreModel] = useState<string>('gemini-2.5-flash');
  const [gpuAcceleration, setGpuAcceleration] = useState(false);
  const [cpuCores, setCpuCores] = useState('auto');
  const learningSystem = useLearningSystem();

  const handleFeedback = (result: MidiGenerationResult, action: FeedbackAction) => {
    // The description from the AI is the best source for keywords to learn from.
    learningSystem.handleFeedback(result.description, action);
  };

  const handleAnalysisComplete = (result: AnalysisResult, fileName: string) => {
    // Duplicate detection using fingerprint
    const existingItem = libraryItems.find(item => 
      item.type === 'analysis' && item.result.fingerprint === result.fingerprint
    );
    if (existingItem) {
      alert(`Duplicate Sample Detected\n\nThis file appears to be identical to "${existingItem.name}" which is already in your session library.`);
    }

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

  return (
    <>
      <div className="min-h-screen bg-bkg text-on-surface flex flex-col items-center p-4 sm:p-6">
        <main className="w-full max-w-3xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary">AI Music Studio</h1>
            <p className="text-on-surface-muted mt-2">Analyze audio and generate new musical ideas with Gemini.</p>
          </header>
          
          <StatusPanelCard
            sessionFileCount={libraryItems.length}
            lastActivity={lastActivity}
            learningStatus={learningSystem.isEnabled}
            aiCoreModel={aiCoreModel}
            onModelChange={setAiCoreModel}
            gpuAcceleration={gpuAcceleration}
            onGpuToggle={() => setGpuAcceleration(prev => !prev)}
            cpuCores={cpuCores}
            onCpuCoresChange={setCpuCores}
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
          />

          <FileUploadCard 
            onAnalysisComplete={handleAnalysisComplete}
            analysisResult={analysisResult} 
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
          />
          
          <SessionLibraryCard items={libraryItems} analysisResult={analysisResult} />

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