/**
 * Cookie Management Utility
 * Simple interface for reading and writing cookies
 */

class Cookie {
  get(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(';').shift();
    }
    return null;
  }

  set(name, value, days = 7) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
    return this;
  }

  remove(name) {
    return this.set(name, '', -1);
  }

  has(name) {
    return this.get(name) !== null;
  }

  getAll() {
    const cookies = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name) {
        cookies[name] = value;
      }
    });
    return cookies;
  }
}

// Create singleton instance
export const cookie = new Cookie();

// Export to window for global access
export function exportToWindow() {
  if (typeof window !== 'undefined') {
    window.cookie = cookie;
  }
}

// Auto-export if in browser
if (typeof window !== 'undefined') {
  exportToWindow();
}

export default cookie;