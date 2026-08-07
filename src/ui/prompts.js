import themodal from "./theModal.js";
import onDomReady from "../dom-utilities/onDomReady.js";
import toast from "./toast.js";
import copyToClipboard from "../string-utilities/copy-to-clipboard.js";

const CONFIRM_BUTTON_SVG = `<div style="width: 28px;"><svg viewBox="0 0 60 33" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M34.5 0.75H43.5V5.25H49V9.75H54.5V14.25H60V18.75H54.5V23.25H49V27.75H43.5V32.25H34.5V27.75H40V23.25H45.5V18.75H0V14.25H45.5V9.75H40V5.25H34.5V0.75Z" fill="white"/></svg></div>`;

function createModal(promptText, yesCallback, extraContent = "", includeInput = false, defaultValue = "") {
  const inputHtml = includeInput
    ? `<div><input class="micromodal__input" type="text" value="${defaultValue}" required></div>`
    : "";

  themodal.html = `<div>
    <div class="micromodal__heading">${promptText}</div>
    ${inputHtml}
    ${extraContent}
  </div>`;
  themodal.yes = CONFIRM_BUTTON_SVG;

  const promise = new Promise((resolve, reject) => {
    themodal.onYes(() => {
      let promptResult;
      if (includeInput) {
        promptResult = document.querySelector(".micromodal__input").value;
        if (!promptResult) return false; // keep modal open on empty input
      }
      // Run the validation callback synchronously so a throw can keep the
      // modal open (callers rely on this — e.g. delete-site confirms by
      // throwing when the typed name doesn't match).
      if (yesCallback) {
        try {
          yesCallback(promptResult);
        } catch (err) {
          toast(err.message || 'An error occurred', 'error');
          return false; // keep modal open, user can retry
        }
      }
      // Defer resolve so downstream .then() handlers don't fire inside this
      // modal's onYes loop — themodal is a singleton, and chained ask()/
      // consent() calls need a clean themodal to set up their state.
      setTimeout(() => resolve(promptResult), 0);
      return true; // allow modal to close
    });

    themodal.onNo = () => {
      setTimeout(reject, 0);
    };
  });

  themodal.open();

  setTimeout(() => {
    const modalContainer = document.querySelector('.micromodal-parent');
    if (modalContainer) {
      modalContainer.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-copy]');
        if (btn) {
          copyToClipboard(btn.dataset.copy);
          toast('Copied', 'success');
        }
      });
    }
  }, 0);

  // Fire-and-forget callers (e.g. consent(msg, cb) with no await) don't consume
  // the reject path; dismissal now rejects, so swallow it here to avoid an
  // unhandled rejection. Awaiters still observe the rejection via their await.
  promise.catch(() => {});

  return promise;
}

// Public API functions
export function ask(promptText, yesCallback, defaultValue = "", extraContent = "") {
  return createModal(promptText, yesCallback, extraContent, true, defaultValue);
}

export function consent(promptText, yesCallback, extraContent = "") {
  return createModal(promptText, yesCallback, extraContent, false);
}

/**
 * Display an informational modal with a title and optional content paragraphs
 * @param {string} promptText - The title/heading text
 * @param {...string} content - Additional content paragraphs (variadic)
 * @returns {Promise} Resolves when user confirms, rejects on close
 */
export function tell(promptText, ...content) {
  const contentHtml = content.length > 0
    ? content.map(c => `<div class="micromodal__tell-content">${c}</div>`).join("")
    : "";

  themodal.html = `<div class="micromodal__tell">
    <div class="micromodal__tell-title">${promptText}</div>
    ${contentHtml}
  </div>`;
  themodal.yes = CONFIRM_BUTTON_SVG;

  const promise = new Promise((resolve, reject) => {
    themodal.onYes(() => {
      setTimeout(resolve, 0);
      return true;
    });

    themodal.onNo = () => {
      setTimeout(reject, 0);
    };
  });

  themodal.open();

  // See createModal: swallow the reject for fire-and-forget tell() callers;
  // awaiters still observe it via their await.
  promise.catch(() => {});

  return promise;
}

/**
 * Display a modal with a code snippet and copy functionality
 * @param {string} title - The modal heading
 * @param {string} content - The code to display
 * @param {string} extraContent - Optional raw HTML rendered below the copy button.
 *   Callers style their own container; use `<div class="snippet-warning">…</div>`
 *   for the standard yellow-bordered warning box.
 */
export function snippet(title, content, extraContent = '') {

  // Create the modal content with copy button
  const modalContent = `
    <div class="snippet-code-block">
      <pre>${content}</pre>
    </div>

    <button type="button" class="micromodal__secondary-btn copy-snippet-btn" style="margin-bottom: 14px;">copy</button>

    ${extraContent || ''}
  `;

  // Use the existing modal system
  themodal.html = `<div>
    <div class="micromodal__heading">${title}</div>
    ${modalContent}
  </div>`;

  themodal.yes = '';

  const promise = new Promise((resolve) => {
    // Local copy function
    const handleCopy = function(event) {
      if (event.target.closest('.copy-snippet-btn')) {
        copyToClipboard(content);
        toast('Copied to clipboard!', 'success');
      }
    };

    // Add event listener to the modal container after it opens
    setTimeout(() => {
      const modalContainer = document.querySelector('.micromodal-parent');
      if (modalContainer) {
        modalContainer.addEventListener('click', handleCopy);
      }
    }, 0);

    themodal.onYes(() => {
      // Clean up the event listener synchronously — the DOM may be torn down
      // before our deferred resolve fires otherwise.
      const modalContainer = document.querySelector('.micromodal-parent');
      if (modalContainer) {
        modalContainer.removeEventListener('click', handleCopy);
      }
      setTimeout(resolve, 0);
      return true;
    });

    themodal.onNo = () => {
      const modalContainer = document.querySelector('.micromodal-parent');
      if (modalContainer) {
        modalContainer.removeEventListener('click', handleCopy);
      }
      setTimeout(resolve, 0);
    };
  });

  themodal.open();

  return promise;
}

// Auto-initialize - cleanup any leftover modal elements
export function init() {
  onDomReady(() => {
    const micromodalParentElem = document.querySelector(".micromodal-parent");
    if (micromodalParentElem) {
      micromodalParentElem.remove();
      document.body.style.overflow = "";
    }
  });
}

// Auto-export to window unless suppressed by loader
if (!window.__hyperclayNoAutoExport) {
  window.ask = ask;
  window.consent = consent;
  window.tell = tell;
  window.snippet = snippet;
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.ask = ask;
  window.hyperclay.consent = consent;
  window.hyperclay.tell = tell;
  window.hyperclay.snippet = snippet;
  window.h = window.hyperclay;
}

// Auto-init when module is imported
init();
