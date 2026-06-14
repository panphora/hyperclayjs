// Template upgrades: when this fork's hyper-source points at a newer
// hyper-version, the owner sees a small popover; one click migrates the
// page's data into the new template, saves, and reloads. The mechanism
// (version check, pristine fetch, transform tag, keyed apply) lives in the
// vendored hyper-html-api upgrade bundle, which attaches
// window.hyperclay.upgrade during evaluation. This module adds the platform
// policy: owner-only gating, the popover UI, saveHtml, reload.

import { upgrade } from './vendor/hyper-html-api-upgrade.vendor.js'
import { isEditMode, isOwner } from './core/isAdminOfCurrentResource.js'
import { saveHtml } from './core/savePageCore.js'

const POPOVER_ID = 'hyperclay-upgrade-popover'
const DISMISS_PREFIX = 'hha:upgrade-dismissed:'

function dismissKey(info) {
  return `${DISMISS_PREFIX}${info.sourceUrl}:${info.sourceVersion}`
}

function isDismissed(info) {
  try {
    return !!localStorage.getItem(dismissKey(info))
  } catch {
    return false
  }
}

function persistDismissal(info) {
  try {
    localStorage.setItem(dismissKey(info), '1')
  } catch {
    /* storage unavailable: dismissal lasts until reload */
  }
}

const POPOVER_CSS = `
#${POPOVER_ID} { position: fixed; bottom: 16px; right: 16px; z-index: 2147483000;
  width: 300px; box-sizing: border-box; background: #1c1c1e; color: #f3f3f5;
  border: 1px solid #3a3a3e; border-radius: 10px; padding: 14px 16px;
  font: 13px/1.5 system-ui, -apple-system, sans-serif;
  box-shadow: 0 10px 32px rgba(0,0,0,.4); }
#${POPOVER_ID} .hcu-title { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
#${POPOVER_ID} .hcu-versions { margin-bottom: 4px; }
#${POPOVER_ID} .hcu-source { color: #9a9aa2; word-break: break-all; margin-bottom: 8px; }
#${POPOVER_ID} .hcu-note { color: #9a9aa2; margin-bottom: 12px; }
#${POPOVER_ID} .hcu-status { margin-bottom: 8px; display: none; }
#${POPOVER_ID} .hcu-status.hcu-error { color: #ff7b87; display: block; }
#${POPOVER_ID} .hcu-status.hcu-busy { color: #f3f3f5; display: block; }
#${POPOVER_ID} .hcu-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
#${POPOVER_ID} button { font: inherit; border-radius: 6px; padding: 5px 10px;
  cursor: pointer; border: 1px solid #3a3a3e; background: transparent; color: #f3f3f5; }
#${POPOVER_ID} button[data-upgrade-action="run"] { background: #f3f3f5; color: #1c1c1e;
  border-color: #f3f3f5; font-weight: 600; }
#${POPOVER_ID} button:disabled { opacity: .5; cursor: default; }
`

function el(doc, tag, className, text) {
  const node = doc.createElement(tag)
  if (className) node.className = className
  if (text != null) node.textContent = text
  return node
}

export function showPopover(info, deps = {}) {
  const {
    runUpgrade = upgrade.run,
    save = saveHtml,
    reload = () => location.reload(),
    doc = document,
  } = deps

  const existing = doc.getElementById(POPOVER_ID)
  if (existing) existing.remove()

  const card = el(doc, 'div', null)
  card.id = POPOVER_ID

  const style = el(doc, 'style', null, POPOVER_CSS)
  card.appendChild(style)

  card.appendChild(el(doc, 'div', 'hcu-title', 'Update available'))
  card.appendChild(
    el(
      doc,
      'div',
      'hcu-versions',
      info.currentVersion
        ? `v${info.currentVersion} → v${info.sourceVersion}`
        : `→ v${info.sourceVersion}`,
    ),
  )
  card.appendChild(el(doc, 'div', 'hcu-source', `from: ${info.sourceUrl}`))
  card.appendChild(
    el(
      doc,
      'div',
      'hcu-note',
      'Your current version is kept in version history. Customizations outside your data will be replaced.',
    ),
  )

  const status = el(doc, 'div', 'hcu-status')
  card.appendChild(status)

  const buttons = el(doc, 'div', 'hcu-buttons')
  const upgradeBtn = el(doc, 'button', null, 'Upgrade')
  upgradeBtn.setAttribute('data-upgrade-action', 'run')
  const laterBtn = el(doc, 'button', null, 'Later')
  laterBtn.setAttribute('data-upgrade-action', 'later')
  const skipBtn = el(doc, 'button', null, 'Skip this version')
  skipBtn.setAttribute('data-upgrade-action', 'skip')
  buttons.appendChild(upgradeBtn)
  buttons.appendChild(laterBtn)
  buttons.appendChild(skipBtn)
  card.appendChild(buttons)

  function setStatus(text, kind) {
    status.textContent = text
    status.className = `hcu-status${kind ? ` hcu-${kind}` : ''}`
  }

  function setBusy(busy) {
    upgradeBtn.disabled = busy
    laterBtn.disabled = busy
    skipBtn.disabled = busy
  }

  laterBtn.addEventListener('click', () => card.remove())
  skipBtn.addEventListener('click', () => {
    persistDismissal(info)
    card.remove()
  })
  upgradeBtn.addEventListener('click', async () => {
    setBusy(true)
    setStatus('Upgrading…', 'busy')
    try {
      const result = await runUpgrade()
      const { err, data } = await save(result.html)
      if (err) throw err
      if (data && data.msgType === 'skipped') throw new Error(data.msg || 'Save was skipped')
      setStatus('Upgraded. Reloading…', 'busy')
      reload()
    } catch (err) {
      setStatus(`Upgrade failed: ${err && err.message ? err.message : err}`, 'error')
      setBusy(false)
    }
  })

  doc.body.appendChild(card)
  return card
}

export async function initUpgrade(deps = {}) {
  const {
    owner = isOwner,
    editMode = isEditMode,
    check = upgrade.checkForUpdate,
  } = deps
  if (!owner || !editMode) return null
  const info = await check()
  if (!info || !info.available || isDismissed(info)) return null
  return showPopover(info, deps)
}

function init() {
  if (typeof document === 'undefined') return
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initUpgrade()
    })
  } else {
    initUpgrade()
  }
}

init()

export { upgrade }
export default upgrade
