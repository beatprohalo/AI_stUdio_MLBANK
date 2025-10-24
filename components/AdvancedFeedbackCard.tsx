import React, { useState } from 'react';
import type { AdvancedFeedbackSchema, MidiGenerationResult } from '../types';

interface AdvancedFeedbackCardProps {
  generationResult: MidiGenerationResult;
  onFeedback: (feedback: AdvancedFeedbackSchema) => void;
  onClose: () => void;
}

const AdvancedFeedbackCard: React.FC<AdvancedFeedbackCardProps> = ({
  generationResult,
  onFeedback,
  onClose
}) => {
  const [feedback, setFeedback] = useState<AdvancedFeedbackSchema>({
    harmonicComplexity: 3,
    melodicCoherence: 3,
    dynamicExpression: 3,
    voiceLeading: 3,
    overallQuality: 3
  });

  const handleSliderChange = (field: keyof AdvancedFeedbackSchema, value: number) => {
    setFeedback(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    onFeedback(feedback);
    onClose();
  };

  const getRatingLabel = (value: number): string => {
    if (value <= 1) return 'Poor';
    if (value <= 2) return 'Below Average';
    if (value <= 3) return 'Average';
    if (value <= 4) return 'Good';
    return 'Excellent';
  };

  const getRatingColor = (value: number): string => {
    if (value <= 2) return 'text-red-500';
    if (value <= 3) return 'text-yellow-500';
    if (value <= 4) return 'text-blue-500';
    return 'text-green-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-bkg border border-outline rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Advanced Musical Feedback</h2>
          <button
            onClick={onClose}
            className="text-on-surface-muted hover:text-on-surface transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-4 bg-surface rounded-lg">
          <h3 className="font-semibold text-on-surface mb-2">Generated Music:</h3>
          <p className="text-on-surface-muted">{generationResult.description}</p>
        </div>

        <div className="space-y-6">
          {/* Harmonic Complexity */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Harmonic Sophistication
            </label>
            <p className="text-sm text-on-surface-muted mb-3">
              Rate the complexity and sophistication of the chord progressions and harmonic movement.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-on-surface-muted">Simple I-IV-V</span>
              <input
                type="range"
                min="1"
                max="5"
                value={feedback.harmonicComplexity}
                onChange={(e) => handleSliderChange('harmonicComplexity', parseInt(e.target.value))}
                className="flex-1 h-2 bg-outline rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm text-on-surface-muted">Complex Modal Interchange</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className={`text-sm font-medium ${getRatingColor(feedback.harmonicComplexity)}`}>
                {getRatingLabel(feedback.harmonicComplexity)}
              </span>
              <span className="text-sm text-on-surface-muted">{feedback.harmonicComplexity}/5</span>
            </div>
          </div>

          {/* Melodic Coherence */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Melodic Development
            </label>
            <p className="text-sm text-on-surface-muted mb-3">
              How well does the melody develop cohesively with motifs and thematic material?
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-on-surface-muted">Random Notes</span>
              <input
                type="range"
                min="1"
                max="5"
                value={feedback.melodicCoherence}
                onChange={(e) => handleSliderChange('melodicCoherence', parseInt(e.target.value))}
                className="flex-1 h-2 bg-outline rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm text-on-surface-muted">Motivic Development</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className={`text-sm font-medium ${getRatingColor(feedback.melodicCoherence)}`}>
                {getRatingLabel(feedback.melodicCoherence)}
              </span>
              <span className="text-sm text-on-surface-muted">{feedback.melodicCoherence}/5</span>
            </div>
          </div>

          {/* Dynamic Expression */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Dynamic Expression
            </label>
            <p className="text-sm text-on-surface-muted mb-3">
              How expressive and dynamic is the musical performance and phrasing?
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-on-surface-muted">Static</span>
              <input
                type="range"
                min="1"
                max="5"
                value={feedback.dynamicExpression}
                onChange={(e) => handleSliderChange('dynamicExpression', parseInt(e.target.value))}
                className="flex-1 h-2 bg-outline rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm text-on-surface-muted">Highly Expressive</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className={`text-sm font-medium ${getRatingColor(feedback.dynamicExpression)}`}>
                {getRatingLabel(feedback.dynamicExpression)}
              </span>
              <span className="text-sm text-on-surface-muted">{feedback.dynamicExpression}/5</span>
            </div>
          </div>

          {/* Voice Leading */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Voice Leading
            </label>
            <p className="text-sm text-on-surface-muted mb-3">
              How smooth and sophisticated is the movement between chord voices?
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-on-surface-muted">Parallel Motion</span>
              <input
                type="range"
                min="1"
                max="5"
                value={feedback.voiceLeading}
                onChange={(e) => handleSliderChange('voiceLeading', parseInt(e.target.value))}
                className="flex-1 h-2 bg-outline rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm text-on-surface-muted">Sophisticated Counterpoint</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className={`text-sm font-medium ${getRatingColor(feedback.voiceLeading)}`}>
                {getRatingLabel(feedback.voiceLeading)}
              </span>
              <span className="text-sm text-on-surface-muted">{feedback.voiceLeading}/5</span>
            </div>
          </div>

          {/* Overall Quality */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Overall Musical Quality
            </label>
            <p className="text-sm text-on-surface-muted mb-3">
              Rate the overall musical quality and appeal of the generated composition.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-on-surface-muted">Poor</span>
              <input
                type="range"
                min="1"
                max="5"
                value={feedback.overallQuality}
                onChange={(e) => handleSliderChange('overallQuality', parseInt(e.target.value))}
                className="flex-1 h-2 bg-outline rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-sm text-on-surface-muted">Excellent</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className={`text-sm font-medium ${getRatingColor(feedback.overallQuality)}`}>
                {getRatingLabel(feedback.overallQuality)}
              </span>
              <span className="text-sm text-on-surface-muted">{feedback.overallQuality}/5</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 text-on-surface-muted hover:text-on-surface transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-dark transition-colors"
          >
            Submit Feedback
          </button>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: var(--color-primary);
          cursor: pointer;
          border: 2px solid var(--color-surface);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: var(--color-primary);
          cursor: pointer;
          border: 2px solid var(--color-surface);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default AdvancedFeedbackCard;
