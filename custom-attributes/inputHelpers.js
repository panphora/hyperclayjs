// Input helpers - combines prevent-enter and autosize
import { init as initPrevent } from './preventEnter.js';
import { init as initAutosize } from './autosize.js';

function init() {
  initPrevent();
  initAutosize();
}

// Auto-init when module is imported
init();

export { init };
export default init;
