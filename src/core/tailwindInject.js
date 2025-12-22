import { insertStyles } from '../dom-utilities/insertStyleTag.js';
import cookie from '../utilities/cookie.js';

function init() {
  const currentResource = cookie.get('currentResource');
  if (!currentResource) return;

  const href = `/tailwindcss/${currentResource}`;
  insertStyles(href, (link) => {
    link.setAttribute('onaftersave', 'cacheBust(this)');
  });
}

init();
