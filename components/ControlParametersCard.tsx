import React, { useState } from 'react';
import type { UserPreferences } from '../types';

interface ControlParametersCardProps {
  preferences: UserPreferences;
  onPreferencesChange: (preferences: UserPreferences) => void;
  onClose: () => void;
}

const ControlParametersCard: React.FC<ControlParametersCardProps> = ({
  preferences,
  onPreferencesChange,
  onClose
}) => {
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(preferences);

  const handleParameterChange = (
    category: keyof UserPreferences,
    parameter: string,
    value: number
  ) => {
    setLocalPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parameter]: value
      }
    }));
  };

  const handleApply = () => {
    onPreferencesChange(localPreferences);
    onClose();
  };

  const handleReset = () => {
    setLocalPreferences(preferences);
  };

  const getLabel = (value: number): string => {
    if (value < 0.2) return 'Very Low';
    if (value < 0.4) return 'Low';
    if (value < 0.6) return 'Medium';
    if (value < 0.8) return 'High';
    return 'Very High';
  };

  const getColor = (value: number): string => {
    if (value < 0.3) return 'text-red-500';
    if (value < 0.6) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-bkg border border-outline rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Control Parameters</h2>
          <button
            onClick={onClose}
            className="text-on-surface-muted hover:text-on-surface transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-on-surface-muted mb-6">
          Adjust these parameters to fine-tune your AI music generation. These settings will override learned preferences for specific generations.
        </p>

        <div className="space-y-8">
          {/* Harmonic Parameters */}
          <div>
            <h3 className="text-lg font-semibold text-on-surface mb-4">Harmonic Parameters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Harmonic Complexity
                </label>
                <p className="text-sm text-on-surface-muted mb-3">
                  Controls the sophistication of chord progressions and harmonic movement.
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-on-surface-muted">Simple</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={localPreferences.harmonic.complexity}
                    onChange={(e) => handleParameterChange('harmonic', 'complexity', parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-outline rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-on-surface-muted">Complex</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className={`text-sm font-medium ${getColor(localPreferences.harmonic.complexity)}`}>
                    {getLabel(localPreferences.harmonic.complexity)}
                  </span>
                  <span className="text-sm text-on-surface-muted">
                    {Math.round(localPreferences.harmonic.complexity * 100)}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Jazz Influence
                </label>
                <p className="text-sm text-on-surface-muted mb-3">
                  Amount of jazz harmony, extended chords, and alterations.
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-on-surface-muted">None</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={localPreferences.harmonic.jazzInfluence}
                    onChange={(e) => handleParameterChange('harmonic', 'jazzInfluence', parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-outline rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-on-surface-muted">Heavy</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className={`text-sm font-medium ${getColor(localPreferences.harmonic.jazzInfluence)}`}>
                    {getLabel(localPreferences.harmonic.jazzInfluence)}
                  </span>
                  <span className="text-sm text-on-surface-muted">
                    {Math.round(localPreferences.harmonic.jazzInfluence * 100)}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Modal Flavor
                </label>
                <p className="text-sm text-on-surface-muted mb-3">
                  Frequency of modal interchange and borrowed chords.
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-on-surface-muted">None</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={localPreferences.harmonic.modalFlavor}
                    onChange={(e) => handleParameterChange('harmonic', 'modalFlavor', parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-outline rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-on-surface-muted">Frequent</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className={`text-sm font-medium ${getColor(localPreferences.harmonic.modalFlavor)}`}>
                    {getLabel(localPreferences.harmonic.modalFlavor)}
                  </span>
                  <span className="text-sm text-on-surface-muted">
                    {Math.round(localPreferences.harmonic.modalFlavor * 100)}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Chromaticism
                </label>
                <p className="text-sm text-on-surface-muted mb-3">
                  Use of chromatic passing tones and neighbor tones.
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-on-surface-muted">Diatonic</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={localPreferences.harmonic.chromaticism}
                    onChange={(e) => handleParameterChange('harmonic', 'chromaticism', parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-outline rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-on-surface-muted">Chromatic</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className={`text-sm font-medium ${getColor(localPreferences.harmonic.chromaticism)}`}>
                    {getLabel(localPreferences.harmonic.chromaticism)}
                  </span>
                  <span className="text-sm text-on-surface-muted">
                    {Math.round(localPreferences.harmonic.chromaticism * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Melodic Parameters */}
          <div>
            <h3 className="text-lg font-semibold text-on-surface mb-4">Melodic Parameters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Motivic Development
                </label>
                <p className="text-sm text-on-surface-muted mb-3">
                  How much the melody develops through theme and variation.
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-on-surface-muted">Improvisational</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={localPreferences.melodic.motivicDevelopment}
                    onChange={(e) => handleParameterChange('melodic', 'motivicDevelopment', parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-outline rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-on-surface-muted">Thematic</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className={`text-sm font-medium ${getColor(localPreferences.melodic.motivicDevelopment)}`}>
                    {getLabel(localPreferences.melodic.motivicDevelopment)}
                  </span>
                  <span className="text-sm text-on-surface-muted">
                    {Math.round(localPreferences.melodic.motivicDevelopment * 100)}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Contour Variety
                </label>
                <p className="text-sm text-on-surface-muted mb-3">
                  Diversity of melodic shapes and contours.
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-on-surface-muted">Linear</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={localPreferences.melodic.contourVariety}
                    onChange={(e) => handleParameterChange('melodic', 'contourVariety', parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-outline rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-on-surface-muted">Varied</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className={`text-sm font-medium ${getColor(localPreferences.melodic.contourVariety)}`}>
                    {getLabel(localPreferences.melodic.contourVariety)}
                  </span>
                  <span className="text-sm text-on-surface-muted">
                    {Math.round(localPreferences.melodic.contourVariety * 100)}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Rhythmic Complexity
                </label>
                <p className="text-sm text-on-surface-muted mb-3">
                  Level of syncopation and rhythmic sophistication.
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-on-surface-muted">Simple</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={localPreferences.melodic.rhythmicComplexity}
                    onChange={(e) => handleParameterChange('melodic', 'rhythmicComplexity', parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-outline rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-on-surface-muted">Complex</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className={`text-sm font-medium ${getColor(localPreferences.melodic.rhythmicComplexity)}`}>
                    {getLabel(localPreferences.melodic.rhythmicComplexity)}
                  </span>
                  <span className="text-sm text-on-surface-muted">
                    {Math.round(localPreferences.melodic.rhythmicComplexity * 100)}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Melodic Range
                </label>
                <p className="text-sm text-on-surface-muted mb-3">
                  Octave span of the melodic material.
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-on-surface-muted">Narrow</span>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={localPreferences.melodic.range}
                    onChange={(e) => handleParameterChange('melodic', 'range', parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-outline rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-on-surface-muted">Wide</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className={`text-sm font-medium ${getColor(localPreferences.melodic.range / 3)}`}>
                    {localPreferences.melodic.range.toFixed(1)} octaves
                  </span>
                  <span className="text-sm text-on-surface-muted">
                    {Math.round((localPreferences.melodic.range / 3) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Parameters */}
          <div>
            <h3 className="text-lg font-semibold text-on-surface mb-4">Dynamic Parameters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Expressiveness
                </label>
                <p className="text-sm text-on-surface-muted mb-3">
                  Dynamic range and expressive phrasing.
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-on-surface-muted">Subtle</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={localPreferences.dynamics.expressiveness}
                    onChange={(e) => handleParameterChange('dynamics', 'expressiveness', parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-outline rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-on-surface-muted">Dramatic</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className={`text-sm font-medium ${getColor(localPreferences.dynamics.expressiveness)}`}>
                    {getLabel(localPreferences.dynamics.expressiveness)}
                  </span>
                  <span className="text-sm text-on-surface-muted">
                    {Math.round(localPreferences.dynamics.expressiveness * 100)}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Micro-timing
                </label>
                <p className="text-sm text-on-surface-muted mb-3">
                  Amount of humanization and timing variation.
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-on-surface-muted">Quantized</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={localPreferences.dynamics.microTiming}
                    onChange={(e) => handleParameterChange('dynamics', 'microTiming', parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-outline rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-on-surface-muted">Humanized</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className={`text-sm font-medium ${getColor(localPreferences.dynamics.microTiming)}`}>
                    {getLabel(localPreferences.dynamics.microTiming)}
                  </span>
                  <span className="text-sm text-on-surface-muted">
                    {Math.round(localPreferences.dynamics.microTiming * 100)}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">
                  Accentuation
                </label>
                <p className="text-sm text-on-surface-muted mb-3">
                  Strength of accents and emphasis patterns.
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-on-surface-muted">Soft</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={localPreferences.dynamics.accentuation}
                    onChange={(e) => handleParameterChange('dynamics', 'accentuation', parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-outline rounded-lg appearance-none cursor-pointer slider"
                  />
                  <span className="text-sm text-on-surface-muted">Strong</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className={`text-sm font-medium ${getColor(localPreferences.dynamics.accentuation)}`}>
                    {getLabel(localPreferences.dynamics.accentuation)}
                  </span>
                  <span className="text-sm text-on-surface-muted">
                    {Math.round(localPreferences.dynamics.accentuation * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-on-surface-muted hover:text-on-surface transition-colors"
          >
            Reset to Defaults
          </button>
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-on-surface-muted hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-dark transition-colors"
            >
              Apply Parameters
            </button>
          </div>
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

export default ControlParametersCard;
