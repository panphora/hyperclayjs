/**
 * [onaftersave] Custom Attribute
 *
 * Runs inline JavaScript when save status changes.
 * Pairs with the existing [onbeforesave] attribute.
 *
 * Usage:
 *   <span onaftersave="this.innerText = event.detail.msg"></span>
 *   <div onaftersave="console.log('Status:', event.detail.status)"></div>
 *
 * The event.detail object contains:
 *   - status: 'saving' | 'saved' | 'offline' | 'error'
 *   - msg: string (e.g., 'Saved' or error message)
 *   - timestamp: number (Date.now())
 */

function broadcast(e) {
  const status = e.type.replace('hyperclay:save-', '');
  const detail = { ...e.detail, status };

  document.querySelectorAll('[onaftersave]').forEach(el => {
    try {
      const event = new CustomEvent('aftersave', { detail });
      const handler = new Function('event', el.getAttribute('onaftersave'));
      handler.call(el, event);
    } catch (err) {
      console.error('[onaftersave] Error in handler:', err);
    }
  });
}

function init() {
  document.addEventListener('hyperclay:save-saving', broadcast);
  document.addEventListener('hyperclay:save-saved', broadcast);
  document.addEventListener('hyperclay:save-offline', broadcast);
  document.addEventListener('hyperclay:save-error', broadcast);
}

init();

export default init;
