/**
 * @jest-environment jsdom
 *
 * Lane behavior for view-mode livesync: edit-mode tabs ride the 'live' lane
 * (send + receive), view-mode tabs ride the 'saved' lane (receive-only, fed
 * post-strip on-disk HTML by the server).
 */

jest.mock('../src/vendor/hyper-morph.vendor.js', () => ({
  HyperMorph: { morph: jest.fn(() => Promise.resolve()) },
}));

jest.mock('../src/utilities/mutation.js', () => ({
  __esModule: true,
  default: { pause: jest.fn(), resume: jest.fn() },
}));

// jsdom has no EventSource; capture constructed URLs.
let eventSourceUrls;
class FakeEventSource {
  constructor(url) {
    eventSourceUrls.push(url);
    this.readyState = 0;
  }
  close() {}
}

import { LiveSync } from '../src/communication/live-sync.js';

describe('LiveSync lanes', () => {
  let addEventListenerSpy;

  beforeEach(() => {
    eventSourceUrls = [];
    global.EventSource = FakeEventSource;
    window.EventSource = FakeEventSource;
    addEventListenerSpy = jest.spyOn(document, 'addEventListener');
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
    delete global.EventSource;
    delete window.EventSource;
  });

  test('defaults to the saved lane outside edit mode (jsdom has no admin cookie)', () => {
    const sync = new LiveSync();
    expect(sync.lane).toBe('saved');
  });

  test('saved lane connects with lane=saved and registers no snapshot listener', () => {
    const sync = new LiveSync();
    sync.lane = 'saved';
    sync.start('index.html');

    expect(eventSourceUrls).toHaveLength(1);
    expect(eventSourceUrls[0]).toContain('/_/live-sync/stream?page-url=');
    expect(eventSourceUrls[0]).toContain('&lane=saved');

    const snapshotListeners = addEventListenerSpy.mock.calls
      .filter(([event]) => event === 'hyperclay:snapshot-ready');
    expect(snapshotListeners).toHaveLength(0);
    expect(sync._snapshotHandler).toBeNull();

    sync.stop();
  });

  test('live lane connects with lane=live and listens for snapshots', () => {
    const sync = new LiveSync();
    sync.lane = 'live';
    sync.start('index.html');

    expect(eventSourceUrls).toHaveLength(1);
    expect(eventSourceUrls[0]).toContain('&lane=live');

    const snapshotListeners = addEventListenerSpy.mock.calls
      .filter(([event]) => event === 'hyperclay:snapshot-ready');
    expect(snapshotListeners).toHaveLength(1);
    expect(typeof sync._snapshotHandler).toBe('function');

    sync.stop();
  });
});
