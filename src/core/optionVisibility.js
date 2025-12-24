/**
 * Option Visibility (CSS Layers Implementation)
 *
 * Shows/hides elements based on `option:` attributes and ancestor matches.
 *
 * Usage:
 *   <div editmode="true">
 *     <button option:editmode="true">Visible</button>
 *     <button option:editmode="false">Hidden</button>
 *   </div>
 *
 * An element with `option:name="value"` is hidden by default.
 * It becomes visible when ANY ancestor has `name="value"`.
 *
 * ---
 *
 * HOW IT WORKS:
 * 1. Uses `display: none !important` to forcefully hide elements
 * 2. Uses `display: revert-layer !important` to un-hide when ancestor matches
 *    `revert-layer` tells the browser: "Ignore rules in this layer, fall back to author styles"
 * 3. This preserves the user's original `display` (flex, grid, block) without us knowing what it is
 *
 * BROWSER SUPPORT:
 * Requires `@layer` and `revert-layer` support (~92% of browsers, 2022+).
 * Falls back gracefully - elements remain visible if unsupported.
 *
 * TRADEOFFS:
 * - Pro: Pure CSS after generation, zero JS overhead for toggling
 * - Pro: Simple code, similar to original approach
 * - Con: Loses to user `!important` rules (layered !important < unlayered !important)
 */

import Mutation from "../utilities/mutation.js";
import insertStyles from "../dom-utilities/insertStyleTag.js";

const STYLE_NAME = 'option-visibility';

const optionVisibility = {
  debug: false,
  _started: false,
  _unsubscribe: null,

  log(...args) {
    if (this.debug) console.log('[OptionVisibility:Layer]', ...args);
  },

  /**
   * Check if browser supports the layer approach
   */
  isSupported() {
    return typeof CSS !== 'undefined'
      && typeof CSS.supports === 'function'
      && CSS.supports('display', 'revert-layer');
  },

  /**
   * Find all unique option:name="value" patterns using XPath (faster than regex on HTML)
   */
  findOptionAttributes() {
    const patterns = new Map();

    try {
      const snapshot = document.evaluate(
        '//*[@*[starts-with(name(), "option:")]]',
        document.documentElement,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null
      );

      for (let i = 0; i < snapshot.snapshotLength; i++) {
        const el = snapshot.snapshotItem(i);
        for (const attr of el.attributes) {
          if (attr.name.startsWith('option:')) {
            const name = attr.name.slice(7);
            const value = attr.value;
            const key = `${name}=${value}`;
            if (!patterns.has(key)) {
              patterns.set(key, { name, value });
            }
          }
        }
      }
    } catch (error) {
      this.log('XPath error, falling back to empty', error);
    }

    return [...patterns.values()];
  },

  /**
   * Generate CSS rules wrapped in @layer
   */
  generateCSS(attributes) {
    if (!attributes.length) return '';

    const rules = attributes.map(({ name, value }) => {
      const safeName = CSS.escape(name);
      const safeValue = CSS.escape(value);

      // Hidden by default, visible when ancestor matches
      // Both rules need !important for consistency within the layer
      return `[option\\:${safeName}="${safeValue}"]{display:none!important}[${safeName}="${safeValue}"] [option\\:${safeName}="${safeValue}"]{display:revert-layer!important}`;
    }).join('');

    return `@layer ${STYLE_NAME}{${rules}}`;
  },

  /**
   * Update the style element with current rules
   */
  update() {
    if (!this.isSupported()) {
      this.log('Browser lacks revert-layer support, skipping');
      return;
    }

    try {
      const attributes = this.findOptionAttributes();
      const css = this.generateCSS(attributes);
      // mutations-ignore: This style tag is regenerated on load. Without this,
      // the mutation observer would detect it as a change, delaying the settled signal.
      insertStyles(STYLE_NAME, css, (style) => {
        style.setAttribute('mutations-ignore', '');
      });
      this.log(`Generated ${attributes.length} rules`);
    } catch (error) {
      console.error('[OptionVisibility:Layer] Error generating rules:', error);
    }
  },

  start() {
    if (this._started) return;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start(), { once: true });
      return;
    }

    this._started = true;

    if (!this.isSupported()) {
      console.warn('[OptionVisibility:Layer] Browser lacks revert-layer support. Elements will remain visible.');
      return;
    }

    this.update();

    // selectorFilter only triggers on option:* attribute changes (new patterns).
    // Ancestor attribute changes (e.g., editmode="true" -> "false") are handled
    // automatically by the browser - CSS rules re-evaluate when attributes change.
    this._unsubscribe = Mutation.onAnyChange({
      debounce: 200,
      selectorFilter: el => [...el.attributes].some(attr => attr.name.startsWith('option:')),
      omitChangeDetails: true
    }, () => this.update());

    this.log('Started');
  },

  stop() {
    if (!this._started) return;

    this._started = false;

    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = null;
    }

    const style = document.querySelector(`style[data-name="${STYLE_NAME}"]`);
    if (style) style.remove();

    this.log('Stopped');
  }
};

// Auto-export
if (!window.__hyperclayNoAutoExport) {
  window.optionVisibility = optionVisibility;
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.optionVisibility = optionVisibility;
  window.h = window.hyperclay;
}

export default optionVisibility;

export function init() {
  optionVisibility.start();
}

init();
