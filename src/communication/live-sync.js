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
   * Auto-detect the current site identifier from the URL
   * Returns site ID without .html extension
   *
   * Handles:
   * - /                  -> index
   * - /about             -> about
   * - /about.html        -> about
   * - /about/            -> about/index
   * - /pages/contact     -> pages/contact
   * - /pages/contact/    -> pages/contact/index
   */
  detectCurrentFile() {
    let pathname = window.location.pathname;

    // Root path
    if (pathname === '/') {
      return 'index';
    }

    // Remove leading slash
    pathname = pathname.replace(/^\//, '');

    // Handle trailing slash -> directory index
    if (pathname.endsWith('/')) {
      return pathname + 'index';
    }

    // Remove .html extension if present
    if (pathname.endsWith('.html')) {
      return pathname.slice(0, -5);
    }

    // Already a site identifier
    return pathname;
  }

  /**
   * Connect to the SSE endpoint
   * Uses native EventSource reconnection behavior
   */
  connect() {
    if (this.isDestroyed) return;

    const url = `/live-sync/stream?file=${encodeURIComponent(this.currentFile)}`;
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

      const { html, sender } = data;

      // Ignore own changes
      if (sender === this.clientId) {
        this._log('Ignoring own message (sender matches clientId)');
        return;
      }

      // Guard against invalid html
      if (typeof html !== 'string') {
        console.error('[LiveSync] Received invalid html, ignoring');
        return;
      }

      this._log(`Received update from: ${sender} (my clientId: ${this.clientId})`);
      this.applyUpdate(html);
      if (this.onUpdate) this.onUpdate({ html, sender });
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: this.currentFile,
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
   * Apply an update received from the server
   * Morphs the entire document (head and body)
   */
  applyUpdate(html) {
    this._log('applyUpdate - pausing mutations and morphing');
    this.isPaused = true;
    this.lastHtml = html;

    // Pause mutation observer so morph doesn't trigger autosave
    Mutation.pause();

    // Parse as full document
    const parser = new DOMParser();
    const newDoc = parser.parseFromString(html, 'text/html');

    // Morph entire document (html element)
    HyperMorph.morph(document.documentElement, newDoc.documentElement, {
      morphStyle: 'outerHTML',
      ignoreActiveValue: true,
      head: { style: 'merge' },
      scripts: { handle: true, matchMode: 'smart' }
    });

    this._log('applyUpdate - morph complete, resuming mutations');
    Mutation.resume();
    this.isPaused = false;
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
