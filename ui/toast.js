// a nice, simple alert
// ❗️ don't use too much text!

// Default modern icons
const defaultIcons = {
  success: `<svg viewBox="0 0 48 45" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.9404 22.4475L21.9099 29.724L35.1906 14.4045M3 3H44.9804V42.809H3V3Z" stroke="#33D131" stroke-width="4.3"/></svg>`,
  error: `<svg viewBox="0 0 46 44" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31.7383 12.4045L13 31.1429M31.7451 31.1429L13.0068 12.4046M2.00977 2H43.9902V41.809H2.00977V2Z" stroke="#FF4450" stroke-width="4"/></svg>`
};

// Legacy icons for hyperclay.com
const legacyIcons = {
  success: `<svg viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M32 1h-5v3.5h-2.5V8h-2v3.5H20V15h-2.5v3.5h-2V22H13v3.5H9V22H7v-3.5H6V15H1v3.5h1V22h2v3.5h1.5V29H7v3.5h5V29h3.5v-3.5H18V22h2.5v-3.5h2V15H25v-3.5h2.5V8h2V4.5H32V1Z" fill="#76C824"/></svg>`,
  error: `<svg viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M33 1h-5v3.5h-3.5V8H21v3.5h-3.5V15h-2v-3.5H12V8H8.5V4.5H5V1H0v3.5h3.5V8H7v3.5h3.5V15H14v3.5h-3.5V22H7v3.5H3.5V29H0v3.5h5V29h3.5v-3.5H12V22h3.5v-3.5h2V22H21v3.5h3.5V29H28v3.5h5V29h-3.5v-3.5H26V22h-3.5v-3.5H19V15h3.5v-3.5H26V8h3.5V4.5H33V1Z" fill="#DD304F"/></svg>`
};

// Default templates
const defaultTemplates = {
  container: `<div class="toast-container" save-ignore></div>`,
  toast: {
    success: `
      <div class="toast toast-modern hide success noise-texture">
        <div class="toast-icon">{icon}</div>
        <div class="toast-message">{message}</div>
      </div>
    `,
    error: `
      <div class="toast toast-modern hide error noise-texture">
        <div class="toast-icon">{icon}</div>
        <div class="toast-message">{message}</div>
      </div>
    `
  }
};

// Legacy templates for hyperclay.com
const legacyTemplates = {
  container: `<div class="toast-container" save-ignore></div>`,
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
    `
  }
};

// Default styles
const defaultStyles = `
  .toast-container {
    z-index: 9999;
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    align-items: end;
    gap: 18px;
  }
  
  .toast {
    position: relative;
    right: 0;
    cursor: pointer;
    transition: right 0.5s ease-in-out, opacity 0.5s ease-in-out;
  }
  
  .toast.hide {
    right: -400px;
    opacity: 0;
  }
  
  .toast-modern {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 24px 16px 16px;
    font-size: 16px;
    font-family: monospace;
    font-weight: bold;
    color: white;
    border-width: 1px;
    border-style: solid;
  }
  
  .toast-modern.success {
    border-color: #358234;
    background: radial-gradient(85.86% 68.42% at 50% 68.42%, #142419 0%, #1D3927 100%);
  }
  
  .toast-modern.error {
    border-color: #992930;
    background: radial-gradient(85.86% 68.42% at 50% 68.42%, #240A13 0%, #481826 100%);
  }
  
  .toast-icon {
    position: relative;
    top: -1px;
  }
  
  .toast-icon svg {
    width: 22px;
    height: 22px;
  }
  
  .toast-message {
    position: relative;
    top: -1px;
  }
  
  .noise-texture {
    position: relative;
  }
  
  .noise-texture::before {
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

const legacyStyles = `
  .toast-container {
    z-index: 9999;
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    align-items: end;
  }
  
  .toast-container > * + * {
    margin-top: 18px;
  }
  
  .toast {
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
  }
  
  .toast svg {
    position: relative;
    top: -1px;
    width: 17px;
    height: 17px;
    margin-right: 13px;
  }
  
  .toast.hide {
    right: -300px;
  }
  
  .toast.success {
    color: #76C824;
    border: 2px dashed #589E11;
  }
  
  .toast.error {
    color: #DD304F;
    border: 2px dashed #CD2140;
  }
`;

// Helper function to inject styles
function injectStyles(styles) {
  // Remove existing toast styles if present
  const existingStyles = document.querySelectorAll('.toast-styles');
  existingStyles.forEach(style => style.remove());
  
  // Add new styles
  const styleSheet = document.createElement('style');
  styleSheet.className = 'toast-styles';
  styleSheet.setAttribute('save-ignore', '');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

// Main toast function
function toast(message, messageType = "success") {
  messageType = messageType || "success";
  
  // Get configuration
  const config = toast.config || {};
  const templates = config.templates || defaultTemplates;
  const icons = config.icons || defaultIcons;

  // Get or create container
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = templates.container;
    toastContainer = tempDiv.firstElementChild;
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

// Configuration for legacy hyperclay.com style
toast.legacyConfig = {
  templates: legacyTemplates,
  icons: legacyIcons,
  styles: legacyStyles
};

// Helper to apply legacy config
toast.useLegacy = function() {
  toast.config = toast.legacyConfig;
  // Replace styles with legacy styles
  injectStyles(legacyStyles);
};

// Initialize with default styles when script loads
injectStyles(defaultStyles);

// Export to window (called by export-to-window module)
export function exportToWindow() {
  window.toast = toast;
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.toast = toast;
}

export default toast;