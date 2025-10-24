
import { useState, useEffect, useCallback } from 'react';
import { LearningSystemState, LearnedPreferences, MusicalDimension, FeedbackAction, PreferenceWeights, SnippetAnalysisResult } from '../types';

const STORAGE_KEY = 'aiMusicStudioLearningSystem';
const LEARNING_RATE = 0.1;
const MAX_CONFIDENCE_SAMPLES = 50; // Confidence reaches 100% after this many samples

// Keywords for parsing the AI's description text
const KEYWORD_MAP: Record<MusicalDimension, string[]> = {
    [MusicalDimension.STYLE]: ['jazz', 'classical', 'rock', 'blues', 'electronic', 'folk', 'pop', 'ambient', 'hip-hop', 'country', 'funk', 'soul', 'reggae'],
    [MusicalDimension.MOOD]: ['happy', 'sad', 'melancholic', 'energetic', 'calm', 'dramatic', 'mysterious', 'romantic', 'aggressive', 'peaceful', 'upbeat', 'funky', 'dark', 'light'],
    [MusicalDimension.KEY]: ['c major', 'g major', 'd major', 'a major', 'e major', 'f major', 'c minor', 'g minor', 'd minor', 'a minor', 'e minor', 'f minor'],
    [MusicalDimension.INSTRUMENT]: ['piano', 'guitar', 'drums', 'bass', 'violin', 'saxophone', 'trumpet', 'flute', 'synthesizer', 'organ', 'synth', 'cello', 'clarinet', 'trombone', 'marimba', 'harp', 'electric guitar', 'acoustic guitar', 'rhodes', 'pads', 'lead'],
    [MusicalDimension.HUMANIZATION]: ['swing', 'groove', 'humanized', 'natural feel', 'velocity variance', 'timing imperfection', 'dynamic range', 'rubato', 'expressive', 'phrasing', 'articulation', 'laid-back', 'behind the beat', 'unquantized', 'tight', 'quantized', 'rushed'],
    [MusicalDimension.PATTERN]: ['complex rhythm', 'simple rhythm', 'melodic', 'arpeggiated', 'dense texture', 'sparse texture', 'repetitive', 'syncopated', 'call and response', 'chord', 'progression', 'four-on-the-floor', 'off-beats', 'bassline riff'],
    [MusicalDimension.HARMONIC_COMPLEXITY]: ['simple', 'complex', 'sophisticated', 'extended chords', 'altered chords', 'secondary dominants', 'modal interchange', 'chromatic', 'diatonic', 'functional harmony', 'voice leading', 'counterpoint'],
    [MusicalDimension.MELODIC_DEVELOPMENT]: ['motivic', 'thematic', 'development', 'variation', 'transformation', 'sequence', 'imitation', 'fugue', 'canon', 'improvisational', 'linear', 'contour', 'shape'],
    [MusicalDimension.DYNAMIC_EXPRESSION]: ['expressive', 'dynamic', 'phrasing', 'crescendo', 'diminuendo', 'accent', 'emphasis', 'articulation', 'legato', 'staccato', 'tenuto', 'fermata'],
    [MusicalDimension.VOICE_LEADING]: ['smooth', 'contrary motion', 'oblique motion', 'parallel motion', 'voice leading', 'counterpoint', 'polyphony', 'homophony', 'chordal', 'linear']
};

const INITIAL_PREFERENCES: LearnedPreferences = {
    [MusicalDimension.STYLE]: {},
    [MusicalDimension.MOOD]: {},
    [MusicalDimension.KEY]: {},
    [MusicalDimension.INSTRUMENT]: {},
    [MusicalDimension.HUMANIZATION]: {},
    [MusicalDimension.PATTERN]: {},
    [MusicalDimension.HARMONIC_COMPLEXITY]: {},
    [MusicalDimension.MELODIC_DEVELOPMENT]: {},
    [MusicalDimension.DYNAMIC_EXPRESSION]: {},
    [MusicalDimension.VOICE_LEADING]: {},
};

const getInitialState = (): LearningSystemState => {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Basic validation and migration for older states
            if (parsed.preferences && typeof parsed.sampleCount === 'number') {
                // Ensure new dimensions exist
                parsed.preferences[MusicalDimension.HUMANIZATION] = parsed.preferences[MusicalDimension.HUMANIZATION] || {};
                parsed.preferences[MusicalDimension.PATTERN] = parsed.preferences[MusicalDimension.PATTERN] || {};

                return {
                    ...parsed,
                    confidence: Math.min(100, (parsed.sampleCount / MAX_CONFIDENCE_SAMPLES) * 100),
                };
            }
        }
    } catch (error) {
        console.error("Failed to load learning state from localStorage:", error);
    }
    return {
        isEnabled: false,
        preferences: INITIAL_PREFERENCES,
        sampleCount: 0,
        confidence: 0,
    };
};

export const useLearningSystem = () => {
    const [state, setState] = useState<LearningSystemState>(getInitialState);

    useEffect(() => {
        try {
            const stateToStore = {
                isEnabled: state.isEnabled,
                preferences: state.preferences,
                sampleCount: state.sampleCount,
            };
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStore));
        } catch (error) {
            console.error("Failed to save learning state to localStorage:", error);
        }
    }, [state]);
    
    const toggleLearning = useCallback(() => {
        setState(s => ({ ...s, isEnabled: !s.isEnabled }));
    }, []);

    const resetLearning = useCallback(() => {
        if (window.confirm("Are you sure you want to reset all learned preferences? This action cannot be undone.")) {
            setState({
                isEnabled: state.isEnabled,
                preferences: INITIAL_PREFERENCES,
                sampleCount: 0,
                confidence: 0,
            });
        }
    }, [state.isEnabled]);

    const updatePreferences = useCallback((dimension: MusicalDimension, keyword: string, action: FeedbackAction) => {
        setState(s => {
            const newPrefs = { ...s.preferences };
            const weights: PreferenceWeights = { ...newPrefs[dimension] };
            const currentWeight = weights[keyword] || 0.1;

            let newWeight = currentWeight;
            if (action === FeedbackAction.LIKE || action === FeedbackAction.DOWNLOAD) {
                newWeight += LEARNING_RATE;
            } else if (action === FeedbackAction.DISLIKE) {
                newWeight -= LEARNING_RATE;
            }
            // REGENERATE is a milder dislike
            else if (action === FeedbackAction.REGENERATE) {
                newWeight -= LEARNING_RATE / 2;
            }
            
            weights[keyword] = Math.max(0.1, Math.min(1.0, newWeight)); // Clamp weight
            newPrefs[dimension] = weights;
            
            const newSampleCount = s.sampleCount + 1;

            return {
                ...s,
                preferences: newPrefs,
                sampleCount: newSampleCount,
                confidence: Math.min(100, (newSampleCount / MAX_CONFIDENCE_SAMPLES) * 100),
            };
        });
    }, []);
    
    const handleFeedback = useCallback((description: string, action: FeedbackAction) => {
        if (!state.isEnabled) return;

        const lowercasedDescription = description.toLowerCase();
        
        Object.entries(KEYWORD_MAP).forEach(([dimension, keywords]) => {
            keywords.forEach(keyword => {
                const keywordRegex = new RegExp(`\\b${keyword.replace(/ /g, '\\s+')}\\b`);
                if (keywordRegex.test(lowercasedDescription)) {
                    updatePreferences(dimension as MusicalDimension, keyword, action);
                }
            });
        });

    }, [state.isEnabled, updatePreferences]);

    const handleBulkFeedback = useCallback((descriptions: string[], action: FeedbackAction) => {
        if (!state.isEnabled || descriptions.length === 0) return;

        const weightAdjustments: Partial<Record<MusicalDimension, PreferenceWeights>> = {};

        descriptions.forEach(description => {
            const lowercasedDescription = description.toLowerCase();

            Object.entries(KEYWORD_MAP).forEach(([dimensionStr, keywords]) => {
                const dimension = dimensionStr as MusicalDimension;
                keywords.forEach(keyword => {
                    const keywordRegex = new RegExp(`\\b${keyword.replace(/ /g, '\\s+')}\\b`);
                    if (keywordRegex.test(lowercasedDescription)) {
                        if (!weightAdjustments[dimension]) {
                            weightAdjustments[dimension] = {};
                        }
                        if (!weightAdjustments[dimension]![keyword]) {
                            weightAdjustments[dimension]![keyword] = 0;
                        }

                        let delta = 0;
                        if (action === FeedbackAction.LIKE || action === FeedbackAction.DOWNLOAD) {
                            delta = LEARNING_RATE;
                        } else if (action === FeedbackAction.DISLIKE) {
                            delta = -LEARNING_RATE;
                        } else if (action === FeedbackAction.REGENERATE) {
                            delta = -LEARNING_RATE / 2;
                        }
                        
                        weightAdjustments[dimension]![keyword]! += delta;
                    }
                });
            });
        });

        setState(s => {
            const newPrefs = JSON.parse(JSON.stringify(s.preferences));

            Object.entries(weightAdjustments).forEach(([dimensionStr, adjustments]) => {
                const dimension = dimensionStr as MusicalDimension;
                const currentWeights = newPrefs[dimension];
                Object.entries(adjustments).forEach(([keyword, delta]) => {
                    const currentWeight = currentWeights[keyword] || 0.1;
                    const newWeight = currentWeight + delta;
                    currentWeights[keyword] = Math.max(0.1, Math.min(1.0, newWeight));
                });
            });

            const newSampleCount = s.sampleCount + descriptions.length;

            return {
                ...s,
                preferences: newPrefs,
                sampleCount: newSampleCount,
                confidence: Math.min(100, (newSampleCount / MAX_CONFIDENCE_SAMPLES) * 100),
            };
        });
    }, [state.isEnabled]);

    const learnFromSnippetAnalysis = useCallback((analysis: SnippetAnalysisResult) => {
        if (!state.isEnabled) return;
        
        const descriptions = [
            { text: analysis.humanization, dimension: MusicalDimension.HUMANIZATION },
            { text: analysis.pattern, dimension: MusicalDimension.PATTERN },
        ];
        
        descriptions.forEach(({ text, dimension }) => {
            const lowercasedText = text.toLowerCase();
            const keywords = KEYWORD_MAP[dimension];
            
            keywords.forEach(keyword => {
                const keywordRegex = new RegExp(`\\b${keyword.replace(/ /g, '\\s+')}\\b`);
                if (keywordRegex.test(lowercasedText)) {
                    // We treat this as a strong "like"
                    updatePreferences(dimension, keyword, FeedbackAction.LIKE);
                }
            });
        });

    }, [state.isEnabled, updatePreferences]);


    // Data management functions
    const exportData = useCallback(async () => {
        try {
            // Collect all session data
            const sessionLibrary = localStorage.getItem('aiMusicStudioSessionLibrary');
            const lastActivity = localStorage.getItem('aiMusicStudioLastActivity');
            const processedFiles = localStorage.getItem('aiMusicStudioProcessedFiles');
            const apiKey = localStorage.getItem('aiMusicStudioApiKey');
            const apiEndpoint = localStorage.getItem('aiMusicStudioEndpoint');
            
            const dataToExport = {
                learningSystem: state,
                sessionLibrary: sessionLibrary ? JSON.parse(sessionLibrary) : [],
                lastActivity: lastActivity,
                processedFiles: processedFiles ? JSON.parse(processedFiles) : [],
                apiConfig: {
                    apiKey: apiKey || '',
                    endpoint: apiEndpoint || 'google'
                },
                timestamp: new Date().toISOString(),
                version: '2.0'
            };
            
            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ai-music-studio-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Save backup timestamp
            localStorage.setItem('aiMusicStudioLastBackup', new Date().toISOString());
        } catch (error) {
            console.error('Export failed:', error);
            throw error;
        }
    }, [state]);

    const importData = useCallback(async (file: File) => {
        try {
            const text = await file.text();
            const importedData = JSON.parse(text);
            
            if (importedData.learningSystem) {
                setState(importedData.learningSystem);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(importedData.learningSystem));
            } else {
                throw new Error('Invalid backup file format');
            }
        } catch (error) {
            console.error('Import failed:', error);
            throw error;
        }
    }, []);

    const getDataStats = useCallback(async () => {
        try {
            const lastBackup = localStorage.getItem('aiMusicStudioLastBackup');
            const sessionLibrary = localStorage.getItem('aiMusicStudioSessionLibrary');
            const sessionLibraryData = sessionLibrary ? JSON.parse(sessionLibrary) : [];
            
            return {
                samples: state.sampleCount,
                lastBackup: lastBackup ? new Date(lastBackup) : null,
                dbSize: JSON.stringify(state).length + (sessionLibrary ? sessionLibrary.length : 0),
                sessionItems: sessionLibraryData.length
            };
        } catch (error) {
            console.error('Failed to get data stats:', error);
            return {
                samples: 0,
                lastBackup: null,
                dbSize: 0,
                sessionItems: 0
            };
        }
    }, [state]);

    const isInitialized = true; // Always initialized since we use localStorage

    // Manual data loading function
    const loadDataFromFile = useCallback(async (file: File) => {
        try {
            const text = await file.text();
            const importedData = JSON.parse(text);
            
            if (importedData.learningSystem) {
                setState(importedData.learningSystem);
                // Save learning system to localStorage
                localStorage.setItem(STORAGE_KEY, JSON.stringify(importedData.learningSystem));
                
                // Restore session library if available
                if (importedData.sessionLibrary) {
                    localStorage.setItem('aiMusicStudioSessionLibrary', JSON.stringify(importedData.sessionLibrary));
                }
                
                // Restore last activity if available
                if (importedData.lastActivity) {
                    localStorage.setItem('aiMusicStudioLastActivity', importedData.lastActivity);
                }
                
                // Restore processed files if available
                if (importedData.processedFiles) {
                    localStorage.setItem('aiMusicStudioProcessedFiles', JSON.stringify(importedData.processedFiles));
                }
                
                // Restore API config if available
                if (importedData.apiConfig) {
                    localStorage.setItem('aiMusicStudioApiKey', importedData.apiConfig.apiKey || '');
                    localStorage.setItem('aiMusicStudioEndpoint', importedData.apiConfig.endpoint || 'google');
                }
                
                localStorage.setItem('aiMusicStudioLastBackup', new Date().toISOString());
                return true;
            } else {
                throw new Error('Invalid backup file format');
            }
        } catch (error) {
            console.error('Failed to load data from file:', error);
            throw error;
        }
    }, []);

    // Check if data exists in localStorage
    const hasStoredData = useCallback(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored && stored !== 'null' && stored !== '{}';
        } catch (error) {
            return false;
        }
    }, []);

    return {
        ...state,
        toggleLearning,
        resetLearning,
        handleFeedback,
        handleBulkFeedback,
        learnFromSnippetAnalysis,
        exportData,
        importData,
        getDataStats,
        isInitialized,
        loadDataFromFile,
        hasStoredData,
    };
};