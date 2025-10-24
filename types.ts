import type { ReactNode } from 'react';

export interface AnalysisResult {
  bpm: number;
  key: string;
  mood: string;
  genre: string;
  chords: string[];
  instruments: string[];
  tempoCategory: string;
  loudness: number; // in LUFS
  fingerprint: string;
}

export interface SnippetAnalysisResult {
  humanization: string;
  pattern: string;
}

export enum GenerationModel {
  MIDI = "midi",
  AUDIO = "audio",
}

export interface MidiNote {
  note: number;
  velocity: number;
  time: number; // in seconds
  duration: number; // in seconds
}

export interface MidiTrack {
  trackName?: string;
  notes: MidiNote[];
}

export interface MidiGenerationResult {
  description: string;
  tracks: MidiTrack[];
  bpm?: number;
}

// --- AI Learning System Types ---

export enum FeedbackAction {
  LIKE = 'like',
  DISLIKE = 'dislike',
  REGENERATE = 'regenerate',
  DOWNLOAD = 'download', // Implicit like
}

export enum MusicalDimension {
  STYLE = 'style',
  MOOD = 'mood',
  KEY = 'key',
  INSTRUMENT = 'instrument',
  HUMANIZATION = 'humanization',
  PATTERN = 'pattern',
  HARMONIC_COMPLEXITY = 'harmonic_complexity',
  MELODIC_DEVELOPMENT = 'melodic_development',
  DYNAMIC_EXPRESSION = 'dynamic_expression',
  VOICE_LEADING = 'voice_leading',
}

export type PreferenceWeights = { [key: string]: number };

export interface LearnedPreferences {
  [MusicalDimension.STYLE]: PreferenceWeights;
  [MusicalDimension.MOOD]: PreferenceWeights;
  [MusicalDimension.KEY]: PreferenceWeights;
  [MusicalDimension.INSTRUMENT]: PreferenceWeights;
  [MusicalDimension.HUMANIZATION]: PreferenceWeights;
  [MusicalDimension.PATTERN]: PreferenceWeights;
  [MusicalDimension.HARMONIC_COMPLEXITY]: PreferenceWeights;
  [MusicalDimension.MELODIC_DEVELOPMENT]: PreferenceWeights;
  [MusicalDimension.DYNAMIC_EXPRESSION]: PreferenceWeights;
  [MusicalDimension.VOICE_LEADING]: PreferenceWeights;
}

export interface LearningSystemState {
  isEnabled: boolean;
  preferences: LearnedPreferences;
  sampleCount: number;
  confidence: number;
}

// --- Session Library Types ---

export interface BaseLibraryItem {
  id: string;
  name: string;
  timestamp: Date;
}

// Fix: Corrected typo in the extended interface name from `BaseLibrary-item` to `BaseLibraryItem`.
export interface AnalyzedLibraryItem extends BaseLibraryItem {
  type: 'analysis';
  result: AnalysisResult;
}

export interface GeneratedLibraryItem extends BaseLibraryItem {
  type: 'generation';
  prompt: string;
  result: MidiGenerationResult;
}

export type LibraryItem = AnalyzedLibraryItem | GeneratedLibraryItem;

// --- API Configuration ---

export enum ModelProvider {
  GOOGLE = "google",
  LOCAL_GEMMA = "local-gemma",
  LOCAL_LLAMA = "local-llama",
  LOCAL_OLLAMA = "local-ollama",
  CUSTOM = "custom"
}

export enum GeminiModel {
  GEMINI_2_0_FLASH = "gemini-2.0-flash-exp",
  GEMINI_1_5_PRO = "gemini-1.5-pro",
  GEMINI_1_5_FLASH = "gemini-1.5-flash",
  GEMINI_1_0_PRO = "gemini-1.0-pro"
}

export interface ApiConfig {
  apiKey: string;
  endpoint: string; // "google" for Gemini API, or a custom URL for a local LLM
  provider: ModelProvider;
  modelName?: string; // For local models like "gemma-2b", "llama2-7b", etc.
  geminiModel?: GeminiModel; // For Google Gemini models
}

// Advanced Feedback System Types
export interface AdvancedFeedbackSchema {
  harmonicComplexity: number; // 1-5: Simple I-IV-V to complex modal interchange
  melodicCoherence: number;   // 1-5: Random notes to motivic development
  dynamicExpression: number;  // 1-5: Static to highly expressive
  voiceLeading: number;      // 1-5: Parallel motion to sophisticated counterpoint
  overallQuality: number;     // 1-5: Overall musical quality
}

export interface MusicalStyleProfile {
  id: string;
  name: string;
  description: string;
  characteristics: {
    harmonic: {
      complexity: number;
      jazzInfluence: number;
      modalFlavor: number;
      chromaticism: number;
    };
    melodic: {
      motivicDevelopment: number;
      contourVariety: number;
      rhythmicComplexity: number;
      range: number;
    };
    dynamics: {
      expressiveness: number;
      microTiming: number;
      accentuation: number;
    };
  };
}

export interface UserPreferences {
  harmonic: {
    complexity: number;        // 0=simple, 1=very complex
    jazzInfluence: number;     // Extended chords, alterations
    modalFlavor: number;       // Modal interchange frequency
    chromaticism: number;      // Chromatic passing tones
  };
  melodic: {
    motivicDevelopment: number; // Theme and variation usage
    contourVariety: number;    // Shape diversity
    rhythmicComplexity: number; // Syncopation level
    range: number;             // Octaves to span
  };
  dynamics: {
    expressiveness: number;     // Dynamic range usage
    microTiming: number;        // Humanization amount
    accentuation: number;       // Accent strength
  };
}