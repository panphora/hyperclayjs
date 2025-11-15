import getDataFromForm from "../dom/getDataFromForm.js";

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
    const url = elem.getAttribute('action');
    const method = elem.getAttribute('method');
    const data = getDataFromForm(elem);
    
    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(res => res.json().then(resData => {
        return { ...resData, ok: res.ok, msgType: res.ok ? "success" : "error" }
      }))
      .then((res) => {
        handleResponse(elem, res);
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

export default function init () {
  document.addEventListener('submit', handleFormSubmit);
  document.addEventListener('click', handleButtonClick);
}