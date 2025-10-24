import React, { useRef, useState, useEffect } from 'react';
import { useRealtimeAnalysis } from '../hooks/useRealtimeAnalysis';
import { analyzeRecordedSnippet } from '../services/geminiService';
import type { SnippetAnalysisResult, ApiConfig } from '../types';
import { MicrophoneIcon, StopIcon, LoadingSpinner, BrainCircuitIcon, ArrowPathRoundedSquareIcon } from './icons';

interface RealtimeAnalysisCardProps {
  onLearn: (result: SnippetAnalysisResult) => void;
  isEnabled: boolean;
  apiConfig: ApiConfig;
}

const RealtimeAnalysisCard: React.FC<RealtimeAnalysisCardProps> = ({ onLearn, isEnabled, apiConfig }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isRecording, recordedBlob, recordingTime, error, startRecording, stopRecording, reset } = useRealtimeAnalysis(canvasRef);
  
  const [analysisResult, setAnalysisResult] = useState<SnippetAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [contentType, setContentType] = useState<'beatbox' | 'melody'>('beatbox');

  useEffect(() => {
    if (recordedBlob) {
      const analyze = async () => {
        setIsAnalyzing(true);
        setAnalysisResult(null);
        setAnalysisError(null);
        try {
          // We can't actually get the duration from a blob easily without loading it into an audio element.
          // Since this is a simulation, we'll just use the recordingTime.
          const result = await analyzeRecordedSnippet(recordingTime, contentType, apiConfig);
          setAnalysisResult(result);
        } catch (err) {
          console.error("Analysis failed:", err);
          setAnalysisError("Analysis failed. This might be due to high request volume. Please try again after a minute.");
        } finally {
          setIsAnalyzing(false);
        }
      };
      analyze();
    }
  }, [recordedBlob, recordingTime, contentType, apiConfig]);

  const handleLearn = () => {
    if (analysisResult) {
      onLearn(analysisResult);
      // Optional: show a confirmation message
      resetAll();
    }
  };
  
  const resetAll = () => {
    reset();
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setAnalysisError(null);
  };

  const renderContent = () => {
    if (isAnalyzing) {
      return (
        <div className="flex flex-col items-center justify-center h-36 text-on-surface-muted">
          <LoadingSpinner />
          <p className="mt-2">Analyzing your performance...</p>
        </div>
      );
    }

    if (analysisError) {
      return (
        <div className="flex flex-col items-center justify-center h-36 text-center text-red-400">
           <p className="font-semibold">Oops! Something went wrong.</p>
           <p className="text-sm mt-1">{analysisError}</p>
            <button
              onClick={resetAll}
              className="mt-4 flex items-center px-4 py-2 text-sm bg-surface-border text-on-surface rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors"
            >
              <ArrowPathRoundedSquareIcon className="h-4 w-4 mr-2" />
              Try Again
            </button>
        </div>
      );
    }

    if (analysisResult) {
      return (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-secondary">Performance Feel:</h4>
            <p className="text-sm text-on-surface-muted pl-2 border-l-2 border-surface-border">{analysisResult.humanization}</p>
          </div>
          <div>
            <h4 className="font-semibold text-secondary">Musical Pattern:</h4>
            <p className="text-sm text-on-surface-muted pl-2 border-l-2 border-surface-border">{analysisResult.pattern}</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={resetAll}
              className="flex items-center px-4 py-2 text-sm bg-surface-border text-on-surface rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors"
            >
              <ArrowPathRoundedSquareIcon className="h-4 w-4 mr-2" />
              Record Again
            </button>
            <button
              onClick={handleLearn}
              disabled={!isEnabled}
              className="flex items-center px-4 py-2 text-sm bg-primary text-bkg font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              <BrainCircuitIcon className="h-4 w-4 mr-2" />
              Teach This To AI
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div className="md:col-span-2 bg-bkg/50 p-2 rounded-md h-36">
          <canvas ref={canvasRef} className="w-full h-full"></canvas>
        </div>
        <div className="flex flex-col items-center justify-center text-center">
            {isRecording ? (
              <>
                <div className="text-3xl font-bold text-red-500">{10 - recordingTime}s</div>
                <p className="text-on-surface-muted text-sm">Recording...</p>
              </>
            ) : (
              <p className="text-sm text-on-surface-muted">
                Record a short clip to teach the AI your unique feel.
              </p>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-surface border border-surface-border rounded-lg p-6 mb-6 shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <div>
            <h2 className="text-xl font-bold text-secondary">Capture Performance DNA</h2>
            <p className="text-sm text-on-surface-muted">Teach the AI your groove by recording a beatbox or melody.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as 'beatbox' | 'melody')}
            disabled={isRecording || isAnalyzing || !!analysisResult || !!analysisError}
            className="p-2 border-2 border-surface-border bg-input-bg text-on-surface rounded-md focus:ring-2 focus:border-primary transition disabled:opacity-50"
          >
            <option value="beatbox">Beatbox</option>
            <option value="melody">Melody</option>
          </select>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isAnalyzing || !!analysisResult || !!analysisError}
            className={`flex items-center justify-center px-4 py-2 text-bkg font-bold rounded-full transition-colors w-36 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-primary hover:opacity-90'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording ? <StopIcon className="mr-2" /> : <MicrophoneIcon className="mr-2" />}
            <span>{isRecording ? 'Stop' : 'Record'}</span>
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-center text-red-400">{error}</div>}
      {!isEnabled && (
        <div className="mb-4 p-3 text-center bg-yellow-900/50 text-yellow-300 rounded-md text-sm">
          Enable the AI Learning System to teach it your captured performances.
        </div>
      )}

      {renderContent()}
    </div>
  );
};

export default RealtimeAnalysisCard;