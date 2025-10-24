import React, { useState, useCallback, useEffect } from 'react';
import { generateMidi, generateAudio } from '../services/geminiService';
import { generateFilename } from '../services/autoNamingService';
import { createMidiBlob, createJsonBlob, createCombinedBlob } from '../services/midiService';
import { workerManager } from '../services/workerManager';
import { devToolsManager } from '../services/devToolsManager';
import { memoryOptimizer } from '../services/memoryOptimizer';
import { GenerationModel, FeedbackAction } from '../types';
import type { MidiGenerationResult, AnalysisResult, LearnedPreferences, ApiConfig, AdvancedFeedbackSchema, MusicalStyleProfile, UserPreferences } from '../types';
import { LoadingSpinner, PlayIcon, DownloadIcon } from './icons';
import FeedbackButtons from './FeedbackButtons';
import AdvancedFeedbackCard from './AdvancedFeedbackCard';
import StyleProfileCard from './StyleProfileCard';
import ControlParametersCard from './ControlParametersCard';
import ABTestingCard from './ABTestingCard';

// Audio decoding helper functions
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


interface GenerationCardProps {
  analysisResult: AnalysisResult | null;
  learningIsEnabled: boolean;
  preferences: LearnedPreferences | null;
  onFeedback: (result: MidiGenerationResult, action: FeedbackAction) => void;
  onGenerationComplete: (result: MidiGenerationResult, prompt: string) => void;
  apiConfig: ApiConfig;
}

const GenerationCard: React.FC<GenerationCardProps> = ({ analysisResult, learningIsEnabled, preferences, onFeedback, onGenerationComplete, apiConfig }) => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<GenerationModel>(GenerationModel.MIDI);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [midiResult, setMidiResult] = useState<MidiGenerationResult | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  
  // Advanced features state
  const [showAdvancedFeedback, setShowAdvancedFeedback] = useState(false);
  const [showStyleProfiles, setShowStyleProfiles] = useState(false);
  const [showControlParameters, setShowControlParameters] = useState(false);
  const [showABTesting, setShowABTesting] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    harmonic: { complexity: 0.5, jazzInfluence: 0.3, modalFlavor: 0.4, chromaticism: 0.3 },
    melodic: { motivicDevelopment: 0.6, contourVariety: 0.5, rhythmicComplexity: 0.4, range: 2.0 },
    dynamics: { expressiveness: 0.6, microTiming: 0.4, accentuation: 0.5 }
  });
  
  // Memory monitoring
  const [memoryInfo, setMemoryInfo] = useState<{
    used: number;
    total: number;
    workers: number;
  } | null>(null);

  useEffect(() => {
    // Hide feedback buttons when the model is switched away from MIDI
    if (model !== GenerationModel.MIDI) {
      setShowFeedback(false);
    } else if (midiResult) {
      setShowFeedback(true);
    }
  }, [model, midiResult]);

  // Memory monitoring effect
  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const workerInfo = workerManager.getMemoryInfo();
        setMemoryInfo({
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024), // MB
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
          workers: workerInfo.activeWorkers
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Initialize dev tools monitoring
  useEffect(() => {
    devToolsManager.startMonitoring();
    
    return () => {
      // Clean up any pending workers
      workerManager.cleanup();
      devToolsManager.cleanup();
    };
  }, []);

  const playAudio = () => {
    if (!audioBuffer) return;
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputAudioContext.destination);
    source.start();
  };
  
  const downloadAudio = () => {
     if (!audioBuffer) return;
     const getWavBytes = (buffer: AudioBuffer) => {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const bitDepth = 16;
        const numFrames = buffer.length;
        const blockAlign = numChannels * bitDepth / 8;
        const byteRate = sampleRate * blockAlign;
        const dataSize = numFrames * blockAlign;
        const bufferSize = 44 + dataSize;
        const wavBuffer = new ArrayBuffer(bufferSize);
        const view = new DataView(wavBuffer);
        
        let pos = 0;
        const writeString = (s: string) => {
            for (let i = 0; i < s.length; i++) view.setUint8(pos + i, s.charCodeAt(i));
            pos += s.length;
        };

        writeString('RIFF'); view.setUint32(pos, 36 + dataSize, true); pos += 4;
        writeString('WAVE'); writeString('fmt '); view.setUint32(pos, 16, true); pos += 4;
        view.setUint16(pos, 1, true); pos += 2; view.setUint16(pos, numChannels, true); pos += 2;
        view.setUint32(pos, sampleRate, true); pos += 4; view.setUint32(pos, byteRate, true); pos += 4;
        view.setUint16(pos, blockAlign, true); pos += 2; view.setUint16(pos, bitDepth, true); pos += 2;
        writeString('data'); view.setUint32(pos, dataSize, true); pos += 4;
        
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numFrames; i++) {
            const val = Math.max(-1, Math.min(1, channelData[i]));
            view.setInt16(pos, val * 32767, true);
            pos += 2;
        }

        return new Blob([view], { type: 'audio/wav' });
     }
     
     const blob = getWavBytes(audioBuffer);
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = generateFilename(prompt, analysisResult, 'audio');
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
     URL.revokeObjectURL(url);
  };

  const downloadMidi = () => {
    if (!midiResult?.tracks || midiResult.tracks.length === 0) {
      alert("No MIDI data was generated to download. Please try generating a new idea.");
      return;
    }

    if (learningIsEnabled) {
      onFeedback(midiResult, FeedbackAction.DOWNLOAD);
    }
    const bpm = midiResult?.bpm || analysisResult?.bpm || 120;
    const blob = createMidiBlob(midiResult.tracks, { bpm, preferences: learningIsEnabled ? preferences : undefined });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generateFilename(prompt, analysisResult, 'midi');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadJson = () => {
    if (!midiResult) {
      alert("No MIDI data was generated to download. Please try generating a new idea.");
      return;
    }

    const jsonData = {
      description: midiResult.description,
      bpm: midiResult.bpm || analysisResult?.bpm || 120,
      tracks: midiResult.tracks,
      analysisResult: analysisResult,
      preferences: learningIsEnabled ? preferences : null,
      metadata: {
        timestamp: new Date().toISOString(),
        prompt: prompt,
        learningEnabled: learningIsEnabled,
        version: "1.0"
      }
    };

    const blob = createJsonBlob(jsonData);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generateFilename(prompt, analysisResult, 'json');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadCombined = async () => {
    if (!midiResult?.tracks || midiResult.tracks.length === 0) {
      alert("No MIDI data was generated to download. Please try generating a new idea.");
      return;
    }

    if (learningIsEnabled) {
      onFeedback(midiResult, FeedbackAction.DOWNLOAD);
    }

    const jsonData = {
      description: midiResult.description,
      bpm: midiResult.bpm || analysisResult?.bpm || 120,
      tracks: midiResult.tracks,
      analysisResult: analysisResult,
      preferences: learningIsEnabled ? preferences : null,
      metadata: {
        timestamp: new Date().toISOString(),
        prompt: prompt,
        learningEnabled: learningIsEnabled,
        version: "1.0"
      }
    };

    const bpm = midiResult?.bpm || analysisResult?.bpm || 120;
    const blob = await createCombinedBlob(midiResult.tracks, jsonData, { 
      bpm, 
      preferences: learningIsEnabled ? preferences : undefined 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generateFilename(prompt, analysisResult, 'combined');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }
    
    if (learningIsEnabled && midiResult && model === GenerationModel.MIDI) {
      onFeedback(midiResult, FeedbackAction.REGENERATE);
    }

    setIsLoading(true);
    setError(null);
    setMidiResult(null);
    setAudioBuffer(null);
    setShowFeedback(false);
    setProgress(0);
    setProgressText('');

    try {
      // Check memory before starting generation
      if (memoryInfo && memoryInfo.used > 100) { // More than 100MB used
        setError('Memory usage is high. Please close other tabs and try again.');
        return;
      }

      // Check dev tools connection
      if (!devToolsManager.canPerformIntensiveOperation()) {
        setError('System is not ready for intensive operations. Please wait a moment and try again.');
        return;
      }

      // Update heartbeat before starting
      devToolsManager.updateHeartbeat();

      if (model === GenerationModel.MIDI) {
        setProgressText('Generating MIDI...');
        setProgress(20);
        
        // Add a progress update during the API call
        const progressInterval = setInterval(() => {
          setProgress(prev => Math.min(prev + 5, 90));
          // Update heartbeat to prevent dev tools disconnection
          devToolsManager.updateHeartbeat();
        }, 2000);
        
        // Use worker for MIDI generation to prevent blocking
        let result;
        try {
          result = await workerManager.executeTask('generateMidi', {
            prompt,
            config: apiConfig,
            bpm: analysisResult?.bpm,
            preferences: learningIsEnabled ? preferences ?? undefined : undefined,
            analysisResult
          });
        } catch (workerError) {
          console.warn('Worker failed, falling back to main thread:', workerError);
          // Fallback to main thread
          result = await generateMidi(prompt, apiConfig, analysisResult?.bpm, learningIsEnabled ? preferences ?? undefined : undefined, analysisResult);
        }
        
        clearInterval(progressInterval);
        setProgress(100);
        setProgressText('MIDI generated successfully!');
        
        // Optimize MIDI data for memory efficiency
        const optimizedResult = memoryOptimizer.optimizeMidiData(result);
        setMidiResult(optimizedResult);
        setShowFeedback(true);
        onGenerationComplete(optimizedResult, prompt);
        
        // Force cleanup after generation
        memoryOptimizer.cleanup();
      } else {
        setProgressText('Generating MIDI...');
        setProgress(20);
        
        // Simulate MIDI generation progress
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress(40);
        setProgressText('Converting to audio...');
        
        const base64Audio = await generateAudio(prompt, apiConfig, learningIsEnabled ? preferences ?? undefined : undefined);
        
        setProgress(70);
        setProgressText('Processing audio...');
        
        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedBytes = decode(base64Audio);
        const buffer = await outputAudioContext.decodeAudioData(decodedBytes.buffer);
        
        setProgress(100);
        setProgressText('Audio generated successfully!');
        setAudioBuffer(buffer);
      }
    } catch (err) {
      let errorMessage = 'Failed to generate content. Please try again.';
      
      // Check for specific error types
      if (err instanceof Error) {
        if (err.message.includes('timeout')) {
          errorMessage = 'Request timed out. The AI service is taking too long to respond. Please try again with a simpler prompt or check your internet connection.';
        } else if (err.message.includes('All Ollama models failed')) {
          errorMessage = 'Local LLM connection failed. Please ensure Ollama is running and try: ollama pull llama3:latest';
        } else if (err.message.includes('not found')) {
          errorMessage = 'Model not found. Please install a model with: ollama pull llama3:latest';
        } else if (err.message.includes('Could not parse')) {
          errorMessage = 'The AI generated invalid MIDI data. Please try a different prompt.';
        } else if (err.message.includes('Request timeout')) {
          errorMessage = 'Request timed out after 30 seconds. Please try again.';
        } else if (err.message.includes('MIDI generation timeout')) {
          errorMessage = 'MIDI generation timed out after 60 seconds. Please try a simpler prompt.';
        }
      }
      
      setError(errorMessage);
      console.error('Generation error:', err);
    } finally {
      setIsLoading(false);
      // Clear progress after a delay
      setTimeout(() => {
        setProgress(0);
        setProgressText('');
      }, 2000);
    }
  }, [prompt, model, analysisResult, learningIsEnabled, preferences, onFeedback, midiResult, onGenerationComplete, apiConfig]);

  const handleFeedbackAction = (action: FeedbackAction) => {
    if (midiResult && learningIsEnabled) {
      onFeedback(midiResult, action);
      setShowFeedback(false); // Hide buttons after feedback is given
    }
  };

  const handleAdvancedFeedback = (feedback: AdvancedFeedbackSchema) => {
    // Process advanced feedback and update learning system
    console.log('Advanced feedback received:', feedback);
    // TODO: Implement advanced feedback processing
    setShowAdvancedFeedback(false);
  };

  const handleStyleProfileSelect = (profile: MusicalStyleProfile) => {
    // Apply style profile to user preferences
    const newPreferences: UserPreferences = {
      harmonic: profile.characteristics.harmonic,
      melodic: profile.characteristics.melodic,
      dynamics: profile.characteristics.dynamics
    };
    setUserPreferences(newPreferences);
    setShowStyleProfiles(false);
  };

  const handleControlParametersChange = (newPreferences: UserPreferences) => {
    setUserPreferences(newPreferences);
    setShowControlParameters(false);
  };

  const handleABTestComplete = (result: MidiGenerationResult, prompt: string, variant: 'conservative' | 'experimental') => {
    onGenerationComplete(result, prompt);
    setShowABTesting(false);
  };
  
  return (
    <div className="bg-surface border border-surface-border rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-secondary mb-4">2. Generate New Music</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., A happy piano melody in C major, or A jazz bassline with swing feel"
        className="w-full p-2 border-2 border-surface-border bg-input-bg text-on-surface rounded-md focus:ring-2 focus:border-primary transition"
        rows={3}
      />
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="model-select" className="text-on-surface-muted">Model:</label>
            <select
              id="model-select"
              value={model}
              onChange={(e) => setModel(e.target.value as GenerationModel)}
              className="p-2 border-2 border-surface-border bg-input-bg text-on-surface rounded-md focus:ring-2 focus:border-primary transition"
            >
              <option value={GenerationModel.MIDI}>MIDI Idea</option>
              <option value={GenerationModel.AUDIO}>Audio Music</option>
            </select>
          </div>
          
          {/* Advanced Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowStyleProfiles(true)}
              className="px-3 py-1 text-sm bg-secondary/20 text-secondary hover:bg-secondary/30 rounded-md transition-colors"
            >
              Style Profiles
            </button>
            <button
              onClick={() => setShowControlParameters(true)}
              className="px-3 py-1 text-sm bg-primary/20 text-primary hover:bg-primary/30 rounded-md transition-colors"
            >
              Parameters
            </button>
            <button
              onClick={() => setShowABTesting(true)}
              className="px-3 py-1 text-sm bg-on-surface-muted/20 text-on-surface-muted hover:bg-on-surface-muted/30 rounded-md transition-colors"
            >
              A/B Test
            </button>
          </div>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt}
          className="flex items-center justify-center px-6 py-2 bg-primary text-bkg font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {isLoading ? <LoadingSpinner /> : null}
          <span>{isLoading ? 'Generating...' : 'Generate'}</span>
        </button>
      </div>

      {error && <div className="mt-4 text-red-400">{error}</div>}
      
      {/* Memory monitoring display */}
      {memoryInfo && (
        <div className="mt-2 text-xs text-on-surface-muted">
          Memory: {memoryInfo.used}MB / {memoryInfo.total}MB
          {memoryInfo.workers > 0 && ` | Workers: ${memoryInfo.workers}`}
          {memoryInfo.used > 80 && (
            <span className="text-yellow-400 ml-2">⚠️ High memory usage</span>
          )}
        </div>
      )}
      
      {isLoading && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-on-surface-muted">{progressText}</span>
            <span className="text-sm text-on-surface-muted">{progress}%</span>
          </div>
          <div className="w-full bg-surface-border rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {midiResult && (
        <div className="mt-6 p-4 bg-bkg/50 rounded-md">
            <div className="flex justify-between items-start mb-2">
               <div>
                <h3 className="font-semibold text-on-surface">Generated MIDI Idea:</h3>
                <pre className="whitespace-pre-wrap text-on-surface-muted text-sm font-mono mt-2">{midiResult.description}</pre>
               </div>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-4">
              <button 
                onClick={downloadMidi} 
                className="flex items-center space-x-2 text-bkg bg-primary hover:bg-primary/90 transition-colors px-4 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl"
              >
                <DownloadIcon /> <span>Download .mid</span>
              </button>
              <button 
                onClick={downloadJson} 
                className="flex items-center space-x-2 text-bkg bg-secondary hover:bg-secondary/90 transition-colors px-4 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl"
              >
                <DownloadIcon /> <span>Download .json</span>
              </button>
              <button 
                onClick={downloadCombined} 
                className="flex items-center space-x-2 text-bkg bg-on-surface-muted hover:bg-on-surface-muted/90 transition-colors px-4 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl"
              >
                <DownloadIcon /> <span>Download Both</span>
              </button>
            </div>
            
           {showFeedback && learningIsEnabled && (
             <div className="mt-4 space-y-3">
               <FeedbackButtons onFeedback={handleFeedbackAction} />
               <button
                 onClick={() => setShowAdvancedFeedback(true)}
                 className="px-4 py-2 text-sm bg-primary/20 text-primary hover:bg-primary/30 rounded-md transition-colors"
               >
                 Advanced Feedback
               </button>
             </div>
           )}
        </div>
      )}

      {audioBuffer && (
        <div className="mt-6 p-4 bg-bkg/50 rounded-md">
            <h3 className="font-semibold text-on-surface mb-2">Generated Audio:</h3>
            <div className="flex items-center space-x-4">
                <button onClick={playAudio} className="flex items-center space-x-2 text-secondary hover:text-primary transition-colors p-2 rounded-full bg-surface/50">
                    <PlayIcon /> <span>Play</span>
                </button>
                <button onClick={downloadAudio} className="flex items-center space-x-2 text-secondary hover:text-primary transition-colors p-2 rounded-full bg-surface/50">
                    <DownloadIcon /> <span>Download .wav</span>
                </button>
            </div>
        </div>
      )}

      {/* Advanced Feedback Modal */}
      {showAdvancedFeedback && midiResult && (
        <AdvancedFeedbackCard
          generationResult={midiResult}
          onFeedback={handleAdvancedFeedback}
          onClose={() => setShowAdvancedFeedback(false)}
        />
      )}

      {/* Style Profile Modal */}
      {showStyleProfiles && (
        <StyleProfileCard
          onProfileSelect={handleStyleProfileSelect}
          onClose={() => setShowStyleProfiles(false)}
        />
      )}

      {/* Control Parameters Modal */}
      {showControlParameters && (
        <ControlParametersCard
          preferences={userPreferences}
          onPreferencesChange={handleControlParametersChange}
          onClose={() => setShowControlParameters(false)}
        />
      )}

      {/* A/B Testing Modal */}
      {showABTesting && (
        <ABTestingCard
          prompt={prompt}
          userPreferences={userPreferences}
          apiConfig={apiConfig}
          onGenerationComplete={handleABTestComplete}
          onClose={() => setShowABTesting(false)}
        />
      )}
    </div>
  );
};

export default GenerationCard;