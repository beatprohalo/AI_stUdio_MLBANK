import type { 
  AdvancedFeedbackSchema, 
  MusicalStyleProfile, 
  UserPreferences, 
  LearnedPreferences,
  MusicalDimension,
  MidiGenerationResult,
  AnalysisResult
} from '../types';

// Pre-configured musical style profiles
export const MUSICAL_STYLE_PROFILES: MusicalStyleProfile[] = [
  {
    id: 'classical-romantic',
    name: 'Classical Romantic',
    description: 'Rich harmony, expressive dynamics, developed themes',
    characteristics: {
      harmonic: {
        complexity: 0.8,
        jazzInfluence: 0.2,
        modalFlavor: 0.6,
        chromaticism: 0.7
      },
      melodic: {
        motivicDevelopment: 0.9,
        contourVariety: 0.8,
        rhythmicComplexity: 0.6,
        range: 2.5
      },
      dynamics: {
        expressiveness: 0.9,
        microTiming: 0.7,
        accentuation: 0.8
      }
    }
  },
  {
    id: 'jazz-fusion',
    name: 'Jazz Fusion',
    description: 'Complex chords, syncopation, chromaticism',
    characteristics: {
      harmonic: {
        complexity: 0.9,
        jazzInfluence: 0.9,
        modalFlavor: 0.8,
        chromaticism: 0.8
      },
      melodic: {
        motivicDevelopment: 0.8,
        contourVariety: 0.9,
        rhythmicComplexity: 0.9,
        range: 2.0
      },
      dynamics: {
        expressiveness: 0.8,
        microTiming: 0.8,
        accentuation: 0.7
      }
    }
  },
  {
    id: 'progressive-rock',
    name: 'Progressive Rock',
    description: 'Odd meters, modulation, dramatic dynamics',
    characteristics: {
      harmonic: {
        complexity: 0.7,
        jazzInfluence: 0.5,
        modalFlavor: 0.7,
        chromaticism: 0.6
      },
      melodic: {
        motivicDevelopment: 0.7,
        contourVariety: 0.8,
        rhythmicComplexity: 0.8,
        range: 2.2
      },
      dynamics: {
        expressiveness: 0.9,
        microTiming: 0.6,
        accentuation: 0.9
      }
    }
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Simple harmony, evolving patterns, subtle development',
    characteristics: {
      harmonic: {
        complexity: 0.3,
        jazzInfluence: 0.1,
        modalFlavor: 0.4,
        chromaticism: 0.2
      },
      melodic: {
        motivicDevelopment: 0.6,
        contourVariety: 0.4,
        rhythmicComplexity: 0.5,
        range: 1.5
      },
      dynamics: {
        expressiveness: 0.4,
        microTiming: 0.3,
        accentuation: 0.3
      }
    }
  }
];

// Analyze uploaded MIDI/audio for musical patterns
export const analyzeMusicalPatterns = (analysisResult: AnalysisResult): UserPreferences => {
  const { chords, mood, genre, instruments } = analysisResult;
  
  // Analyze harmonic complexity based on chord progression
  const harmonicComplexity = analyzeHarmonicComplexity(chords);
  const jazzInfluence = analyzeJazzInfluence(chords, genre);
  const modalFlavor = analyzeModalFlavor(chords);
  const chromaticism = analyzeChromaticism(chords);
  
  // Analyze melodic characteristics
  const motivicDevelopment = analyzeMotivicDevelopment(genre, mood);
  const contourVariety = analyzeContourVariety(mood);
  const rhythmicComplexity = analyzeRhythmicComplexity(genre);
  const range = analyzeMelodicRange(genre);
  
  // Analyze dynamic characteristics
  const expressiveness = analyzeDynamicExpressiveness(mood);
  const microTiming = analyzeMicroTiming(genre);
  const accentuation = analyzeAccentuation(genre);
  
  return {
    harmonic: {
      complexity: harmonicComplexity,
      jazzInfluence,
      modalFlavor,
      chromaticism
    },
    melodic: {
      motivicDevelopment,
      contourVariety,
      rhythmicComplexity,
      range
    },
    dynamics: {
      expressiveness,
      microTiming,
      accentuation
    }
  };
};

// Harmonic analysis functions
const analyzeHarmonicComplexity = (chords: string[]): number => {
  if (chords.length === 0) return 0.5;
  
  // Simple heuristic: more chords and complex chord names = higher complexity
  const complexChordIndicators = ['maj7', 'min7', '7', '9', '11', '13', 'sus', 'add', 'dim', 'aug'];
  let complexityScore = 0;
  
  chords.forEach(chord => {
    const chordStr = chord.toLowerCase();
    if (complexChordIndicators.some(indicator => chordStr.includes(indicator))) {
      complexityScore += 0.2;
    }
    if (chordStr.includes('b') || chordStr.includes('#')) {
      complexityScore += 0.1; // Chromatic alterations
    }
  });
  
  return Math.min(1.0, complexityScore / chords.length + 0.3);
};

const analyzeJazzInfluence = (chords: string[], genre: string): number => {
  const jazzGenres = ['jazz', 'fusion', 'bebop', 'swing', 'blues'];
  const isJazzGenre = jazzGenres.some(jazzGenre => 
    genre.toLowerCase().includes(jazzGenre)
  );
  
  if (isJazzGenre) return 0.9;
  
  // Analyze chord extensions
  const jazzChordIndicators = ['7', '9', '11', '13', 'maj7', 'min7'];
  const jazzScore = chords.reduce((score, chord) => {
    const chordStr = chord.toLowerCase();
    return score + (jazzChordIndicators.some(indicator => chordStr.includes(indicator)) ? 0.2 : 0);
  }, 0);
  
  return Math.min(1.0, jazzScore);
};

const analyzeModalFlavor = (chords: string[]): number => {
  // Modal interchange typically involves borrowing chords from parallel modes
  const modalIndicators = ['m', 'min', 'minor'];
  const majorIndicators = ['maj', 'major', ''];
  
  let modalScore = 0;
  chords.forEach(chord => {
    const chordStr = chord.toLowerCase();
    if (modalIndicators.some(indicator => chordStr.includes(indicator))) {
      modalScore += 0.3;
    }
  });
  
  return Math.min(1.0, modalScore);
};

const analyzeChromaticism = (chords: string[]): number => {
  const chromaticIndicators = ['b', '#', 'flat', 'sharp'];
  let chromaticScore = 0;
  
  chords.forEach(chord => {
    const chordStr = chord.toLowerCase();
    if (chromaticIndicators.some(indicator => chordStr.includes(indicator))) {
      chromaticScore += 0.2;
    }
  });
  
  return Math.min(1.0, chromaticScore);
};

// Melodic analysis functions
const analyzeMotivicDevelopment = (genre: string, mood: string): number => {
  const classicalGenres = ['classical', 'romantic', 'baroque', 'chamber'];
  const isClassical = classicalGenres.some(genreName => 
    genre.toLowerCase().includes(genreName)
  );
  
  if (isClassical) return 0.9;
  
  const dramaticMoods = ['dramatic', 'epic', 'cinematic', 'orchestral'];
  const isDramatic = dramaticMoods.some(moodName => 
    mood.toLowerCase().includes(moodName)
  );
  
  return isDramatic ? 0.8 : 0.6;
};

const analyzeContourVariety = (mood: string): number => {
  const expressiveMoods = ['dramatic', 'emotional', 'expressive', 'passionate'];
  const isExpressive = expressiveMoods.some(moodName => 
    mood.toLowerCase().includes(moodName)
  );
  
  return isExpressive ? 0.8 : 0.6;
};

const analyzeRhythmicComplexity = (genre: string): number => {
  const complexGenres = ['jazz', 'fusion', 'progressive', 'math', 'experimental'];
  const isComplex = complexGenres.some(genreName => 
    genre.toLowerCase().includes(genreName)
  );
  
  return isComplex ? 0.9 : 0.5;
};

const analyzeMelodicRange = (genre: string): number => {
  const wideRangeGenres = ['orchestral', 'classical', 'cinematic', 'epic'];
  const isWideRange = wideRangeGenres.some(genreName => 
    genre.toLowerCase().includes(genreName)
  );
  
  return isWideRange ? 2.5 : 2.0;
};

// Dynamic analysis functions
const analyzeDynamicExpressiveness = (mood: string): number => {
  const expressiveMoods = ['dramatic', 'emotional', 'passionate', 'intense', 'epic'];
  const isExpressive = expressiveMoods.some(moodName => 
    mood.toLowerCase().includes(moodName)
  );
  
  return isExpressive ? 0.9 : 0.6;
};

const analyzeMicroTiming = (genre: string): number => {
  const humanizedGenres = ['jazz', 'blues', 'folk', 'acoustic'];
  const isHumanized = humanizedGenres.some(genreName => 
    genre.toLowerCase().includes(genreName)
  );
  
  return isHumanized ? 0.8 : 0.5;
};

const analyzeAccentuation = (genre: string): number => {
  const accentedGenres = ['rock', 'metal', 'punk', 'marching', 'military'];
  const isAccented = accentedGenres.some(genreName => 
    genre.toLowerCase().includes(genreName)
  );
  
  return isAccented ? 0.9 : 0.6;
};

// Convert user preferences to learned preferences format
export const convertToLearnedPreferences = (userPrefs: UserPreferences): Partial<LearnedPreferences> => {
  return {
    [MusicalDimension.HARMONIC_COMPLEXITY]: {
      'simple': 1 - userPrefs.harmonic.complexity,
      'complex': userPrefs.harmonic.complexity,
      'jazz': userPrefs.harmonic.jazzInfluence,
      'modal': userPrefs.harmonic.modalFlavor,
      'chromatic': userPrefs.harmonic.chromaticism
    },
    [MusicalDimension.MELODIC_DEVELOPMENT]: {
      'motivic': userPrefs.melodic.motivicDevelopment,
      'contour': userPrefs.melodic.contourVariety,
      'rhythmic': userPrefs.melodic.rhythmicComplexity,
      'wide_range': userPrefs.melodic.range / 3.0 // Normalize to 0-1
    },
    [MusicalDimension.DYNAMIC_EXPRESSION]: {
      'expressive': userPrefs.dynamics.expressiveness,
      'humanized': userPrefs.dynamics.microTiming,
      'accented': userPrefs.dynamics.accentuation
    }
  };
};

// Apply style profile to generation prompt
export const applyStyleProfileToPrompt = (
  basePrompt: string, 
  profile: MusicalStyleProfile
): string => {
  const { characteristics } = profile;
  
  let stylePrompt = `\n\nSTYLE PROFILE: ${profile.name}\n`;
  stylePrompt += `${profile.description}\n\n`;
  
  // Harmonic characteristics
  if (characteristics.harmonic.complexity > 0.7) {
    stylePrompt += `- Use sophisticated harmonic progressions with extended chords\n`;
  }
  if (characteristics.harmonic.jazzInfluence > 0.7) {
    stylePrompt += `- Incorporate jazz harmony with 7ths, 9ths, and altered dominants\n`;
  }
  if (characteristics.harmonic.modalFlavor > 0.7) {
    stylePrompt += `- Apply modal interchange and borrowed chords\n`;
  }
  if (characteristics.harmonic.chromaticism > 0.7) {
    stylePrompt += `- Use chromatic passing tones and neighbor tones\n`;
  }
  
  // Melodic characteristics
  if (characteristics.melodic.motivicDevelopment > 0.7) {
    stylePrompt += `- Develop clear melodic motifs with variation and transformation\n`;
  }
  if (characteristics.melodic.contourVariety > 0.7) {
    stylePrompt += `- Create diverse melodic contours (ascending, descending, arch, wave)\n`;
  }
  if (characteristics.melodic.rhythmicComplexity > 0.7) {
    stylePrompt += `- Use complex rhythmic patterns with syncopation\n`;
  }
  if (characteristics.melodic.range > 2.0) {
    stylePrompt += `- Utilize wide melodic range with strategic leaps\n`;
  }
  
  // Dynamic characteristics
  if (characteristics.dynamics.expressiveness > 0.7) {
    stylePrompt += `- Apply dramatic dynamic contrasts and phrasing\n`;
  }
  if (characteristics.dynamics.microTiming > 0.7) {
    stylePrompt += `- Include subtle timing variations and humanization\n`;
  }
  if (characteristics.dynamics.accentuation > 0.7) {
    stylePrompt += `- Emphasize structural accents and downbeats\n`;
  }
  
  return basePrompt + stylePrompt;
};

// Generate A/B test variations
export const generateABTestVariations = (
  basePrompt: string,
  userPrefs: UserPreferences
): { conservative: string; experimental: string } => {
  const conservativePrompt = basePrompt + `\n\nCONSERVATIVE APPROACH:
- Use established harmonic progressions
- Apply moderate complexity
- Focus on clear, accessible melodies
- Use standard dynamic ranges`;

  const experimentalPrompt = basePrompt + `\n\nEXPERIMENTAL APPROACH:
- Push harmonic boundaries with extended chords and modulations
- Create complex, evolving melodic lines
- Apply dramatic dynamic contrasts
- Use advanced rhythmic patterns and polyrhythms`;

  return { conservative: conservativePrompt, experimental: experimentalPrompt };
};

// Update preferences based on feedback
export const updatePreferencesFromFeedback = (
  currentPrefs: UserPreferences,
  feedback: AdvancedFeedbackSchema
): UserPreferences => {
  const learningRate = 0.1;
  
  return {
    harmonic: {
      complexity: Math.max(0, Math.min(1, 
        currentPrefs.harmonic.complexity + (feedback.harmonicComplexity - 3) * learningRate
      )),
      jazzInfluence: Math.max(0, Math.min(1, 
        currentPrefs.harmonic.jazzInfluence + (feedback.harmonicComplexity - 3) * learningRate
      )),
      modalFlavor: Math.max(0, Math.min(1, 
        currentPrefs.harmonic.modalFlavor + (feedback.harmonicComplexity - 3) * learningRate
      )),
      chromaticism: Math.max(0, Math.min(1, 
        currentPrefs.harmonic.chromaticism + (feedback.harmonicComplexity - 3) * learningRate
      ))
    },
    melodic: {
      motivicDevelopment: Math.max(0, Math.min(1, 
        currentPrefs.melodic.motivicDevelopment + (feedback.melodicCoherence - 3) * learningRate
      )),
      contourVariety: Math.max(0, Math.min(1, 
        currentPrefs.melodic.contourVariety + (feedback.melodicCoherence - 3) * learningRate
      )),
      rhythmicComplexity: Math.max(0, Math.min(1, 
        currentPrefs.melodic.rhythmicComplexity + (feedback.melodicCoherence - 3) * learningRate
      )),
      range: Math.max(1, Math.min(3, 
        currentPrefs.melodic.range + (feedback.melodicCoherence - 3) * learningRate * 0.5
      ))
    },
    dynamics: {
      expressiveness: Math.max(0, Math.min(1, 
        currentPrefs.dynamics.expressiveness + (feedback.dynamicExpression - 3) * learningRate
      )),
      microTiming: Math.max(0, Math.min(1, 
        currentPrefs.dynamics.microTiming + (feedback.dynamicExpression - 3) * learningRate
      )),
      accentuation: Math.max(0, Math.min(1, 
        currentPrefs.dynamics.accentuation + (feedback.dynamicExpression - 3) * learningRate
      ))
    }
  };
};
