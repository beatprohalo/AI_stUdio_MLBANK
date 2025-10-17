import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { ApiConfig, AnalysisResult, MidiGenerationResult, LearnedPreferences, SnippetAnalysisResult } from '../types';

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

const callLocalLlm = async (prompt: string, schema: any, apiKey: string, endpoint: string) => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'local-model', // Model name is often ignored by local servers
      prompt: prompt,
      schema: schema,
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Local LLM API error: ${response.statusText}`);
  }

  const json = await response.json();
  // Local LLMs might return the JSON directly in a `data` or `response` field
  return json.data || json.response || json;
};

export const testConnection = async (config: ApiConfig): Promise<boolean> => {
  try {
    if (config.endpoint === 'google') {
      const ai = new GoogleGenAI({ apiKey: config.apiKey });
      // A simple, non-streaming call to a lightweight model to test credentials
      await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'test' });
    } else {
      // For local LLMs, we can often hit a /v1/models endpoint or similar
      const response = await fetch(config.endpoint.replace('/v1/chat/completions', '/v1/models'), {
        headers: { 'Authorization': `Bearer ${config.apiKey}` }
      });
      if (!response.ok) throw new Error('Failed to connect to local LLM');
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
    text = await callLocalLlm(prompt, analysisSchema, config.apiKey, config.endpoint);
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
    text = await callLocalLlm(prompt, snippetAnalysisSchema, config.apiKey, config.endpoint);
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

export const generateMidi = async (prompt: string, config: ApiConfig, bpm?: number, preferences?: LearnedPreferences): Promise<MidiGenerationResult> => {
  let fullPrompt = `You are an expert musical composer AI. Generate a compelling musical idea based on the following prompt.
Provide:
1.  A creative text description of the generated musical idea.
2.  A suitable BPM for the idea.
3.  A JSON object containing a 'tracks' array with AT LEAST TWO tracks:
    - Track 1: A chord progression (e.g., block chords on a piano or pads). Name this track appropriately (e.g., "Piano Chords", "Synth Pads").
    - Track 2: A basic melody that complements the chord progression. Name this track appropriately (e.g., "Lead Melody").
The musical idea should be around 4-8 bars long.

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
    
    let preferencePrompt = "\n\nBased on learned user preferences, please try to incorporate the following characteristics: ";
    const prefs = [];
    if (topStyle) prefs.push(`Style: ${topStyle}`);
    if (topMood) prefs.push(`Mood: ${topMood}`);
    if (topKey) prefs.push(`Key: ${topKey}`);
    if (topPattern) prefs.push(`Rhythmic Pattern: ${topPattern}`);
    if (topHumanization) prefs.push(`Performance Feel: ${topHumanization}`);

    if (prefs.length > 0) {
      fullPrompt += preferencePrompt + prefs.join(', ') + '.';
    }
  }

  let text;
  if (config.endpoint === 'google') {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: midiGenerationSchema,
      },
    });
    text = response.text.trim();
  } else {
    text = await callLocalLlm(fullPrompt, midiGenerationSchema, config.apiKey, config.endpoint);
  }

  try {
    const parsed = typeof text === 'string' ? JSON.parse(text) : text;
    if (parsed.notes && !parsed.tracks) {
        parsed.tracks = [{ notes: parsed.notes }];
        delete parsed.notes;
    }
    return parsed as MidiGenerationResult;
  } catch (e) {
    console.error("Failed to parse MIDI generation JSON:", e);
    throw new Error("Could not parse the MIDI data from the AI response.");
  }
};

export const generateAudio = async (prompt: string, config: ApiConfig, preferences?: LearnedPreferences): Promise<string> => {
  let voiceStyleInstruction = "Say the following with a cheerful, clear voice:";

  if (preferences) {
    const topHumanization = getTopPreference(preferences.humanization);
    if (topHumanization) {
      // Instruct the model to adopt a specific vocal style based on learned preferences.
      // Keywords like "expressive", "laid-back", or "dynamic" work well for TTS.
      voiceStyleInstruction = `Adopt an '${topHumanization}' vocal style. With that in mind, say the following with a cheerful and clear voice:`;
    }
  }

  const fullPrompt = `You are an AI voice assistant. ${voiceStyleInstruction} "Here is the audio I generated for you, based on your prompt: ${prompt}"`;

  if (config.endpoint !== 'google') {
      throw new Error("Audio generation is only supported with the Google Gemini API.");
  }

  const ai = new GoogleGenAI({ apiKey: config.apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: fullPrompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("No audio data received from API.");
  }
  return base64Audio;
};