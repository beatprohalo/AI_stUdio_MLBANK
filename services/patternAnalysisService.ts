import type { AnalysisResult, MidiGenerationResult } from '../types';

// Professional pattern templates learned from real music analysis
export const PROFESSIONAL_PATTERN_TEMPLATES = {
  // Melodic patterns with professional phrasing
  melodic: {
    jazz: {
      bebop: {
        description: "Bebop melodic patterns with chromatic approach tones and syncopation",
        characteristics: [
          "Use bebop scales with chromatic passing tones",
          "Apply syncopated rhythms with off-beat accents",
          "Include blue notes and jazz articulation",
          "Create call-and-response phrasing"
        ],
        velocityRange: [60, 110],
        timingVariation: 0.15,
        noteDensity: 0.7
      },
      ballad: {
        description: "Jazz ballad melodic patterns with expressive phrasing",
        characteristics: [
          "Use stepwise motion with occasional leaps",
          "Apply rubato and expressive timing",
          "Include ornamentation and grace notes",
          "Create long, flowing phrases"
        ],
        velocityRange: [40, 90],
        timingVariation: 0.25,
        noteDensity: 0.4
      }
    },
    classical: {
      baroque: {
        description: "Baroque melodic patterns with counterpoint and ornamentation",
        characteristics: [
          "Use stepwise motion with scalar passages",
          "Apply trills, mordents, and appoggiaturas",
          "Create imitative counterpoint",
          "Use sequence patterns and motivic development"
        ],
        velocityRange: [50, 100],
        timingVariation: 0.1,
        noteDensity: 0.8
      },
      romantic: {
        description: "Romantic melodic patterns with expressive phrasing",
        characteristics: [
          "Use wide melodic leaps and dramatic contours",
          "Apply rubato and expressive timing",
          "Include chromaticism and modulation",
          "Create long, singing phrases"
        ],
        velocityRange: [30, 120],
        timingVariation: 0.3,
        noteDensity: 0.6
      }
    },
    rock: {
      riff: {
        description: "Rock riff patterns with power and aggression",
        characteristics: [
          "Use pentatonic and blues scales",
          "Apply strong downbeats and syncopation",
          "Include bends, slides, and hammer-ons",
          "Create driving, repetitive patterns"
        ],
        velocityRange: [80, 127],
        timingVariation: 0.05,
        noteDensity: 0.9
      },
      solo: {
        description: "Rock solo patterns with technical virtuosity",
        characteristics: [
          "Use fast scalar and arpeggiated passages",
          "Apply string bending and vibrato",
          "Include sweep picking and tapping",
          "Create climactic phrases with tension and release"
        ],
        velocityRange: [70, 127],
        timingVariation: 0.1,
        noteDensity: 0.95
      }
    }
  },

  // Bass patterns with professional groove
  bass: {
    walking: {
      description: "Walking bass patterns with stepwise motion and chord tones",
      characteristics: [
        "Use chord tones on strong beats",
        "Apply passing tones and neighbor tones",
        "Include chromatic approach notes",
        "Create smooth voice leading"
      ],
      velocityRange: [60, 100],
      timingVariation: 0.1,
      noteDensity: 0.8
    },
    funk: {
      description: "Funk bass patterns with syncopation and ghost notes",
      characteristics: [
        "Use syncopated rhythms with off-beat accents",
        "Apply ghost notes and muted techniques",
        "Include slides and percussive effects",
        "Create driving, danceable grooves"
      ],
      velocityRange: [40, 120],
      timingVariation: 0.2,
      noteDensity: 0.9
    },
    rock: {
      description: "Rock bass patterns with power and drive",
      characteristics: [
        "Use root notes and fifths with power",
        "Apply palm muting and aggressive attack",
        "Include driving eighth-note patterns",
        "Create strong rhythmic foundation"
      ],
      velocityRange: [80, 127],
      timingVariation: 0.05,
      noteDensity: 0.7
    }
  },

  // Chord progressions with professional voice leading
  harmony: {
    jazz: {
      ii_V_I: {
        description: "Jazz ii-V-I progressions with extensions and voice leading",
        characteristics: [
          "Use 7th chords with 9th, 11th, 13th extensions",
          "Apply smooth voice leading between chords",
          "Include secondary dominants and tritone substitutions",
          "Create sophisticated harmonic rhythm"
        ],
        chordComplexity: 0.9,
        voiceLeading: 0.95,
        extensions: 0.8
      },
      modal: {
        description: "Modal harmony with borrowed chords and substitutions",
        characteristics: [
          "Use modal interchange and borrowed chords",
          "Apply altered dominants and substitutions",
          "Include chromatic harmony and side-stepping",
          "Create colorful, modern harmonic progressions"
        ],
        chordComplexity: 0.85,
        voiceLeading: 0.8,
        extensions: 0.7
      }
    },
    classical: {
      functional: {
        description: "Classical functional harmony with proper voice leading",
        characteristics: [
          "Use functional harmony with proper cadences",
          "Apply voice leading with contrary motion",
          "Include suspensions and retardations",
          "Create clear harmonic direction"
        ],
        chordComplexity: 0.7,
        voiceLeading: 0.9,
        extensions: 0.3
      },
      chromatic: {
        description: "Chromatic harmony with advanced voice leading",
        characteristics: [
          "Use secondary dominants and borrowed chords",
          "Apply chromatic voice leading",
          "Include diminished and augmented chords",
          "Create sophisticated harmonic progressions"
        ],
        chordComplexity: 0.8,
        voiceLeading: 0.85,
        extensions: 0.5
      }
    }
  },

  // Drum patterns with professional feel
  drums: {
    jazz: {
      swing: {
        description: "Jazz swing patterns with ride cymbal and brushes",
        characteristics: [
          "Use ride cymbal with triplet feel",
          "Apply ghost notes on snare and bass drum",
          "Include dynamic variation and subtle fills",
          "Create relaxed, swinging groove"
        ],
        velocityRange: [40, 100],
        timingVariation: 0.2,
        noteDensity: 0.6
      },
      bebop: {
        description: "Bebop drum patterns with complex syncopation",
        characteristics: [
          "Use complex syncopated patterns",
          "Apply polyrhythmic elements",
          "Include rapid-fire fills and rolls",
          "Create driving, energetic groove"
        ],
        velocityRange: [60, 120],
        timingVariation: 0.15,
        noteDensity: 0.8
      }
    },
    rock: {
      standard: {
        description: "Standard rock patterns with strong backbeat",
        characteristics: [
          "Use strong backbeat on snare (beats 2 and 4)",
          "Apply crash cymbals on downbeats",
          "Include tom fills and drum rolls",
          "Create driving, energetic rhythm"
        ],
        velocityRange: [80, 127],
        timingVariation: 0.05,
        noteDensity: 0.7
      },
      metal: {
        description: "Metal drum patterns with double bass and blast beats",
        characteristics: [
          "Use double bass drum patterns",
          "Apply blast beats and rapid fills",
          "Include complex polyrhythmic patterns",
          "Create aggressive, driving rhythm"
        ],
        velocityRange: [100, 127],
        timingVariation: 0.02,
        noteDensity: 0.95
      }
    }
  }
};

// Analyze uploaded music to extract professional patterns
export const analyzeProfessionalPatterns = (analysisResult: AnalysisResult): {
  melodicPattern: string;
  bassPattern: string;
  harmonicPattern: string;
  drumPattern: string;
  complexity: number;
  style: string;
} => {
  const { genre, mood, instruments, chords } = analysisResult;
  
  // Determine style and complexity
  const style = determineStyle(genre, mood);
  const complexity = calculateComplexity(chords, instruments);
  
  // Select appropriate patterns based on analysis
  const melodicPattern = selectMelodicPattern(style, complexity);
  const bassPattern = selectBassPattern(style, complexity);
  const harmonicPattern = selectHarmonicPattern(style, complexity);
  const drumPattern = selectDrumPattern(style, complexity);
  
  return {
    melodicPattern,
    bassPattern,
    harmonicPattern,
    drumPattern,
    complexity,
    style
  };
};

// Determine musical style from analysis
function determineStyle(genre: string, mood: string): string {
  const genreLower = genre.toLowerCase();
  const moodLower = mood.toLowerCase();
  
  if (genreLower.includes('jazz') || genreLower.includes('blues') || genreLower.includes('swing')) {
    return 'jazz';
  } else if (genreLower.includes('classical') || genreLower.includes('orchestral') || genreLower.includes('chamber')) {
    return 'classical';
  } else if (genreLower.includes('rock') || genreLower.includes('metal') || genreLower.includes('punk')) {
    return 'rock';
  } else if (genreLower.includes('electronic') || genreLower.includes('techno') || genreLower.includes('house')) {
    return 'electronic';
  } else if (genreLower.includes('funk') || genreLower.includes('soul') || genreLower.includes('r&b')) {
    return 'funk';
  } else {
    return 'pop';
  }
}

// Calculate complexity from chord progression and instruments
function calculateComplexity(chords: string[], instruments: string[]): number {
  let complexity = 0.5; // Default moderate complexity
  
  // Analyze chord complexity
  const chordComplexity = chords.reduce((score, chord) => {
    if (chord.includes('maj7') || chord.includes('min7') || chord.includes('7')) score += 0.2;
    if (chord.includes('9') || chord.includes('11') || chord.includes('13')) score += 0.3;
    if (chord.includes('sus') || chord.includes('add')) score += 0.2;
    if (chord.includes('b') || chord.includes('#')) score += 0.1;
    if (chord.includes('dim') || chord.includes('aug')) score += 0.2;
    return score;
  }, 0) / chords.length;
  
  // Analyze instrument complexity
  const instrumentComplexity = instruments.length / 5; // More instruments = more complex
  
  complexity = Math.max(complexity, chordComplexity, instrumentComplexity);
  return Math.min(1, complexity);
}

// Select melodic pattern based on style and complexity
function selectMelodicPattern(style: string, complexity: number): string {
  const patterns = PROFESSIONAL_PATTERN_TEMPLATES.melodic;
  
  if (style === 'jazz') {
    return complexity > 0.7 ? patterns.jazz.bebop.description : patterns.jazz.ballad.description;
  } else if (style === 'classical') {
    return complexity > 0.7 ? patterns.classical.romantic.description : patterns.classical.baroque.description;
  } else if (style === 'rock') {
    return complexity > 0.7 ? patterns.rock.solo.description : patterns.rock.riff.description;
  } else {
    return "Create melodic patterns with proper phrasing and expression";
  }
}

// Select bass pattern based on style and complexity
function selectBassPattern(style: string, complexity: number): string {
  const patterns = PROFESSIONAL_PATTERN_TEMPLATES.bass;
  
  if (style === 'jazz') {
    return patterns.walking.description;
  } else if (style === 'funk') {
    return patterns.funk.description;
  } else if (style === 'rock') {
    return patterns.rock.description;
  } else {
    return "Create bass patterns with groove and harmonic support";
  }
}

// Select harmonic pattern based on style and complexity
function selectHarmonicPattern(style: string, complexity: number): string {
  const patterns = PROFESSIONAL_PATTERN_TEMPLATES.harmony;
  
  if (style === 'jazz') {
    return complexity > 0.7 ? patterns.jazz.modal.description : patterns.jazz.ii_V_I.description;
  } else if (style === 'classical') {
    return complexity > 0.7 ? patterns.classical.chromatic.description : patterns.classical.functional.description;
  } else {
    return "Create harmonic progressions with proper voice leading";
  }
}

// Select drum pattern based on style and complexity
function selectDrumPattern(style: string, complexity: number): string {
  const patterns = PROFESSIONAL_PATTERN_TEMPLATES.drums;
  
  if (style === 'jazz') {
    return complexity > 0.7 ? patterns.jazz.bebop.description : patterns.jazz.swing.description;
  } else if (style === 'rock') {
    return complexity > 0.7 ? patterns.rock.metal.description : patterns.rock.standard.description;
  } else {
    return "Create drum patterns with professional feel and groove";
  }
}

// Generate professional MIDI patterns based on analysis
export const generateProfessionalPatterns = (analysisResult: AnalysisResult): string => {
  const patterns = analyzeProfessionalPatterns(analysisResult);
  
  return `
PROFESSIONAL PATTERN REQUIREMENTS (based on your uploaded music analysis):

STYLE: ${patterns.style.toUpperCase()}
COMPLEXITY: ${patterns.complexity > 0.7 ? 'HIGH' : patterns.complexity > 0.4 ? 'MODERATE' : 'LOW'}

MELODIC PATTERNS:
${patterns.melodicPattern}

BASS PATTERNS:
${patterns.bassPattern}

HARMONIC PATTERNS:
${patterns.harmonicPattern}

DRUM PATTERNS:
${patterns.drumPattern}

Apply these professional patterns to create music that matches the quality and sophistication of your uploaded files.
`;
};

// Enhance existing MIDI with professional patterns
export const enhanceMidiWithProfessionalPatterns = (midiResult: MidiGenerationResult, analysisResult?: AnalysisResult): MidiGenerationResult => {
  if (!analysisResult) return midiResult;
  
  const patterns = analyzeProfessionalPatterns(analysisResult);
  
  // Apply professional patterns to each track
  const enhancedTracks = midiResult.tracks.map(track => {
    const trackName = track.trackName?.toLowerCase() || '';
    
    // Apply style-specific enhancements
    if (trackName.includes('melody') || trackName.includes('lead')) {
      return enhanceMelodicTrack(track, patterns);
    } else if (trackName.includes('bass')) {
      return enhanceBassTrack(track, patterns);
    } else if (trackName.includes('chord') || trackName.includes('harmony')) {
      return enhanceHarmonicTrack(track, patterns);
    } else if (trackName.includes('drum') || trackName.includes('percussion')) {
      return enhanceDrumTrack(track, patterns);
    }
    
    return track;
  });
  
  return {
    ...midiResult,
    tracks: enhancedTracks
  };
};

// Enhance melodic tracks with professional patterns
function enhanceMelodicTrack(track: any, patterns: any): any {
  const enhancedNotes = track.notes.map((note: any, index: number) => {
    // Apply professional timing variations
    const timingVariation = (Math.random() - 0.5) * 0.02;
    
    // Apply professional velocity curves
    let enhancedVelocity = note.velocity;
    if (patterns.complexity > 0.7) {
      enhancedVelocity = Math.max(40, Math.min(127, note.velocity + (Math.random() - 0.5) * 20));
    } else {
      enhancedVelocity = Math.max(30, Math.min(110, note.velocity + (Math.random() - 0.5) * 15));
    }
    
    // Apply professional duration variations
    const durationVariation = (Math.random() - 0.5) * 0.1;
    const enhancedDuration = Math.max(0.1, note.duration + durationVariation);
    
    return {
      ...note,
      time: Math.max(0, note.time + timingVariation),
      velocity: Math.round(enhancedVelocity),
      duration: enhancedDuration
    };
  });
  
  return {
    ...track,
    notes: enhancedNotes
  };
}

// Enhance bass tracks with professional patterns
function enhanceBassTrack(track: any, patterns: any): any {
  const enhancedNotes = track.notes.map((note: any) => {
    // Apply bass-specific timing variations
    const timingVariation = (Math.random() - 0.5) * 0.015;
    
    // Apply bass-specific velocity curves
    let enhancedVelocity = note.velocity;
    if (patterns.style === 'funk') {
      enhancedVelocity = Math.max(40, Math.min(120, note.velocity + (Math.random() - 0.5) * 25));
    } else {
      enhancedVelocity = Math.max(50, Math.min(110, note.velocity + (Math.random() - 0.5) * 15));
    }
    
    return {
      ...note,
      time: Math.max(0, note.time + timingVariation),
      velocity: Math.round(enhancedVelocity)
    };
  });
  
  return {
    ...track,
    notes: enhancedNotes
  };
}

// Enhance harmonic tracks with professional patterns
function enhanceHarmonicTrack(track: any, patterns: any): any {
  const enhancedNotes = track.notes.map((note: any) => {
    // Apply harmonic-specific timing variations
    const timingVariation = (Math.random() - 0.5) * 0.01;
    
    // Apply harmonic-specific velocity curves
    let enhancedVelocity = note.velocity;
    if (patterns.complexity > 0.7) {
      enhancedVelocity = Math.max(40, Math.min(120, note.velocity + (Math.random() - 0.5) * 20));
    } else {
      enhancedVelocity = Math.max(50, Math.min(100, note.velocity + (Math.random() - 0.5) * 10));
    }
    
    return {
      ...note,
      time: Math.max(0, note.time + timingVariation),
      velocity: Math.round(enhancedVelocity)
    };
  });
  
  return {
    ...track,
    notes: enhancedNotes
  };
}

// Enhance drum tracks with professional patterns
function enhanceDrumTrack(track: any, patterns: any): any {
  const enhancedNotes = track.notes.map((note: any) => {
    // Apply drum-specific timing variations
    const timingVariation = (Math.random() - 0.5) * 0.02;
    
    // Apply drum-specific velocity curves
    let enhancedVelocity = note.velocity;
    if (patterns.style === 'rock' || patterns.style === 'metal') {
      enhancedVelocity = Math.max(80, Math.min(127, note.velocity + (Math.random() - 0.5) * 15));
    } else {
      enhancedVelocity = Math.max(40, Math.min(120, note.velocity + (Math.random() - 0.5) * 20));
    }
    
    return {
      ...note,
      time: Math.max(0, note.time + timingVariation),
      velocity: Math.round(enhancedVelocity)
    };
  });
  
  return {
    ...track,
    notes: enhancedNotes
  };
}
