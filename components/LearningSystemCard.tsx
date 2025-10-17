import React from 'react';
import { BrainCircuitIcon, EyeIcon, ArrowPathRoundedSquareIcon } from './icons';

interface LearningSystemCardProps {
  isEnabled: boolean;
  confidence: number;
  sampleCount: number;
  onToggle: () => void;
  onReset: () => void;
  onView: () => void;
}

const LearningSystemCard: React.FC<LearningSystemCardProps> = ({
  isEnabled,
  confidence,
  sampleCount,
  onToggle,
  onReset,
  onView,
}) => {
  const confidenceColor = isEnabled ? 'text-primary' : 'text-on-surface-muted';

  return (
    <div className="bg-surface border border-surface-border rounded-lg p-6 mb-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
            <BrainCircuitIcon className="h-6 w-6 text-secondary mr-3" />
            <h2 className="text-xl font-bold text-secondary">AI Learning System</h2>
        </div>
        <button
          onClick={onToggle}
          className={`px-4 py-2 text-sm font-bold rounded-full transition-colors ${
            isEnabled
              ? 'bg-primary/20 text-primary hover:bg-primary/30'
              : 'bg-on-surface-muted/20 text-on-surface-muted hover:bg-on-surface-muted/30'
          }`}
        >
          {isEnabled ? '🎓 LEARNING ENABLED' : '🎓 LEARNING DISABLED'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="bg-bkg/50 p-4 rounded-md text-center">
            <div className="text-sm text-on-surface-muted">Confidence</div>
            <div className={`text-2xl font-bold ${confidenceColor}`}>{confidence.toFixed(0)}%</div>
        </div>
        <div className="bg-bkg/50 p-4 rounded-md text-center">
            <div className="text-sm text-on-surface-muted">Status</div>
            <div className={`text-2xl font-bold ${isEnabled ? 'text-green-400' : 'text-red-400'}`}>{isEnabled ? 'Active' : 'Inactive'}</div>
        </div>
        <div className="bg-bkg/50 p-4 rounded-md text-center">
            <div className="text-sm text-on-surface-muted">Samples Learned</div>
            <div className={`text-2xl font-bold ${confidenceColor}`}>{sampleCount}</div>
        </div>
      </div>
      
      <div className="flex items-center justify-end space-x-2">
         <button 
            onClick={onView}
            className="flex items-center px-4 py-2 text-sm bg-surface-border text-on-surface rounded-full hover:bg-primary/20 hover:text-primary transition-colors disabled:opacity-50"
            disabled={!isEnabled}
        >
            <EyeIcon />
            <span>View Preferences</span>
        </button>
        <button 
            onClick={onReset}
            className="flex items-center px-4 py-2 text-sm bg-surface-border text-on-surface rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50"
            disabled={!isEnabled || sampleCount === 0}
        >
            <ArrowPathRoundedSquareIcon />
            <span>Reset Learning</span>
        </button>
      </div>

    </div>
  );
};

export default LearningSystemCard;
