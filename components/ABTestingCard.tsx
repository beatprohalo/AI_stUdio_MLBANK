import React, { useState, useCallback } from 'react';
import { generateMidi } from '../services/geminiService';
import { generateABTestVariations } from '../services/advancedMusicService';
import type { MidiGenerationResult, ApiConfig, UserPreferences } from '../types';
import { LoadingSpinner, DownloadIcon } from './icons';

interface ABTestingCardProps {
  prompt: string;
  userPreferences: UserPreferences;
  apiConfig: ApiConfig;
  onGenerationComplete: (result: MidiGenerationResult, prompt: string, variant: 'conservative' | 'experimental') => void;
  onClose: () => void;
}

const ABTestingCard: React.FC<ABTestingCardProps> = ({
  prompt,
  userPreferences,
  apiConfig,
  onGenerationComplete,
  onClose
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conservativeResult, setConservativeResult] = useState<MidiGenerationResult | null>(null);
  const [experimentalResult, setExperimentalResult] = useState<MidiGenerationResult | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<'conservative' | 'experimental' | null>(null);

  const handleGenerateVariations = useCallback(async () => {
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setConservativeResult(null);
    setExperimentalResult(null);
    setSelectedVariant(null);

    try {
      // Generate conservative variation
      const conservativePrompt = generateABTestVariations(prompt, userPreferences).conservative;
      const conservativeResult = await generateMidi(conservativePrompt, apiConfig);
      setConservativeResult(conservativeResult);

      // Generate experimental variation
      const experimentalPrompt = generateABTestVariations(prompt, userPreferences).experimental;
      const experimentalResult = await generateMidi(experimentalPrompt, apiConfig);
      setExperimentalResult(experimentalResult);

    } catch (err) {
      let errorMessage = 'Failed to generate A/B test variations. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again with a simpler prompt.';
        } else if (err.message.includes('Could not parse')) {
          errorMessage = 'The AI generated invalid MIDI data. Please try a different prompt.';
        }
      }
      
      setError(errorMessage);
      console.error('A/B testing error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, userPreferences, apiConfig]);

  const handleVariantSelect = (variant: 'conservative' | 'experimental') => {
    setSelectedVariant(variant);
  };

  const handleDownloadVariant = (variant: 'conservative' | 'experimental') => {
    const result = variant === 'conservative' ? conservativeResult : experimentalResult;
    if (!result) return;

    // Create a simple MIDI blob for download
    const jsonData = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ab-test-${variant}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Track the selection for learning
    onGenerationComplete(result, prompt, variant);
  };

  const getVariantDescription = (variant: 'conservative' | 'experimental'): string => {
    if (variant === 'conservative') {
      return 'Uses established harmonic progressions, moderate complexity, clear melodies, and standard dynamic ranges.';
    } else {
      return 'Pushes harmonic boundaries, creates complex evolving melodies, applies dramatic dynamics, and uses advanced rhythmic patterns.';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-bkg border border-outline rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">A/B Testing: Conservative vs Experimental</h2>
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
          <h3 className="font-semibold text-on-surface mb-2">Prompt:</h3>
          <p className="text-on-surface-muted">{prompt}</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {!conservativeResult && !experimentalResult && !isLoading && (
          <div className="text-center py-8">
            <p className="text-on-surface-muted mb-4">
              Generate two variations of your prompt to compare conservative vs experimental approaches.
            </p>
            <button
              onClick={handleGenerateVariations}
              className="px-6 py-3 bg-primary text-on-primary rounded-lg hover:bg-primary-dark transition-colors"
            >
              Generate A/B Test Variations
            </button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <LoadingSpinner />
            <p className="text-on-surface-muted mt-4">Generating A/B test variations...</p>
          </div>
        )}

        {conservativeResult && experimentalResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Conservative Variation */}
            <div className={`border rounded-lg p-4 ${
              selectedVariant === 'conservative' 
                ? 'border-primary bg-primary/10' 
                : 'border-outline hover:border-primary/50'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-on-surface">Conservative Approach</h3>
                {selectedVariant === 'conservative' && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-on-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <p className="text-sm text-on-surface-muted mb-4">
                {getVariantDescription('conservative')}
              </p>

              <div className="mb-4 p-3 bg-surface rounded-md">
                <h4 className="font-medium text-on-surface mb-2">Generated Music:</h4>
                <p className="text-sm text-on-surface-muted">{conservativeResult.description}</p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleVariantSelect('conservative')}
                  className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                    selectedVariant === 'conservative'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface text-on-surface hover:bg-surface/80'
                  }`}
                >
                  {selectedVariant === 'conservative' ? 'Selected' : 'Select Conservative'}
                </button>
                <button
                  onClick={() => handleDownloadVariant('conservative')}
                  className="flex items-center space-x-2 px-4 py-2 bg-secondary text-on-secondary rounded-md hover:bg-secondary/90 transition-colors"
                >
                  <DownloadIcon />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Experimental Variation */}
            <div className={`border rounded-lg p-4 ${
              selectedVariant === 'experimental' 
                ? 'border-primary bg-primary/10' 
                : 'border-outline hover:border-primary/50'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-on-surface">Experimental Approach</h3>
                {selectedVariant === 'experimental' && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-on-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <p className="text-sm text-on-surface-muted mb-4">
                {getVariantDescription('experimental')}
              </p>

              <div className="mb-4 p-3 bg-surface rounded-md">
                <h4 className="font-medium text-on-surface mb-2">Generated Music:</h4>
                <p className="text-sm text-on-surface-muted">{experimentalResult.description}</p>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleVariantSelect('experimental')}
                  className={`flex-1 px-4 py-2 rounded-md transition-colors ${
                    selectedVariant === 'experimental'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface text-on-surface hover:bg-surface/80'
                  }`}
                >
                  {selectedVariant === 'experimental' ? 'Selected' : 'Select Experimental'}
                </button>
                <button
                  onClick={() => handleDownloadVariant('experimental')}
                  className="flex items-center space-x-2 px-4 py-2 bg-secondary text-on-secondary rounded-md hover:bg-secondary/90 transition-colors"
                >
                  <DownloadIcon />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedVariant && (
          <div className="mt-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">Selection Summary</h4>
            <p className="text-on-surface-muted">
              You selected the <strong>{selectedVariant}</strong> approach. 
              This choice will be used to refine future generations based on your preferences.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 text-on-surface-muted hover:text-on-surface transition-colors"
          >
            Close
          </button>
          {conservativeResult && experimentalResult && (
            <button
              onClick={() => {
                if (selectedVariant) {
                  handleDownloadVariant(selectedVariant);
                }
              }}
              disabled={!selectedVariant}
              className="px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Download Selected
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ABTestingCard;
