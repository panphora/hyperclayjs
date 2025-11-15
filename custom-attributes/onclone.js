export default function init() {
  const originalCloneNode = Node.prototype.cloneNode;
  
  Node.prototype.cloneNode = function(deep) {
    const clonedNode = originalCloneNode.call(this, deep);
    
    if (clonedNode.nodeType === Node.ELEMENT_NODE) {
      processOnclone(clonedNode);
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