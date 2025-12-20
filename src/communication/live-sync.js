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
 *   │  4. MORPH              Idiomorph to update DOM          │
 *   │                        (preserves focus, input values)  │
 *   └─────────────────────────────────────────────────────────┘
 *
 * DEPENDS ON: Idiomorph (for intelligent DOM morphing)
 * INTEGRATES WITH: snapshot.js (receives snapshot-ready events)
 */

class LiveSync {
  constructor() {
    this.sse = null;
    this.currentFile = null;
    this.lastHeadHash = null;
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
   * Generate or retrieve a persistent client ID
   */
  generateClientId() {
    let id = null;

    try {
      id = localStorage.getItem('livesync-client-id');
    } catch (e) {
      // localStorage might not be available
    }

    if (!id) {
      id = Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
      try {
        localStorage.setItem('livesync-client-id', id);
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

      // Check for head changes -> full reload
      // Only compare when BOTH hashes exist (server must send headHash)
      // Only set lastHeadHash when incoming hash is valid
      if (headHash) {
        if (this.lastHeadHash && headHash !== this.lastHeadHash) {
          console.log('[LiveSync] Head changed, reloading');
          location.reload();
          return;
        }
        this.lastHeadHash = headHash;
      }

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
   * This replaces DOM observation — we sync when save happens.
   */
  listenForSnapshots() {
    this._snapshotHandler = (event) => {
      if (this.isPaused) return;

      const { body } = event.detail;
      if (!body) return;

      this.sendBody(body);
    };

    document.addEventListener('hyperclay:snapshot-ready', this._snapshotHandler);
  }

  /**
   * Send body HTML to the server (debounced)
   * Only updates lastBodyHtml after successful save
   */
  sendBody(body) {
    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      // Skip if unchanged
      if (body === this.lastBodyHtml) return;

      console.log('[LiveSync] Sending update');

      // Compute head hash to send to server (for hosted mode)
      const headHash = this.computeHeadHash();
      this.lastHeadHash = headHash; // Track local head changes

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
   * Compute MD5-like hash of head content (first 8 hex chars)
   * Uses a simple string hash since we don't have crypto in browser
   */
  computeHeadHash() {
    const head = document.head?.innerHTML;
    if (!head) return null;

    // Simple hash function (djb2)
    let hash = 5381;
    for (let i = 0; i < head.length; i++) {
      hash = ((hash << 5) + hash) + head.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    // Convert to hex and take first 8 chars
    return Math.abs(hash).toString(16).padStart(8, '0').slice(0, 8);
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

      // Use Idiomorph if available
      const morphFn = window.Idiomorph?.morph;

      if (morphFn) {
        morphFn(document.body, temp, {
          morphStyle: 'innerHTML',
          ignoreActiveValue: true
        });
      } else {
        // Fallback to innerHTML
        console.warn('[LiveSync] Idiomorph not available, using innerHTML fallback');
        document.body.innerHTML = bodyHtml;
      }

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
