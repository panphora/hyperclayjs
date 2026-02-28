import getDataFromForm from "../dom-utilities/getDataFromForm.js";

function handleFormSubmit(event) {
  const form = event.target;
  if (form.hasAttribute('ajax-form')) {
    event.preventDefault();
    submitAjax(form);
  }
}

function handleButtonClick(event) {
  const button = event.target.closest('[ajax-button]');
  if (button) {
    event.preventDefault();
    submitAjax(button);
  }
}

function submitAjax(elem) {
  callSubmitEvents(elem).then(() => {
    // Ajax buttons can have their own action/method or inherit from parent form
    const isButton = elem.hasAttribute('ajax-button');
    const parentForm = elem.closest('form');

    // Get URL - prioritize element's own action attribute
    let url = elem.getAttribute('action');
    if (!url && parentForm) {
      url = parentForm.getAttribute('action');
    }
    if (!url) {
      url = window.location.href;
    }

    // Get method - prioritize element's own method attribute
    let method = elem.getAttribute('method');
    if (!method && parentForm) {
      method = parentForm.getAttribute('method');
    }
    method = (method || 'POST').toUpperCase();

    // Get data - from parent form if button is inside one, otherwise from element itself
    const dataSource = (isButton && parentForm) ? parentForm : elem;
    const data = getDataFromForm(dataSource);

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(async (res) => {
        const contentType = res.headers.get('content-type') || '';
        let resData = {};
        if (res.status !== 204 && contentType.includes('application/json')) {
          resData = await res.json();
        }
        handleResponse(elem, { ...resData, ok: res.ok, msgType: res.ok ? "success" : "error" });
      })
      .catch(error => console.error('Error:', error));
  });
}

function handleResponse(elem, res) {
  if (res.ok && elem.matches('form')) elem.reset();
  const onResponseCode = elem.getAttribute('onresponse');
  if (onResponseCode) {
    new Function('res', onResponseCode).call(elem, res);
  }
}

async function callSubmitEvents(elem) {
  const elemsWithSubmitEvents = [elem, ...elem.querySelectorAll("[onbeforesubmit]")];
  for (const elemWithSubmitEvents of elemsWithSubmitEvents) {
    if (elemWithSubmitEvents.hasAttribute('onbeforesubmit')) {
      const result = new Function('return ' + elemWithSubmitEvents.getAttribute('onbeforesubmit')).call(elemWithSubmitEvents);
      if (result instanceof Promise) {
        await result;
      }
    }
  }
}

function init () {
  document.addEventListener('submit', handleFormSubmit);
  document.addEventListener('click', handleButtonClick);
}

// Auto-init when module is imported
init();

export { init };
export default init;
