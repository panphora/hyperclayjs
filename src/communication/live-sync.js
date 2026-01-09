/**
 * live-sync.js — Real-time sync between admin users
 *
 * HOW IT WORKS:
 *
 *   ┌─────────────────────────────────────────────────────────┐
 *   │  1. LISTEN            snapshot-ready event from save    │
 *   │                       (body with form values, no strip) │
 *   └─────────────────────────────────────────────────────────┘
 *                              │
 *                              ▼
 *   ┌─────────────────────────────────────────────────────────┐
 *   │  2. SEND               POST body to /live-sync/save     │
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
 *   │  4. MORPH              HyperMorph to update DOM          │
 *   │                        (preserves focus, input values)  │
 *   └─────────────────────────────────────────────────────────┘
 *
 * INTEGRATES WITH: snapshot.js (receives snapshot-ready events)
 */

import { HyperMorph } from "../vendor/hyper-morph.vendor.js";

class LiveSync {
  constructor() {
    this.sse = null;
    this.currentFile = null;
    this.initialHeadHash = null;  // This tab's head hash at startup (for detecting local template changes)
    this.lastBodyHtml = null;
    this.clientId = this.generateClientId();
    this.debounceMs = 150;
    this.debounceTimer = null;
    this.isPaused = false;
    this.isDestroyed = false;

    // Store handler reference for cleanup
    this._snapshotHandler = null;

    // Callbacks
    this.onConnect = null;
    this.onDisconnect = null;
    this.onUpdate = null;
    this.onError = null;
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
    this.lastHeadHash = null;
    this.lastBodyHtml = null;

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

      // Handle error events from server
      if (data.error) {
        console.error('[LiveSync] Server error:', data.error);
        if (this.onError) this.onError(new Error(data.error));
        return;
      }

      const { body, headHash, sender } = data;

      // Ignore own changes
      if (sender === this.clientId) return;

      // Guard against invalid body - never apply non-string
      if (typeof body !== 'string') {
        console.error('[LiveSync] Received invalid body (not a string), ignoring');
        return;
      }

      // NOTE: We intentionally ignore the received headHash here.
      // Each tab has its own <head> content which may legitimately differ
      // (load order, injected scripts, browser extensions). Comparing
      // headHash across tabs caused false-positive reloads.
      // Instead, each tab tracks its own initialHeadHash to detect
      // local template changes when sending.

      console.log('[LiveSync] Received update from:', sender);
      this.applyUpdate(body);
      if (this.onUpdate) this.onUpdate({ body, sender });
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
   * Receives the full cloned documentElement and extracts head/body.
   */
  listenForSnapshots() {
    this._snapshotHandler = async (event) => {
      if (this.isPaused) return;

      const { documentElement } = event.detail;
      if (!documentElement) return;

      // Extract head and body directly from cloned element
      const head = documentElement.querySelector('head')?.innerHTML || '';
      const body = documentElement.querySelector('body')?.innerHTML || '';

      // Compute headHash using SHA-256 (async)
      const headHash = await this.computeHeadHash(head);

      // Track initial head hash for this tab (detect local template changes)
      if (!this.initialHeadHash) {
        this.initialHeadHash = headHash;
        console.log('[LiveSync] Initial head hash:', headHash);
      } else if (headHash !== this.initialHeadHash) {
        // Local head changed - template was modified
        // Log but don't block sync (user may have intentionally edited <head>)
        console.warn('[LiveSync] Head changed locally (template modified)');
      }

      // Send update even if body is empty (allows clearing content)
      this.sendUpdate(body, headHash);
    };

    document.addEventListener('hyperclay:snapshot-ready', this._snapshotHandler);
  }

  /**
   * Send body and headHash to the server (debounced)
   * Only updates lastBodyHtml after successful save
   */
  sendUpdate(body, headHash) {
    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      // Skip if unchanged
      if (body === this.lastBodyHtml) return;

      console.log('[LiveSync] Sending update');

      fetch('/live-sync/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: this.currentFile,
          body: body,
          sender: this.clientId,
          headHash: headHash
        })
      }).then(response => {
        if (response.ok) {
          // Only update lastBodyHtml after successful save
          this.lastBodyHtml = body;
        } else {
          // Log non-OK responses but don't suppress future sends
          console.warn('[LiveSync] Save returned status:', response.status);
        }
      }).catch(err => {
        // Network error - don't update lastBodyHtml so next mutation will retry
        console.error('[LiveSync] Save failed:', err);
        if (this.onError) this.onError(err);
      });
    }, this.debounceMs);
  }

  /**
   * Compute SHA-256 hash of head content (first 16 hex chars)
   * Uses SubtleCrypto API (async)
   * @param {string} head - Head innerHTML
   * @returns {Promise<string|null>} 16-char hex hash or null if unavailable
   */
  async computeHeadHash(head) {
    if (!head) return null;

    // SubtleCrypto requires secure context (HTTPS or localhost)
    if (!crypto?.subtle?.digest) {
      console.warn('[LiveSync] SHA-256 unavailable (non-secure context), skipping headHash');
      return null;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(head);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
    } catch (e) {
      console.warn('[LiveSync] SHA-256 hash failed, skipping headHash:', e);
      return null;
    }
  }

  /**
   * Apply an update received from the server
   * Guards against non-string values
   */
  applyUpdate(bodyHtml) {
    // Guard against non-string values
    if (typeof bodyHtml !== 'string') {
      console.error('[LiveSync] applyUpdate called with non-string value, ignoring');
      return;
    }

    this.isPaused = true;
    this.lastBodyHtml = bodyHtml;

    try {
      const temp = document.createElement('div');
      temp.innerHTML = bodyHtml;

      HyperMorph.morph(document.body, temp, {
        morphStyle: 'innerHTML',
        ignoreActiveValue: true
      });

      this.rehydrateFormState(document.body);
    } finally {
      this.isPaused = false;
    }
  }

  /**
   * Sync form control attributes to properties after DOM morph
   */
  rehydrateFormState(container) {
    const focused = document.activeElement;

    // Text inputs and textareas
    container.querySelectorAll('input[value], textarea[value]').forEach(el => {
      if (el === focused) return;
      el.value = el.getAttribute('value') || '';
    });

    // Checkboxes and radios
    container.querySelectorAll('input[type="checkbox"], input[type="radio"]').forEach(el => {
      if (el === focused) return;
      el.checked = el.hasAttribute('checked');
    });

    // Select dropdowns
    container.querySelectorAll('select').forEach(select => {
      if (select === focused) return;
      select.querySelectorAll('option').forEach(opt => {
        opt.selected = opt.hasAttribute('selected');
      });
    });
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
