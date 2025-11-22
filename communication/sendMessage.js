import behaviorCollector from "./behaviorCollector.js";
import getDataFromForm from "../dom-utilities/getDataFromForm.js";
import toast from "../ui/toast.js";

function sendMessage(eventOrObj, successMessage = "Successfully sent", callback) {
  let form;
  let data;
  
  if (eventOrObj instanceof Event) {
    eventOrObj.preventDefault();
    form = eventOrObj.target.closest('form');

    if (!form) {
      toast('No form found for this element', 'error');
      return Promise.reject('No form found');
    }

    data = getDataFromForm(form);
  } else {
    data = eventOrObj;
    if (this?.closest) {
      form = this.closest('form');
    }
  }

  data.behaviorData = behaviorCollector.getData();

  return fetch("/message", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => res.ok ? res.json() : Promise.reject(`Request failed: ${res.status}`))
    .then(result => {
      toast(successMessage);
      
      if (form?.reset) {
        form.reset();
      }
      
      if (callback) callback(result);
      return result;
    })
    .catch(error => {
      toast(`Failed to send message: ${error}`);
      throw error;
    });
}

// Self-export to hyperclay only
window.hyperclay = window.hyperclay || {};
window.hyperclay.sendMessage = sendMessage;

export default sendMessage;