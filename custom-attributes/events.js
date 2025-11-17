// Events module - combines all event attribute handlers
import { init as initOnclickaway } from './onclickaway.js';
import { init as initOnclone } from './onclone.js';
import { init as initOnpagemutation } from './onpagemutation.js';
import { init as initOnrender } from './onrender.js';

function init() {
  initOnclickaway();
  initOnclone();
  initOnpagemutation();
  initOnrender();
}

export { init };
export default init;
