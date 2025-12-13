// [prevent-enter]: Prevents Enter key from creating newlines
function init () {
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.keyCode === 13) {
      const preventEnterElement = event.target.closest('[prevent-enter]');
      if (preventEnterElement) {
        event.preventDefault();
      }
    }
  });
}
export { init };
export default init;
