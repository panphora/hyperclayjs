import { beforeSave } from './savePage.js';

// <input type="checkbox" persist>
export default function enablePersistentFormInputValues(filterBySelector = "[persist]") {
  const selector = `input${filterBySelector}:not([type="password"]):not([type="hidden"]):not([type="file"]), textarea${filterBySelector}, select${filterBySelector}`;
  
  document.addEventListener('input', (event) => {
    const elem = event.target;
    if (elem.matches(selector) && !(elem.type === 'checkbox' || elem.type === 'radio')) {
      if (elem.tagName.toLowerCase() === 'textarea') {
        // Store in value attribute instead of textContent to preserve cursor position
        elem.setAttribute('value', elem.value);
      } else {
        elem.setAttribute('value', elem.value);
      }
    }
  });

  document.addEventListener('change', (event) => {
    const elem = event.target;
    if (elem.matches(selector) && (elem.type === 'checkbox' || elem.type === 'radio')) {
      if (elem.checked) {
        elem.setAttribute('checked', '');
      } else {
        elem.removeAttribute('checked');
      }
    }
  });

  // Before save, transfer value attribute to textContent for textareas
  beforeSave((doc) => {
    const textareas = doc.querySelectorAll('textarea[value]');
    textareas.forEach(textarea => {
      textarea.textContent = textarea.getAttribute('value');
      textarea.removeAttribute('value');
    });
  });
}