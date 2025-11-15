import {
  hyperclay,
  initCustomAttributes,
  insertStyleTag,
  optionVisibilityRuleGenerator, 
  toast
} from "./hyperclay.js";
/*
  ↑ adds some globals, like ask(), consent(), info()
*/

/**
 * Initialize custom HTML attributes
 * - el.nearest.[attr]:     Finds nearest element with specified attribute by looking at each ancestor and its children
 * - el.val.[attr]:         Gets/sets the value of specified attribute on the nearest element with that attribute
 * - el.text.[attr]:        Gets/sets the innerText of the nearest element with the specified attribute
 * - el.exec.[attr]:        Evals the value of the specified attribute on th nearest element with that attribute
 * - el.cycle(1, attr):     Replaces the current element with the next element that shares its attribute, cycling through them in order based on their text content
 * - el.cycleAttr(1, attr): Changes this element's attribute to the next value found on other elements with the same attribute
 * - onclickaway:           Evals its value when there's a click outside the element
 * - onclone:               Evals its value when element is cloned via cloneNode()
 * - onbeforesave:          Evals before save
 * - onpagemutation:        Evals on every DOM mutation in the current HTML page
 * - onrender:              Evals its value when element is rendered
 * - sortable:              Enables drag-and-drop sorting on child elements using sortable.js
 * - ajax-form:             Submits a form using an AJAX request
 * - ajax-button:           Allows a button to trigger an AJAX request
 */
initCustomAttributes();

/**
 * Input Value Persistence
 * Automatically saves form input values marked with "persist" attribute
 */
hyperclay.enablePersistentFormInputValues();

/**
 * Admin-only Inputs
 * Ensures inputs marked with "admin" attribute are only enabled for administrators
 */
hyperclay.disableAdminInputsBeforeSave();
hyperclay.enableAdminInputsOnPageLoad();

/**
 * Admin-only Resources
 * Ensures admin resources marked with "admin" attribute are only loaded for administrators
 */
hyperclay.disableAdminResourcesBeforeSave();
hyperclay.enableAdminResourcesOnPageLoad();

/**
 * Admin ContentEditable
 * Ensures contenteditable elements marked with "admin" attribute are only editable for administrators
 */
hyperclay.disableContentEditableBeforeSave();
hyperclay.enableContentEditableForAdminOnPageLoad();

/**
 * Admin OnClick
 * Ensures onclick attributes on elements marked with "admin" attribute only work for administrators
 */
hyperclay.disableOnClickBeforeSave();
hyperclay.enableOnClickForAdminOnPageLoad();

/**
 * Editmode Management
 * Sets editmode attribute on <html> element to either "true" or "false", used for conditional styling
 */
hyperclay.setPageTypeOnPageLoad();
hyperclay.setViewerPageTypeBeforeSave();

/** 
 * Dynamic Option Visibility
 * Manages visibility of elements with "option" attribute based on ancestors' element states
 */
optionVisibilityRuleGenerator.start();

/**
 * Page Save Functionality
 * - Custom save button with "trigger-save" attribute
 * - Keyboard shortcut (CMD/CTRL+S)
 * - Auto-save on input or DOM changes (with throttling)
 */
hyperclay.initHyperclaySaveButton();
hyperclay.initSaveKeyboardShortcut();
hyperclay.initSavePageOnChange();

// Load required CSS styling for UI components
// insertStyleTag("https://hyperclay.com/css/micromodal.css"); // modal dialogs, like ask(), consent()

export * from "./hyperclay.js";