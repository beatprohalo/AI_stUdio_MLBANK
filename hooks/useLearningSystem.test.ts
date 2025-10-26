import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useLearningSystem } from './useLearningSystem';
import { LearningSystemState, MusicalDimension } from '../types';

const STORAGE_KEY = 'aiMusicStudioLearningSystem';

describe('useLearningSystem', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should correctly migrate old state from localStorage', () => {
    // 1. Setup: Create an old state object that is missing some of the newer preference dimensions.
    const oldState = {
      isEnabled: true,
      preferences: {
        [MusicalDimension.STYLE]: { 'jazz': 0.5 },
        [MusicalDimension.MOOD]: { 'happy': 0.8 },
        // This state is missing KEY, INSTRUMENT, HUMANIZATION, and PATTERN
      },
      sampleCount: 10,
    };

    // 2. Mock localStorage to return this old state.
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(oldState));

    // 3. Render the hook.
    const { result } = renderHook(() => useLearningSystem());

    // 4. Assert: Check if the hook's state has been correctly initialized and migrated.
    // The missing preference dimensions should be present with their default empty objects.
    expect(result.current.preferences).toHaveProperty(MusicalDimension.STYLE);
    expect(result.current.preferences).toHaveProperty(MusicalDimension.MOOD);
    expect(result.current.preferences).toHaveProperty(MusicalDimension.KEY);
    expect(result.current.preferences).toHaveProperty(MusicalDimension.INSTRUMENT);
    expect(result.current.preferences).toHaveProperty(MusicalDimension.HUMANIZATION);
    expect(result.current.preferences).toHaveProperty(MusicalDimension.PATTERN);

    // Check that the existing data was preserved.
    expect(result.current.preferences[MusicalDimension.STYLE]['jazz']).toBe(0.5);
    expect(result.current.preferences[MusicalDimension.MOOD]['happy']).toBe(0.8);

    // Check that other state values were loaded correctly.
    expect(result.current.isEnabled).toBe(true);
    expect(result.current.sampleCount).toBe(10);
    expect(result.current.confidence).toBeCloseTo((10 / 50) * 100);
  });
});