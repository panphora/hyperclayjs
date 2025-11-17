function init () {
  document.addEventListener('input', event => {
    const target = event.target;
    if (target.matches('textarea[autosize]')) {
      target.style.overflowY = 'hidden';
      target.style.height = 'auto';
      target.style.height = target.scrollHeight + 'px';
    }
  });

  document.querySelectorAll('textarea[autosize]').forEach(textarea => {
    textarea.style.overflowY = 'hidden';
    textarea.style.height = textarea.scrollHeight + 'px';
  });
}
export { init };
export default init;
