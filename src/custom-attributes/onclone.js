function init() {
  // Bail if already patched (idempotence)
  if (Node.prototype.__hyperclayOnclone) {
    return;
  }

  const originalCloneNode = Node.prototype.cloneNode;

  // Store original for idempotence check
  Node.prototype.__hyperclayOnclone = originalCloneNode;

  Node.prototype.cloneNode = function(deep) {
    const clonedNode = originalCloneNode.call(this, deep);

    if (clonedNode.nodeType === Node.ELEMENT_NODE) {
      processOnclone(clonedNode);
      clonedNode.querySelectorAll('[onclone]').forEach(processOnclone);
    }

    return clonedNode;
  };

  function processOnclone(element) {
    const oncloneCode = element.getAttribute('onclone');
    if (oncloneCode) {
      try {
        new Function(oncloneCode).call(element);
      } catch (error) {
        console.error('Error executing onclone:', error);
      }
    }
  }
}
export { init };
export default init;
