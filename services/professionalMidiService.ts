import type { MidiGenerationResult, ApiConfig, LearnedPreferences, AnalysisResult } from '../types';

// Professional MIDI pattern templates based on real music analysis
export const PROFESSIONAL_PATTERNS = {
  // Melodic patterns with proper phrasing
  melodic: {
    jazz: [
      "Create a sophisticated jazz melody with bebop scales, chromatic approach tones, and syncopated rhythms",
      "Use call-and-response phrasing with 2-bar question and 2-bar answer patterns",
      "Include blue notes, grace notes, and jazz articulation (scoops, falls, vibrato)",
      "Apply swing feel with off-beat accents and anticipatory notes"
    ],
    classical: [
      "Develop a classical melody with clear phrase structure (antecedent-consequent)",
      "Use sequence patterns, imitation, and motivic development",
      "Include ornamentation: trills, mordents, appoggiaturas, and turns",
      "Apply proper classical articulation: legato, staccato, tenuto, and dynamic shaping"
    ],
    rock: [
      "Create a rock melody with pentatonic and blues scales",
      "Use power chord progressions with distortion-friendly intervals",
      "Include guitar-style bends, slides, and hammer-ons",
      "Apply aggressive articulation with strong downbeats and syncopation"
    ],
    electronic: [
      "Design an electronic melody with arpeggiated patterns and filter sweeps",
      "Use step-sequencer style quantization with occasional humanization",
      "Include sidechain compression effects and velocity automation",
      "Apply electronic articulation: staccato, portamento, and filter modulation"
    ]
  },

  // Bass patterns with professional groove
  bass: {
    walking: [
      "Create a walking bass line with stepwise motion and occasional leaps",
      "Use chord tones on strong beats and passing tones on weak beats",
      "Include chromatic approach notes and neighbor tones",
      "Apply swing feel with slight anticipation of beat 1"
    ],
    funk: [
      "Design a funk bass line with syncopated rhythms and ghost notes",
      "Use octave jumps, slides, and percussive techniques",
      "Include 16th-note patterns with emphasis on the 'and' of beats",
      "Apply slap bass techniques and muted notes"
    ],
    rock: [
      "Create a rock bass line with power chord roots and fifths",
      "Use palm-muted notes and aggressive attack",
      "Include driving eighth-note patterns with occasional fills",
      "Apply distortion-friendly intervals and strong downbeats"
    ],
    electronic: [
      "Design an electronic bass with sub-bass frequencies and sidechain",
      "Use step-sequencer quantization with occasional humanization",
      "Include filter sweeps and automation curves",
      "Apply electronic articulation with precise timing"
    ]
  },

  // Chord progressions with voice leading
  harmony: {
    jazz: [
      "Use ii-V-I progressions with extensions (9ths, 11ths, 13ths)",
      "Include secondary dominants and tritone substitutions",
      "Apply voice leading with contrary motion and smooth transitions",
      "Use altered dominants and modal interchange"
    ],
    classical: [
      "Create functional harmony with proper cadences (authentic, plagal, deceptive)",
      "Use secondary dominants and borrowed chords",
      "Apply voice leading with stepwise motion and contrary motion",
      "Include suspensions, retardations, and anticipations"
    ],
    pop: [
      "Use common pop progressions: I-V-vi-IV, vi-IV-I-V",
      "Include inversions to create smooth bass lines",
      "Apply voice leading with minimal movement between chords",
      "Use extended chords sparingly for color"
    ],
    electronic: [
      "Create electronic harmony with stacked fifths and fourths",
      "Use parallel chord movement and filter sweeps",
      "Include sidechain compression and automation",
      "Apply electronic voicings with wide spacing"
    ]
  },

  // Drum patterns with professional feel
  drums: {
    jazz: [
      "Use jazz drum patterns with ride cymbal, hi-hat, and brushes",
      "Include ghost notes on snare and bass drum",
      "Apply swing feel with triplet subdivisions",
      "Use dynamic variation and subtle fills"
    ],
    rock: [
      "Create rock drum patterns with strong backbeat on snare",
      "Use crash cymbals on downbeats and hi-hat on off-beats",
      "Include tom fills and drum rolls",
      "Apply consistent velocity with occasional accents"
    ],
    electronic: [
      "Design electronic drum patterns with 4/4 kick and snare",
      "Use programmed hi-hat patterns with velocity variation",
      "Include electronic percussion and synthetic sounds",
      "Apply sidechain compression and automation"
    ],
    funk: [
      "Create funk drum patterns with syncopated snare hits",
      "Use ghost notes and rim shots for texture",
      "Include open hi-hat on off-beats and closed on downbeats",
      "Apply dynamic variation and subtle fills"
    ]
  }
};

// Professional MIDI generation with sophisticated patterns
export const generateProfessionalMidi = async (
  prompt: string, 
  config: ApiConfig, 
  bpm?: number, 
  preferences?: LearnedPreferences,
  analysisResult?: AnalysisResult
): Promise<MidiGenerationResult> => {
  
  // Analyze the prompt to determine style and complexity
  const styleAnalysis = analyzePromptStyle(prompt);
  const complexityLevel = determineComplexityLevel(preferences, analysisResult);
  
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

STYLE-SPECIFIC REQUIREMENTS:`;

  // Add style-specific requirements
  if (styleAnalysis.isJazz) {
    fullPrompt += `
JAZZ STYLE:
- Use bebop scales, blue notes, and chromatic approach tones
- Apply swing feel with triplet subdivisions and off-beat accents
- Include jazz articulation: scoops, falls, bends, and vibrato
- Use sophisticated chord progressions with extensions and alterations
- Create call-and-response phrasing and improvisational elements`;
  }

  if (styleAnalysis.isClassical) {
    fullPrompt += `
CLASSICAL STYLE:
- Use proper classical form with clear phrase structure
- Apply classical articulation and ornamentation
- Include counterpoint and polyphonic texture
- Use functional harmony with proper voice leading
- Create melodic development through sequence and imitation`;
  }

  if (styleAnalysis.isRock) {
    fullPrompt += `
ROCK STYLE:
- Use power chords, pentatonic scales, and blues elements
- Apply aggressive articulation with strong downbeats
- Include guitar techniques: bends, slides, hammer-ons, pull-offs
- Use driving rhythms with syncopation and anticipation
- Create energy through dynamic contrast and rhythmic intensity`;
  }

  if (styleAnalysis.isElectronic) {
    fullPrompt += `
ELECTRONIC STYLE:
- Use arpeggiated patterns and step-sequencer style quantization
- Apply sidechain compression and filter automation
- Include electronic articulation with precise timing
- Use parallel harmony and wide voicings
- Create electronic textures through synthesis and effects`;
  }

  fullPrompt += `

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

Prompt: "${prompt}"`;

  if (bpm) {
    fullPrompt += `\n\nPlease match the tempo: ${bpm} BPM.`;
  }

  if (analysisResult) {
    fullPrompt += `\n\nREFERENCE ANALYSIS:
- Key: ${analysisResult.key}
- Genre: ${analysisResult.genre}
- Mood: ${analysisResult.mood}
- BPM: ${analysisResult.bpm}
- Instruments: ${analysisResult.instruments.join(', ')}
- Chords: ${analysisResult.chords.join(' - ')}
Use this analysis to inform your composition style and approach.`;
  }

  if (preferences) {
    const topStyle = getTopPreference(preferences.style);
    const topMood = getTopPreference(preferences.mood);
    const topKey = getTopPreference(preferences.key);
    const topPattern = getTopPreference(preferences.pattern);
    const topHumanization = getTopPreference(preferences.humanization);
    
    let preferencePrompt = "\n\nLEARNED MUSICAL PREFERENCES (apply these to create personalized professional music):\n";
    const prefs = [];
    if (topStyle) prefs.push(`Style: ${topStyle} (use ${topStyle} characteristics, instruments, and musical elements)`);
    if (topMood) prefs.push(`Mood: ${topMood} (create music that conveys ${topMood} emotions and energy)`);
    if (topKey) prefs.push(`Key: ${topKey} (use ${topKey} as the primary key center)`);
    if (topPattern) prefs.push(`Rhythmic Pattern: ${topPattern} (use ${topPattern} rhythmic patterns and phrasing)`);
    if (topHumanization) prefs.push(`Performance Feel: ${topHumanization} (apply ${topHumanization} timing and expression)`);

    if (prefs.length > 0) {
      fullPrompt += preferencePrompt + prefs.join("\n") + "\n\nIncorporate these learned preferences into your professional composition to match the user's musical style and create music that sounds like their preferred musical characteristics.";
    }
  }

  // Add professional pattern requirements if analysis is available
  if (analysisResult) {
    const { generateProfessionalPatterns } = await import('./patternAnalysisService');
    const patternRequirements = generateProfessionalPatterns(analysisResult);
    fullPrompt += patternRequirements;
  }

  // Call the existing generateMidi function with the enhanced prompt
  const { generateMidi } = await import('./geminiService');
  const result = await generateMidi(fullPrompt, config, bpm, preferences);
  
  // Enhance the result with professional patterns
  if (analysisResult) {
    const { enhanceMidiWithProfessionalPatterns } = await import('./patternAnalysisService');
    const enhancedResult = enhanceMidiWithProfessionalPatterns(result, analysisResult);
    
    // Validate and enhance the MIDI quality
    const { validateAndEnhanceMidi } = await import('./midiValidationService');
    return validateAndEnhanceMidi(enhancedResult);
  }
  
  // Validate and enhance the MIDI quality
  const { validateAndEnhanceMidi } = await import('./midiValidationService');
  return validateAndEnhanceMidi(result);
};

// Analyze prompt to determine musical style
function analyzePromptStyle(prompt: string): {
  isJazz: boolean;
  isClassical: boolean;
  isRock: boolean;
  isElectronic: boolean;
} {
  const lowerPrompt = prompt.toLowerCase();
  
  const jazzKeywords = ['jazz', 'swing', 'bebop', 'blues', 'improvisation', 'saxophone', 'trumpet', 'walking bass'];
  const classicalKeywords = ['classical', 'orchestral', 'symphony', 'chamber', 'baroque', 'romantic', 'violin', 'piano'];
  const rockKeywords = ['rock', 'metal', 'punk', 'guitar', 'distortion', 'power chord', 'riff', 'solo'];
  const electronicKeywords = ['electronic', 'synth', 'techno', 'house', 'ambient', 'digital', 'sequencer', 'arpeggio'];
  
  return {
    isJazz: jazzKeywords.some(keyword => lowerPrompt.includes(keyword)),
    isClassical: classicalKeywords.some(keyword => lowerPrompt.includes(keyword)),
    isRock: rockKeywords.some(keyword => lowerPrompt.includes(keyword)),
    isElectronic: electronicKeywords.some(keyword => lowerPrompt.includes(keyword))
  };
}

// Determine complexity level based on preferences and analysis
function determineComplexityLevel(preferences?: LearnedPreferences, analysisResult?: AnalysisResult): 'simple' | 'moderate' | 'complex' | 'very-complex' {
  if (!preferences && !analysisResult) return 'moderate';
  
  // Analyze harmonic complexity from preferences
  let complexityScore = 0.5; // Default moderate
  
  if (preferences) {
    const harmonicComplexity = Object.values(preferences.harmonic_complexity || {});
    if (harmonicComplexity.length > 0) {
      complexityScore = Math.max(...harmonicComplexity);
    }
  }
  
  if (analysisResult) {
    // Analyze chord complexity
    const chordComplexity = analysisResult.chords.reduce((score, chord) => {
      if (chord.includes('maj7') || chord.includes('min7') || chord.includes('7')) score += 0.2;
      if (chord.includes('9') || chord.includes('11') || chord.includes('13')) score += 0.3;
      if (chord.includes('sus') || chord.includes('add')) score += 0.2;
      if (chord.includes('b') || chord.includes('#')) score += 0.1;
      return score;
    }, 0) / analysisResult.chords.length;
    
    complexityScore = Math.max(complexityScore, chordComplexity);
  }
  
  if (complexityScore < 0.3) return 'simple';
  if (complexityScore < 0.6) return 'moderate';
  if (complexityScore < 0.8) return 'complex';
  return 'very-complex';
}

// Get top preference from learned preferences
function getTopPreference(weights: { [key: string]: number }): string | null {
  const entries = Object.entries(weights);
  if (entries.length === 0) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

// Professional MIDI validation and enhancement
export const enhanceMidiWithProfessionalPatterns = (midiResult: MidiGenerationResult): MidiGenerationResult => {
  const enhancedTracks = midiResult.tracks.map(track => {
    const enhancedNotes = track.notes.map(note => {
      // Apply professional timing variations
      const timingVariation = (Math.random() - 0.5) * 0.02; // ±20ms
      
      // Apply professional velocity curves
      let enhancedVelocity = note.velocity;
      if (note.velocity < 60) {
        enhancedVelocity = Math.max(30, note.velocity + (Math.random() - 0.5) * 10);
      } else if (note.velocity > 100) {
        enhancedVelocity = Math.min(127, note.velocity + (Math.random() - 0.5) * 15);
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
  });
  
  return {
    ...midiResult,
    tracks: enhancedTracks
  };
};
