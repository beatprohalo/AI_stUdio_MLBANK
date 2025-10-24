import type { ApiConfig, AnalysisResult, MidiGenerationResult, SnippetAnalysisResult } from '../types';

export class LocalLLMService {
  private endpoint: string;
  private modelName?: string;

  constructor(config: ApiConfig) {
    this.endpoint = config.endpoint;
    this.modelName = config.modelName;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.endpoint}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Local LLM connection test failed:', error);
      return false;
    }
  }

  async generateResponse(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      
      const response = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelName || 'llama2:7b',
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 2000,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response || '';
    } catch (error) {
      console.error('Local LLM generation failed:', error);
      throw error;
    }
  }

  async analyzeAudio(fileName: string): Promise<AnalysisResult> {
    const systemPrompt = `You are a professional music analyst. Analyze the provided audio file and return a JSON response with the following structure:
    {
      "bpm": 120,
      "key": "C Major",
      "mood": "Energetic, Happy",
      "genre": "Indie Rock",
      "chords": ["C", "G", "Am", "F"],
      "instruments": ["Acoustic Drums", "Electric Bass", "Female Vocals", "Electric Guitar"],
      "tempoCategory": "Uptempo Dance",
      "loudness": -9.5
    }`;

    const prompt = `Analyze the audio file "${fileName}" and provide a detailed musical analysis.`;

    try {
      const response = await this.generateResponse(prompt, systemPrompt);
      
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          ...analysis,
          fingerprint: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
      } else {
        // Fallback if no JSON found
        return {
          bpm: 120,
          key: "C Major",
          mood: "Energetic",
          genre: "Unknown",
          chords: ["C", "G", "Am", "F"],
          instruments: ["Unknown"],
          tempoCategory: "Moderate",
          loudness: -12,
          fingerprint: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
      }
    } catch (error) {
      console.error('Audio analysis failed:', error);
      throw error;
    }
  }

  async analyzeSnippet(audioData: string): Promise<SnippetAnalysisResult> {
    const systemPrompt = `You are a professional music analyst specializing in performance analysis. Analyze the provided audio snippet and return a JSON response with the following structure:
    {
      "humanization": "Detailed description of the performance feel, focusing on timing, dynamics, and groove",
      "pattern": "Description of the core rhythmic or melodic pattern"
    }`;

    const prompt = `Analyze this audio snippet and provide detailed performance analysis.`;

    try {
      const response = await this.generateResponse(prompt, systemPrompt);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        return {
          humanization: "Slightly behind the beat with a relaxed swing feel",
          pattern: "A classic four-on-the-floor kick pattern"
        };
      }
    } catch (error) {
      console.error('Snippet analysis failed:', error);
      throw error;
    }
  }

  async generateMidi(prompt: string, preferences?: any): Promise<MidiGenerationResult> {
    const systemPrompt = `You are a professional music composer. Generate a MIDI composition based on the user's request and return a JSON response with the following structure:
    {
      "description": "Creative description of the generated musical idea",
      "bpm": 120,
      "tracks": [
        {
          "trackName": "Piano Melody",
          "notes": [
            {
              "note": 60,
              "velocity": 80,
              "time": 0.0,
              "duration": 0.5
            }
          ]
        }
      ]
    }`;

    const fullPrompt = `Generate a MIDI composition: ${prompt}`;

    try {
      const response = await this.generateResponse(fullPrompt, systemPrompt);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        // Fallback simple melody
        return {
          description: "Simple generated melody",
          bpm: 120,
          tracks: [{
            trackName: "Melody",
            notes: [
              { note: 60, velocity: 80, time: 0.0, duration: 0.5 },
              { note: 64, velocity: 80, time: 0.5, duration: 0.5 },
              { note: 67, velocity: 80, time: 1.0, duration: 0.5 },
              { note: 72, velocity: 80, time: 1.5, duration: 1.0 }
            ]
          }]
        };
      }
    } catch (error) {
      console.error('MIDI generation failed:', error);
      throw error;
    }
  }

  async generateAudio(prompt: string, preferences?: any): Promise<{ audioData: string; description: string }> {
    const systemPrompt = `You are a professional music composer. Generate an audio composition based on the user's request. Return a JSON response with:
    {
      "description": "Description of the generated audio",
      "audioData": "Base64 encoded audio data"
    }`;

    const fullPrompt = `Generate an audio composition: ${prompt}`;

    try {
      const response = await this.generateResponse(fullPrompt, systemPrompt);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      } else {
        return {
          description: "Generated audio composition",
          audioData: "" // Local models can't generate actual audio data
        };
      }
    } catch (error) {
      console.error('Audio generation failed:', error);
      throw error;
    }
  }
}

// Factory function to create the appropriate service
export function createLLMService(config: ApiConfig) {
  if (config.provider === 'google') {
    // Return the existing Gemini service
    return null; // Will be handled by existing service
  } else {
    // Return local LLM service
    return new LocalLLMService(config);
  }
}

