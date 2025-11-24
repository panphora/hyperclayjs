function copyToClipboard(text) {
  // Create temporary textarea element
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';

  // Add to DOM, select, copy, and remove
  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, 99999); // For mobile devices

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      console.log('Copied to clipboard');
    } else {
      console.log('Copy failed');
    }
  } catch (err) {
    console.error('Unable to copy:', err);
  }

  document.body.removeChild(textarea);
}

// Export to window (called by export-to-window module)
export function exportToWindow() {
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.copyToClipboard = copyToClipboard;
}

export default copyToClipboard;