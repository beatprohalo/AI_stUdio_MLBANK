import React, { useState } from 'react';
import { MUSICAL_STYLE_PROFILES } from '../services/advancedMusicService';
import type { MusicalStyleProfile } from '../types';

interface StyleProfileCardProps {
  onProfileSelect: (profile: MusicalStyleProfile) => void;
  onClose: () => void;
}

const StyleProfileCard: React.FC<StyleProfileCardProps> = ({
  onProfileSelect,
  onClose
}) => {
  const [selectedProfile, setSelectedProfile] = useState<MusicalStyleProfile | null>(null);

  const handleSelectProfile = (profile: MusicalStyleProfile) => {
    setSelectedProfile(profile);
  };

  const handleApplyProfile = () => {
    if (selectedProfile) {
      onProfileSelect(selectedProfile);
      onClose();
    }
  };

  const getComplexityLabel = (value: number): string => {
    if (value < 0.3) return 'Simple';
    if (value < 0.6) return 'Moderate';
    if (value < 0.8) return 'Complex';
    return 'Very Complex';
  };

  const getIntensityLabel = (value: number): string => {
    if (value < 0.3) return 'Subtle';
    if (value < 0.6) return 'Moderate';
    if (value < 0.8) return 'Strong';
    return 'Intense';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-bkg border border-outline rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Musical Style Profiles</h2>
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
          Select a pre-configured musical style profile to influence your AI music generation. 
          Each profile contains specific characteristics for harmony, melody, and dynamics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MUSICAL_STYLE_PROFILES.map((profile) => (
            <div
              key={profile.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedProfile?.id === profile.id
                  ? 'border-primary bg-primary/10'
                  : 'border-outline hover:border-primary/50'
              }`}
              onClick={() => handleSelectProfile(profile)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-on-surface">{profile.name}</h3>
                {selectedProfile?.id === profile.id && (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-on-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <p className="text-on-surface-muted mb-4">{profile.description}</p>

              <div className="space-y-3">
                {/* Harmonic Characteristics */}
                <div>
                  <h4 className="text-sm font-medium text-on-surface mb-2">Harmonic Style</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-muted">Complexity</span>
                      <span className="text-on-surface">{getComplexityLabel(profile.characteristics.harmonic.complexity)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-muted">Jazz Influence</span>
                      <span className="text-on-surface">{getIntensityLabel(profile.characteristics.harmonic.jazzInfluence)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-muted">Modal Flavor</span>
                      <span className="text-on-surface">{getIntensityLabel(profile.characteristics.harmonic.modalFlavor)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-muted">Chromaticism</span>
                      <span className="text-on-surface">{getIntensityLabel(profile.characteristics.harmonic.chromaticism)}</span>
                    </div>
                  </div>
                </div>

                {/* Melodic Characteristics */}
                <div>
                  <h4 className="text-sm font-medium text-on-surface mb-2">Melodic Style</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-muted">Motivic Development</span>
                      <span className="text-on-surface">{getIntensityLabel(profile.characteristics.melodic.motivicDevelopment)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-muted">Contour Variety</span>
                      <span className="text-on-surface">{getIntensityLabel(profile.characteristics.melodic.contourVariety)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-muted">Rhythmic Complexity</span>
                      <span className="text-on-surface">{getIntensityLabel(profile.characteristics.melodic.rhythmicComplexity)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-muted">Range</span>
                      <span className="text-on-surface">{profile.characteristics.melodic.range.toFixed(1)} octaves</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Characteristics */}
                <div>
                  <h4 className="text-sm font-medium text-on-surface mb-2">Dynamic Style</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-muted">Expressiveness</span>
                      <span className="text-on-surface">{getIntensityLabel(profile.characteristics.dynamics.expressiveness)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-muted">Micro-timing</span>
                      <span className="text-on-surface">{getIntensityLabel(profile.characteristics.dynamics.microTiming)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-muted">Accentuation</span>
                      <span className="text-on-surface">{getIntensityLabel(profile.characteristics.dynamics.accentuation)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 text-on-surface-muted hover:text-on-surface transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyProfile}
            disabled={!selectedProfile}
            className="px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Style Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default StyleProfileCard;
