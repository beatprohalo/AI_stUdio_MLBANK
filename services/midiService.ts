import type { MidiTrack } from '../types';

const TPQN = 480; // Ticks Per Quarter Note - a standard resolution

const createTrackChunk = (track: MidiTrack, bpm: number): Uint8Array => {
    const { notes, trackName } = track;
    const SECONDS_PER_TICK = 60 / (bpm * TPQN);

    type MidiEvent = { tick: number; type: 'on' | 'off'; note: number; velocity: number };
    const events: MidiEvent[] = [];

    notes.forEach(note => {
        const startTick = Math.round(note.time / SECONDS_PER_TICK);
        const endTick = Math.round((note.time + note.duration) / SECONDS_PER_TICK);
        const dynamicVelocity = Math.min(127, Math.max(0, note.velocity + Math.round((note.duration - 0.5) * 15)));

        events.push({ tick: startTick, type: 'on', note: note.note, velocity: dynamicVelocity });
        events.push({ tick: endTick, type: 'off', note: note.note, velocity: 0 });
    });

    events.sort((a, b) => a.tick - b.tick);

    const trackData: number[] = [];
    let lastTick = 0;

    const writeVLQ = (value: number) => {
        let buffer = [];
        buffer.push(value & 0x7F);
        while (value >>= 7) {
            buffer.unshift((value & 0x7F) | 0x80);
        }
        trackData.push(...buffer);
    };

    if (trackName !== 'Tempo Track') {
        writeVLQ(0);
        const tempo = Math.round(60000000 / bpm);
        trackData.push(0xFF, 0x51, 0x03, (tempo >> 16) & 0xFF, (tempo >> 8) & 0xFF, tempo & 0xFF);
    }
    
    if (trackName) {
        writeVLQ(0);
        trackData.push(0xFF, 0x03, trackName.length, ...trackName.split('').map(c => c.charCodeAt(0)));
    }

    events.forEach(event => {
        const delta = event.tick - lastTick;
        writeVLQ(delta);
        const status = event.type === 'on' ? 0x90 : 0x80;
        trackData.push(status, event.note, event.velocity);
        lastTick = event.tick;
    });

    writeVLQ(0);
    trackData.push(0xFF, 0x2F, 0x00); // End of Track

    const mTrkHeader = [
        0x4d, 0x54, 0x72, 0x6b, // "MTrk"
        (trackData.length >> 24) & 0xFF,
        (trackData.length >> 16) & 0xFF,
        (trackData.length >> 8) & 0xFF,
        trackData.length & 0xFF,
    ];
    
    return new Uint8Array([...mTrkHeader, ...trackData]);
};

export const createMidiBlob = (tracks: MidiTrack[], options?: { bpm?: number }): Blob => {
    const { bpm = 120 } = options || {};
    const mThd = [
        0x4d, 0x54, 0x68, 0x64, // "MThd"
        0x00, 0x00, 0x00, 0x06, // Chunk length
        0x00, 0x01,             // Format 1 (multi-track)
        (tracks.length >> 8) & 0xFF, tracks.length & 0xFF, // Number of tracks
        (TPQN >> 8) & 0xFF, TPQN & 0xFF, // Division (TPQN)
    ];

    const trackChunks = tracks.map(track => createTrackChunk(track, bpm));
    
    const combined = new Uint8Array(mThd.length + trackChunks.reduce((sum, chunk) => sum + chunk.length, 0));
    combined.set(new Uint8Array(mThd), 0);
    let offset = mThd.length;
    trackChunks.forEach(chunk => {
        combined.set(chunk, offset);
        offset += chunk.length;
    });

    return new Blob([combined], { type: 'audio/midi' });
};