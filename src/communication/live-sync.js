/**
 * live-sync.js — Real-time sync between admin users
 *
 * HOW IT WORKS:
 *
 *   ┌─────────────────────────────────────────────────────────┐
 *   │  1. LISTEN            snapshot-ready event from save    │
 *   │                       (full document with form values)  │
 *   └─────────────────────────────────────────────────────────┘
 *                              │
 *                              ▼
 *   ┌─────────────────────────────────────────────────────────┐
 *   │  2. SEND               POST html to /live-sync/save     │
 *   │                        (debounced, skip if unchanged)   │
 *   └─────────────────────────────────────────────────────────┘
 *                              │
 *                              ▼
 *   ┌─────────────────────────────────────────────────────────┐
 *   │  3. RECEIVE            SSE stream from server           │
 *   │                        (other clients' changes)         │
 *   └─────────────────────────────────────────────────────────┘
 *                              │
 *                              ▼
 *   ┌─────────────────────────────────────────────────────────┐
 *   │  4. MORPH              HyperMorph full documentElement  │
 *   │                        (preserves focus, input values)  │
 *   └─────────────────────────────────────────────────────────┘
 *
 * INTEGRATES WITH: snapshot.js (receives snapshot-ready events)
 */

import { HyperMorph } from "../vendor/hyper-morph.vendor.js";
import Mutation from "../utilities/mutation.js";

class LiveSync {
  constructor() {
    this.sse = null;
    this.currentFile = null;
    this.lastHtml = null;
    this.clientId = this.generateClientId();
    this.debounceMs = 150;
    this.debounceTimer = null;
    this.isPaused = false;
    this.isDestroyed = false;
    this.debug = false;

    // Store handler reference for cleanup
    this._snapshotHandler = null;

    // High-water mark of server seqs we've seen on this channel (own echoes
    // count too). Server-broadcast payloads carry a monotonic seq
    // (Date.now()-based). We drop anything <= this to guard against rare
    // cases where a stale message lands after a newer one — e.g. buffered
    // replay, alt backend after reconnect, or an own-save echo arriving
    // after a peer's newer broadcast.
    this.lastSeenSeq = 0;

    // Promise chain used to serialize overlapping applyUpdate() calls.
    // A morph with external scripts returns a Promise; without chaining, two
    // SSE events arriving back-to-back would interleave their morphs on the
    // same DOM.
    this._applyChain = Promise.resolve();

    // Callbacks
    this.onConnect = null;
    this.onDisconnect = null;
    this.onUpdate = null;
    this.onError = null;
    this.onNotification = null;
  }

  _log(message, data = null) {
    if (!this.debug) return;
    const prefix = `[LiveSync ${new Date().toISOString()}]`;
    if (data !== null) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
    }
  }

  /**
   * Generate or retrieve a tab-specific client ID
   * Uses sessionStorage (unique per tab) not localStorage (shared across tabs)
   */
  generateClientId() {
    let id = null;

    try {
      id = sessionStorage.getItem('livesync-client-id');
    } catch (e) {
      // sessionStorage might not be available
    }

    if (!id) {
      id = Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
      try {
        sessionStorage.setItem('livesync-client-id', id);
      } catch (e) {
        // That's okay
      }
    }

    return id;
  }

  /**
   * Start the LiveSync system
   * Can be called after stop() to restart with a new file
   */
  start(file = null) {
    // Reset destroyed flag to allow restart after stop()
    this.isDestroyed = false;

    // Prevent double-connect: clean up existing connection first
    if (this.sse || this._snapshotHandler) {
      this.cleanup();
    }

    this.currentFile = file || this.detectCurrentFile();

    if (!this.currentFile) {
      console.warn('[LiveSync] No file detected');
      return;
    }

    // Reset state for new connection
    this.lastHtml = null;
    this.lastSeenSeq = 0;
    this._applyChain = Promise.resolve();

    console.log('[LiveSync] Starting for:', this.currentFile);
    this.connect();
    this.listenForSnapshots();
  }

  /**
   * Clean up resources without marking as destroyed
   * Used internally by start() to prevent double-connect
   */
  cleanup() {
    if (this.sse) {
      this.sse.close();
      this.sse = null;
    }

    if (this._snapshotHandler) {
      document.removeEventListener('hyperclay:snapshot-ready', this._snapshotHandler);
      this._snapshotHandler = null;
    }

    clearTimeout(this.debounceTimer);
  }

  /**
   * Auto-detect the current site file path from the URL
   * Returns the path including extension (e.g., card-canvas.html)
   *
   * Handles:
   * - /                           -> index.html
   * - /about.html                 -> about.html
   * - /about.htmlclay             -> about.htmlclay
   * - /about.html/dashboard       -> about.html  (SPA route stripped)
   * - /blog/app.htmlclay/settings -> blog/app.htmlclay  (SPA route stripped)
   */
  detectCurrentFile() {
    let pathname = window.location.pathname;

    if (pathname === '/') {
      return 'index.html';
    }

    pathname = pathname.replace(/^\//, '');

    const htmlMatch = pathname.match(/^(.*?\.html(?:clay)?)/);
    if (htmlMatch) return htmlMatch[1];

    return pathname;
  }

  /**
   * Connect to the SSE endpoint
   * Uses native EventSource reconnection behavior
   */
  connect() {
    if (this.isDestroyed) return;

    const pageUrl = encodeURIComponent(window.location.href);
    const url = `/live-sync/stream?page-url=${pageUrl}`;
    this.sse = new EventSource(url);

    this.sse.onopen = () => {
      console.log('[LiveSync] Connected');
      if (this.onConnect) this.onConnect();
    };

    this.sse.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Handle notifications (show toast, don't morph)
      if (data.type === "notification") {
        this.handleNotification(data);
        return;
      }

      // Handle error events from server
      if (data.error) {
        console.error('[LiveSync] Server error:', data.error);
        if (this.onError) this.onError(new Error(data.error));
        return;
      }

      const { html, sender, seq } = data;

      // Staleness check runs FIRST — compared against the high-water mark of
      // seqs we've seen (own echoes count too, see below). `seq` is optional
      // for back-compat with older server builds that don't stamp it.
      if (typeof seq === 'number' && seq <= this.lastSeenSeq) {
        this._log(`Dropping stale message: seq=${seq}, lastSeen=${this.lastSeenSeq}`);
        return;
      }

      // Advance the watermark before the sender filter so that our own save
      // echoes count toward "seen". Without this, a later buffered/replayed
      // peer message with a smaller seq could rewind us past our local edit.
      if (typeof seq === 'number') {
        this.lastSeenSeq = seq;
      }

      // Ignore own changes — already reflected in the DOM, nothing to morph
      if (sender === this.clientId) {
        this._log('Ignoring own message (sender matches clientId)');
        return;
      }

      // Guard against invalid html
      if (typeof html !== 'string') {
        console.error('[LiveSync] Received invalid html, ignoring');
        return;
      }

      this._log(`Received update from: ${sender} (my clientId: ${this.clientId}, seq=${seq})`);
      this.applyUpdate(html, seq);
      if (this.onUpdate) this.onUpdate({ html, sender, seq });
    };

    // Native EventSource auto-reconnects on transient errors
    // We just surface the status via callbacks
    this.sse.onerror = () => {
      if (this.sse.readyState === EventSource.CONNECTING) {
        console.log('[LiveSync] Reconnecting...');
      } else if (this.sse.readyState === EventSource.CLOSED) {
        console.log('[LiveSync] Connection closed');
        if (this.onError) this.onError(new Error('Connection closed'));
      }
      if (this.onDisconnect) this.onDisconnect();
    };
  }

  /**
   * Listen for snapshot-ready events from the save system.
   * Receives the full cloned documentElement and sends it.
   */
  listenForSnapshots() {
    this._snapshotHandler = (event) => {
      if (this.isPaused) {
        this._log('snapshot-ready received but isPaused, skipping');
        return;
      }

      const { documentElement } = event.detail;
      if (!documentElement) return;

      this._log('snapshot-ready received, preparing to send');
      const html = documentElement.outerHTML;
      this.sendUpdate(html);
    };

    document.addEventListener('hyperclay:snapshot-ready', this._snapshotHandler);
  }

  /**
   * Send full HTML to the server (debounced)
   * Only updates lastHtml after successful save
   */
  sendUpdate(html) {
    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      // Skip if unchanged
      if (html === this.lastHtml) {
        this._log('Skipping send - HTML unchanged');
        return;
      }

      this._log(`Sending update (HTML length: ${html.length}, lastHtml length: ${this.lastHtml?.length || 0})`);

      fetch('/live-sync/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Page-URL': window.location.href },
        body: JSON.stringify({
          html: html,
          sender: this.clientId
        })
      }).then(response => {
        if (response.ok) {
          this.lastHtml = html;
        } else {
          console.warn('[LiveSync] Save returned status:', response.status);
        }
      }).catch(err => {
        console.error('[LiveSync] Save failed:', err);
        if (this.onError) this.onError(err);
      });
    }, this.debounceMs);
  }

  /**
   * Apply an update received from the server.
   * Morphs the entire document (head and body).
   *
   * Serialized via a promise chain so concurrent SSE events don't produce
   * overlapping morphs (morph can return a Promise when external scripts load).
   *
   * @param {string} html - Full document HTML
   * @param {number} [seq] - Optional monotonic seq from the server
   * @returns {Promise<void>}
   */
  applyUpdate(html, seq) {
    // Serialize concurrent updates onto a single promise chain. `.catch` on
    // the combined result both logs the failure (so it isn't a silent
    // unhandled rejection) AND heals the chain so subsequent updates aren't
    // blocked by it. `_applyChain` and the returned promise are the same
    // caught promise — callers that fire-and-forget are safe.
    const result = this._applyChain
      .then(() => this._doApplyUpdate(html, seq))
      .catch((err) => {
        console.error('[LiveSync] applyUpdate failed:', err);
      });
    this._applyChain = result;
    return result;
  }

  /**
   * Actual morph work. Do not call directly — use applyUpdate() so calls
   * serialize.
   * @param {string} html
   * @param {number} [seq]
   * @returns {Promise<void>}
   */
  async _doApplyUpdate(html, seq) {
    this._log('applyUpdate - pausing mutations and morphing');
    this.isPaused = true;

    // Preserve scroll position: a remote edit that inserts or removes content
    // above the viewport would otherwise cause a visible jump. Capturing here
    // and restoring after the morph keeps the viewport stable. Browser
    // scroll-clamping handles the case where the document is now shorter.
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    // Pause mutation observer so morph doesn't trigger autosave
    Mutation.pause();

    // Parse as full document
    const parser = new DOMParser();
    const newDoc = parser.parseFromString(html, 'text/html');

    try {
      // Morph entire document. We MUST await — HyperMorph.morph returns a
      // Promise when `scripts: { handle: true }` needs to wait for external
      // scripts to load. If we don't await, Mutation.resume() fires before
      // late-loading scripts execute, and any DOM mutations they trigger look
      // like user edits → the receiving tab rebroadcasts them (feedback loop).
      await HyperMorph.morph(document.documentElement, newDoc.documentElement, {
        morphStyle: 'outerHTML',
        ignoreActiveValue: true,
        head: { style: 'merge' },
        scripts: { handle: true, matchMode: 'smart' }
      });

      // Restore viewport. Done after morph so layout has settled.
      window.scrollTo(scrollX, scrollY);

      // Only mark lastHtml after a successful morph so that a failed apply
      // doesn't desync our state and cause the next outbound save to be
      // mistakenly skipped as "unchanged". Note: lastSeenSeq is advanced at
      // receive time (in onmessage) so the staleness check covers own-save
      // echoes even when they don't reach this point.
      this.lastHtml = html;
    } finally {
      this._log('applyUpdate - morph complete, resuming mutations');
      Mutation.resume();
      // Defer past microtask boundary — MutationObserver callbacks fire before
      // this, so isPaused catches any stray snapshots from the morph itself.
      await new Promise((resolve) => setTimeout(resolve, 0));
      this.isPaused = false;
    }
  }

  /**
   * Handle a notification message from the server
   * Shows a toast and emits an event for custom handling
   * @param {Object} data - { msgType, msg, action?, persistent? }
   */
  handleNotification({ msgType, msg, action, persistent }) {
    this._log(`Notification received: ${msgType} - ${msg}`);

    // Show toast if available
    if (persistent && window.toastPersistent) {
      window.toastPersistent(msg, msgType);
    } else if (window.toast) {
      window.toast(msg, msgType);
    } else {
      console.log(`[LiveSync] Notification: ${msg}`);
    }

    // Emit event for custom handling (e.g., reload button)
    document.dispatchEvent(new CustomEvent('hyperclay:notification', {
      detail: { msgType, msg, action, persistent }
    }));

    // Call notification callback if set
    if (this.onNotification) {
      this.onNotification({ msgType, msg, action, persistent });
    }
  }

  /**
   * Stop LiveSync and clean up resources
   * Can call start() again to restart
   */
  stop() {
    this.cleanup();
    this.isDestroyed = true;
    console.log('[LiveSync] Stopped');
  }
}

// Singleton instance
const liveSync = new LiveSync();

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => liveSync.start());
  } else {
    liveSync.start();
  }
}

// Export for hyperclayjs module system
export { liveSync };
export default liveSync;
