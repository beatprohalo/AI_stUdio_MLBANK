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
}

export type PreferenceWeights = { [key: string]: number };

export interface LearnedPreferences {
  [MusicalDimension.STYLE]: PreferenceWeights;
  [MusicalDimension.MOOD]: PreferenceWeights;
  [MusicalDimension.KEY]: PreferenceWeights;
  [MusicalDimension.INSTRUMENT]: PreferenceWeights;
  [MusicalDimension.HUMANIZATION]: PreferenceWeights;
  [MusicalDimension.PATTERN]: PreferenceWeights;
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

export interface ApiConfig {
  apiKey: string;
  endpoint: string; // "google" for Gemini API, or a custom URL for a local LLM
}