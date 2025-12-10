// Events module - combines all event attribute handlers
import { init as initOnclickaway } from './onclickaway.js';
import { init as initOnclone } from './onclone.js';
import { init as initOnmutation } from './onmutation.js';
import { init as initOnpagemutation } from './onpagemutation.js';
import { init as initOnrender } from './onrender.js';

function init() {
  initOnclickaway();
  initOnclone();
  initOnmutation();
  initOnpagemutation();
  initOnrender();
}

// Auto-init when module is imported
init();

export { init };
export default init;
