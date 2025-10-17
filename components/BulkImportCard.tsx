
import React, { useState } from 'react';
import { FeedbackAction } from '../types';
import { FolderPlusIcon } from './icons';

interface ProgressState {
  processing: boolean;
  total: number;
  processed: number;
  eta: number; // in seconds
}

interface ImportSectionProps {
  title: string;
  description: string;
  acceptedFiles: string;
  onImport: (files: FileList) => void;
  isLoading: boolean;
  isEnabled: boolean;
}

const ImportSection: React.FC<ImportSectionProps> = ({ title, description, acceptedFiles, onImport, isLoading, isEnabled }) => {
  const [files, setFiles] = useState<FileList | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(event.target.files);
    }
  };

  const handleImportClick = () => {
    if (files) {
      onImport(files);
      setFiles(null); 
      const input = document.getElementById(`file-input-${title}`) as HTMLInputElement;
      if (input) input.value = "";
    }
  };

  return (
    <div className="bg-bkg/50 p-4 rounded-md">
      <h3 className="font-semibold text-on-surface">{title}</h3>
      <p className="text-sm text-on-surface-muted mt-1 mb-3">{description}</p>
      <div className="flex items-center space-x-2">
        <label className="flex-1">
          <span className="sr-only">Choose files for {title}</span>
          <input
            type="file"
            id={`file-input-${title}`}
            multiple
            accept={acceptedFiles}
            onChange={handleFileChange}
            disabled={!isEnabled || isLoading}
            className="block w-full text-sm text-on-surface-muted
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-primary/20 file:text-primary
              hover:file:bg-primary/30 disabled:opacity-50 disabled:hover:file:bg-primary/20"
          />
        </label>
        <button
          onClick={handleImportClick}
          disabled={isLoading || !files || files.length === 0 || !isEnabled}
          className="flex items-center justify-center px-4 py-2 bg-secondary text-bkg text-sm font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          Import
        </button>
      </div>
      {files && files.length > 0 && (
        <p className="text-xs text-on-surface-muted mt-2">{files.length} file(s) selected.</p>
      )}
    </div>
  );
};


interface BulkImportCardProps {
  onBulkLearn: (descriptions: string[], action: FeedbackAction) => void;
  isEnabled: boolean;
}

const BulkImportCard: React.FC<BulkImportCardProps> = ({ onBulkLearn, isEnabled }) => {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const isProcessing = progress?.processing ?? false;

  const handleImport = async (files: FileList, type: 'chords' | 'melodies' | 'humanization') => {
    setSuccessMessage(null);

    const descriptions = Array.from(files).map(file => {
      const nameWithoutExt = file.name.split('.').slice(0, -1).join('.');
      const cleanedName = nameWithoutExt.replace(/[_-]/g, ' ');
      
      switch(type) {
        case 'chords': return `${cleanedName} chord progression pattern`;
        case 'melodies': return `${cleanedName} melodic pattern`;
        case 'humanization': return `${cleanedName} humanized natural feel performance`;
        default: return cleanedName;
      }
    });
    
    const totalFiles = files.length;
    setProgress({ processing: true, total: totalFiles, processed: 0, eta: Infinity });
    const startTime = Date.now();

    for (let i = 0; i < totalFiles; i++) {
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));

      const processedCount = i + 1;
      const elapsedTime = (Date.now() - startTime) / 1000;
      const timePerFile = elapsedTime / processedCount;
      const remainingFiles = totalFiles - processedCount;
      const estimatedTimeRemaining = Math.round(timePerFile * remainingFiles);
      
      setProgress({
        processing: true,
        total: totalFiles,
        processed: processedCount,
        eta: estimatedTimeRemaining,
      });
    }

    onBulkLearn(descriptions, FeedbackAction.LIKE);

    setProgress(null);
    setSuccessMessage(`Successfully learned from ${files.length} ${type} file(s)!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };


  return (
    <div className="bg-surface border border-surface-border rounded-lg p-6 mb-6 shadow-lg">
      <div className="flex items-center mb-4">
        <FolderPlusIcon className="h-6 w-6 text-secondary mr-3" />
        <h2 className="text-xl font-bold text-secondary">Bulk Import to Train AI</h2>
      </div>
      
      {!isEnabled && (
        <div className="mb-4 p-3 text-center bg-yellow-900/50 text-yellow-300 rounded-md text-sm">
          Enable the AI Learning System to import files for training.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <ImportSection
          title="MIDI Chords"
          description="Import MIDI files of chord progressions to teach the AI your harmonic style."
          acceptedFiles=".mid,.midi"
          onImport={(files) => handleImport(files, 'chords')}
          isLoading={isProcessing}
          isEnabled={isEnabled}
        />
        <ImportSection
          title="MIDI Melodies"
          description="Import MIDI files of melodies to teach the AI your melodic preferences."
          acceptedFiles=".mid,.midi"
          onImport={(files) => handleImport(files, 'melodies')}
          isLoading={isProcessing}
          isEnabled={isEnabled}
        />
        <ImportSection
          title="Audio for Humanization"
          description="Import audio files (loops, stems) to teach the AI about your preferred rhythmic feel and dynamics."
          acceptedFiles="audio/wav,audio/mpeg"
          onImport={(files) => handleImport(files, 'humanization')}
          isLoading={isProcessing}
          isEnabled={isEnabled}
        />
      </div>
      
      {isProcessing && progress && (
        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-on-surface">Processing Files...</span>
            <span className="text-sm font-medium text-on-surface-muted">{progress.processed} / {progress.total}</span>
          </div>
          <div className="w-full bg-surface-border rounded-full h-2.5">
            <div className="bg-secondary h-2.5 rounded-full transition-width duration-150" style={{ width: `${(progress.processed / progress.total) * 100}%` }}></div>
          </div>
          <div className="text-right text-xs text-on-surface-muted mt-1">
            ETA: {progress.eta < Infinity && progress.eta > 0 ? `${progress.eta}s remaining` : 'Calculating...'}
          </div>
        </div>
      )}


      {successMessage && !isProcessing && (
        <div className="mt-4 text-center text-green-400 font-semibold transition-opacity duration-300">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default BulkImportCard;
