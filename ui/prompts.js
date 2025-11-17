import themodal from "./theModal.js";
import onDomReady from "../dom-utilities/onDomReady.js";
import toast from "./toast.js";
import copyToClipboard from "../string-utilities/copy-to-clipboard.js";

const CLOSE_BUTTON_SVG = `<svg class="group" viewBox="0 0 134 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path class="fill-[#1D2032] group-hover:fill-[#212543]" d="M132 132.5 1 1.5h131v131Z" /><path fill-rule="evenodd" clip-rule="evenodd" d="M0 0h3v1.5h1.5V3H6v1.5h1.5V6H9v1.5h1.5V9H12v1.5h1.5V12H15v1.5h1.5V15H18v1.5h1.5V18H21v1.5h1.5V21H24v1.5h1.5V24H27v1.5h1.5V27H30v1.5h1.5V30H33v1.5h1.5V33H36v1.5h1.5V36H39v1.5h1.5V39H42v1.5h1.5V42H45v1.5h1.5V45H48v1.5h1.5V48H51v1.5h1.5V51H54v1.5h1.5V54H57v1.5h1.5V57H60v1.5h1.5V60H63v1.5h1.5V63H66v1.5h1.5V66H69v1.5h1.5V69H72v1.5h1.5V72H75v1.5h1.5V75H78v1.5h1.5V78H81v1.5h1.5V81H84v1.5h1.5V84H87v1.5h1.5V87H90v1.5h1.5V90H93v1.5h1.5V93H96v1.5h1.5V96H99v1.5h1.5V99h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v3h-3V132H129v-1.5h-1.5V129H126v-1.5h-1.5V126H123v-1.5h-1.5V123H120v-1.5h-1.5V120H117v-1.5h-1.5V117H114v-1.5h-1.5V114H111v-1.5h-1.5V111H108v-1.5h-1.5V108H105v-1.5h-1.5V105H102v-1.5h-1.5V102H99v-1.5h-1.5V99H96v-1.5h-1.5V96H93v-1.5h-1.5V93H90v-1.5h-1.5V90H87v-1.5h-1.5V87H84v-1.5h-1.5V84H81v-1.5h-1.5V81H78v-1.5h-1.5V78H75v-1.5h-1.5V75H72v-1.5h-1.5V72H69v-1.5h-1.5V69H66v-1.5h-1.5V66H63v-1.5h-1.5V63H60v-1.5h-1.5V60H57v-1.5h-1.5V57H54v-1.5h-1.5V54H51v-1.5h-1.5V51H48v-1.5h-1.5V48H45v-1.5h-1.5V45H42v-1.5h-1.5V42H39v-1.5h-1.5V39H36v-1.5h-1.5V36H33v-1.5h-1.5V33H30v-1.5h-1.5V30H27v-1.5h-1.5V27H24v-1.5h-1.5V24H21v-1.5h-1.5V21H18v-1.5h-1.5V18H15v-1.5h-1.5V15H12v-1.5h-1.5V12H9v-1.5H7.5V9H6V7.5H4.5V6H3V4.5H1.5V3H0V0ZM108.8 22h5.2v5.1h-2.6v2.6H109v2.6h-2.6v2.6h-2.6v2.5h-2.6v5.2h2.6V45h2.6v2.6h2.6v2.6h2.5v2.6h2.6V58h-5.1v-2.6h-2.6V53h-2.6v-2.6h-2.6v-2.6h-2.5v-2.6h-5.2v2.6H91v2.6h-2.6v2.6h-2.6v2.5h-2.6V58H78v-5.1h2.6v-2.6H83v-2.6h2.6v-2.6h2.6v-2.5h2.6v-5.2h-2.6V35h-2.6v-2.6h-2.6v-2.6h-2.5v-2.6H78V22h5.2v2.6h2.5V27h2.6v2.6h2.6v2.6h2.5v2.6h5.2v-2.6h2.5v-2.6h2.6v-2.6h2.6v-2.5h2.5V22Z" fill="#fff"/></svg>`;
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
  themodal.closeHtml = CLOSE_BUTTON_SVG;
  themodal.yes = CONFIRM_BUTTON_SVG;

  const promise = new Promise((resolve, reject) => {
    themodal.onYes(() => {
      try {
        if (includeInput) {
          const promptResult = document.querySelector(".micromodal__input").value;
          if (promptResult) {
            if (yesCallback) yesCallback(promptResult);
            resolve(promptResult);
            return true; // Allow modal to close
          }
        } else {
          if (yesCallback) yesCallback();
          resolve();
          return true; // Allow modal to close
        }
      } catch (error) {
        // Show error message as toast
        toast(error.message || 'An error occurred', 'error');
        // Keep modal open - don't reject or resolve
        // User can try again
        return false; // Prevent modal from closing
      }
    });
    
    themodal.onNo = () => {
      reject();
    };
  });

  themodal.open();
  
  return promise;
}

// Public API functions
export function ask(promptText, yesCallback, defaultValue = "", extraContent = "") {
  return createModal(promptText, yesCallback, extraContent, true, defaultValue);
}

export function consent(promptText, yesCallback, extraContent = "") {
  return createModal(promptText, yesCallback, extraContent, false);
}

export function tell(promptText, yesCallback, extraContent = "") {
  return createModal(promptText, yesCallback, extraContent, false);
}

/**
 * Display a modal with a code snippet and copy functionality
 * Following the existing modal pattern from prompts.js
 */
export function snippet(title, content, options = {}) {
  const {
    extraContent = 'Save this, it won\'t be shown again. Expires in 1 year.'
  } = options;

  // Create the modal content with copy button
  const modalContent = `
    <div class="bg-[#292E54] p-4 mb-[14px] max-w-[420px]">
      <div class="overflow-x-auto">
        <pre class="text-white font-mono text-sm whitespace-nowrap">${content}</pre>
      </div>
    </div>

    <button type="button" class="custom-button group font-fixedsys text-center cursor-pointer border-[3px] border-t-[#474C65] border-r-[#131725] border-b-[#131725] border-l-[#474C65] bg-[#1D1F2F] hover:bg-[#232639] active:border-b-[#474C65] active:border-l-[#131725] active:border-t-[#131725] active:border-r-[#474C65] text-[23px] p-[2px_16px_4px] w-full mb-4 copy-snippet-btn">
      <span class="whitespace-nowrap select-none inline-block group-active:translate-x-[1.5px] group-active:translate-y-[1.5px]">copy</span>
    </button>

    ${extraContent ? `
      <div class="p-3 border-2 border-[#989742] bg-[#1E1E11] text-sm text-[#FBF7B7] max-w-[420px]">
        ${extraContent}
      </div>
    ` : ''}
  `;

  // Use the existing modal system
  themodal.html = `<div>
    <div class="micromodal__heading">${title}</div>
    ${modalContent}
  </div>`;

  themodal.closeHtml = CLOSE_BUTTON_SVG;
  themodal.yes = CONFIRM_BUTTON_SVG;

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
      // Clean up the event listener
      const modalContainer = document.querySelector('.micromodal-parent');
      if (modalContainer) {
        modalContainer.removeEventListener('click', handleCopy);
      }
      resolve();
      return true;
    });

    themodal.onNo = () => {
      // Clean up the event listener
      const modalContainer = document.querySelector('.micromodal-parent');
      if (modalContainer) {
        modalContainer.removeEventListener('click', handleCopy);
      }
      resolve();
    };
  });

  themodal.open();

  return promise;
}

/**
 * Show API key with standard warning
 */
export function showApiKey(apiKey, username, expiresAt) {
  return snippet('Sync API Key', apiKey, {
    extraContent: `This key won't be shown again. Save it. Expires in 1 year.`
  });
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