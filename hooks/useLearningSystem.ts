
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
    [MusicalDimension.PATTERN]: ['complex rhythm', 'simple rhythm', 'melodic', 'arpeggiated', 'dense texture', 'sparse texture', 'repetitive', 'syncopated', 'call and response', 'chord', 'progression', 'four-on-the-floor', 'off-beats', 'bassline riff']
};

const INITIAL_PREFERENCES: LearnedPreferences = {
    [MusicalDimension.STYLE]: {},
    [MusicalDimension.MOOD]: {},
    [MusicalDimension.KEY]: {},
    [MusicalDimension.INSTRUMENT]: {},
    [MusicalDimension.HUMANIZATION]: {},
    [MusicalDimension.PATTERN]: {},
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


    return {
        ...state,
        toggleLearning,
        resetLearning,
        handleFeedback,
        handleBulkFeedback,
        learnFromSnippetAnalysis,
    };
};