import Mutation from "../utilities/mutation.js";

function init() {
  const executePageMutation = async element => {
    try {
      const code = element.getAttribute('onpagemutation');
      const asyncFn = new Function(`return (async function() { ${code} })`)();
      await asyncFn.call(element);
    } catch (error) {
      console.error('Error in onpagemutation execution:', error);
    }
  };

  Mutation.onAnyChange({
    debounce: 200,
    omitChangeDetails: true
  }, () => document.querySelectorAll('[onpagemutation]').forEach(executePageMutation));
}
export { init };
export default init;
