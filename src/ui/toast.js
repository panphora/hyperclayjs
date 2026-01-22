// a nice, simple alert
// ❗️ don't use too much text!

// Default modern icons (normalized to 48x48 viewBox)
const defaultIcons = {
  success: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.9404 23.9475L21.9099 31.224L35.1906 15.9045M3 4.5H44.9804V44.309H3V4.5Z" stroke="#33D131" stroke-width="4.3"/></svg>`,
  error: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M32.7383 14.4045L14 33.1429M32.7451 33.1429L14.0068 14.4046M3.01 4H44.99V43.809H3.01V4Z" stroke="#FF4450" stroke-width="4"/></svg>`,
  warning: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 8L4 40H44L24 8Z" stroke="#F5A623" stroke-width="4" stroke-linejoin="round"/><path d="M24 20V28M24 34V36" stroke="#F5A623" stroke-width="4" stroke-linecap="round"/></svg>`,
  info: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="20" stroke="#4A90D9" stroke-width="4"/><path d="M24 20V32M24 14V16" stroke="#4A90D9" stroke-width="4" stroke-linecap="round"/></svg>`
};

// Hyperclay icons
export const hyperclayIcons = {
  success: `<svg viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M32 1h-5v3.5h-2.5V8h-2v3.5H20V15h-2.5v3.5h-2V22H13v3.5H9V22H7v-3.5H6V15H1v3.5h1V22h2v3.5h1.5V29H7v3.5h5V29h3.5v-3.5H18V22h2.5v-3.5h2V15H25v-3.5h2.5V8h2V4.5H32V1Z" fill="#76C824"/></svg>`,
  error: `<svg viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M33 1h-5v3.5h-3.5V8H21v3.5h-3.5V15h-2v-3.5H12V8H8.5V4.5H5V1H0v3.5h3.5V8H7v3.5h3.5V15H14v3.5h-3.5V22H7v3.5H3.5V29H0v3.5h5V29h3.5v-3.5H12V22h3.5v-3.5h2V22H21v3.5h3.5V29H28v3.5h5V29h-3.5v-3.5H26V22h-3.5v-3.5H19V15h3.5v-3.5H26V8h3.5V4.5H33V1Z" fill="#DD304F"/></svg>`,
  warning: `<svg viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M18 1h-3v3h-2v3h-2v3H9v3H7v3H5v3H3v3H1v6h31v-6h-2v-3h-2v-3h-2v-3h-2v-3h-2V7h-2V4h-2V1zm-2 8h1v10h-1V9zm0 13h1v2h-1v-2z" fill="#F5A623"/></svg>`,
  info: `<svg viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 1v3H9v3H6v3H3v6h3v3h3v3h3v3h9v-3h3v-3h3v-3h3v-6h-3V7h-3V4h-3V1H12zm4 7h1v2h-1V8zm0 5h1v9h-1v-9z" fill="#4A90D9"/></svg>`
};

// Default templates
const defaultTemplates = {
  toast: {
    success: `
      <div class="toast hide success noise-texture">
        <div class="toast-icon">{icon}</div>
        <div class="toast-message">{message}</div>
      </div>
    `,
    error: `
      <div class="toast hide error noise-texture">
        <div class="toast-icon">{icon}</div>
        <div class="toast-message">{message}</div>
      </div>
    `,
    warning: `
      <div class="toast hide warning noise-texture">
        <div class="toast-icon">{icon}</div>
        <div class="toast-message">{message}</div>
      </div>
    `,
    info: `
      <div class="toast hide info noise-texture">
        <div class="toast-icon">{icon}</div>
        <div class="toast-message">{message}</div>
      </div>
    `
  }
};

// Hyperclay templates
export const hyperclayTemplates = {
  toast: {
    success: `
      <div class="toast hide success">
        {icon}
        <span class="message">{message}</span>
      </div>
    `,
    error: `
      <div class="toast hide error">
        {icon}
        <span class="message">{message}</span>
      </div>
    `,
    warning: `
      <div class="toast hide warning">
        {icon}
        <span class="message">{message}</span>
      </div>
    `,
    info: `
      <div class="toast hide info">
        {icon}
        <span class="message">{message}</span>
      </div>
    `
  }
};

// Modern styles (scoped by data-toast-theme="modern")
const modernStyles = `
  [data-toast-theme="modern"].toast-container {
    z-index: 9999;
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    align-items: end;
    gap: 18px;
  }

  [data-toast-theme="modern"] .toast {
    position: relative;
    right: 0;
    cursor: pointer;
    transition: right 0.5s ease-in-out, opacity 0.5s ease-in-out;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px 16px 16px;
    font-size: var(--hyperclay-toast-font-size, 16px);
    font-family: var(--hyperclay-toast-font-family, monospace);
    font-weight: bold;
    color: white;
    border-width: 1px;
    border-style: solid;
  }

  [data-toast-theme="modern"] .toast.hide {
    right: -400px;
    opacity: 0;
  }

  [data-toast-theme="modern"] .toast.success {
    border-color: #358234;
    background: radial-gradient(85.86% 68.42% at 50% 68.42%, #142419 0%, #1D3927 100%);
  }

  [data-toast-theme="modern"] .toast.error {
    border-color: #992930;
    background: radial-gradient(85.86% 68.42% at 50% 68.42%, #240A13 0%, #481826 100%);
  }

  [data-toast-theme="modern"] .toast.warning {
    border-color: #B8860B;
    background: radial-gradient(85.86% 68.42% at 50% 68.42%, #2A2010 0%, #3D3018 100%);
  }

  [data-toast-theme="modern"] .toast.info {
    border-color: #2E6B9E;
    background: radial-gradient(85.86% 68.42% at 50% 68.42%, #0A1A24 0%, #162D3D 100%);
  }

  [data-toast-theme="modern"] .toast-icon {
    position: relative;
    top: -1px;
  }

  [data-toast-theme="modern"] .toast-icon svg {
    display: block;
    width: 22px;
    height: 22px;
  }

  [data-toast-theme="modern"] .toast-message {
    position: relative;
    top: -1px;
  }

  [data-toast-theme="modern"] .noise-texture {
    position: relative;
  }

  [data-toast-theme="modern"] .noise-texture::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.12;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.2' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    background-repeat: repeat;
  }
`;

// Hyperclay styles (scoped by data-toast-theme="hyperclay")
export const hyperclayStyles = `
  [data-toast-theme="hyperclay"].toast-container {
    z-index: 9999;
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    align-items: end;
  }

  [data-toast-theme="hyperclay"].toast-container > * + * {
    margin-top: 18px;
  }

  [data-toast-theme="hyperclay"] .toast {
    position: relative;
    right: 0;
    display: flex;
    align-items: center;
    padding: 10px 19px 11px 17px;
    cursor: pointer;
    color: rgba(255,255,255,.8);
    background-color: #0B0C12;
    border: 2px dashed rgba(255,255,255,.6);
    transition: right 0.5s ease-in-out;
    font-size: var(--hyperclay-toast-font-size, inherit);
    font-family: var(--hyperclay-toast-font-family, inherit);
  }

  [data-toast-theme="hyperclay"] .toast svg {
    position: relative;
    top: -1px;
    width: 17px;
    height: 17px;
    margin-right: 13px;
  }

  [data-toast-theme="hyperclay"] .toast.hide {
    right: -300px;
  }

  [data-toast-theme="hyperclay"] .toast.success {
    color: #76C824;
    border: 2px dashed #589E11;
  }

  [data-toast-theme="hyperclay"] .toast.error {
    color: #DD304F;
    border: 2px dashed #CD2140;
  }

  [data-toast-theme="hyperclay"] .toast.warning {
    color: #F5A623;
    border: 2px dashed #D4900E;
  }

  [data-toast-theme="hyperclay"] .toast.info {
    color: #4A90D9;
    border: 2px dashed #3A7BBF;
  }
`;

// Track which theme styles have been injected
const injectedThemes = new Set();

// Global toast configuration (can be overridden by toast-hyperclay module)
let toastConfig = {
  styles: modernStyles,
  templates: defaultTemplates,
  icons: defaultIcons,
  theme: 'modern'
};

// Allow other modules (like toast-hyperclay) to override default toast styling
export function setToastTheme(config) {
  Object.assign(toastConfig, config);
}

// Helper function to inject styles for a theme (additive, not replacing)
export function injectToastStyles(styles, theme) {
  if (injectedThemes.has(theme)) return;

  const styleSheet = document.createElement('style');
  styleSheet.className = `toast-styles-${theme}`;
  styleSheet.setAttribute('save-remove', '');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  injectedThemes.add(theme);
}

// Core toast function (used by both toast and toastHyperclay)
export function toastCore(message, messageType = "success", config = {}) {
  const templates = config.templates || defaultTemplates;
  const icons = config.icons || defaultIcons;
  const theme = config.theme || 'modern';

  // Get or create container for this theme
  let toastContainer = document.querySelector(`.toast-container[data-toast-theme="${theme}"]`);
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.setAttribute('data-toast-theme', theme);
    toastContainer.setAttribute('save-remove', '');
    document.body.append(toastContainer);
  }

  // Create toast element
  const icon = icons[messageType] || icons.success;
  const template = templates.toast[messageType] || templates.toast.success;
  const toastHtml = template
    .replace('{icon}', icon)
    .replace('{message}', message);

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = toastHtml.trim();
  const toastElement = tempDiv.firstElementChild;

  // Add click handler
  toastElement.addEventListener('click', () => {
    toastElement.classList.add('hide');
    setTimeout(() => toastElement.remove(), 500);
  });

  // Add to container and animate in
  toastContainer.append(toastElement);
  setTimeout(() => toastElement.classList.remove('hide'), 10);

  // Auto-hide after timeout
  setTimeout(() => {
    toastElement.classList.add('hide');
    setTimeout(() => toastElement.remove(), 500);
  }, 6600);
}

// Main toast function - uses configured theme (default: modern, or hyperclay if toast-hyperclay loaded)
function toast(message, messageType = "success") {
  injectToastStyles(toastConfig.styles, toastConfig.theme);
  toastCore(message, messageType, {
    templates: toastConfig.templates,
    icons: toastConfig.icons,
    theme: toastConfig.theme
  });
}

// Auto-export to window unless suppressed by loader
if (!window.__hyperclayNoAutoExport) {
  window.toast = toast;
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.toast = toast;
  window.h = window.hyperclay;
}

export default toast;
