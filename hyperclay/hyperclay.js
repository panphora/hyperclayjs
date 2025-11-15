// browser
import cookie from "./browser/cookie.js";
import query from "./browser/query.js";

// ajax
import {
  uploadFile, 
  createFile, 
  uploadFileBasic
} from "./hyperclay/uploadFile.js";
import sendMessage from "./hyperclay/sendMessage.js";

// custom attributes
import initCustomAttributeAjaxElements from "./custom-attributes/ajaxElements.js";
import initCustomAttributeDomHelpers from "./custom-attributes/domHelpers.js";
import initCustomAttributeOnclickaway from "./custom-attributes/onclickaway.js";
import initCustomAttributeOnclone from "./custom-attributes/onclone.js";
import initOnpagemutation from "./custom-attributes/onpagemutation.js";
import initCustomAttributeOnrender from "./custom-attributes/onrender.js";
import initCustomAttributePrevent from "./custom-attributes/prevent.js";
import initCustomAttributeSortable from "./custom-attributes/sortable.js";
import initTextareaAutosize from "./editing/autosize.js";

// date
import {getTimeFromNow} from "./date/relativeDate.js";

// dom
import All from "./dom/All.js";
import getDataFromForm from "./dom/getDataFromForm.js";
import insertStyleTag from "./dom/insertStyleTag.js";
import Mutation from "./dom/Mutation.js";
import nearest from "./dom/nearest.js";

// hyperclay
import { isEditMode, isOwner } from "./hyperclay/isAdminOfCurrentResource.js";
import {toggleEditMode} from "./hyperclay/editmode.js";
import restoreFromBackup from "./hyperclay/restoreFromBackup.js";
import enablePersistentFormInputValues from "./hyperclay/enablePersistentFormInputValues.js";
import getCurrentFolderId from "./hyperclay/getCurrentFolderId.js";
import showHyperclayAppPopup from "./hyperclay/showHyperclayAppPopup.js";
import {
  beforeSave,
  savePage,
  replacePageWith,
  initHyperclaySaveButton,
  initSaveKeyboardShortcut,
  initSavePageOnChange
} from "./hyperclay/savePage.js";

// hyperclay - editmode
import {
  setViewerPageTypeBeforeSave,
  setPageTypeOnPageLoad
} from "./hyperclay/setPageTypeOnDocumentElement.js";

// hyperclay - conditional admin elements
import {
  disableAdminInputsBeforeSave,
  enableAdminInputsOnPageLoad
} from "./hyperclay/adminInputs.js";
import {
  disableAdminResourcesBeforeSave,
  enableAdminResourcesOnPageLoad
} from "./hyperclay/adminResources.js";
import {
  disableContentEditableBeforeSave,
  enableContentEditableForAdminOnPageLoad
} from "./hyperclay/adminContenteditable.js";
import {
  disableOnClickBeforeSave,
  enableOnClickForAdminOnPageLoad
} from "./hyperclay/adminOnClick.js";

// string
import slugify from "./string/slugify.js";
import emmet from "./string/emmet-html.js";

// ui
import optionVisibilityRuleGenerator from "./hyperclay/optionVisibilityRuleGenerator.js";
import {ask, consent, tell} from "./ui/prompts.js";
import {info} from "./ui/info.js";
import movingBorder from "./ui/movingBorder.js";
import Sortable from './vendor/Sortable.js';
import toast from "./ui/toast.js";
import themodal from "./ui/theModal.js";

// init custom attributes
function initCustomAttributes () {
  initCustomAttributeAjaxElements(); // [ajax-form], [ajax-button]
  initCustomAttributeOnclickaway(); // [onclickaway]
  initCustomAttributeOnclone(); // [onclone]
  initOnpagemutation(); // [onpagemutation]
  initCustomAttributePrevent(); // [prevent-enter]
  initCustomAttributeOnrender(); // [onrender]
  initCustomAttributeSortable(); // [sortable]
  initTextareaAutosize(); // [autosize]

  initCustomAttributeDomHelpers(); // DOM methods: nearest, val, text, exec, cycle, cycleAttr
}

// show hyperclay app popup for multi-tenant apps (only on homepage)
if (cookie.get("isMultiTenantApp") === true && window.location.pathname === '/') {
  showHyperclayAppPopup();
}

const hyperclay = { 
  beforeSave,
  createFile,
  disableAdminInputsBeforeSave,
  disableAdminResourcesBeforeSave,
  disableContentEditableBeforeSave,
  disableOnClickBeforeSave,
  enableAdminInputsOnPageLoad,
  enableAdminResourcesOnPageLoad,
  enableContentEditableForAdminOnPageLoad,
  enableOnClickForAdminOnPageLoad,
  enablePersistentFormInputValues,
  getCurrentFolderId,
  initHyperclaySaveButton,
  initSaveKeyboardShortcut,
  initSavePageOnChange,
  isEditMode,
  isOwner,
  replacePageWith,
  savePage,
  sendMessage,
  setPageTypeOnPageLoad,
  setViewerPageTypeBeforeSave,
  toggleEditMode,
  uploadFile,
  uploadFileBasic
};

// add to WINDOW
Object.assign(window, {
  All,
  ask,
  consent,
  cookie,
  getDataFromForm,
  getTimeFromNow,
  h: emmet,
  hyperclay,
  info,
  initCustomAttributes,
  insertStyleTag,
  movingBorder,
  Mutation,
  nearest,
  optionVisibilityRuleGenerator,
  query,
  slugify,
  Sortable,
  tell,
  toast,
});

// show msg in toast
const msg = cookie.get("msg");
if (msg) {
  const msgType = cookie.get("msgType");

  toast(msg, msgType || "success");
  
  cookie.remove("msg");
  cookie.remove("msgType");
}

export {
  All,
  ask,
  consent,
  cookie,
  getDataFromForm,
  getTimeFromNow,
  emmet as h,
  hyperclay,
  info,
  initCustomAttributes,
  insertStyleTag,
  movingBorder,
  Mutation,
  nearest,
  optionVisibilityRuleGenerator,
  query,
  slugify,
  Sortable,
  tell,
  themodal,
  toast
}