

import React, { useState, useCallback, useEffect } from 'react';
import { generateMidi, generateAudio } from '../services/geminiService';
import { generateFilename } from '../services/autoNamingService';
import { createMidiBlob } from '../services/midiService';
import { GenerationModel, FeedbackAction } from '../types';
import type { MidiGenerationResult, AnalysisResult, LearnedPreferences } from '../types';
import { LoadingSpinner, PlayIcon, DownloadIcon } from './icons';
import FeedbackButtons from './FeedbackButtons';

// Audio decoding helper functions
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


interface GenerationCardProps {
  analysisResult: AnalysisResult | null;
  learningIsEnabled: boolean;
  preferences: LearnedPreferences | null;
  onFeedback: (result: MidiGenerationResult, action: FeedbackAction) => void;
  onGenerationComplete: (result: MidiGenerationResult, prompt: string) => void;
}

const GenerationCard: React.FC<GenerationCardProps> = ({ analysisResult, learningIsEnabled, preferences, onFeedback, onGenerationComplete }) => {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState<GenerationModel>(GenerationModel.MIDI);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [midiResult, setMidiResult] = useState<MidiGenerationResult | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    // Hide feedback buttons when the model is switched away from MIDI
    if (model !== GenerationModel.MIDI) {
      setShowFeedback(false);
    } else if (midiResult) {
      setShowFeedback(true);
    }
  }, [model, midiResult]);

  const playAudio = () => {
    if (!audioBuffer) return;
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputAudioContext.destination);
    source.start();
  };
  
  const downloadAudio = () => {
     if (!audioBuffer) return;
     const getWavBytes = (buffer: AudioBuffer) => {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const bitDepth = 16;
        const numFrames = buffer.length;
        const blockAlign = numChannels * bitDepth / 8;
        const byteRate = sampleRate * blockAlign;
        const dataSize = numFrames * blockAlign;
        const bufferSize = 44 + dataSize;
        const wavBuffer = new ArrayBuffer(bufferSize);
        const view = new DataView(wavBuffer);
        
        let pos = 0;
        const writeString = (s: string) => {
            for (let i = 0; i < s.length; i++) view.setUint8(pos + i, s.charCodeAt(i));
            pos += s.length;
        };

        writeString('RIFF'); view.setUint32(pos, 36 + dataSize, true); pos += 4;
        writeString('WAVE'); writeString('fmt '); view.setUint32(pos, 16, true); pos += 4;
        view.setUint16(pos, 1, true); pos += 2; view.setUint16(pos, numChannels, true); pos += 2;
        view.setUint32(pos, sampleRate, true); pos += 4; view.setUint32(pos, byteRate, true); pos += 4;
        view.setUint16(pos, blockAlign, true); pos += 2; view.setUint16(pos, bitDepth, true); pos += 2;
        writeString('data'); view.setUint32(pos, dataSize, true); pos += 4;
        
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < numFrames; i++) {
            const val = Math.max(-1, Math.min(1, channelData[i]));
            view.setInt16(pos, val * 32767, true);
            pos += 2;
        }

        return new Blob([view], { type: 'audio/wav' });
     }
     
     const blob = getWavBytes(audioBuffer);
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = generateFilename(prompt, analysisResult, 'audio');
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
     URL.revokeObjectURL(url);
  };

  const downloadMidi = () => {
    if (!midiResult?.tracks || midiResult.tracks.length === 0) {
      alert("No MIDI data was generated to download. Please try generating a new idea.");
      return;
    }

    if (learningIsEnabled) {
      onFeedback(midiResult, FeedbackAction.DOWNLOAD);
    }
    const bpm = midiResult?.bpm || analysisResult?.bpm || 120;
    const blob = createMidiBlob(midiResult.tracks, { bpm });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generateFilename(prompt, analysisResult, 'midi');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }
    
    if (learningIsEnabled && midiResult && model === GenerationModel.MIDI) {
      onFeedback(midiResult, FeedbackAction.REGENERATE);
    }

    setIsLoading(true);
    setError(null);
    setMidiResult(null);
    setAudioBuffer(null);
    setShowFeedback(false);

    try {
      if (model === GenerationModel.MIDI) {
        const result = await generateMidi(prompt, analysisResult?.bpm, learningIsEnabled ? preferences ?? undefined : undefined);
        setMidiResult(result);
        setShowFeedback(true);
        onGenerationComplete(result, prompt);
      } else {
        const base64Audio = await generateAudio(prompt, learningIsEnabled ? preferences ?? undefined : undefined);
        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        const decodedBytes = decode(base64Audio);
        const buffer = await decodeAudioData(decodedBytes, outputAudioContext, 24000, 1);
        setAudioBuffer(buffer);
      }
    } catch (err) {
      setError('Failed to generate content. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, model, analysisResult, learningIsEnabled, preferences, onFeedback, midiResult, onGenerationComplete]);

  const handleFeedbackAction = (action: FeedbackAction) => {
    if (midiResult && learningIsEnabled) {
      onFeedback(midiResult, action);
      setShowFeedback(false); // Hide buttons after feedback is given
    }
  }
  
  return (
    <div className="bg-surface border border-surface-border rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-secondary mb-4">2. Generate New Music</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., A happy piano melody in C major"
        className="w-full p-2 border-2 border-surface-border bg-input-bg text-on-surface rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition"
        rows={3}
      />
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
            <label htmlFor="model-select" className="text-on-surface-muted">Model:</label>
            <select
              id="model-select"
              value={model}
              onChange={(e) => setModel(e.target.value as GenerationModel)}
              className="p-2 border-2 border-surface-border bg-input-bg text-on-surface rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition"
            >
              <option value={GenerationModel.MIDI}>MIDI Idea</option>
              <option value={GenerationModel.AUDIO}>Audio (TTS)</option>
            </select>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt}
          className="flex items-center justify-center px-6 py-2 bg-primary text-bkg font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {isLoading ? <LoadingSpinner /> : null}
          <span>{isLoading ? 'Generating...' : 'Generate'}</span>
        </button>
      </div>

      {error && <div className="mt-4 text-red-400">{error}</div>}
      
      {midiResult && (
        <div className="mt-6 p-4 bg-bkg/50 rounded-md">
            <div className="flex justify-between items-start mb-2">
               <div>
                <h3 className="font-semibold text-on-surface">Generated MIDI Idea:</h3>
                <pre className="whitespace-pre-wrap text-on-surface-muted text-sm font-mono mt-2">{midiResult.description}</pre>
               </div>
               <button onClick={downloadMidi} className="flex-shrink-0 flex items-center space-x-2 text-secondary hover:text-primary transition-colors p-2 rounded-full bg-surface/50 ml-4">
                    <DownloadIcon /> <span>Download .mid</span>
               </button>
            </div>
           {showFeedback && learningIsEnabled && (
             <FeedbackButtons onFeedback={handleFeedbackAction} />
           )}
        </div>
      )}

      {audioBuffer && (
        <div className="mt-6 p-4 bg-bkg/50 rounded-md">
            <h3 className="font-semibold text-on-surface mb-2">Generated Audio:</h3>
            <div className="flex items-center space-x-4">
                <button onClick={playAudio} className="flex items-center space-x-2 text-secondary hover:text-primary transition-colors p-2 rounded-full bg-surface/50">
                    <PlayIcon /> <span>Play</span>
                </button>
                <button onClick={downloadAudio} className="flex items-center space-x-2 text-secondary hover:text-primary transition-colors p-2 rounded-full bg-surface/50">
                    <DownloadIcon /> <span>Download .wav</span>
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default GenerationCard;