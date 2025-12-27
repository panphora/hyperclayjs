import autosize from './autosize.esm.js';

function init() {
  document.querySelectorAll('textarea[autosize]').forEach(autosize);

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          if (node.matches?.('textarea[autosize]')) autosize(node);
          node.querySelectorAll?.('textarea[autosize]').forEach(autosize);
        }
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

export { init };
export default init;
