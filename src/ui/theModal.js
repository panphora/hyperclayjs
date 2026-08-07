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
      // Fall back to the stored modal reference when the node was removed from
      // the DOM externally (e.g. a live-sync morph). Without this, getElementById
      // returns null, closeModal() is skipped, and its cleanup never runs — the
      // onClose callback, this.removeEventListeners() (which drops MicroModal's
      // document keydown listener), and scroll restore are all stranded.
      const modal = document.getElementById(targetModal)
      if (modal) this.modal = modal
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
      if (this.modal) {
        this.modal.removeEventListener('touchstart', this.onClick)
        this.modal.removeEventListener('click', this.onClick)
      }
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
    if (!activeModal) return
    targetModal ? activeModal.closeModalById(targetModal) : activeModal.closeModal()
    activeModal = null
  }

  return { init, show, close }
})()



// themodal.js 
// MIT License (c) 2023 David Miranda

const modalCss = `<style class="micromodal-css">
.micromodal {
  display: none;
  color: #fff;
  font-family: var(--hyperclay-modal-font-family, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);
  font-size: var(--hyperclay-modal-font-size, 18px);
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
  width: 100%;
  min-width: 0;
  max-width: min(550px, calc(100vw - 2rem));
  max-height: calc(100vh - 4rem);
  max-height: calc(100dvh - 2rem);
  box-sizing: border-box;
  overflow: hidden;
  border: 2px solid #FFFFFF;
  background-color: #11131E;
}

.micromodal__inner {
  overflow-x: hidden;
  overflow-y: auto;
  /* Must subtract container's 4px border (2px top + 2px bottom) from max-height,
     otherwise inner overflows past container since box-sizing: border-box
     makes the container's content area smaller than its max-height */
  max-height: calc(100dvh - 2rem - 4px);
  padding: 26px 40px 40px 40px;
}

@media (min-width: 640px) {
  .micromodal .micromodal__inner {
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
  overflow-wrap: anywhere;
}

.micromodal .micromodal__heading {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 8px;
  overflow-wrap: anywhere;
}

.micromodal .micromodal__input {
  width: min(calc(100vw - 100px), 420px);
  padding: 6px 6px 7px;
  font-size: var(--hyperclay-modal-input-font-size, 16px);
  color: #000;
  background: #fff;
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
  line-height: 0;
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

.micromodal button.micromodal__secondary-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 39px;
  line-height: 0;
  border: 3px solid;
  border-top-color: #474C65;
  border-left-color: #474C65;
  border-bottom-color: #131725;
  border-right-color: #131725;
  background-color: #1D1F2F;
  color: #E5E7EB;
  font-family: inherit;
  font-size: inherit;
  font-weight: bold;
}

.micromodal button.micromodal__secondary-btn:focus,
.micromodal button.micromodal__secondary-btn:hover {
  background-color: #232639;
}

.micromodal button.micromodal__secondary-btn:active {
  border-top-color: #131725;
  border-left-color: #131725;
  border-bottom-color: #474C65;
  border-right-color: #474C65;
}

.micromodal:has(.snippet-code-block) .micromodal__content {
  margin-bottom: 0;
}

.micromodal .snippet-code-block {
  background-color: #292E54;
  padding: 1rem;
  margin-bottom: 14px;
  max-width: 420px;
  overflow-x: auto;
}

.micromodal .snippet-code-block pre {
  color: white;
  font-family: var(--hyperclay-modal-code-font-family, var(--hyperclay-modal-font-family, monospace));
  font-size: 0.875rem;
  white-space: nowrap;
  margin: 0;
}

.micromodal .snippet-warning {
  padding: 0.75rem;
  border: 2px solid #989742;
  background-color: #1E1E11;
  font-size: 0.875rem;
  color: #FBF7B7;
  max-width: 420px;
}

.micromodal .snippet-link-box {
  font-size: 16px;
  margin-top: 0.75rem;
  text-align: right;
}

.micromodal .snippet-link-box a {
  color: #F6F7F9;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.45rem;
  border: 1px solid #474C64;
  line-height: 1;
}

.micromodal .snippet-link-box a:hover {
  color: #E5E7EB;
  border-color: #75798B;
}

.micromodal .snippet-link-box a svg {
  width: 0.85rem;
  height: 0.85rem;
  flex-shrink: 0;
}

.micromodal button.micromodal__close {
  clip-path: polygon(0% 4%, 0% 0%, 100% 0%, 100% 100%, 94% 100%);
  position: absolute;
  top: -1px;
  right: -1px;
  width: 68px;
}

.micromodal .micromodal__close-bg {
  fill: #1D2032;
}

.micromodal .micromodal__close:hover .micromodal__close-bg {
  fill: #212543;
}

.micromodal .micromodal__close-x {
  fill: #fff;
}

.micromodal .micromodal__tell {
  max-width: 440px;
  margin-bottom: 28px;
}

.micromodal .micromodal__tell > * + * {
  margin-top: 20px;
}

.micromodal .micromodal__tell-title {
  font-size: var(--hyperclay-modal-title-font-size, 20px);
  font-weight: bold;
}

.micromodal .micromodal__tell-content {
  font-size: var(--hyperclay-modal-font-size, 16px);
  font-weight: normal;
}

@media (min-width: 640px) {
  .micromodal .micromodal__tell-title {
    font-size: var(--hyperclay-modal-title-font-size, 22px);
  }
  .micromodal .micromodal__tell-content {
    font-size: var(--hyperclay-modal-font-size, 18px);
  }
}
</style>`;

const modalHtml = `<div class="micromodal" id="micromodal" aria-hidden="true">
  <div class="micromodal__overlay" tabindex="-1">
    <form class="micromodal__container" role="dialog" aria-modal="true">
      <div class="micromodal__inner">
        <div class="micromodal__content"></div>
        <div class="micromodal__buttons">
          <button class="micromodal__no" type="button"></button>
          <button class="micromodal__yes" type="submit"></button>
        </div>
      </div>
      <button class="micromodal__close" type="button" aria-label="Close modal"></button>
    </form>
  </div>
</div>`;

// Default close button (pixel-art X). Ships with themodal so directly-driven
// modals get a visible close control; callers can still override closeHtml
// per-open (including to "" for no visible X).
const DEFAULT_CLOSE_SVG = `<svg viewBox="0 0 134 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path class="micromodal__close-bg" d="M132 132.5 1 1.5h131v131Z" /><path class="micromodal__close-x" fill-rule="evenodd" clip-rule="evenodd" d="M0 0h3v1.5h1.5V3H6v1.5h1.5V6H9v1.5h1.5V9H12v1.5h1.5V12H15v1.5h1.5V15H18v1.5h1.5V18H21v1.5h1.5V21H24v1.5h1.5V24H27v1.5h1.5V27H30v1.5h1.5V30H33v1.5h1.5V33H36v1.5h1.5V36H39v1.5h1.5V39H42v1.5h1.5V42H45v1.5h1.5V45H48v1.5h1.5V48H51v1.5h1.5V51H54v1.5h1.5V54H57v1.5h1.5V57H60v1.5h1.5V60H63v1.5h1.5V63H66v1.5h1.5V66H69v1.5h1.5V69H72v1.5h1.5V72H75v1.5h1.5V75H78v1.5h1.5V78H81v1.5h1.5V81H84v1.5h1.5V84H87v1.5h1.5V87H90v1.5h1.5V90H93v1.5h1.5V93H96v1.5h1.5V96H99v1.5h1.5V99h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v1.5h1.5v3h-3V132H129v-1.5h-1.5V129H126v-1.5h-1.5V126H123v-1.5h-1.5V123H120v-1.5h-1.5V120H117v-1.5h-1.5V117H114v-1.5h-1.5V114H111v-1.5h-1.5V111H108v-1.5h-1.5V108H105v-1.5h-1.5V105H102v-1.5h-1.5V102H99v-1.5h-1.5V99H96v-1.5h-1.5V96H93v-1.5h-1.5V93H90v-1.5h-1.5V90H87v-1.5h-1.5V87H84v-1.5h-1.5V84H81v-1.5h-1.5V81H78v-1.5h-1.5V78H75v-1.5h-1.5V75H72v-1.5h-1.5V72H69v-1.5h-1.5V69H66v-1.5h-1.5V66H63v-1.5h-1.5V63H60v-1.5h-1.5V60H57v-1.5h-1.5V57H54v-1.5h-1.5V54H51v-1.5h-1.5V51H48v-1.5h-1.5V48H45v-1.5h-1.5V45H42v-1.5h-1.5V42H39v-1.5h-1.5V39H36v-1.5h-1.5V36H33v-1.5h-1.5V33H30v-1.5h-1.5V30H27v-1.5h-1.5V27H24v-1.5h-1.5V24H21v-1.5h-1.5V21H18v-1.5h-1.5V18H15v-1.5h-1.5V15H12v-1.5h-1.5V12H9v-1.5H7.5V9H6V7.5H4.5V6H3V4.5H1.5V3H0V0ZM108.8 22h5.2v5.1h-2.6v2.6H109v2.6h-2.6v2.6h-2.6v2.5h-2.6v5.2h2.6V45h2.6v2.6h2.6v2.6h2.5v2.6h2.6V58h-5.1v-2.6h-2.6V53h-2.6v-2.6h-2.6v-2.6h-2.5v-2.6h-5.2v2.6H91v2.6h-2.6v2.6h-2.6v2.5h-2.6V58H78v-5.1h2.6v-2.6H83v-2.6h2.6v-2.6h2.6v-2.5h2.6v-5.2h-2.6V35h-2.6v-2.6h-2.6v-2.6h-2.5v-2.6H78V22h5.2v2.6h2.5V27h2.6v2.6h2.6v2.6h2.5v2.6h5.2v-2.6h2.5v-2.6h2.6v-2.6h2.6v-2.5h2.5V22Z" /></svg>`;

const themodal = (() => {
  let html = "";
  let yes = "";
  let no = "";
  let zIndex = "100";
  let closeHtml = DEFAULT_CLOSE_SVG;

  let enableClickOutsideCloses = true;
  let disableScroll = true;
  let disableFocus = false;

  let onYes = [];
  let onNo = [];
  let onOpen = [];

  const themodalMain = {
    isShowing: false,
    open() {
      // This modal's callbacks were registered (onYes pushed / onNo assigned)
      // immediately before open(). Capture them for THIS open() call, then clear
      // the shared arrays so the next modal starts clean. Every handler below
      // fires ONLY these captured callbacks, so stacked modals can never drain
      // each other's promises.
      const myOnYes = onYes;
      const myOnNo = onNo;
      const myOnOpen = onOpen;
      onYes = [];
      onNo = [];
      onOpen = [];

      // The prompt promise must settle exactly once: resolve on yes, reject on
      // any dismissal (no / close / backdrop / Esc / superseded). dismiss() runs
      // the no-callbacks at most once; the yes path sets `settled` to block it.
      let settled = false;
      const dismiss = () => {
        if (settled) return;
        settled = true;
        myOnNo.forEach(cb => cb());
      };

      // Singleton: only one modal on screen at a time. If one is still up (or
      // left stale state behind, e.g. a live-sync morph removed its DOM), reject
      // its promise and tear it down before opening the new one.
      if (this.isShowing || document.querySelector('.micromodal-parent')) {
        this._dismiss?.();
        this._cleanupListeners?.();
        document.querySelectorAll('.micromodal-parent').forEach(n => n.remove());
        this.isShowing = false;
        document.body.style.overflow = '';
      }

      // Expose this modal's dismiss so a later open()/close can settle it.
      this._dismiss = dismiss;

      document.body.insertAdjacentHTML("afterbegin", "<div save-remove snapshot-remove class='micromodal-parent'>" + modalCss + modalHtml + "</div>");

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
        // Just close on no / close-button / backdrop; onClose runs dismiss().
        if (event.target.closest(".micromodal__no") || event.target.closest(".micromodal__close")) {
          MicroModal.close("micromodal");
        // MODIFIED so modal doesn't close if mousedown happened inside the modal
        } else if (enableClickOutsideCloses && mousedownOnBackdrop && !event.target.closest(".micromodal__container") && event.target.closest(".micromodal__overlay")) {
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

          for (const cb of myOnYes) {
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

          // Only close if all callbacks succeeded. The yes callbacks already
          // scheduled their resolve, so mark settled to stop onClose rejecting.
          if (shouldClose) {
            settled = true;
            MicroModal.close("micromodal");
          }
        }
      }

      // MODIFIED so modal doesn't close if mousedown happened inside the modal
      document.addEventListener("mousedown", handleMousedown);
      document.addEventListener("click", handleClick);
      document.addEventListener("submit", handleSubmit);

      // Store cleanup so stale listeners can be removed if DOM is yanked externally
      this._cleanupListeners = () => {
        document.removeEventListener("mousedown", handleMousedown);
        document.removeEventListener("click", handleClick);
        document.removeEventListener("submit", handleSubmit);
      };

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
          // Settle the promise as rejected if it closed without a yes
          // (no / close / backdrop / Esc). No-op once already resolved.
          dismiss();

          document.querySelector(".micromodal-parent")?.remove();

          html = "";
          yes = "";
          no = "";
          zIndex = "100";
          closeHtml = DEFAULT_CLOSE_SVG;

          // reset to defaults
          enableClickOutsideCloses = true;
          disableScroll = true;
          disableFocus = false;

          // onYes/onNo/onOpen are owned by open() now (captured into this call's
          // locals and cleared there), so they are deliberately not reset here:
          // a late onClose must not wipe a newer modal's freshly-registered cbs.

          this.isShowing = false;

          // MODIFIED so modal doesn't close if mousedown happened inside the modal
          document.removeEventListener("mousedown", handleMousedown);
          document.removeEventListener("click", handleClick);
          document.removeEventListener("submit", handleSubmit);
          this._cleanupListeners = null;
          this._dismiss = null;
        }
      });

      this.isShowing = true;

      myOnOpen.forEach(cb => cb());

      if (!disableFocus) {
        let firstInput = modalOverlayElem.querySelector(".micromodal__content :is(input,textarea,button):not(.micromodal__hide), .micromodal__buttons :is(input,textarea,button):not(.micromodal__hide)");
        firstInput?.focus();
        firstInput?.setSelectionRange?.(-1, -1);
      }
    },
    close() {
      // onClose runs the dismiss/reject path; just trigger the close.
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

    // Two registration forms are in use across callers: themodal.onYes(cb)
    // (call → push, supports multiple) and themodal.onNo = cb (assign → replace).
    // Expose both via get (returns a push fn) + set (replaces with one cb), so
    // the assign form registers a callback instead of clobbering the method.
    get onYes() { return (cb) => { onYes.push(cb); }; },
    set onYes(cb) { onYes = [cb]; },
    get onNo() { return (cb) => { onNo.push(cb); }; },
    set onNo(cb) { onNo = [cb]; },
    get onOpen() { return (cb) => { onOpen.push(cb); }; },
    set onOpen(cb) { onOpen = [cb]; },
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
