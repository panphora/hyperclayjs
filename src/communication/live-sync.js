/**
 * hyperclayjs/src/communication/live-sync.js
 *
 * Browser-side LiveSync: SSE receiving + DOM observation + sending changes
 *
 * WHAT THIS FILE DOES:
 * 1. Connects to the server's SSE endpoint
 * 2. Receives updates and morphs the DOM
 * 3. Watches for local DOM changes
 * 4. Sends local changes to the server
 *
 * DEPENDS ON: Idiomorph (for intelligent DOM morphing)
 */

class LiveSync {
  constructor() {
    this.sse = null;
    this.observer = null;
    this.currentFile = null;
    this.lastHeadHash = null;
    this.lastBodyHtml = null;
    this.clientId = this.generateClientId();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.debounceMs = 150;
    this.debounceTimer = null;
    this.isPaused = false;
    this.isDestroyed = false;

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
   */
  start(file = null) {
    if (this.isDestroyed) return;

    this.currentFile = file || this.detectCurrentFile();

    if (!this.currentFile) {
      console.warn('[LiveSync] No file detected');
      return;
    }

    console.log('[LiveSync] Starting for:', this.currentFile);
    this.connect();
    this.observeChanges();
  }

  /**
   * Auto-detect the current HTML file from the URL
   */
  detectCurrentFile() {
    const pathname = window.location.pathname;

    if (pathname === '/') return 'index.html';

    const name = pathname.replace(/^\//, '').replace(/\.html$/, '');
    return `${name}.html`;
  }

  /**
   * Connect to the SSE endpoint
   */
  connect() {
    if (this.isDestroyed) return;

    const url = `/live-sync/stream?file=${encodeURIComponent(this.currentFile)}`;
    this.sse = new EventSource(url);

    this.sse.onopen = () => {
      console.log('[LiveSync] Connected');
      this.reconnectAttempts = 0;
      if (this.onConnect) this.onConnect();
    };

    this.sse.onmessage = (event) => {
      const { body, headHash, sender } = JSON.parse(event.data);

      // Ignore own changes
      if (sender === this.clientId) return;

      // Check for head changes -> full reload
      if (this.lastHeadHash && headHash !== this.lastHeadHash) {
        console.log('[LiveSync] Head changed, reloading');
        location.reload();
        return;
      }
      this.lastHeadHash = headHash;

      console.log('[LiveSync] Received update from:', sender);
      this.applyUpdate(body);
      if (this.onUpdate) this.onUpdate({ body, sender });
    };

    this.sse.onerror = () => {
      console.log('[LiveSync] Connection error');
      if (this.onDisconnect) this.onDisconnect();

      if (this.sse.readyState === EventSource.CLOSED) {
        this.handleReconnect();
      }
    };
  }

  /**
   * Start observing the DOM for changes
   */
  observeChanges() {
    this.observer = new MutationObserver(() => {
      if (this.isPaused) return;
      this.sendUpdate();
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });

    // Form input listener (MutationObserver misses value changes)
    document.body.addEventListener('input', (e) => {
      if (this.isPaused) return;
      if (e.target.matches('input, textarea, select')) {
        this.sendUpdate();
      }
    });
  }

  /**
   * Send the current body HTML to the server (debounced)
   */
  sendUpdate() {
    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      const body = document.body.innerHTML;

      // Skip if unchanged
      if (body === this.lastBodyHtml) return;
      this.lastBodyHtml = body;

      console.log('[LiveSync] Sending update');

      fetch('/live-sync/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: this.currentFile,
          body: body,
          sender: this.clientId
        })
      }).catch(err => {
        console.error('[LiveSync] Save failed:', err);
        if (this.onError) this.onError(err);
      });
    }, this.debounceMs);
  }

  /**
   * Apply an update received from the server
   */
  applyUpdate(bodyHtml) {
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
   * Handle reconnection with exponential backoff
   */
  handleReconnect() {
    if (this.isDestroyed) return;

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[LiveSync] Max reconnection attempts reached');
      if (this.onError) this.onError(new Error('Max reconnection attempts'));
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    console.log(`[LiveSync] Reconnecting in ${delay}ms`);
    setTimeout(() => this.connect(), delay);
  }

  /**
   * Stop LiveSync and clean up resources
   */
  stop() {
    this.isDestroyed = true;

    if (this.sse) {
      this.sse.close();
      this.sse = null;
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    clearTimeout(this.debounceTimer);
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
