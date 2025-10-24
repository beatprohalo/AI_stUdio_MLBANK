import type { AnalysisResult } from '../types';

const musicalTerms = {
    instruments: ['piano', 'guitar', 'drums', 'bass', 'violin', 'cello', 'flute', 'sax', 'trumpet', 'synth', 'organ', 'rhodes', 'pads', 'lead'],
    genres: ['rock', 'jazz', 'classical', 'electronic', 'pop', 'blues', 'folk', 'metal', 'ambient', 'house', 'techno', 'hip-hop', 'funk', 'soul'],
    moods: ['happy', 'sad', 'energetic', 'calm', 'dramatic', 'mysterious', 'uplifting', 'melancholy', 'aggressive', 'peaceful', 'upbeat', 'funky'],
    keys: ['c', 'g', 'f', 'd', 'a', 'e', 'b', 'major', 'minor'],
    tempo: ['slow', 'fast', 'moderate', 'ballad', 'up-tempo'],
};

const analyzePrompt = (prompt: string): { [key: string]: string[] } => {
    const lowerPrompt = prompt.toLowerCase();
    const found: { [key: string]: string[] } = {};

    Object.keys(musicalTerms).forEach(category => {
        found[category] = [];
        (musicalTerms as any)[category].forEach((term: string) => {
            if (new RegExp(`\\b${term}\\b`).test(lowerPrompt)) {
                found[category].push(term);
            }
        });
    });

    return found;
};

const sanitizeFilename = (filename: string, maxLength: number = 50): string => {
    let clean = filename
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^_|_$/g, '');

    if (clean.length > maxLength) {
        clean = clean.substring(0, maxLength);
    }

    if (!clean || clean.length < 3) {
        clean = 'generated_music';
    }

    return clean;
};

export const generateFilename = (
    prompt: string,
    analysisResult: AnalysisResult | null,
    fileType: 'midi' | 'audio' | 'json' | 'combined'
): string => {
    const promptAnalysis = analyzePrompt(prompt);

    const components: string[] = [];
    
    // 1. Mood/Genre from prompt or analysis
    const mood = promptAnalysis.moods[0] || analysisResult?.mood.split(',')[0].trim() || promptAnalysis.genres[0];
    if (mood) components.push(mood);

    // 2. Instrument from prompt or analysis
    const instrument = promptAnalysis.instruments[0] || analysisResult?.instruments[0];
    if (instrument) components.push(instrument);

    // 3. Key from prompt or analysis
    const key = promptAnalysis.keys.join('') || analysisResult?.key.replace(' ', '');
    if (key) components.push(key);
    
    // 4. BPM from analysis
    if (analysisResult?.bpm) {
        components.push(`${analysisResult.bpm}bpm`);
    }

    // Fallback if no components found
    if (components.length === 0) {
        const fallback = prompt.split(' ').slice(0, 3).join('_');
        components.push(fallback || 'music_idea');
    }

    const timestamp = new Date().toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}Z/, '')
        .substring(2, 8); // YYMMDD

    const baseName = sanitizeFilename(components.join('_'));
    let extension: string;
    switch (fileType) {
        case 'midi':
            extension = 'mid';
            break;
        case 'audio':
            extension = 'wav';
            break;
        case 'json':
            extension = 'json';
            break;
        case 'combined':
            extension = 'json'; // Combined files are JSON format
            break;
        default:
            extension = 'mid';
    }
    
    return `${baseName}_${timestamp}.${extension}`;
};