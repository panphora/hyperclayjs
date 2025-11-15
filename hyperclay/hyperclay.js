// browser
import cookie from "../utilities/cookie.js";
import query from "../string-utilities/query.js";

// ajax
import {
  uploadFile,
  createFile,
  uploadFileBasic
} from "../communication/uploadFile.js";
import sendMessage from "../communication/sendMessage.js";

// custom attributes
import initCustomAttributeAjaxElements from "../custom-attributes/ajaxElements.js";
import initCustomAttributeDomHelpers from "../custom-attributes/domHelpers.js";
import initCustomAttributeOnclickaway from "../custom-attributes/onclickaway.js";
import initCustomAttributeOnclone from "../custom-attributes/onclone.js";
import initOnpagemutation from "../custom-attributes/onpagemutation.js";
import initCustomAttributeOnrender from "../custom-attributes/onrender.js";
import initCustomAttributePrevent from "../custom-attributes/prevent.js";
import initCustomAttributeSortable from "../custom-attributes/sortable.js";
import initTextareaAutosize from "../custom-attributes/autosize.js";

// date
import {getTimeFromNow} from "./date/relativeDate.js";

// dom
import All from "../dom-utilities/All.js";
import getDataFromForm from "./dom/getDataFromForm.js";
import insertStyleTag from "../dom-utilities/insertStyleTag.js";
import Mutation from "../utilities/mutation.js";
import nearest from "../utilities/nearest.js";

// hyperclay
import { isEditMode, isOwner } from "../core/isAdminOfCurrentResource.js";
import {toggleEditMode} from "../core/editmode.js";
import restoreFromBackup from "./restoreFromBackup.js";
import enablePersistentFormInputValues from "../core/enablePersistentFormInputValues.js";
import getCurrentFolderId from "./getCurrentFolderId.js";
import showHyperclayAppPopup from "./showHyperclayAppPopup.js";
import {
  beforeSave,
  savePage,
  replacePageWith,
  initHyperclaySaveButton,
  initSaveKeyboardShortcut,
  initSavePageOnChange
} from "../core/savePage.js";

// hyperclay - editmode
import {
  setViewerPageTypeBeforeSave,
  setPageTypeOnPageLoad
} from "../core/setPageTypeOnDocumentElement.js";

// hyperclay - conditional admin elements
import {
  disableAdminInputsBeforeSave,
  enableAdminInputsOnPageLoad
} from "../core/adminInputs.js";
import {
  disableAdminResourcesBeforeSave,
  enableAdminResourcesOnPageLoad
} from "../core/adminResources.js";
import {
  disableContentEditableBeforeSave,
  enableContentEditableForAdminOnPageLoad
} from "../core/adminContenteditable.js";
import {
  disableOnClickBeforeSave,
  enableOnClickForAdminOnPageLoad
} from "../core/adminOnClick.js";

// string
import slugify from "../string-utilities/slugify.js";
import emmet from "../string-utilities/emmet-html.js";

// ui
import optionVisibilityRuleGenerator from "../core/optionVisibilityRuleGenerator.js";
import {ask, consent, tell} from "../ui/prompts.js";
import {info} from "../ui/info.js";
import movingBorder from "../ui/movingBorder.js";
import Sortable from '../vendor/Sortable.js';
import toast from "../ui/toast.js";
import themodal from "../ui/theModal.js";

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