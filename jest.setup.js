// Runs before each test file's modules load.

// jsdom (as bundled with jest-environment-jsdom 30) does not provide
// EventSource. live-sync.js auto-instantiates a singleton at module load
// and that singleton calls `new EventSource(...)` from start(). Without
// this stub, importing live-sync.js (or anything that pulls it in)
// throws ReferenceError before any test code runs.
if (typeof globalThis.EventSource === 'undefined') {
  globalThis.EventSource = class EventSourceStub {
    constructor() {
      this.readyState = 0;
    }
    close() {}
    addEventListener() {}
    removeEventListener() {}
  };
}
