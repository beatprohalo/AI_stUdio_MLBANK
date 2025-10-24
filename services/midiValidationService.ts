import type { MidiGenerationResult } from '../types';

// Professional MIDI validation and enhancement
export const validateAndEnhanceMidi = (midiResult: MidiGenerationResult): MidiGenerationResult => {
  const enhancedTracks = midiResult.tracks.map(track => {
    const enhancedNotes = track.notes.map(note => {
      // Validate and enhance note properties
      const enhancedNote = {
        ...note,
        note: Math.max(21, Math.min(108, note.note)), // Ensure valid MIDI range
        velocity: Math.max(1, Math.min(127, note.velocity)), // Ensure valid velocity
        time: Math.max(0, note.time), // Ensure non-negative time
        duration: Math.max(0.1, note.duration) // Ensure minimum duration
      };
      
      return enhancedNote;
    });
    
    // Sort notes by time to ensure proper ordering
    enhancedNotes.sort((a, b) => a.time - b.time);
    
    return {
      ...track,
      notes: enhancedNotes
    };
  });
  
  return {
    ...midiResult,
    tracks: enhancedTracks
  };
};

// Professional MIDI quality assessment
export const assessMidiQuality = (midiResult: MidiGenerationResult): {
  overall: number;
  melodic: number;
  harmonic: number;
  rhythmic: number;
  dynamic: number;
  issues: string[];
} => {
  const issues: string[] = [];
  let melodicScore = 0;
  let harmonicScore = 0;
  let rhythmicScore = 0;
  let dynamicScore = 0;
  
  // Analyze each track
  midiResult.tracks.forEach((track, trackIndex) => {
    const trackName = track.trackName?.toLowerCase() || `track-${trackIndex}`;
    const notes = track.notes;
    
    if (notes.length === 0) {
      issues.push(`Track ${trackIndex} (${trackName}) has no notes`);
      return;
    }
    
    // Melodic analysis
    if (trackName.includes('melody') || trackName.includes('lead')) {
      melodicScore += analyzeMelodicQuality(notes);
    }
    
    // Harmonic analysis
    if (trackName.includes('chord') || trackName.includes('harmony')) {
      harmonicScore += analyzeHarmonicQuality(notes);
    }
    
    // Rhythmic analysis
    rhythmicScore += analyzeRhythmicQuality(notes);
    
    // Dynamic analysis
    dynamicScore += analyzeDynamicQuality(notes);
  });
  
  // Calculate overall scores
  const trackCount = midiResult.tracks.length;
  melodicScore = trackCount > 0 ? melodicScore / trackCount : 0;
  harmonicScore = trackCount > 0 ? harmonicScore / trackCount : 0;
  rhythmicScore = trackCount > 0 ? rhythmicScore / trackCount : 0;
  dynamicScore = trackCount > 0 ? dynamicScore / trackCount : 0;
  
  const overall = (melodicScore + harmonicScore + rhythmicScore + dynamicScore) / 4;
  
  return {
    overall: Math.round(overall * 100) / 100,
    melodic: Math.round(melodicScore * 100) / 100,
    harmonic: Math.round(harmonicScore * 100) / 100,
    rhythmic: Math.round(rhythmicScore * 100) / 100,
    dynamic: Math.round(dynamicScore * 100) / 100,
    issues
  };
};

// Analyze melodic quality
function analyzeMelodicQuality(notes: any[]): number {
  if (notes.length < 2) return 0.3;
  
  let score = 0.5; // Base score
  
  // Check for melodic contour
  const pitches = notes.map(n => n.note);
  const contour = calculateMelodicContour(pitches);
  if (contour.variety > 0.5) score += 0.2;
  
  // Check for proper phrasing
  const phraseLength = calculatePhraseLength(notes);
  if (phraseLength > 0.6) score += 0.2;
  
  // Check for appropriate note density
  const noteDensity = calculateNoteDensity(notes);
  if (noteDensity > 0.3 && noteDensity < 0.8) score += 0.1;
  
  return Math.min(1, score);
}

// Analyze harmonic quality
function analyzeHarmonicQuality(notes: any[]): number {
  if (notes.length < 3) return 0.3;
  
  let score = 0.5; // Base score
  
  // Check for chord voicing
  const chordVoicing = calculateChordVoicing(notes);
  if (chordVoicing > 0.6) score += 0.2;
  
  // Check for voice leading
  const voiceLeading = calculateVoiceLeading(notes);
  if (voiceLeading > 0.5) score += 0.2;
  
  // Check for harmonic rhythm
  const harmonicRhythm = calculateHarmonicRhythm(notes);
  if (harmonicRhythm > 0.4) score += 0.1;
  
  return Math.min(1, score);
}

// Analyze rhythmic quality
function analyzeRhythmicQuality(notes: any[]): number {
  if (notes.length < 2) return 0.3;
  
  let score = 0.5; // Base score
  
  // Check for rhythmic variety
  const rhythmicVariety = calculateRhythmicVariety(notes);
  if (rhythmicVariety > 0.4) score += 0.2;
  
  // Check for syncopation
  const syncopation = calculateSyncopation(notes);
  if (syncopation > 0.3) score += 0.2;
  
  // Check for proper timing
  const timing = calculateTimingQuality(notes);
  if (timing > 0.6) score += 0.1;
  
  return Math.min(1, score);
}

// Analyze dynamic quality
function analyzeDynamicQuality(notes: any[]): number {
  if (notes.length < 2) return 0.3;
  
  let score = 0.5; // Base score
  
  // Check for velocity variety
  const velocityVariety = calculateVelocityVariety(notes);
  if (velocityVariety > 0.4) score += 0.2;
  
  // Check for dynamic shaping
  const dynamicShaping = calculateDynamicShaping(notes);
  if (dynamicShaping > 0.5) score += 0.2;
  
  // Check for appropriate velocity range
  const velocityRange = calculateVelocityRange(notes);
  if (velocityRange > 0.6) score += 0.1;
  
  return Math.min(1, score);
}

// Helper functions for analysis
function calculateMelodicContour(pitches: number[]): { variety: number; direction: number } {
  if (pitches.length < 2) return { variety: 0, direction: 0 };
  
  let directionChanges = 0;
  let totalVariety = 0;
  
  for (let i = 1; i < pitches.length; i++) {
    const current = pitches[i];
    const previous = pitches[i - 1];
    const interval = Math.abs(current - previous);
    
    totalVariety += interval;
    
    if (i > 1) {
      const prevDirection = pitches[i - 1] - pitches[i - 2];
      const currentDirection = current - previous;
      
      if ((prevDirection > 0 && currentDirection < 0) || (prevDirection < 0 && currentDirection > 0)) {
        directionChanges++;
      }
    }
  }
  
  const variety = totalVariety / (pitches.length - 1);
  const direction = directionChanges / (pitches.length - 2);
  
  return { variety: Math.min(1, variety / 12), direction: Math.min(1, direction) };
}

function calculatePhraseLength(notes: any[]): number {
  if (notes.length < 2) return 0;
  
  const totalDuration = Math.max(...notes.map(n => n.time + n.duration)) - Math.min(...notes.map(n => n.time));
  const noteCount = notes.length;
  
  return Math.min(1, noteCount / (totalDuration * 4)); // 4 notes per beat is good phrasing
}

function calculateNoteDensity(notes: any[]): number {
  if (notes.length < 2) return 0;
  
  const totalDuration = Math.max(...notes.map(n => n.time + n.duration)) - Math.min(...notes.map(n => n.time));
  return notes.length / (totalDuration * 8); // 8 notes per second is good density
}

function calculateChordVoicing(notes: any[]): number {
  if (notes.length < 3) return 0;
  
  // Group notes by time to find chords
  const timeGroups: { [time: number]: number[] } = {};
  notes.forEach(note => {
    const time = Math.round(note.time * 4) / 4; // Quantize to quarter notes
    if (!timeGroups[time]) timeGroups[time] = [];
    timeGroups[time].push(note.note);
  });
  
  let voicingScore = 0;
  let chordCount = 0;
  
  Object.values(timeGroups).forEach(chord => {
    if (chord.length >= 3) {
      chordCount++;
      // Check for proper chord spacing
      const sortedChord = chord.sort((a, b) => a - b);
      let spacingScore = 0;
      
      for (let i = 1; i < sortedChord.length; i++) {
        const interval = sortedChord[i] - sortedChord[i - 1];
        if (interval >= 3 && interval <= 12) { // Good spacing
          spacingScore += 1;
        }
      }
      
      voicingScore += spacingScore / (sortedChord.length - 1);
    }
  });
  
  return chordCount > 0 ? voicingScore / chordCount : 0;
}

function calculateVoiceLeading(notes: any[]): number {
  if (notes.length < 4) return 0;
  
  // Group notes by time to find chord progressions
  const timeGroups: { [time: number]: number[] } = {};
  notes.forEach(note => {
    const time = Math.round(note.time * 4) / 4;
    if (!timeGroups[time]) timeGroups[time] = [];
    timeGroups[time].push(note.note);
  });
  
  const times = Object.keys(timeGroups).map(Number).sort((a, b) => a - b);
  let voiceLeadingScore = 0;
  let progressionCount = 0;
  
  for (let i = 1; i < times.length; i++) {
    const currentChord = timeGroups[times[i]].sort((a, b) => a - b);
    const previousChord = timeGroups[times[i - 1]].sort((a, b) => a - b);
    
    if (currentChord.length >= 3 && previousChord.length >= 3) {
      progressionCount++;
      
      // Calculate voice leading smoothness
      let smoothness = 0;
      const minDistance = Math.min(currentChord.length, previousChord.length);
      
      for (let j = 0; j < minDistance; j++) {
        const distance = Math.abs(currentChord[j] - previousChord[j]);
        if (distance <= 2) { // Smooth voice leading
          smoothness += 1;
        }
      }
      
      voiceLeadingScore += smoothness / minDistance;
    }
  }
  
  return progressionCount > 0 ? voiceLeadingScore / progressionCount : 0;
}

function calculateHarmonicRhythm(notes: any[]): number {
  if (notes.length < 4) return 0;
  
  // Group notes by time to find harmonic rhythm
  const timeGroups: { [time: number]: number[] } = {};
  notes.forEach(note => {
    const time = Math.round(note.time * 4) / 4;
    if (!timeGroups[time]) timeGroups[time] = [];
    timeGroups[time].push(note.note);
  });
  
  const times = Object.keys(timeGroups).map(Number).sort((a, b) => a - b);
  if (times.length < 2) return 0;
  
  // Calculate harmonic rhythm variety
  const intervals = [];
  for (let i = 1; i < times.length; i++) {
    intervals.push(times[i] - times[i - 1]);
  }
  
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
  
  return Math.min(1, variance / 4); // Higher variance = better harmonic rhythm
}

function calculateRhythmicVariety(notes: any[]): number {
  if (notes.length < 2) return 0;
  
  const durations = notes.map(n => n.duration);
  const uniqueDurations = new Set(durations.map(d => Math.round(d * 4) / 4)).size;
  
  return Math.min(1, uniqueDurations / 8); // More unique durations = better variety
}

function calculateSyncopation(notes: any[]): number {
  if (notes.length < 2) return 0;
  
  let syncopatedNotes = 0;
  const totalNotes = notes.length;
  
  notes.forEach(note => {
    const beatPosition = (note.time * 4) % 1;
    if (beatPosition > 0.5 && beatPosition < 1) { // Off-beat
      syncopatedNotes++;
    }
  });
  
  return syncopatedNotes / totalNotes;
}

function calculateTimingQuality(notes: any[]): number {
  if (notes.length < 2) return 0;
  
  // Check for proper note spacing
  const sortedNotes = notes.sort((a, b) => a.time - b.time);
  let timingScore = 0;
  
  for (let i = 1; i < sortedNotes.length; i++) {
    const current = sortedNotes[i];
    const previous = sortedNotes[i - 1];
    const gap = current.time - (previous.time + previous.duration);
    
    if (gap >= 0) { // No overlapping notes
      timingScore += 1;
    }
  }
  
  return timingScore / (sortedNotes.length - 1);
}

function calculateVelocityVariety(notes: any[]): number {
  if (notes.length < 2) return 0;
  
  const velocities = notes.map(n => n.velocity);
  const minVel = Math.min(...velocities);
  const maxVel = Math.max(...velocities);
  
  return (maxVel - minVel) / 127;
}

function calculateDynamicShaping(notes: any[]): number {
  if (notes.length < 4) return 0;
  
  // Check for crescendo/diminuendo patterns
  const sortedNotes = notes.sort((a, b) => a.time - b.time);
  const velocities = sortedNotes.map(n => n.velocity);
  
  let shapingScore = 0;
  const segmentSize = Math.max(2, Math.floor(velocities.length / 4));
  
  for (let i = 0; i < velocities.length - segmentSize; i += segmentSize) {
    const segment = velocities.slice(i, i + segmentSize);
    const trend = calculateTrend(segment);
    
    if (Math.abs(trend) > 0.1) { // Significant trend
      shapingScore += 1;
    }
  }
  
  return shapingScore / Math.ceil(velocities.length / segmentSize);
}

function calculateVelocityRange(notes: any[]): number {
  if (notes.length < 2) return 0;
  
  const velocities = notes.map(n => n.velocity);
  const minVel = Math.min(...velocities);
  const maxVel = Math.max(...velocities);
  
  // Good velocity range is 40-120
  const range = maxVel - minVel;
  return Math.min(1, range / 80);
}

function calculateTrend(values: number[]): number {
  if (values.length < 2) return 0;
  
  const n = values.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
  const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  return slope;
}
