// Input helpers - combines prevent-enter and autosize
import { init as initPrevent } from './preventEnter.js';
import { init as initAutosize } from './autosize.js';

function init() {
  initPrevent();
  initAutosize();
}

export { init };
export default init;
