import { insertStyles } from '../dom-utilities/insertStyleTag.js';
import cookie from '../utilities/cookie.js';

function findTailwindLink(resourceName) {
  const targetPath = `/tailwindcss/${resourceName}.css`;
  return [...document.querySelectorAll('link[rel="stylesheet"]')]
    .find(el => {
      try {
        const url = new URL(el.getAttribute('href'), location.href);
        return url.pathname === targetPath;
      } catch {
        return false;
      }
    });
}

function swapTailwindLink() {
  const currentResource = cookie.get('currentResource');
  if (!currentResource) return;

  const oldLink = findTailwindLink(currentResource);
  if (!oldLink) return;

  const newLink = document.createElement('link');
  newLink.rel = 'stylesheet';
  const url = new URL(oldLink.getAttribute('href'), location.href);
  url.searchParams.set('v', Date.now());
  newLink.href = url.href;
  newLink.setAttribute('save-ignore', '');

  oldLink.insertAdjacentElement('afterend', newLink);

  newLink.onload = () => {
    oldLink.remove();
  };

  setTimeout(() => {
    if (oldLink.parentNode) {
      oldLink.remove();
    }
  }, 2000);
}

function init() {
  const currentResource = cookie.get('currentResource');
  if (!currentResource) return;

  const href = `/tailwindcss/${currentResource}.css`;
  insertStyles(href, (link) => {
    link.setAttribute('save-ignore', '');
  });

  document.addEventListener('hyperclay:save-saved', swapTailwindLink);
}

init();
