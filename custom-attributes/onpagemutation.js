/*
   [onpagemutation] / [onglobalmutation] - Trigger code when ANY element on the page changes

   Usage:
   <span onglobalmutation="this.textContent = All('li').length">0</span>
   <span onpagemutation="this.textContent = All('li').length">0</span>

   Both attributes are equivalent - onglobalmutation is the preferred name for clarity.
*/
import Mutation from "../utilities/mutation.js";

function init() {
  const executeGlobalMutation = async element => {
    try {
      // Support both onglobalmutation and onpagemutation (legacy)
      const code = element.getAttribute('onglobalmutation') || element.getAttribute('onpagemutation');
      const asyncFn = new Function(`return (async function() { ${code} })`)();
      await asyncFn.call(element);
    } catch (error) {
      console.error('Error in onglobalmutation/onpagemutation execution:', error);
    }
  };

  Mutation.onAnyChange({
    debounce: 200,
    omitChangeDetails: true
  }, () => {
    document.querySelectorAll('[onglobalmutation], [onpagemutation]').forEach(executeGlobalMutation);
  });
}
export { init };
export default init;
