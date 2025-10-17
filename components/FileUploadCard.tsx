import React, { useState, useCallback } from 'react';
import { analyzeAudioFile } from '../services/geminiService';
import type { AnalysisResult } from '../types';
import { LoadingSpinner, UploadIcon } from './icons';
import AnalysisCharts from './AnalysisCharts';

interface FileUploadCardProps {
  onAnalysisComplete: (result: AnalysisResult, fileName: string) => void;
  analysisResult: AnalysisResult | null;
}

const FileUploadCard: React.FC<FileUploadCardProps> = ({ onAnalysisComplete, analysisResult }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeAudioFile(file.name);
      onAnalysisComplete(result, file.name);
    } catch (err) {
      setError('Failed to analyze file. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [file, onAnalysisComplete]);

  return (
    <div className="bg-surface border border-surface-border rounded-lg p-6 mb-6 shadow-lg">
      <h2 className="text-xl font-bold text-secondary mb-4">1. Upload & Analyze Audio</h2>
      <div className="flex items-center space-x-4">
        <label className="flex-1 block">
          <span className="sr-only">Choose file</span>
          <input type="file" onChange={handleFileChange} accept="audio/*"
            className="block w-full text-sm text-on-surface-muted
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-primary/20 file:text-primary
              hover:file:bg-primary/30"
          />
        </label>
        <button
          onClick={handleAnalyze}
          disabled={isLoading || !file}
          className="flex items-center justify-center px-4 py-2 bg-primary text-bkg font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {isLoading ? <LoadingSpinner /> : <UploadIcon />}
          <span>{isLoading ? 'Analyzing...' : 'Analyze'}</span>
        </button>
      </div>

      {error && <div className="mt-4 text-red-400">{error}</div>}

      {analysisResult && (
        <div className="mt-6">
          <h3 className="font-semibold text-on-surface mb-4 text-lg">Analysis Dashboard:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-bkg/50 p-3 rounded text-center"><strong className="block text-secondary">Key</strong> {analysisResult.key}</div>
              <div className="bg-bkg/50 p-3 rounded text-center"><strong className="block text-secondary">Genre</strong> {analysisResult.genre}</div>
              <div className="bg-bkg/50 p-3 rounded text-center"><strong className="block text-secondary">Tempo Category</strong> {analysisResult.tempoCategory}</div>
              <div className="bg-bkg/50 p-3 rounded text-center col-span-1 md:col-span-3"><strong className="block text-secondary">Mood</strong> {analysisResult.mood}</div>
              <div className="bg-bkg/50 p-3 rounded col-span-1 md:col-span-3">
                <strong className="block text-secondary mb-2 text-center">Chord Progression</strong>
                <div className="flex justify-center items-center gap-2 flex-wrap">
                    {analysisResult.chords.map((chord, index) => (
                        <span key={index} className="px-3 py-1 bg-surface rounded-full text-sm font-mono text-on-surface">{chord}</span>
                    ))}
                </div>
              </div>
          </div>
          
          <AnalysisCharts analysisData={analysisResult} />

        </div>
      )}
    </div>
  );
};

export default FileUploadCard;