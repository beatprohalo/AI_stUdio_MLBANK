import { vi } from 'vitest';

class ResizeObserver {
  observe() {
    // do nothing
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
}

vi.stubGlobal('ResizeObserver', ResizeObserver);
