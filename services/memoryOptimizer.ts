// Memory optimization utilities for MIDI generation
// Prevents memory leaks and manages large data structures

interface MemoryStats {
  used: number;
  total: number;
  limit: number;
  percentage: number;
}

class MemoryOptimizer {
  private static instance: MemoryOptimizer;
  private cleanupCallbacks: Set<() => void> = new Set();
  private memoryThreshold = 80; // 80% memory usage threshold

  static getInstance(): MemoryOptimizer {
    if (!MemoryOptimizer.instance) {
      MemoryOptimizer.instance = new MemoryOptimizer();
    }
    return MemoryOptimizer.instance;
  }

  // Get current memory usage
  getMemoryStats(): MemoryStats | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      const limit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
      const percentage = Math.round((used / limit) * 100);

      return { used, total, limit, percentage };
    }
    return null;
  }

  // Check if memory usage is too high
  isMemoryHigh(): boolean {
    const stats = this.getMemoryStats();
    return stats ? stats.percentage > this.memoryThreshold : false;
  }

  // Force garbage collection if available
  forceGarbageCollection(): void {
    if ('gc' in window) {
      (window as any).gc();
    }
  }

  // Register cleanup callback
  registerCleanup(callback: () => void): () => void {
    this.cleanupCallbacks.add(callback);
    return () => this.cleanupCallbacks.delete(callback);
  }

  // Execute all cleanup callbacks
  cleanup(): void {
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('Cleanup callback failed:', error);
      }
    });
    this.cleanupCallbacks.clear();
  }

  // Optimize large arrays by processing in chunks
  async processInChunks<T>(
    items: T[],
    processor: (chunk: T[]) => void,
    chunkSize = 1000
  ): Promise<void> {
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      processor(chunk);
      
      // Yield control every few chunks
      if (i % (chunkSize * 4) === 0) {
        await new Promise(resolve => {
          if (window.requestIdleCallback) {
            window.requestIdleCallback(resolve, { timeout: 5 });
          } else {
            setTimeout(resolve, 0);
          }
        });
      }
    }
  }

  // Create optimized audio buffer
  createOptimizedAudioBuffer(sampleRate: number, duration: number): {
    leftChannel: Float32Array;
    rightChannel: Float32Array;
    samples: number;
  } {
    const samples = Math.floor(sampleRate * duration);
    
    // Check if buffer would be too large
    const estimatedSize = samples * 2 * 4; // 2 channels * 4 bytes per float
    if (estimatedSize > 50 * 1024 * 1024) { // 50MB limit
      throw new Error('Audio buffer would be too large, reducing duration');
    }

    return {
      leftChannel: new Float32Array(samples),
      rightChannel: new Float32Array(samples),
      samples
    };
  }

  // Monitor memory and trigger cleanup if needed
  startMemoryMonitoring(): () => void {
    const interval = setInterval(() => {
      if (this.isMemoryHigh()) {
        console.warn('High memory usage detected, triggering cleanup');
        this.cleanup();
        this.forceGarbageCollection();
      }
    }, 5000);

    return () => clearInterval(interval);
  }

  // Optimize MIDI data for memory efficiency
  optimizeMidiData(midiResult: any): any {
    // Remove unnecessary properties
    const optimized = {
      description: midiResult.description,
      bpm: midiResult.bpm,
      tracks: midiResult.tracks.map((track: any) => ({
        trackName: track.trackName,
        notes: track.notes.map((note: any) => ({
          note: note.note,
          velocity: note.velocity,
          time: Math.round(note.time * 1000) / 1000, // Round to 3 decimal places
          duration: Math.round(note.duration * 1000) / 1000
        }))
      }))
    };

    return optimized;
  }
}

export const memoryOptimizer = MemoryOptimizer.getInstance();
export default MemoryOptimizer;
