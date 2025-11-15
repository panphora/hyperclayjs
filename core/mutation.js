/**
 * Mutation Observer Utility
 * Provides a simple interface for observing DOM mutations
 */

export class Mutation {
  constructor(callback, options = {}) {
    this.callback = callback;
    this.options = {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true,
      ...options
    };
    this.observer = null;
  }

  observe(target = document.body) {
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver(this.callback);
    this.observer.observe(target, this.options);
    return this;
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    return this;
  }

  // Static method for one-time observations
  static observe(target, callback, options) {
    const mutation = new Mutation(callback, options);
    return mutation.observe(target);
  }
}

// Export to window for global access
export function exportToWindow() {
  if (typeof window !== 'undefined') {
    window.Mutation = Mutation;
  }
}

// Auto-export if in browser
if (typeof window !== 'undefined') {
  exportToWindow();
}

export default Mutation;