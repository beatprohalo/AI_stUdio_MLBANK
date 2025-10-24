// Web Worker Manager for MIDI processing
// Handles worker lifecycle and prevents memory leaks

interface WorkerTask {
  id: string;
  worker: Worker;
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

class WorkerManager {
  private workers: Map<string, WorkerTask> = new Map();
  private workerPool: Worker[] = [];
  private maxWorkers = 2; // Limit concurrent workers
  private taskQueue: Array<{
    id: string;
    type: string;
    data: any;
    resolve: (value: any) => void;
    reject: (error: Error) => void;
  }> = [];

  constructor() {
    // Pre-create worker pool
    this.initializeWorkerPool();
  }

  private initializeWorkerPool() {
    // For now, disable workers due to Vite configuration issues
    // Workers will be created on-demand in executeTask
    console.log('Worker pool initialization skipped - using main thread fallback');
  }

  async executeTask(type: string, data: any, timeoutMs = 30000): Promise<any> {
    // Always use main thread for now due to Vite configuration issues
    console.log('Executing task on main thread:', type);
    return this.executeOnMainThread(type, data);
  }

  private async executeOnMainThread(type: string, data: any): Promise<any> {
    // Fallback to main thread execution
    const { generateMidi, generateAudioFromMidi } = await import('./geminiService');
    
    switch (type) {
      case 'generateMidi':
        return await generateMidi(data.prompt, data.config, data.bpm, data.preferences, data.analysisResult);
      case 'processAudio':
        return await generateAudioFromMidi(data.midiResult, data.preferences);
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  private cleanupTask(id: string) {
    const task = this.workers.get(id);
    if (task) {
      clearTimeout(task.timeout);
      task.worker.terminate();
      this.workers.delete(id);
    }
  }

  // Clean up all workers
  cleanup() {
    // Clear all timeouts
    this.workers.forEach(task => {
      clearTimeout(task.timeout);
      task.worker.terminate();
    });
    this.workers.clear();
    
    // Clear worker pool
    this.workerPool.forEach(worker => worker.terminate());
    this.workerPool = [];
    
    // Clear task queue
    this.taskQueue.forEach(task => {
      task.reject(new Error('Worker manager cleanup'));
    });
    this.taskQueue = [];
  }

  // Get memory usage info
  getMemoryInfo() {
    return {
      activeWorkers: this.workers.size,
      availableWorkers: this.workerPool.length,
      queuedTasks: this.taskQueue.length
    };
  }
}

// Singleton instance
export const workerManager = new WorkerManager();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    workerManager.cleanup();
  });
}

export default WorkerManager;
