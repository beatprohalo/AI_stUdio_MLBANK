import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { ApiConfig, AnalysisResult, MidiGenerationResult, LearnedPreferences, SnippetAnalysisResult } from '../types';
import * as Tone from 'tone';

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    bpm: { type: Type.INTEGER, description: "Beats per minute, e.g., 120" },
    key: { type: Type.STRING, description: "Musical key, e.g., 'C Major'" },
    mood: { type: Type.STRING, description: "Overall mood, considering energy and valence. e.g., 'Energetic, Happy'" },
    genre: { type: Type.STRING, description: "The primary musical genre, e.g., 'Indie Rock', 'Ambient Techno'." },
    chords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A simple 4-chord progression, e.g., ['C', 'G', 'Am', 'F']" },
    instruments: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of recognized instruments in the audio, e.g., ['Acoustic Drums', 'Electric Bass', 'Female Vocals', 'Electric Guitar']" },
    tempoCategory: { type: Type.STRING, description: "A descriptive category for the tempo, e.g., 'Andante', 'Uptempo Dance', 'Ballad'." },
    loudness: { type: Type.NUMBER, description: "The integrated loudness of the track in LUFS, typically between -20 and -5, e.g., -9.5." }
  },
  required: ["bpm", "key", "mood", "genre", "chords", "instruments", "tempoCategory", "loudness"]
};

const snippetAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    humanization: { type: Type.STRING, description: "A detailed description of the performance feel, focusing on timing, dynamics, and groove. e.g., 'Slightly behind the beat with a relaxed swing feel and varied dynamics.', 'Very tight and quantized with consistent velocity.', 'Rushed and energetic with sharp accents.'" },
    pattern: { type: Type.STRING, description: "A description of the core rhythmic or melodic pattern. e.g., 'A classic four-on-the-floor kick pattern with an open hi-hat on the off-beats.', 'A syncopated 16th-note bassline riff.', 'A simple, repetitive melodic motif based on a pentatonic scale.'" },
  },
  required: ["humanization", "pattern"]
};

const midiGenerationSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING, description: "A creative text description of the generated musical idea, suitable for a musician to read." },
        bpm: { type: Type.INTEGER, description: "The beats per minute for the generated melody, e.g., 120." },
        tracks: {
            type: Type.ARRAY,
            description: "An array of musical tracks. Generate at least two tracks: one for a chord progression (e.g., 'Rhodes Chords') and one for a melody (e.g., 'Synth Lead').",
            items: {
                type: Type.OBJECT,
                properties: {
                    trackName: { type: Type.STRING, description: "An optional name for the track, e.g., 'Piano Melody'." },
                    notes: {
                        type: Type.ARRAY,
                        description: "An array of musical notes for this track.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                note: { type: Type.INTEGER, description: "MIDI note number (e.g., 60 for Middle C). Range 21-108." },
                                velocity: { type: Type.INTEGER, description: "Note velocity (how hard the note is played, 1-127)." },
                                time: { type: Type.NUMBER, description: "Start time of the note in seconds from the beginning of the track." },
                                duration: { type: Type.NUMBER, description: "Duration of the note in seconds." }
                            },
                            required: ["note", "velocity", "time", "duration"]
                        }
                    }
                },
                required: ["notes"]
            }
        }
    },
    required: ["description", "tracks"]
};

const callLocalLlm = async (prompt: string, schema: any, apiKey: string, endpoint: string, modelName?: string) => {
  // For Ollama, we need to append /api/generate to the endpoint
  const ollamaEndpoint = endpoint.endsWith('/') ? `${endpoint}api/generate` : `${endpoint}/api/generate`;
  
  // Clean and validate model name
  const cleanModelName = modelName ? modelName.trim() : 'gemma3n:e4b';
  console.log('Attempting to connect to local LLM at:', ollamaEndpoint);
  console.log('Using model:', cleanModelName);
  
  // List of fallback models to try if the primary model fails
  // Updated to match available models from Ollama installation
  const fallbackModels = ['gemma3n:e4b', 'llama3:latest', 'gemma:2b', 'gpt-oss:latest'];
  const modelsToTry = [cleanModelName, ...fallbackModels.filter(m => m !== cleanModelName)];
  
  // Create a timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
  });
  
  // Try each model until one works
  for (const modelToTry of modelsToTry) {
    try {
      console.log(`Trying model: ${modelToTry}`);
      
      // Create the fetch request with timeout
      const fetchPromise = fetch(ollamaEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Only add Authorization header if apiKey is provided
          ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
        },
        body: JSON.stringify({
          model: modelToTry,
          prompt: prompt,
          stream: false
        })
      });

      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      if (response.ok) {
        const json = await response.json();
        console.log(`Successfully used model: ${modelToTry}`);
        // Ollama returns the response in a 'response' field
        return json.response || json;
      } else {
        const errorText = await response.text();
        console.log(`Model ${modelToTry} failed: ${response.status} ${response.statusText}`);
        
        // If this is the last model to try, throw the error
        if (modelToTry === modelsToTry[modelsToTry.length - 1]) {
          console.error('All models failed. Last error:', errorText);
          throw new Error(`All Ollama models failed. Please ensure Ollama is running and try: ollama pull llama3:latest`);
        }
      }
    } catch (error) {
      console.log(`Model ${modelToTry} threw error:`, error);
      
      // If this is the last model to try, throw the error
      if (modelToTry === modelsToTry[modelsToTry.length - 1]) {
        throw error;
      }
    }
  }
  
  // This should never be reached, but just in case
  throw new Error('No models available');
};

export const testConnection = async (config: ApiConfig): Promise<boolean> => {
  try {
    if (config.endpoint === 'google') {
      const ai = new GoogleGenAI({ apiKey: config.apiKey });
      // A simple, non-streaming call to a lightweight model to test credentials
      await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'test' });
    } else {
      // For Ollama, test the /api/tags endpoint to see available models
      const ollamaEndpoint = config.endpoint.endsWith('/') ? `${config.endpoint}api/tags` : `${config.endpoint}/api/tags`;
      const response = await fetch(ollamaEndpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to connect to Ollama server');
      
      const data = await response.json();
      console.log('Available Ollama models:', data.models?.map((m: any) => m.name) || 'No models found');
    }
    return true;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
};

export const analyzeAudioFile = async (fileName: string, config: ApiConfig): Promise<AnalysisResult> => {
  const prompt = `You are an expert audio engineer with perfect pitch and deep musical knowledge. You have just listened to an audio file named "${fileName}". Your task is to provide a detailed analysis of its actual musical content, not just what's implied by the filename.
  
Provide the analysis in JSON format.

Generate the following properties based on the audio content:
1.  **bpm**: The precise BPM of the track.
2.  **key**: The musical key.
3.  **mood**: A descriptive mood, considering energy level and valence (e.g., 'High-energy, Uplifting', 'Low-energy, Melancholic').
4.  **genre**: The primary musical genre and a sub-genre if applicable (e.g., 'Electronic / House', 'Rock / Indie Rock').
5.  **chords**: A plausible 4-chord progression that represents the core harmony.
6.  **instruments**: A list of 3-5 specific instruments you can clearly identify in the recording (e.g., "Acoustic Drum Kit", "Electric Bass", "Distorted Electric Guitar", "Male Vocals").
7.  **tempoCategory**: A descriptive category for the tempo (e.g., 'Andante', 'Uptempo Dance', 'Ballad').
8.  **loudness**: The integrated loudness in LUFS. A typical value for a mastered track is between -14 and -8 LUFS.`;

  let text;
  if (config.endpoint === 'google') {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
      },
    });
    text = response.text.trim();
  } else {
    text = await callLocalLlm(prompt, analysisSchema, config.apiKey, config.endpoint, config.modelName);
  }

  try {
    const parsed = typeof text === 'string' ? JSON.parse(text) : text;

    // A simple pseudo-fingerprint based on a few key characteristics
    const fingerprintSource = `${parsed.key}-${parsed.bpm}-${parsed.instruments.join('')}-${parsed.loudness.toFixed(1)}`;
    // A simple hashing function (not cryptographic, just for uniqueness)
    let hash = 0;
    for (let i = 0; i < fingerprintSource.length; i++) {
        const char = fingerprintSource.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }

    const result: AnalysisResult = {
        ...parsed,
        fingerprint: hash.toString(16) // as hex string
    };

    return result;
  } catch (e) {
    console.error("Failed to parse analysis JSON:", e);
    throw new Error("Could not parse the analysis from the AI response.");
  }
};

export const analyzeRecordedSnippet = async (audioDurationSeconds: number, contentType: 'beatbox' | 'melody', config: ApiConfig): Promise<SnippetAnalysisResult> => {
  const prompt = `You are an expert music producer and audio analyst. You have just listened to a ${audioDurationSeconds.toFixed(1)}-second audio recording of a person ${contentType === 'beatbox' ? 'beatboxing a drum pattern' : 'humming a melody'}.

Your task is to analyze its musical DNA. Focus on two aspects:
1.  **Humanization**: Describe the performance feel. Is it tight, loose, swung, rushed? Are the dynamics flat or expressive? Use descriptive language.
2.  **Pattern**: Describe the primary rhythmic (if beatbox) or melodic (if humming) pattern. What is the core idea being expressed?

Provide the analysis in the specified JSON format.`;

  let text;
  if (config.endpoint === 'google') {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: snippetAnalysisSchema,
      },
    });
    text = response.text.trim();
  } else {
    text = await callLocalLlm(prompt, snippetAnalysisSchema, config.apiKey, config.endpoint, config.modelName);
  }

  try {
    const parsed = typeof text === 'string' ? JSON.parse(text) : text;
    return parsed as SnippetAnalysisResult;
  } catch (e) {
    console.error("Failed to parse snippet analysis JSON:", e);
    throw new Error("Could not parse the snippet analysis from the AI response.");
  }
};

const getTopPreference = (weights: { [key: string]: number }): string | null => {
    const entries = Object.entries(weights);
    if (entries.length === 0) return null;
    return entries.sort((a, b) => b[1] - a[1])[0][0];
};

// Apply humanization to MIDI data based on learned preferences
const applyHumanizationToMidi = (midiResult: any, preferences: LearnedPreferences): any => {
  console.log('Applying humanization to MIDI data');
  
  const topHumanization = getTopPreference(preferences.humanization);
  const topStyle = getTopPreference(preferences.style);
  
  console.log('Humanization preferences:', { topHumanization, topStyle });
  
  // Define humanization parameters based on learned preferences
  let timingVariation = 0.02; // ±20ms default
  let velocityVariation = 0.1; // ±10% default
  let swingAmount = 0.0; // No swing default
  let microTiming = 0.0; // No micro-timing default
  
  // Apply learned humanization characteristics
  if (topHumanization === 'swing') {
    swingAmount = 0.3; // 30% swing
    timingVariation = 0.05; // ±50ms
    velocityVariation = 0.15; // ±15%
  } else if (topHumanization === 'groove') {
    timingVariation = 0.08; // ±80ms
    velocityVariation = 0.2; // ±20%
    microTiming = 0.02; // ±20ms micro-timing
  } else if (topHumanization === 'humanized') {
    timingVariation = 0.06; // ±60ms
    velocityVariation = 0.12; // ±12%
    microTiming = 0.015; // ±15ms
  } else if (topHumanization === 'natural feel') {
    timingVariation = 0.04; // ±40ms
    velocityVariation = 0.08; // ±8%
    microTiming = 0.01; // ±10ms
  } else if (topHumanization === 'behind the beat') {
    timingVariation = 0.1; // ±100ms (late feel)
    velocityVariation = 0.18; // ±18%
    swingAmount = 0.2; // 20% swing
  } else if (topHumanization === 'tight') {
    timingVariation = 0.01; // ±10ms (very tight)
    velocityVariation = 0.05; // ±5%
  } else if (topHumanization === 'quantized') {
    timingVariation = 0.0; // No timing variation
    velocityVariation = 0.02; // ±2%
  }
  
  // Style-based adjustments
  if (topStyle === 'jazz') {
    swingAmount = Math.max(swingAmount, 0.25); // Jazz always has some swing
    timingVariation *= 1.5; // Jazz is more loose
    velocityVariation *= 1.3; // More dynamic
  } else if (topStyle === 'classical') {
    timingVariation *= 0.7; // Classical is more precise
    velocityVariation *= 0.8; // Less dynamic variation
    microTiming *= 1.5; // More subtle timing nuances
  } else if (topStyle === 'electronic') {
    timingVariation *= 0.5; // Electronic is more mechanical
    velocityVariation *= 0.6; // Less human variation
  }
  
  console.log('Applied humanization parameters:', {
    timingVariation,
    velocityVariation,
    swingAmount,
    microTiming
  });
  
  // Apply humanization to each track
  const humanizedTracks = midiResult.tracks.map((track: any) => {
    const humanizedNotes = track.notes.map((note: any) => {
      // Calculate swing timing adjustment
      const beatPosition = note.time % 1.0; // Position within beat
      let swingAdjustment = 0;
      if (swingAmount > 0 && beatPosition > 0.5) {
        // Apply swing to off-beat notes
        swingAdjustment = swingAmount * 0.25; // 25% of swing amount
      }
      
      // Apply random timing variation
      const timingRandom = (Math.random() - 0.5) * 2 * timingVariation;
      const microTimingRandom = (Math.random() - 0.5) * 2 * microTiming;
      
      // Apply random velocity variation
      const velocityRandom = (Math.random() - 0.5) * 2 * velocityVariation;
      
      return {
        ...note,
        time: Math.max(0, note.time + timingRandom + microTimingRandom + swingAdjustment),
        velocity: Math.max(1, Math.min(127, Math.round(note.velocity * (1 + velocityRandom))))
      };
    });
    
    return {
      ...track,
      notes: humanizedNotes
    };
  });
  
  return {
    ...midiResult,
    tracks: humanizedTracks
  };
};

export const generateMidi = async (prompt: string, config: ApiConfig, bpm?: number, preferences?: LearnedPreferences, analysisResult?: AnalysisResult): Promise<MidiGenerationResult> => {
  // Use professional MIDI generation for better quality
  const { generateProfessionalMidi, enhanceMidiWithProfessionalPatterns } = await import('./professionalMidiService');
  
  try {
    const professionalResult = await generateProfessionalMidi(prompt, config, bpm, preferences, analysisResult);
    return enhanceMidiWithProfessionalPatterns(professionalResult);
  } catch (error) {
    console.warn('Professional MIDI generation failed, falling back to standard generation:', error);
    // Fall back to original generation if professional service fails
  }

  let fullPrompt = `You are a world-class composer and arranger with decades of professional experience. Generate a sophisticated, professional-quality musical composition that could be used in commercial music production.

PROFESSIONAL REQUIREMENTS:
- Create MUSICALLY SOPHISTICATED content that sounds like professional recordings
- Use REALISTIC musical patterns that professional musicians would play
- Apply PROPER MUSICAL PHRASING with clear beginning, middle, and end
- Include PROFESSIONAL ARTICULATION and expression
- Use REALISTIC TIMING with subtle humanization and groove

HARMONIC SOPHISTICATION:
- Use functional harmony with secondary dominants, modal interchange, and borrowed chords
- Apply proper voice leading with smooth transitions and contrary motion
- Include extended chords (7ths, 9ths, 11ths, 13ths) and altered dominants
- Use chromatic passing tones, neighbor tones, and approach notes
- Create harmonic rhythm that supports the melodic phrasing

MELODIC PROFESSIONALISM:
- Develop clear melodic motifs with variation and transformation
- Use proper melodic contour with tension and release
- Apply syncopation, anticipation, and rhythmic displacement
- Include ornamentation appropriate to the style (trills, grace notes, bends)
- Create melodic phrases that breathe and have natural flow

RHYTHMIC SOPHISTICATION:
- Use complex rhythmic patterns with syncopation and polyrhythms
- Apply proper groove and feel appropriate to the style
- Include rhythmic variation and development
- Use rests and space effectively for musical impact
- Create rhythmic interest through subdivision and accent patterns

DYNAMIC EXPRESSION:
- Apply realistic velocity curves that follow musical phrasing
- Use dynamic contrast for musical impact and expression
- Include crescendos, diminuendos, and dynamic shaping
- Apply proper articulation (legato, staccato, tenuto, accents)
- Create dynamic interest through velocity variation

PROFESSIONAL ARRANGEMENT:
- Create a FULL ARRANGEMENT with multiple instruments
- Use proper instrument ranges and voicings
- Apply realistic performance techniques for each instrument
- Include counterpoint and polyphonic texture
- Create musical interest through layering and orchestration

TECHNICAL SPECIFICATIONS:
- Generate 8-16 bars of music with professional development
- Use realistic note timing with subtle humanization (±10-20ms)
- Apply velocity curves that follow musical expression (40-120 range)
- Include proper note durations and rests for musical phrasing
- Create realistic instrument ranges and voicings

TRACK REQUIREMENTS:
- MELODY TRACK: Sophisticated melodic line with proper phrasing and expression
- BASS TRACK: Professional bass line with groove and harmonic support
- CHORD TRACK: Rich harmonic progression with proper voice leading
- DRUM TRACK: Professional drum pattern with realistic feel and groove
- ADDITIONAL TRACKS: Counter-melodies, pads, or other supporting elements

QUALITY STANDARDS:
- This music should sound like it was created by professional musicians
- Use patterns that would be found in commercial recordings
- Apply musical techniques used by top-tier composers and arrangers
- Create content that could be used in professional music production
- Ensure every note serves a musical purpose and contributes to the overall composition

Generate a sophisticated musical composition based on the following prompt.

HARMONIC REQUIREMENTS:
- Use functional harmony with secondary dominants and modal interchange
- Include at least 2 key modulations or tonicizations
- Apply voice leading principles (contrary/oblique motion, smooth transitions)
- Incorporate extended chords (9ths, 11ths, 13ths) and altered dominants
- Use chromatic passing tones and neighbor tones in bass lines

MELODIC REQUIREMENTS:
- Develop motifs through variation (rhythmic, intervallic, sequential)
- Create contour variety (ascending, descending, arch, wave patterns)
- Balance stepwise motion (60-70%) with strategic leaps (30-40%)
- Include tension/release through dissonance resolution
- Apply syncopation and polyrhythmic elements

DYNAMIC SHAPING:
- Velocity curves following phrase arcs (crescendo/diminuendo)
- Accent patterns emphasizing structural downbeats
- Micro-timing humanization (±5-15ms swing feel)
- Dynamic contrast between sections (pp to ff range: 30-120 velocity)

Provide:
1. A creative text description of the generated musical idea.
2. A suitable BPM for the idea.
3. A JSON object containing a 'tracks' array with MULTIPLE tracks for a full arrangement:
    - Melody track: Complex, interesting melodic lines with musical ornaments, phrasing, and realistic note timing
    - Bass track: Rhythmic and harmonic support with realistic bass patterns, walking bass lines, or rhythmic patterns
    - Chord track: Rich harmonic progressions with proper voice leading and realistic chord voicings
    - Drum track: If drums are requested, use MIDI drum notes (35-81) with realistic patterns including kick, snare, hi-hat variations
    - Additional tracks as needed for a full musical arrangement

The musical idea should be around 8-16 bars long with sophisticated musical content including:
- Realistic note timing with slight human-like variations
- Dynamic velocity changes that reflect musical expression
- Complex rhythmic patterns with syncopation and groove
- Harmonic sophistication with chord extensions and voice leading
- Melodic development with motifs, sequences, and musical phrases

Prompt: "${prompt}"`;
  
  if (bpm) {
    fullPrompt += `\n\nPlease try to match the following tempo: ${bpm} BPM.`;
  }

  if (preferences) {
    const topStyle = getTopPreference(preferences.style);
    const topMood = getTopPreference(preferences.mood);
    const topKey = getTopPreference(preferences.key);
    const topPattern = getTopPreference(preferences.pattern);
    const topHumanization = getTopPreference(preferences.humanization);
    
    let preferencePrompt = "\n\nLEARNED MUSICAL PREFERENCES (use these to guide your composition):\n";
    const prefs = [];
    if (topStyle) prefs.push(`Style: ${topStyle} (incorporate ${topStyle} characteristics, instruments, and musical elements)`);
    if (topMood) prefs.push(`Mood: ${topMood} (create music that conveys ${topMood} emotions and energy)`);
    if (topKey) prefs.push(`Key: ${topKey} (use ${topKey} as the primary key center)`);
    if (topPattern) prefs.push(`Rhythmic Pattern: ${topPattern} (use ${topPattern} rhythmic patterns and phrasing)`);
    if (topHumanization) prefs.push(`Performance Feel: ${topHumanization} (apply ${topHumanization} timing and expression)`);

    if (prefs.length > 0) {
      fullPrompt += preferencePrompt + prefs.join("\n") + "\n\nIncorporate these learned preferences into your composition to match the user's musical style and create music that sounds like their preferred musical characteristics.";
    }
  }

  // Create a timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('MIDI generation timeout after 120 seconds')), 120000);
  });

  let text;
  if (config.endpoint === 'google') {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const selectedModel = config.geminiModel || 'gemini-2.0-flash-exp';
    const apiPromise = ai.models.generateContent({
      model: selectedModel,
      contents: fullPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: midiGenerationSchema,
      },
    });
    
    // Race between API call and timeout
    const response = await Promise.race([apiPromise, timeoutPromise]) as any;
    text = response.text.trim();
  } else {
    try {
      text = await Promise.race([callLocalLlm(fullPrompt, midiGenerationSchema, config.apiKey, config.endpoint, config.modelName), timeoutPromise]) as string;
    } catch (localError) {
      console.warn('Local LLM failed, falling back to Google Gemini:', localError);
      
      // Fallback to Google Gemini if local LLM fails
      if (config.apiKey) {
        const ai = new GoogleGenAI({ apiKey: config.apiKey });
        const selectedModel = config.geminiModel || 'gemini-2.0-flash-exp';
        const apiPromise = ai.models.generateContent({
          model: selectedModel,
          contents: fullPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: midiGenerationSchema,
          },
        });
        
        const response = await Promise.race([apiPromise, timeoutPromise]) as any;
        text = response.text.trim();
      } else {
        throw new Error('Local LLM failed and no Google API key is configured. Please set up either Ollama or Google Gemini API key.');
      }
    }
  }

  try {
    const parsed = typeof text === 'string' ? JSON.parse(text) : text;
    if (parsed.notes && !parsed.tracks) {
        parsed.tracks = [{ notes: parsed.notes }];
        delete parsed.notes;
    }
    
    // Apply humanization to the MIDI data if preferences are available
    if (preferences) {
      const humanizedResult = applyHumanizationToMidi(parsed, preferences);
      console.log('Applied humanization to MIDI:', humanizedResult);
      return humanizedResult as MidiGenerationResult;
    }
    
    return parsed as MidiGenerationResult;
  } catch (e) {
    console.error("Failed to parse MIDI generation JSON:", e);
    throw new Error("Could not parse the MIDI data from the AI response.");
  }
};

export const generateAudio = async (prompt: string, config: ApiConfig, preferences?: LearnedPreferences): Promise<string> => {
  try {
    console.log('Starting audio generation for prompt:', prompt);
    
    // Generate MIDI first, then convert to audio
    console.log('Step 1/3: Generating MIDI...');
    const midiResult = await generateMidi(prompt, config, undefined, preferences);
    console.log('MIDI generation successful:', midiResult);
    
    // Convert MIDI to audio using optimized generation with learned preferences
    console.log('Step 2/3: Converting MIDI to audio with optimized generation...');
    const audioBase64 = await generateAudioFromMidi(midiResult, preferences);
    console.log('Step 3/3: Audio conversion successful');
    
    return audioBase64;
  } catch (error) {
    console.error('Audio generation failed:', error);
    
    // Fallback: Generate a simple audio signal
    console.log('Using fallback audio generation');
    return await generateFallbackAudio();
  }
};

const generateFallbackAudio = async (): Promise<string> => {
  console.log('Using simple fallback audio generation');
  return generateSimpleAudio();
};

const convertMidiToAudio = async (midiResult: MidiGenerationResult, preferences?: LearnedPreferences): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Converting MIDI to audio with trained data approach');
      
      // Start Tone.js
      await Tone.start();
      console.log('Tone.js started');
      
      // Get learned preferences
      const topStyle = preferences ? getTopPreference(preferences.style) : null;
      const topMood = preferences ? getTopPreference(preferences.mood) : null;
      const topHumanization = preferences ? getTopPreference(preferences.humanization) : null;
      
      console.log('Learned preferences:', { topStyle, topMood, topHumanization });
      
      // Create synthesizers for each track
      const synths = [];
      
      for (let trackIndex = 0; trackIndex < midiResult.tracks.length; trackIndex++) {
        const track = midiResult.tracks[trackIndex];
        console.log(`Creating synthesizer for track ${trackIndex}:`, track.trackName);
        
        // Determine track characteristics
        const isDrumTrack = track.trackName?.toLowerCase().includes('drum') || 
                          track.trackName?.toLowerCase().includes('percussion') ||
                          track.trackName?.toLowerCase().includes('beat');
        
        const isBassTrack = track.trackName?.toLowerCase().includes('bass') || 
                          track.trackName?.toLowerCase().includes('low');
        
        const isLeadTrack = track.trackName?.toLowerCase().includes('lead') || 
                          track.trackName?.toLowerCase().includes('melody');
        
        // Create appropriate synthesizer based on track type and learned preferences
        let synth;
        
        if (isDrumTrack) {
          // Create drum synthesizer
          synth = new Tone.NoiseSynth({
            noise: { type: "brown" },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.2 }
          });
        } else if (topStyle === 'jazz') {
          // Jazz piano with rich harmonics
          synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sawtooth" },
            envelope: { attack: 0.1, decay: 0.2, sustain: 0.7, release: 0.8 }
          });
        } else if (topStyle === 'electronic') {
          // Electronic synth
          synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sawtooth" },
            envelope: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.8 }
          });
        } else if (topStyle === 'classical') {
          // Classical strings
          synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sine" },
            envelope: { attack: 0.3, decay: 0.2, sustain: 0.8, release: 1.2 }
          });
        } else {
          // Default piano
          synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "triangle" },
            envelope: { attack: 0.05, decay: 0.3, sustain: 0.7, release: 1.0 }
          });
        }
        
        // Apply stereo positioning
        if (isBassTrack) {
          synth.pan.value = 0; // Center
        } else if (isLeadTrack) {
          synth.pan.value = 0.3; // Slightly right
        } else {
          synth.pan.value = 0; // Center
        }
        
        // Apply mood-based volume
        let volume = -6;
        if (topMood === 'energetic') {
          volume += 3;
        } else if (topMood === 'calm') {
          volume -= 3;
        }
        synth.volume.value = volume;
        
        // Connect to destination
        synth.toDestination();
        
        // Schedule notes for this track
        track.notes.forEach(note => {
          const time = note.time;
          const duration = note.duration;
          const midiNote = note.note;
          const velocity = note.velocity / 127;
          
          if (isDrumTrack) {
            // Handle drum notes
            if (note.note === 36 || note.note === 35) { // Kick
              synth.triggerAttackRelease("C1", "8n", time, velocity);
            } else if (note.note === 38 || note.note === 40) { // Snare
              synth.triggerAttackRelease("D2", "8n", time, velocity);
            } else if (note.note >= 41 && note.note <= 43) { // Hi-hat
              synth.triggerAttackRelease("F#3", "16n", time, velocity * 0.5);
            } else { // Other percussion
              const noteName = Tone.Frequency(note.note, "midi").toNote();
              synth.triggerAttackRelease(noteName, "8n", time, velocity);
            }
          } else {
            // Handle melodic notes
            const noteName = Tone.Frequency(midiNote, "midi").toNote();
            synth.triggerAttackRelease(noteName, duration, time, velocity);
          }
        });
        
        synths.push(synth);
      }
      
      // Calculate total duration
      const maxDuration = Math.max(...midiResult.tracks.map(track => 
        Math.max(...track.notes.map(note => note.time + note.duration))
      ));
      const timeout = Math.min(maxDuration + 1, 10); // Cap at 10 seconds
      
      console.log(`Playing audio for ${timeout} seconds`);
      
      // Generate audio by creating a WAV file from the MIDI data
      const audioData = generateAudioFromMidi(midiResult, preferences);
      
      // Use timeout to ensure we don't hang
      setTimeout(() => {
        console.log('Audio generation completed');
        resolve(audioData);
      }, timeout * 1000);
      
    } catch (error) {
      console.error('Audio conversion error:', error);
      // Generate audio from MIDI data as fallback
      const audioData = generateAudioFromMidi(midiResult, preferences);
      resolve(audioData);
    }
  });
};

// Generate actual audio from MIDI data based on trained preferences
const generateAudioFromMidi = async (midiResult: MidiGenerationResult, preferences?: LearnedPreferences): Promise<string> => {
  console.log('Generating audio from MIDI data with trained preferences');
  
  const sampleRate = 22050; // Reduced sample rate to save memory
  const maxDuration = Math.max(...midiResult.tracks.map(track => 
    Math.max(...track.notes.map(note => note.time + note.duration))
  ));
  const duration = Math.min(maxDuration + 1, 4); // Reduced max duration to 4 seconds
  const samples = Math.floor(sampleRate * duration);
  
  // Memory optimization: Use smaller buffer and process in chunks
  if (samples > 88200) { // More than 4 seconds at 22kHz
    console.warn('Audio generation would exceed memory limits, using fallback');
    return generateSimpleAudio();
  }
  
  // Get learned preferences
  const topStyle = preferences ? getTopPreference(preferences.style) : null;
  const topMood = preferences ? getTopPreference(preferences.mood) : null;
  
  console.log('Using learned preferences for audio generation:', { topStyle, topMood });
  
  // Create stereo buffer with memory optimization
  const leftChannel = new Float32Array(samples);
  const rightChannel = new Float32Array(samples);
  
  // Process each track
  for (let trackIndex = 0; trackIndex < midiResult.tracks.length; trackIndex++) {
    const track = midiResult.tracks[trackIndex];
    console.log(`Processing track ${trackIndex}: ${track.trackName}`);
    
    const isDrumTrack = track.trackName?.toLowerCase().includes('drum') || 
                      track.trackName?.toLowerCase().includes('percussion') ||
                      track.trackName?.toLowerCase().includes('beat');
    
    const isBassTrack = track.trackName?.toLowerCase().includes('bass') || 
                      track.trackName?.toLowerCase().includes('low');
    
    const isLeadTrack = track.trackName?.toLowerCase().includes('lead') || 
                      track.trackName?.toLowerCase().includes('melody');
    
    // Process each note in the track
    for (let noteIndex = 0; noteIndex < track.notes.length; noteIndex++) {
      const note = track.notes[noteIndex];
      const startSample = Math.floor(note.time * sampleRate);
      const endSample = Math.floor((note.time + note.duration) * sampleRate);
      const frequency = 440 * Math.pow(2, (note.note - 69) / 12);
      const velocity = note.velocity / 127;
      
      // Apply learned characteristics
      let amplitude = velocity * 0.3;
      
      // Style-based amplitude adjustments
      if (topStyle === 'jazz') {
        amplitude *= 0.8; // Jazz is more subtle
      } else if (topStyle === 'electronic') {
        amplitude *= 1.2; // Electronic is more prominent
      } else if (topStyle === 'classical') {
        amplitude *= 0.9; // Classical is refined
      }
      
      // Mood-based amplitude adjustments
      if (topMood === 'energetic') {
        amplitude *= 1.3;
      } else if (topMood === 'calm') {
        amplitude *= 0.7;
      }
      
      // Generate audio samples for this note with memory optimization
      const chunkSize = 512; // Process in smaller chunks to prevent blocking
      for (let chunkStart = startSample; chunkStart < endSample && chunkStart < samples; chunkStart += chunkSize) {
        const chunkEnd = Math.min(chunkStart + chunkSize, endSample, samples);
        
        // Yield control periodically to prevent blocking the main thread
        if (chunkStart % (chunkSize * 2) === 0) {
          // Use setTimeout for non-blocking yield
          if (window.requestIdleCallback) {
            window.requestIdleCallback(() => {}, { timeout: 5 });
          } else {
            setTimeout(() => {}, 0);
          }
        }
        
        for (let i = chunkStart; i < chunkEnd; i++) {
          const time = i / sampleRate;
          const noteTime = time - note.time;
          
          if (noteTime < 0 || noteTime > note.duration) continue;
          
          let sample = 0;
          
          if (isDrumTrack) {
            // Generate drum sounds
            if (note.note === 36 || note.note === 35) { // Kick
              sample = generateKickDrumSample(noteTime, note.duration, amplitude);
            } else if (note.note === 38 || note.note === 40) { // Snare
              sample = generateSnareDrumSample(noteTime, note.duration, amplitude);
            } else if (note.note >= 41 && note.note <= 43) { // Hi-hat
              sample = generateHiHatSample(noteTime, note.duration, amplitude);
            } else { // Other percussion
              sample = generatePercussionSample(noteTime, note.duration, frequency, amplitude);
            }
          } else {
            // Generate melodic sounds based on learned style
            if (topStyle === 'jazz') {
              sample = generateJazzSample(frequency, noteTime, note.duration, amplitude);
            } else if (topStyle === 'electronic') {
              sample = generateElectronicSample(frequency, noteTime, note.duration, amplitude);
            } else if (topStyle === 'classical') {
              sample = generateClassicalSample(frequency, noteTime, note.duration, amplitude);
            } else {
              sample = generatePianoSample(frequency, noteTime, note.duration, amplitude);
            }
          }
          
          // Apply stereo positioning
          if (isBassTrack) {
            leftChannel[i] += sample * 0.8;
            rightChannel[i] += sample * 0.8;
          } else if (isLeadTrack) {
            leftChannel[i] += sample * 0.7;
            rightChannel[i] += sample * 1.0;
          } else {
            leftChannel[i] += sample;
            rightChannel[i] += sample;
          }
        }
      }
    }
  }
  
  // Convert to WAV format
  return createWavFromChannels(leftChannel, rightChannel, sampleRate);
};

// Drum sample generators
const generateKickDrumSample = (time: number, duration: number, amplitude: number): number => {
  const envelope = Math.exp(-time * 8);
  const fundamental = Math.sin(2 * Math.PI * 60 * time);
  const harmonic = Math.sin(2 * Math.PI * 120 * time) * 0.3;
  return (fundamental + harmonic) * envelope * amplitude;
};

const generateSnareDrumSample = (time: number, duration: number, amplitude: number): number => {
  const envelope = Math.exp(-time * 6);
  const noise = (Math.random() * 2 - 1);
  const highFreq = Math.sin(2 * Math.PI * 200 * time) * 0.3;
  return (noise + highFreq) * envelope * amplitude;
};

const generateHiHatSample = (time: number, duration: number, amplitude: number): number => {
  const envelope = Math.exp(-time * 10);
  const noise = (Math.random() * 2 - 1) * 0.5;
  const highFreq = Math.sin(2 * Math.PI * 8000 * time) * 0.2;
  return (noise + highFreq) * envelope * amplitude;
};

const generatePercussionSample = (time: number, duration: number, frequency: number, amplitude: number): number => {
  const envelope = Math.exp(-time * 5);
  const fundamental = Math.sin(2 * Math.PI * frequency * time);
  const noise = (Math.random() * 2 - 1) * 0.3;
  return (fundamental + noise) * envelope * amplitude;
};

// Melodic sample generators based on learned style
const generateJazzSample = (frequency: number, time: number, duration: number, amplitude: number): number => {
  const envelope = createADSR(time, duration, 0.1, 0.2, 0.7, 0.8);
  const fundamental = Math.sin(2 * Math.PI * frequency * time);
  const harmonic2 = Math.sin(2 * Math.PI * frequency * 2 * time) * 0.4;
  const harmonic3 = Math.sin(2 * Math.PI * frequency * 3 * time) * 0.3;
  const harmonic4 = Math.sin(2 * Math.PI * frequency * 4 * time) * 0.2;
  const harmonic5 = Math.sin(2 * Math.PI * frequency * 5 * time) * 0.1;
  return (fundamental + harmonic2 + harmonic3 + harmonic4 + harmonic5) * envelope * amplitude;
};

const generateElectronicSample = (frequency: number, time: number, duration: number, amplitude: number): number => {
  const envelope = createADSR(time, duration, 0.01, 0.3, 0.5, 0.8);
  const sawtooth = 2 * (time * frequency - Math.floor(time * frequency + 0.5));
  const square = Math.sign(Math.sin(2 * Math.PI * frequency * time));
  const filter = Math.exp(-time * 3);
  return (sawtooth * 0.7 + square * 0.3) * filter * envelope * amplitude;
};

const generateClassicalSample = (frequency: number, time: number, duration: number, amplitude: number): number => {
  const envelope = createADSR(time, duration, 0.3, 0.2, 0.8, 1.2);
  const vibrato = 1 + Math.sin(2 * Math.PI * 6 * time) * 0.08;
  const fundamental = Math.sin(2 * Math.PI * frequency * time * vibrato);
  const harmonic2 = Math.sin(2 * Math.PI * frequency * 2 * time * vibrato) * 0.3;
  const harmonic3 = Math.sin(2 * Math.PI * frequency * 3 * time * vibrato) * 0.2;
  return (fundamental + harmonic2 + harmonic3) * envelope * amplitude;
};

const generatePianoSample = (frequency: number, time: number, duration: number, amplitude: number): number => {
  const envelope = createADSR(time, duration, 0.05, 0.3, 0.7, 1.0);
  const fundamental = Math.sin(2 * Math.PI * frequency * time);
  const harmonic2 = Math.sin(2 * Math.PI * frequency * 2 * time) * 0.5;
  const harmonic3 = Math.sin(2 * Math.PI * frequency * 3 * time) * 0.3;
  const harmonic4 = Math.sin(2 * Math.PI * frequency * 4 * time) * 0.2;
  const harmonic5 = Math.sin(2 * Math.PI * frequency * 5 * time) * 0.1;
  return (fundamental + harmonic2 + harmonic3 + harmonic4 + harmonic5) * envelope * amplitude;
};

// ADSR envelope generator
const createADSR = (time: number, duration: number, attack: number, decay: number, sustain: number, release: number): number => {
  if (time < attack) {
    return time / attack;
  } else if (time < attack + decay) {
    return 1 - (time - attack) / decay * (1 - sustain);
  } else if (time < duration - release) {
    return sustain;
  } else {
    return sustain * (1 - (time - (duration - release)) / release);
  }
};

// Create WAV file from stereo channels
const createWavFromChannels = (leftChannel: Float32Array, rightChannel: Float32Array, sampleRate: number): string => {
  const length = leftChannel.length;
  const buffer = new ArrayBuffer(44 + length * 2 * 2); // 44 byte header + 2 channels * 2 bytes per sample
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * 2 * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 2, true); // 2 channels
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2 * 2, true);
  view.setUint16(32, 2 * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * 2 * 2, true);
  
  // Write stereo samples
  for (let i = 0; i < length; i++) {
    const leftSample = Math.max(-1, Math.min(1, leftChannel[i]));
    const rightSample = Math.max(-1, Math.min(1, rightChannel[i]));
    
    const leftInt = Math.round(leftSample * 32767);
    const rightInt = Math.round(rightSample * 32767);
    
    view.setInt16(44 + i * 4, leftInt, true);
    view.setInt16(44 + i * 4 + 2, rightInt, true);
  }
  
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return base64;
};

// Simple audio generation fallback
const generateSimpleAudio = (): string => {
  // Generate a simple sine wave as base64
  const sampleRate = 44100;
  const duration = 2; // 2 seconds
  const frequency = 440; // A4 note
  const samples = sampleRate * duration;
  
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples * 2, true);
  
  // Generate sine wave
  for (let i = 0; i < samples; i++) {
    const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
    const intSample = Math.round(sample * 32767);
    view.setInt16(44 + i * 2, intSample, true);
  }
  
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  return base64;
};



const encodeWAV = (audioBuffer: AudioBuffer): ArrayBuffer => {
  const length = audioBuffer.length;
  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
  const view = new DataView(arrayBuffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * numberOfChannels * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * 2, true);
  view.setUint16(32, numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * numberOfChannels * 2, true);
  
  // Convert float samples to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }
  
  return arrayBuffer;
};