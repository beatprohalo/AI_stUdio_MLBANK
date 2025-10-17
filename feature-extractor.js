// feature-extractor.js
const path = require('path');

// --- Humanization Feature Extraction ---
function extractHumanizationFeatures(analysis) {
    // Placeholder: In a real scenario, this would be much more sophisticated
    // analyzing note onset timing deviations, velocity spreads, micro-rhythm, etc.

    if (analysis.type === 'midi' && analysis.notes && analysis.notes.length > 0) {
        // Example: simple variance calculations
        const velocities = analysis.notes.map(n => n.velocity);
        const avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;
        const velocityVariance = velocities.map(v => Math.pow(v - avgVelocity, 2)).reduce((a, b) => a + b, 0) / velocities.length;

        // Example: simulated timing deviations
        // This would require comparing to a quantized grid
        const simulatedTimingDeviation = Math.random() * 0.05 + 0.01; // +/- 10-50ms deviation

        return {
            source: 'midi',
            averageVelocity: avgVelocity,
            velocityVariance: velocityVariance, // How much velocities vary
            timingImperfection: simulatedTimingDeviation, // How much notes deviate from grid
            swingFeel: Math.random() * 0.2, // A value indicating swing
            // ... other numerical humanization parameters
            featureVector: [
                avgVelocity,
                velocityVariance,
                simulatedTimingDeviation,
                Math.random(), // more features
                Math.random(),
                Math.random()
            ]
        };
    }
    // For audio, humanization features would be derived from rhythmic patterns, dynamics
    // using something like Meyda's loudness, onset detection, etc.
    // For simplicity, we'll return a generic placeholder for audio for now.
    if (analysis.type === 'audio' && analysis.rhythmicComplexity !== undefined) {
        return {
            source: 'audio',
            rhythmicVariability: analysis.rhythmicComplexity / 10, // Normalize
            dynamicRange: analysis.loudness / 100, // Normalize
            grooveFactor: Math.random() * 0.5,
            featureVector: [
                analysis.rhythmicComplexity / 10,
                analysis.loudness / 100,
                Math.random(),
                Math.random(),
                Math.random(),
                Math.random()
            ]
        };
    }
    return null;
}

// --- Helper for stats ---
const calculateStats = (arr) => {
    if (arr.length === 0) return { mean: 0, stdDev: 0 };
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const stdDev = Math.sqrt(arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / arr.length);
    return { mean, stdDev };
};

// --- Helpers for Rhythmic Analysis ---

/**
 * Classifies a duration in seconds into a musical note type (e.g., 'quarter', 'eighth').
 * @param {number} durationInSeconds - The duration to classify.
 * @param {number} bpm - The tempo in beats per minute.
 * @returns {string} The name of the closest note type.
 */
const classifyDuration = (durationInSeconds, bpm) => {
    const quarterNoteSecs = 60.0 / bpm;
    // Map of note type names to their duration in seconds
    const DURATION_THRESHOLDS = {
        'whole': quarterNoteSecs * 4,
        'half_dotted': quarterNoteSecs * 3,
        'half': quarterNoteSecs * 2,
        'quarter_dotted': quarterNoteSecs * 1.5,
        'quarter': quarterNoteSecs,
        'quarter_triplet': (quarterNoteSecs * 2) / 3,
        'eighth_dotted': quarterNoteSecs * 0.75,
        'eighth': quarterNoteSecs * 0.5,
        'eighth_triplet': quarterNoteSecs / 3,
        'sixteenth': quarterNoteSecs * 0.25,
        'sixteenth_triplet': quarterNoteSecs / 6,
        'thirty_second': quarterNoteSecs * 0.125,
    };

    let closestType = 'unknown';
    let minDifference = Infinity;

    for (const [type, typeDuration] of Object.entries(DURATION_THRESHOLDS)) {
        const difference = Math.abs(durationInSeconds - typeDuration);
        if (difference < minDifference) {
            minDifference = difference;
            closestType = type;
        }
    }

    // Only classify if it's reasonably close (e.g., within 25% of the target duration) to avoid misclassification
    if (minDifference > DURATION_THRESHOLDS[closestType] * 0.25) {
        return 'complex';
    }

    return closestType;
};

/**
 * Finds the most common n-grams (subsequences) in an array.
 * @param {Array<string>} arr - The input array.
 * @param {number} n - The length of the n-gram.
 * @param {number} minCount - The minimum number of occurrences to be considered common.
 * @returns {Array<{motif: string[], count: number}>} A sorted array of common motifs.
 */
const findMostCommonNgrams = (arr, n, minCount = 2) => {
    if (arr.length < n) return [];
    const ngrams = new Map();
    for (let i = 0; i <= arr.length - n; i++) {
        const ngram = arr.slice(i, i + n).join(',');
        ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1);
    }

    const commonNgrams = [];
    for (const [ngramStr, count] of ngrams.entries()) {
        if (count >= minCount) {
            commonNgrams.push({
                motif: ngramStr.split(','),
                count: count
            });
        }
    }
    
    return commonNgrams.sort((a, b) => b.count - a.count);
};


// --- Pattern Feature Extraction ---
function extractPatternFeatures(analysis) {
    // Placeholder: In a real scenario, this would generate embeddings
    // using a specialized model (e.g., MusicVAE, Jukebox embeddings)
    // or detailed representations of melody, harmony, rhythm.

    if (analysis.type === 'midi' && analysis.notes && analysis.notes.length > 1) { // Need at least 2 notes for rhythm
        const { notes, duration } = analysis;
        const bpm = analysis.bpm || analysis.tempo || 120; // Assume 120 BPM if not provided in analysis data

        // --- Rhythmic Complexity Calculation (existing part) ---

        // 1. Note Density: Notes per second.
        const noteDensity = notes.length / duration;
        
        // 2. Rhythmic Variety (Syncopation proxy): Based on variation in Inter-Onset Intervals (IOIs).
        const sortedNotes = [...notes].sort((a, b) => a.time - b.time);
        const iois = [];
        for (let i = 1; i < sortedNotes.length; i++) {
            const ioi = sortedNotes[i].time - sortedNotes[i - 1].time;
            if (ioi > 0.001) { // Exclude chords played at the same time, with a small tolerance
                iois.push(ioi);
            }
        }
        const { mean: meanIoi, stdDev: stdDevIoi } = calculateStats(iois);
        // Coefficient of variation for a normalized measure of variety
        const ioiVariety = (meanIoi > 0) ? (stdDevIoi / meanIoi) : 0;
        
        // 3. Restfulness: Proportion of time between notes vs note length.
        const totalNoteDuration = notes.reduce((sum, note) => sum + note.duration, 0);
        const avgNoteDuration = totalNoteDuration / notes.length;
        // A simple measure: if avg duration is smaller than avg time between notes, it's more 'restful'.
        // This factor reduces complexity for sparse, simple patterns (e.g., whole notes with long gaps).
        const restfulness = (meanIoi > 0) ? Math.max(0, 1 - (avgNoteDuration / meanIoi)) : 0;

        // Combine into a single score (0-10)
        // Heuristics:
        // - Normalize density (cap at 10 notes/sec for max complexity contribution)
        // - Normalize variety (cap at 1.0, high variation is complex)
        const normalizedDensity = Math.min(1, noteDensity / 10.0);
        const normalizedVariety = Math.min(1, ioiVariety);

        // Complexity is high density and high variety. High restfulness reduces complexity.
        let complexity = (0.5 * normalizedDensity + 0.5 * normalizedVariety);
        complexity = complexity * (1 - (restfulness * 0.5)); // Restfulness can reduce perceived complexity by up to 50%
        
        const rhythmicComplexity = Math.max(0, Math.min(10, complexity * 10));

        // Original features
        const pitches = analysis.notes.map(n => n.note % 12); // Use `note` for MIDI number
        const rhythmDensity = analysis.notes.length / analysis.duration;
        const distinctPitches = new Set(pitches).size;

        // --- NEW: Detailed Rhythmic Analysis ---

        // 1. Note Duration Distribution
        const durationDistribution = {};
        notes.forEach(note => {
            const noteType = classifyDuration(note.duration, bpm);
            durationDistribution[noteType] = (durationDistribution[noteType] || 0) + 1;
        });

        // 2. Common Rhythmic Motifs (from Inter-Onset Intervals)
        const ioiRhythmContour = iois.map(ioi => classifyDuration(ioi, bpm));
        const rhythmicMotifs = findMostCommonNgrams(ioiRhythmContour, 3, 2); // Find common 3-event rhythmic patterns

        return {
            source: 'midi',
            pitchClassHistogram: Array.from({length: 12}, (_, i) => pitches.filter(p => p === i).length / pitches.length),
            rhythmDensity: rhythmDensity,
            distinctPitches: distinctPitches,
            rhythmicComplexity: rhythmicComplexity,
            durationDistribution, // The new statistical distribution of note lengths
            rhythmicMotifs,       // The new common rhythmic patterns
            // ... other pattern-specific features
            featureVector: [
                rhythmDensity,
                distinctPitches / 12, // Normalize
                rhythmicComplexity / 10, // Add to feature vector
                ...Array.from({length: 7}, () => Math.random()) // dummy embedding for patterns
            ]
        };
    }

    if (analysis.type === 'audio' && analysis.tempo !== undefined) {
        // Example: using audio analysis features directly as pattern features
        return {
            source: 'audio',
            tempo: analysis.tempo,
            loudness: analysis.loudness,
            rhythmicComplexity: analysis.rhythmicComplexity,
            // ... other audio pattern features
            featureVector: [
                analysis.tempo / 200, // Normalize BPM
                analysis.loudness / 100, // Normalize dB
                analysis.rhythmicComplexity / 10,
                ...Array.from({length: 8}, () => Math.random()) // dummy embedding for patterns
            ]
        };
    }
    return null;
}


module.exports = {
    extractHumanizationFeatures,
    extractPatternFeatures
};