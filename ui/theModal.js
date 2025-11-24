/*

  theModal

  // a pretty alternative to window.prompt

  - set the content of the modal
  - open it
  - user confirms
  - everything about the modal resets

  themodal.html = content;
  themodal.yes = content;
  themodal.no = content;

  themodal.disableFocus = true;
  themodal.disableScroll = true;

  themodal.onYes(content);
  themodal.onNo(content);

  themodal.open();
  themodal.close();

*/

/* 

things you probably want to style

.micromodal {}
.micromodal .micromodal__container {}
.micromodal .micromodal__content {}
.micromodal .micromodal__heading {}
.micromodal .micromodal__input {}
.micromodal .micromodal__input:focus, .micromodal .micromodal__input:active {}
.micromodal .micromodal__buttons {}
.micromodal .micromodal__yes, .micromodal__no {}
.micromodal .micromodal__yes {}
.micromodal .micromodal__yes:focus, .micromodal__yes:hover {}
.micromodal .micromodal__no {}
.micromodal .micromodal__no:focus, .micromodal__no:hover {}
.micromodal .micromodal__close {}
.micromodal .micromodal__close:focus, .micromodal__close:hover {}

*/






// MicroModal
// MIT License (c) 2017 Indrashish Ghosh
// MODIFIED: removed `this.activeElement.focus()` after modal is closed

const MicroModal = (() => {
  'use strict'

  const FOCUSABLE_ELEMENTS = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
    'select:not([disabled]):not([aria-hidden])',
    'textarea:not([disabled]):not([aria-hidden])',
    'button:not([disabled]):not([aria-hidden])',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
    '[tabindex]:not([tabindex^="-"])'
  ]

  class Modal {
    constructor ({
      targetModal,
      triggers = [],
      onShow = () => { },
      onClose = () => { },
      openTrigger = 'data-micromodal-trigger',
      closeTrigger = 'data-micromodal-close',
      openClass = 'is-open',
      disableScroll = false,
      disableFocus = false,
      awaitCloseAnimation = false,
      awaitOpenAnimation = false,
      debugMode = false
    }) {
      this.modal = document.getElementById(targetModal)

      this.config = { debugMode, disableScroll, openTrigger, closeTrigger, openClass, onShow, onClose, awaitCloseAnimation, awaitOpenAnimation, disableFocus }

      if (triggers.length > 0) this.registerTriggers(...triggers)

      this.onClick = this.onClick.bind(this)
      this.onKeydown = this.onKeydown.bind(this)
    }

    registerTriggers (...triggers) {
      triggers.filter(Boolean).forEach(trigger => {
        trigger.addEventListener('click', event => this.showModal(event))
      })
    }

    showModal (event = null) {
      this.activeElement = document.activeElement
      this.modal.setAttribute('aria-hidden', 'false')
      this.modal.classList.add(this.config.openClass)
      this.scrollBehaviour('disable')
      this.addEventListeners()

      if (this.config.awaitOpenAnimation) {
        const handler = () => {
          this.modal.removeEventListener('animationend', handler, false)
          this.setFocusToFirstNode()
        }
        this.modal.addEventListener('animationend', handler, false)
      } else {
        this.setFocusToFirstNode()
      }

      this.config.onShow(this.modal, this.activeElement, event)
    }

    closeModal (event = null) {
      const modal = this.modal
      this.modal.setAttribute('aria-hidden', 'true')
      this.removeEventListeners()
      this.scrollBehaviour('enable')
      this.config.onClose(this.modal, this.activeElement, event)

      if (this.config.awaitCloseAnimation) {
        const openClass = this.config.openClass // <- old school ftw
        this.modal.addEventListener('animationend', function handler () {
          modal.classList.remove(openClass)
          modal.removeEventListener('animationend', handler, false)
        }, false)
      } else {
        modal.classList.remove(this.config.openClass)
      }
    }

    closeModalById (targetModal) {
      this.modal = document.getElementById(targetModal)
      if (this.modal) this.closeModal()
    }

    scrollBehaviour (toggle) {
      if (!this.config.disableScroll) return
      const body = document.querySelector('body')
      switch (toggle) {
        case 'enable':
          Object.assign(body.style, { overflow: '' })
          break
        case 'disable':
          Object.assign(body.style, { overflow: 'hidden' })
          break
        default:
      }
    }

    addEventListeners () {
      this.modal.addEventListener('touchstart', this.onClick)
      this.modal.addEventListener('click', this.onClick)
      document.addEventListener('keydown', this.onKeydown)
    }

    removeEventListeners () {
      this.modal.removeEventListener('touchstart', this.onClick)
      this.modal.removeEventListener('click', this.onClick)
      document.removeEventListener('keydown', this.onKeydown)
    }

    onClick (event) {
      if (
        event.target.hasAttribute(this.config.closeTrigger) ||
        event.target.parentNode.hasAttribute(this.config.closeTrigger)
      ) {
        event.preventDefault()
        event.stopPropagation()
        this.closeModal(event)
      }
    }

    onKeydown (event) {
      if (event.keyCode === 27) this.closeModal(event) // esc
      if (event.keyCode === 9) this.retainFocus(event) // tab
    }

    getFocusableNodes () {
      const nodes = this.modal.querySelectorAll(FOCUSABLE_ELEMENTS)
      return Array(...nodes)
    }

    setFocusToFirstNode () {
      if (this.config.disableFocus) return

      const focusableNodes = this.getFocusableNodes()

      if (focusableNodes.length === 0) return

      const nodesWhichAreNotCloseTargets = focusableNodes.filter(node => {
        return !node.hasAttribute(this.config.closeTrigger)
      })

      if (nodesWhichAreNotCloseTargets.length > 0) nodesWhichAreNotCloseTargets[0].focus()
      if (nodesWhichAreNotCloseTargets.length === 0) focusableNodes[0].focus()
    }

    retainFocus (event) {
      let focusableNodes = this.getFocusableNodes()

      if (focusableNodes.length === 0) return

      focusableNodes = focusableNodes.filter(node => {
        return (node.offsetParent !== null)
      })

      if (!this.modal.contains(document.activeElement)) {
        focusableNodes[0].focus()
      } else {
        const focusedItemIndex = focusableNodes.indexOf(document.activeElement)

        if (event.shiftKey && focusedItemIndex === 0) {
          focusableNodes[focusableNodes.length - 1].focus()
          event.preventDefault()
        }

        if (!event.shiftKey && focusableNodes.length > 0 && focusedItemIndex === focusableNodes.length - 1) {
          focusableNodes[0].focus()
          event.preventDefault()
        }
      }
    }
  }


  // Keep a reference to the opened modal
  let activeModal = null

  const generateTriggerMap = (triggers, triggerAttr) => {
    const triggerMap = []

    triggers.forEach(trigger => {
      const targetModal = trigger.attributes[triggerAttr].value
      if (triggerMap[targetModal] === undefined) triggerMap[targetModal] = []
      triggerMap[targetModal].push(trigger)
    })

    return triggerMap
  }

  const validateModalPresence = id => {
    if (!document.getElementById(id)) {
      console.warn(`MicroModal: \u2757Seems like you have missed %c'${ id }'`, 'background-color: #f8f9fa;color: #50596c;font-weight: bold;', 'ID somewhere in your code. Refer example below to resolve it.')
      console.warn('%cExample:', 'background-color: #f8f9fa;color: #50596c;font-weight: bold;', `<div class="modal" id="${ id }"></div>`)
      return false
    }
  }

  const validateTriggerPresence = triggers => {
    if (triggers.length <= 0) {
      console.warn('MicroModal: \u2757Please specify at least one %c\'micromodal-trigger\'', 'background-color: #f8f9fa;color: #50596c;font-weight: bold;', 'data attribute.')
      console.warn('%cExample:', 'background-color: #f8f9fa;color: #50596c;font-weight: bold;', '<a href="#" data-micromodal-trigger="my-modal"></a>')
      return false
    }
  }

  const validateArgs = (triggers, triggerMap) => {
    validateTriggerPresence(triggers)
    if (!triggerMap) return true
    for (const id in triggerMap) validateModalPresence(id)
    return true
  }

  const init = config => {
    const options = Object.assign({}, { openTrigger: 'data-micromodal-trigger' }, config)

    const triggers = [...document.querySelectorAll(`[${ options.openTrigger }]`)]

    const triggerMap = generateTriggerMap(triggers, options.openTrigger)

    if (options.debugMode === true && validateArgs(triggers, triggerMap) === false) return

    for (const key in triggerMap) {
      const value = triggerMap[key]
      options.targetModal = key
      options.triggers = [...value]
      activeModal = new Modal(options) // eslint-disable-line no-new
    }
  }

  const show = (targetModal, config) => {
    const options = config || {}
    options.targetModal = targetModal

    if (options.debugMode === true && validateModalPresence(targetModal) === false) return

    if (activeModal) activeModal.removeEventListeners()

    activeModal = new Modal(options) // eslint-disable-line no-new
    activeModal.showModal()
  }

  const close = targetModal => {
    targetModal ? activeModal.closeModalById(targetModal) : activeModal.closeModal()
  }

  return { init, show, close }
})()



// themodal.js 
// MIT License (c) 2023 David Miranda

const modalCss = `<style class="micromodal-css">
.micromodal {
  display: none;
  color: #fff;
}

.micromodal button:not(.custom-button) {
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  margin: 0;
  width: auto;
  overflow: visible;
  font: inherit;
  line-height: inherit;
  text-transform: none;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  outline: 0;
}

.micromodal .micromodal__hide {
  display: none;
}

.micromodal.is-open {
  display: block;
}

.micromodal__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0,0,0,.65);
}

.micromodal__container {
  position: relative;
  box-sizing: border-box;
  overflow-y: auto;
  padding: 26px 40px 40px 40px;
  border: 2px solid #FFFFFF;
  background-color: #11131E;
  overflow: visible;
}

@media (min-width: 640px) {
  .micromodal .micromodal__container {
    padding: 52px 64px 60px 64px;
  }
}

.micromodal[aria-hidden="false"] .micromodal__overlay {
  animation: microModalFadeIn .2s cubic-bezier(0.0, 0.0, 0.2, 1);
}

.micromodal[aria-hidden="false"] .micromodal__container {
  animation: microModalSlideIn .2s cubic-bezier(0, 0, .2, 1);
}

.micromodal .micromodal__container,
.micromodal .micromodal__overlay {
  will-change: transform;
}

@keyframes microModalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes microModalSlideIn {
  from { transform: translateY(15%); }
  to { transform: translateY(0); }
}

.micromodal .micromodal__content {
  margin-bottom: 14px;
}

.micromodal .micromodal__heading {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
}

.micromodal .micromodal__input {
  width: clamp(300px, calc(100vw - 100px), 420px);
  padding: 6px 6px 7px;
  font-size: 18px;
  color: #000;
}

.micromodal .micromodal__input:focus, .micromodal .micromodal__input:active {
  outline: 3px solid #6A73B6;
}

.micromodal button.micromodal__yes {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 39px;
  border: 3px solid;
  border-top-color: #94BA6F;
  border-left-color: #94BA6F;
  border-bottom-color: #1A3004;
  border-right-color: #1A3004;
  background-color: #49870B;
}

.micromodal button.micromodal__yes:focus,
.micromodal button.micromodal__yes:hover {
  background-color: #549B0D;
}

.micromodal button.micromodal__yes:active {
  border-top-color: #1A3004;
  border-left-color: #1A3004;
  border-bottom-color: #94BA6F;
  border-right-color: #94BA6F;
}

.micromodal button.micromodal__close {
  clip-path: polygon(0% 4%, 0% 0%, 100% 0%, 100% 100%, 94% 100%);
  position: absolute;
  top: -1px;
  right: -1px;
  width: 68px;
}
</style>`;

const modalHtml = `<div class="micromodal" id="micromodal" aria-hidden="true">
  <div class="micromodal__overlay" tabindex="-1">
    <form class="micromodal__container" role="dialog" aria-modal="true">
      <div class="micromodal__content"></div>
      <div class="micromodal__buttons">
        <button class="micromodal__no" type="button"></button>
        <button class="micromodal__yes" type="submit"></button>
      </div>
      <button class="micromodal__close" type="button" aria-label="Close modal"></button>
    </form>
  </div>
</div>`;

const themodal = (() => {
  let html = "";
  let yes = "";
  let no = "";
  let zIndex = "100";
  let closeHtml = "";

  let enableClickOutsideCloses = true;
  let disableScroll = true;
  let disableFocus = false;

  let onYes = [];
  let onNo = [];
  let onOpen = [];

  const themodalMain = {
    isShowing: false,
    open() {
      document.body.insertAdjacentHTML("afterbegin", "<div save-ignore class='micromodal-parent'>" + modalCss + modalHtml + "</div>");

      const modalOverlayElem = document.querySelector(".micromodal__overlay");
      const modalContentElem = document.querySelector(".micromodal__content");
      const modalButtonsElem = document.querySelector(".micromodal__buttons");
      const modalYesElem = document.querySelector(".micromodal__yes");
      const modalNoElem = document.querySelector(".micromodal__no");
      const modalCloseElem = document.querySelector(".micromodal__close");

      modalContentElem.innerHTML = html;
      modalYesElem.innerHTML = yes;
      modalNoElem.innerHTML = no;
      modalOverlayElem.style.zIndex = zIndex;
      modalCloseElem.innerHTML = closeHtml;

      // MODIFIED so modal doesn't close if mousedown happened inside the modal
      let mousedownOnBackdrop = false;

      // MODIFIED so modal doesn't close if mousedown happened inside the modal
      function handleMousedown(event) {
        // Check if mousedown started on backdrop (overlay but not container)
        mousedownOnBackdrop = event.target.closest(".micromodal__overlay") && 
                              !event.target.closest(".micromodal__container");
      }

      function handleClick(event) {
        if (event.target.closest(".micromodal__no") || event.target.closest(".micromodal__close")) {
          onNo.forEach(cb => cb());
          MicroModal.close("micromodal");
        // MODIFIED so modal doesn't close if mousedown happened inside the modal
        } else if (enableClickOutsideCloses && mousedownOnBackdrop && !event.target.closest(".micromodal__container") && event.target.closest(".micromodal__overlay")) {
          onNo.forEach(cb => cb());
          MicroModal.close("micromodal");
        }
        
        // Reset after handling
        mousedownOnBackdrop = false;
      }

      function handleSubmit(event) {
        if (event.target.closest("#micromodal")) {
          event.preventDefault();
          
          // Execute callbacks and check if any return false or throw errors
          let shouldClose = true;
          
          for (const cb of onYes) {
            try {
              const result = cb();
              // If callback explicitly returns false, don't close
              if (result === false) {
                shouldClose = false;
                break;
              }
            } catch (error) {
              // If callback throws an error, don't close
              shouldClose = false;
              // Could optionally bubble the error up or handle it here
              break;
            }
          }
          
          // Only close if all callbacks succeeded
          if (shouldClose) {
            MicroModal.close("micromodal");
          }
        }
      }

      // MODIFIED so modal doesn't close if mousedown happened inside the modal
      document.addEventListener("mousedown", handleMousedown);
      document.addEventListener("click", handleClick);
      document.addEventListener("submit", handleSubmit);

      function setButtonsVisibility () {
        modalButtonsElem.classList.toggle("micromodal__hide", !yes && !no);
        modalYesElem.classList.toggle("micromodal__hide", !yes);
        modalNoElem.classList.toggle("micromodal__hide", !no);
      }

      setButtonsVisibility();

      MicroModal.show("micromodal", {
        disableScroll,
        disableFocus: true, // we use our own
        // reset everything on close
        onClose: modal => {
          document.querySelector(".micromodal-parent")?.remove();

          html = "";
          yes = "";
          no = "";
          zIndex = "100";
          closeHtml = "";

          // reset to defaults
          enableClickOutsideCloses = true;
          disableScroll = true;
          disableFocus = false;

          onYes = [];
          onNo = [];
          onOpen = [];

          this.isShowing = false;

          // MODIFIED so modal doesn't close if mousedown happened inside the modal
          document.removeEventListener("mousedown", handleMousedown);
          document.removeEventListener("click", handleClick);
          document.removeEventListener("submit", handleSubmit);
        }
      });

      this.isShowing = true;

      if (!disableFocus) {
        let firstInput = modalOverlayElem.querySelector(".micromodal__content :is(input,textarea,button):not(.micromodal__hide), .micromodal__buttons :is(input,textarea,button):not(.micromodal__hide)");
        firstInput?.focus();
        firstInput?.setSelectionRange?.(-1, -1);
      }
    },
    close() {
      onNo.forEach(cb => cb());
      MicroModal.close("micromodal");
    },
    get html() {
      return html;
    },
    set html(newVal) {
      html = newVal;
    },
    get closeHtml() {
      return closeHtml;
    },
    set closeHtml(newVal) {
      closeHtml = newVal;
    },
    get yes() {
      return yes;
    },
    set yes(newVal) {
      yes = newVal;
    },
    get no() {
      return no;
    },
    set no(newVal) {
      no = newVal;
    },
    get zIndex() {
      return zIndex;
    },
    set zIndex(newVal) {
      zIndex = newVal;
    },
    get disableFocus() {
      return disableFocus;
    },
    set disableFocus(newVal) {
      disableFocus = newVal;
    },
    get disableScroll() {
      return disableScroll;
    },
    set disableScroll(newVal) {
      disableScroll = newVal;
    },

    onYes: (cb) => {
      onYes.push(cb);
    },
    onNo: (cb) => {
      onNo.push(cb);
    },
    onOpen: (cb) => {
      onOpen.push(cb);
    },
  };

  return themodalMain;
})();

// Auto-export to window unless suppressed by loader
if (!window.__hyperclayNoAutoExport) {
  window.themodal = themodal;
  window.hyperclay = window.hyperclay || {};
  window.hyperclay.themodal = themodal;
  window.h = window.hyperclay;
}

export default themodal;
