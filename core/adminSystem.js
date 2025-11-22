// Admin system - combines all admin features
import { init as initContenteditable } from './adminContenteditable.js';
import { init as initInputs } from './adminInputs.js';
import { init as initOnClick } from './adminOnClick.js';
import { init as initResources } from './adminResources.js';

function init() {
  initContenteditable();
  initInputs();
  initOnClick();
  initResources();
}

// Auto-init when module is imported
init();

export { init };
export default init;
