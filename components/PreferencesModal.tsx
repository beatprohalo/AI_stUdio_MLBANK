
import React from 'react';
import { LearnedPreferences, MusicalDimension } from '../types';
import { XIcon } from './icons';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: LearnedPreferences;
}

const PreferenceBar = ({ weight }: { weight: number }) => {
  const width = Math.max(1, Math.round(weight * 100)); // Ensure a minimum width for visibility
  return (
    <div className="w-24 bg-surface-border rounded-full h-2.5" title={`Weight: ${weight.toFixed(2)}`}>
      <div className="bg-secondary h-2.5 rounded-full" style={{ width: `${width}%` }}></div>
    </div>
  );
};

const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose, preferences }) => {
  if (!isOpen) return null;

  const renderPreferencesForDimension = (dim: MusicalDimension) => {
    const weights = preferences[dim];
    // Fix: Cast the result of Object.entries to ensure correct type inference for weights.
    // This resolves issues where values were treated as `unknown`, causing arithmetic and method call errors.
    const sortedEntries = (Object.entries(weights) as [string, number][]).sort(([, a], [, b]) => b - a);

    if (sortedEntries.length === 0) {
      return <p className="text-sm text-on-surface-muted italic">No preferences learned yet.</p>;
    }

    return (
      <ul className="space-y-2">
        {sortedEntries.map(([keyword, weight]) => (
          <li key={keyword} className="flex items-center justify-between text-sm">
            <span className="capitalize text-on-surface">{keyword}</span>
            <div className="flex items-center space-x-2">
              <PreferenceBar weight={weight} />
              <span className="font-mono text-xs text-on-surface-muted w-8 text-right">{(weight).toFixed(2)}</span>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="fixed inset-0 bg-bkg/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-surface border border-surface-border rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="sticky top-0 bg-surface/80 backdrop-blur-md flex items-center justify-between p-4 border-b border-surface-border z-10">
          <h2 className="text-xl font-bold text-secondary">Learned Preferences</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-border transition-colors">
            <XIcon />
          </button>
        </header>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 overflow-y-auto">
          {Object.values(MusicalDimension).map(dim => (
            <div key={dim}>
              <h3 className="text-lg font-semibold text-primary mb-3 capitalize">{dim}</h3>
              {renderPreferencesForDimension(dim)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreferencesModal;