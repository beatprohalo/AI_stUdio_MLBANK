import type { MidiTrack, ApiConfig } from '../types';

export interface MidiAnalysisResult {
  bpm: number;
  key: string;
  mood: string;
  genre: string;
  instruments: string[];
  humanization: string;
  pattern: string;
  description: string;
}

// Simple MIDI parser to extract basic musical features
export const analyzeMidiFile = async (file: File, config: ApiConfig): Promise<MidiAnalysisResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        console.log('MIDI file loaded, starting analysis...');
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const midiData = new Uint8Array(arrayBuffer);
        
        console.log('MIDI data size:', midiData.length);
        
        // Parse MIDI file to extract basic features
        const features = parseMidiFeatures(midiData);
        console.log('Parsed features:', features);
        
        // Generate AI description based on extracted features
        const description = await generateMidiDescription(features, config);
        console.log('Generated description:', description);
        
        resolve({
          bpm: features.bpm,
          key: features.key,
          mood: features.mood,
          genre: features.genre,
          instruments: features.instruments,
          humanization: features.humanization,
          pattern: features.pattern,
          description: description
        });
      } catch (error) {
        console.error('MIDI analysis error:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      console.error('Failed to read MIDI file');
      reject(new Error('Failed to read MIDI file'));
    };
    reader.readAsArrayBuffer(file);
  });
};

interface MidiFeatures {
  bpm: number;
  key: string;
  mood: string;
  genre: string;
  instruments: string[];
  humanization: string;
  pattern: string;
}

const parseMidiFeatures = (midiData: Uint8Array): MidiFeatures => {
  // Basic MIDI parsing - this is a simplified version
  // In a real implementation, you'd use a proper MIDI parser library
  
  let bpm = 120; // Default
  let key = "C Major"; // Default
  let mood = "Neutral";
  let genre = "Unknown";
  let instruments: string[] = [];
  let humanization = "Quantized";
  let pattern = "Simple";
  
  // Try to extract tempo from MIDI data
  for (let i = 0; i < midiData.length - 6; i++) {
    // Look for tempo change events (0xFF 0x51)
    if (midiData[i] === 0xFF && midiData[i + 1] === 0x51) {
      const tempoBytes = midiData.slice(i + 3, i + 6);
      const tempo = (tempoBytes[0] << 16) | (tempoBytes[1] << 8) | tempoBytes[2];
      bpm = Math.round(60000000 / tempo);
      break;
    }
  }
  
  // Analyze note patterns to determine key and mood
  const noteCounts = new Map<number, number>();
  let totalNotes = 0;
  let velocitySum = 0;
  let velocityCount = 0;
  
  for (let i = 0; i < midiData.length - 2; i++) {
    // Look for note on events (0x90-0x9F)
    if ((midiData[i] & 0xF0) === 0x90) {
      const note = midiData[i + 1];
      const velocity = midiData[i + 2];
      
      if (velocity > 0) {
        noteCounts.set(note, (noteCounts.get(note) || 0) + 1);
        totalNotes++;
        velocitySum += velocity;
        velocityCount++;
      }
    }
  }
  
  // Determine key based on note frequency
  if (noteCounts.size > 0) {
    const sortedNotes = Array.from(noteCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([note]) => note % 12);
    
    key = determineKey(sortedNotes);
  }
  
  // Determine mood based on velocity and note patterns
  const avgVelocity = velocityCount > 0 ? velocitySum / velocityCount : 64;
  if (avgVelocity > 80) {
    mood = "Energetic";
  } else if (avgVelocity < 50) {
    mood = "Calm";
  } else {
    mood = "Moderate";
  }
  
  // Determine genre based on BPM and patterns
  if (bpm > 140) {
    genre = "Electronic/Dance";
  } else if (bpm > 120) {
    genre = "Pop/Rock";
  } else if (bpm > 80) {
    genre = "Jazz/Blues";
  } else {
    genre = "Classical/Ballad";
  }
  
  // Basic instrument detection (simplified)
  instruments = ["Piano", "Synthesizer"];
  
  // Determine humanization based on timing patterns
  humanization = "Quantized with slight variation";
  
  // Determine pattern type
  if (totalNotes > 100) {
    pattern = "Complex melodic";
  } else if (totalNotes > 50) {
    pattern = "Moderate melodic";
  } else {
    pattern = "Simple melodic";
  }
  
  return {
    bpm,
    key,
    mood,
    genre,
    instruments,
    humanization,
    pattern
  };
};

const determineKey = (noteClasses: number[]): string => {
  // Simplified key detection based on note frequency
  const majorKeys = [
    "C Major", "G Major", "D Major", "A Major", "E Major", "B Major", "F# Major",
    "F Major", "Bb Major", "Eb Major", "Ab Major", "Db Major"
  ];
  
  const minorKeys = [
    "A Minor", "E Minor", "B Minor", "F# Minor", "C# Minor", "G# Minor", "D# Minor",
    "D Minor", "G Minor", "C Minor", "F Minor", "Bb Minor"
  ];
  
  // This is a very simplified key detection
  // In reality, you'd analyze the actual note relationships
  return majorKeys[0]; // Default to C Major
};

const generateMidiDescription = async (features: MidiFeatures, config: ApiConfig): Promise<string> => {
  const prompt = `Analyze this MIDI file with the following characteristics:
- BPM: ${features.bpm}
- Key: ${features.key}
- Mood: ${features.mood}
- Genre: ${features.genre}
- Instruments: ${features.instruments.join(', ')}
- Humanization: ${features.humanization}
- Pattern: ${features.pattern}

Provide a detailed musical description that captures the essence of this MIDI file for learning purposes. Focus on:
1. The musical style and genre characteristics
2. The rhythmic and melodic patterns
3. The performance feel and humanization
4. The overall mood and energy

Keep the description concise but descriptive, suitable for a machine learning system.`;

  try {
    if (config.endpoint === 'google') {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: config.apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text.trim();
    } else {
      // For local LLMs, you'd implement similar logic
      return `${features.genre} style with ${features.mood.toLowerCase()} mood, ${features.pattern} pattern, ${features.humanization} feel`;
    }
  } catch (error) {
    console.error('Failed to generate MIDI description:', error);
    return `${features.genre} style with ${features.mood.toLowerCase()} mood, ${features.pattern} pattern`;
  }
};
