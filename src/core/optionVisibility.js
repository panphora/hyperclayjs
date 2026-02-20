/**
 * Option Visibility
 *
 * Shows/hides elements based on `option:` and `option-not:` attributes.
 *
 * SYNTAX:
 *   option:name="value"       - Show when ancestor has name="value"
 *   option:name="a|b|c"       - Show when ancestor has name="a" OR "b" OR "c"
 *   option:name=""            - Show when ancestor has name="" (empty value)
 *   option:name="|saved"      - Show when ancestor has name="" OR name="saved"
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
 * Uses a single conditional-hide rule per pattern. Elements get `display: none !important`
 * ONLY when they are NOT inside a matching ancestor scope. When the ancestor condition
 * IS met, the hide rule doesn't match, so the author's original display value
 * (flex, grid, block, etc.) applies naturally — no recovery needed.
 *
 * BROWSER SUPPORT:
 * Requires `:is()` and `:not()` with selector lists (~96% of browsers, 2021+).
 * Falls back gracefully - elements remain visible if unsupported.
 *
 * TRADEOFFS:
 * - Pro: Pure CSS after generation, zero JS overhead for toggling
 * - Pro: No @layer or revert-layer — works with any author CSS (layered or unlayered)
 * - Pro: One rule per pattern instead of two
 * - Con: Pipe character `|` cannot be used as a literal value (reserved as OR delimiter)
 */

import Mutation from "../utilities/mutation.js";
import insertStyles from "../dom-utilities/insertStyleTag.js";

const STYLE_NAME = 'option-visibility';

/**
 * Parse an option:/option-not: attribute into a pattern object.
 * Pure function for easy testing.
 *
 * @param {string} attrName - Attribute name (e.g., 'option:editmode', 'option-not:status')
 * @param {string} attrValue - Attribute value (e.g., 'true', 'a|b|c')
 * @returns {Object|null} Pattern object or null if not a valid option attribute
 */
export function parseOptionAttribute(attrName, attrValue) {
  let negated = false;
  let name;

  if (attrName.startsWith('option-not:')) {
    negated = true;
    name = attrName.slice(11);
  } else if (attrName.startsWith('option:')) {
    name = attrName.slice(7);
  } else {
    return null;
  }

  const rawValue = attrValue;
  // Split by pipe, keep empty strings (they match empty attribute values)
  const values = rawValue.split('|');

  return { name, rawValue, values, negated };
}

const optionVisibility = {
  debug: false,
  _started: false,
  _unsubscribe: null,

  log(...args) {
    if (this.debug) console.log('[OptionVisibility]', ...args);
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
          const pattern = parseOptionAttribute(attr.name, attr.value);
          if (!pattern) continue;

          const key = `${pattern.negated ? '!' : ''}${pattern.name}=${pattern.rawValue}`;
          if (!patterns.has(key)) {
            patterns.set(key, pattern);
          }
        }
      }
    } catch (error) {
      this.log('XPath error, falling back to empty', error);
    }

    return [...patterns.values()];
  },

  /**
   * Generate CSS rules for conditional hiding.
   *
   * Each pattern produces a single rule that hides the element ONLY when
   * it's NOT inside a matching ancestor scope. When the condition IS met,
   * the rule doesn't match, so the author's original display value applies.
   */
  generateCSS(patterns) {
    if (!patterns.length) return '';

    return patterns.map(({ name, rawValue, values, negated }) => {
      const safeName = CSS.escape(name);
      const safeRawValue = CSS.escape(rawValue);
      const prefix = negated ? 'option-not' : 'option';
      const attrSelector = `[${prefix}\\:${safeName}="${safeRawValue}"]`;

      let scopeSelectors;
      if (negated) {
        // option-not: active when ancestor has attr but NOT any of the values
        const notList = values.map(v => `[${safeName}="${CSS.escape(v)}"]`).join(',');
        const scope = `[${safeName}]:not(${notList})`;
        scopeSelectors = `${scope},${scope} *`;
      } else {
        // option: active when ancestor has ANY of the values
        const self = values.map(v => `[${safeName}="${CSS.escape(v)}"]`);
        const desc = values.map(v => `[${safeName}="${CSS.escape(v)}"] *`);
        scopeSelectors = [...self, ...desc].join(',');
      }

      return `${attrSelector}:not(:is(${scopeSelectors})){display:none!important}`;
    }).join('');
  },

  /**
   * Update the style element with current rules
   */
  update() {
    try {
      const attributes = this.findOptionAttributes();
      const css = this.generateCSS(attributes);
      insertStyles(STYLE_NAME, css, (style) => {
        style.setAttribute('mutations-ignore', '');
      });
      this.log(`Generated ${attributes.length} rules`);
    } catch (error) {
      console.error('[OptionVisibility] Error generating rules:', error);
    }
  },

  start() {
    if (this._started) return;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start(), { once: true });
      return;
    }

    this._started = true;

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
