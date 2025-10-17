import React from 'react';
import { FeedbackAction } from '../types';
import { ThumbsUpIcon, ThumbsDownIcon, ArrowPathIcon } from './icons';

interface FeedbackButtonsProps {
  onFeedback: (action: FeedbackAction) => void;
}

const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({ onFeedback }) => {
  return (
    <div className="mt-4 pt-4 border-t border-surface-border/50 flex items-center justify-end space-x-2">
      <span className="text-sm text-on-surface-muted mr-2">Rate this idea:</span>
      <button 
        onClick={() => onFeedback(FeedbackAction.LIKE)}
        title="Like"
        className="p-2 rounded-full bg-green-500/20 text-green-300 hover:bg-green-500/40 transition-colors"
      >
        <ThumbsUpIcon />
      </button>
      <button 
        onClick={() => onFeedback(FeedbackAction.DISLIKE)}
        title="Dislike"
        className="p-2 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/40 transition-colors"
      >
        <ThumbsDownIcon />
      </button>
      <button 
        onClick={() => onFeedback(FeedbackAction.REGENERATE)}
        title="Regenerate with same prompt"
        className="p-2 rounded-full bg-blue-500/20 text-blue-300 hover:bg-blue-500/40 transition-colors"
      >
        <ArrowPathIcon />
      </button>
    </div>
  );
};

export default FeedbackButtons;
