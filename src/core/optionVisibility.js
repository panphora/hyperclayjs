/**
 * Option Visibility (CSS Layers Implementation)
 *
 * Shows/hides elements based on `option:` and `option-not:` attributes.
 *
 * SYNTAX:
 *   option:name="value"       - Show when ancestor has name="value"
 *   option:name="a|b|c"       - Show when ancestor has name="a" OR "b" OR "c"
 *   option-not:name="value"   - Show when ancestor has name attr but ≠ "value"
 *   option-not:name="a|b"     - Show when ancestor has name attr but ≠ "a" AND ≠ "b"
 *
 * EXAMPLES:
 *   <div editmode="true">
 *     <button option:editmode="true">Visible in edit mode</button>
 *     <button option:editmode="false">Hidden</button>
 *   </div>
 *
 *   <div savestatus="error">
 *     <span option:savestatus="saved|error">Visible (matches error)</span>
 *     <span option-not:savestatus="saving">Visible (error ≠ saving)</span>
 *   </div>
 *
 * HOW IT WORKS:
 * 1. Uses `display: none !important` to forcefully hide elements
 * 2. Uses `display: revert-layer !important` to un-hide when ancestor matches
 *    `revert-layer` tells the browser: "Ignore rules in this layer, fall back to author styles"
 * 3. This preserves the user's original `display` (flex, grid, block) without us knowing what it is
 *
 * BROWSER SUPPORT:
 * Requires `@layer`, `revert-layer`, and `:not()` selector lists (~92% of browsers, 2022+).
 * Falls back gracefully - elements remain visible if unsupported.
 *
 * TRADEOFFS:
 * - Pro: Pure CSS after generation, zero JS overhead for toggling
 * - Pro: Simple code, similar to original approach
 * - Con: Loses to user `!important` rules (layered !important < unlayered !important)
 * - Con: Pipe character `|` cannot be used as a literal value (reserved as OR delimiter)
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
   * Find all unique option:/option-not: patterns using XPath
   * Returns array of { name, rawValue, values, negated }
   */
  findOptionAttributes() {
    const patterns = new Map();

    try {
      const snapshot = document.evaluate(
        '//*[@*[starts-with(name(), "option:") or starts-with(name(), "option-not:")]]',
        document.documentElement,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null
      );

      for (let i = 0; i < snapshot.snapshotLength; i++) {
        const el = snapshot.snapshotItem(i);
        for (const attr of el.attributes) {
          let negated = false;
          let name;

          if (attr.name.startsWith('option-not:')) {
            negated = true;
            name = attr.name.slice(11);
          } else if (attr.name.startsWith('option:')) {
            name = attr.name.slice(7);
          } else {
            continue;
          }

          const rawValue = attr.value;
          const values = rawValue.split('|').filter(Boolean);
          if (!values.length) continue;

          const key = `${negated ? '!' : ''}${name}=${rawValue}`;
          if (!patterns.has(key)) {
            patterns.set(key, { name, rawValue, values, negated });
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
  generateCSS(patterns) {
    if (!patterns.length) return '';

    const rules = patterns.map(({ name, rawValue, values, negated }) => {
      const safeName = CSS.escape(name);
      const safeRawValue = CSS.escape(rawValue);
      const prefix = negated ? 'option-not' : 'option';
      const attrSelector = `[${prefix}\\:${safeName}="${safeRawValue}"]`;

      // Hide rule (same for both types)
      const hideRule = `${attrSelector}{display:none!important}`;

      // Show rule depends on type
      let showRule;
      if (negated) {
        // option-not: show when ancestor has attr but NOT any of the values
        // Uses :not(sel1, sel2) selector list syntax
        const notList = values.map(v => `[${safeName}="${CSS.escape(v)}"]`).join(',');
        showRule = `[${safeName}]:not(${notList}) ${attrSelector}{display:revert-layer!important}`;
      } else {
        // option: show when ancestor has ANY of the values
        const showSelectors = values.map(v =>
          `[${safeName}="${CSS.escape(v)}"] ${attrSelector}`
        ).join(',');
        showRule = `${showSelectors}{display:revert-layer!important}`;
      }

      return hideRule + showRule;
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

    // selectorFilter only triggers on option:/option-not: attribute changes (new patterns).
    // Ancestor attribute changes (e.g., editmode="true" -> "false") are handled
    // automatically by the browser - CSS rules re-evaluate when attributes change.
    this._unsubscribe = Mutation.onAnyChange({
      debounce: 200,
      selectorFilter: el => [...el.attributes].some(attr =>
        attr.name.startsWith('option:') || attr.name.startsWith('option-not:')
      ),
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
