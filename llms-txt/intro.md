# HyperclayJS

> HyperclayJS is a modular JavaScript library for building malleable HTML files on [Hyperclay](https://hyperclay.com) — self-contained HTML files that use the DOM as their database, can modify themselves, and save changes back to the server.

## How It Works

Hyperclay apps use HTML as both the front end and the database. When the page changes, HyperclayJS grabs the DOM, strips admin-only controls, and POSTs the clean HTML to the save endpoint. Anonymous visitors see a static, read-only page. When the owner loads the page, edit controls are restored.

This is the **save lifecycle**: change → strip admin UI → save → restore admin UI on load.

## Quick Start

```html
<script src="https://cdn.jsdelivr.net/npm/hyperclayjs@latest/src/hyperclay.js?preset=smooth-sailing" type="module"></script>
```

One script tag gives you: auto-save on DOM changes, edit/view mode toggling, form persistence, DOM helpers, UI dialogs, and more. Start simple with jQuery or vanilla JS for DOM manipulation — HyperclayJS handles the save lifecycle automatically.

## Key Concepts

**Edit Mode vs View Mode** — Every page has an `editmode` attribute on `<html>` set to `true` or `false`. Use `option:editmode="true"` on any element to show it only for editors.

**Persist** — Add `persist` to any `<input>`, `<textarea>`, or `<select>` to save its value to the DOM on save.

**Admin-Only Attributes** — `edit-mode-contenteditable`, `edit-mode-input`, `edit-mode-onclick`, `edit-mode-resource` restrict functionality to editors. `save-ignore` excludes elements from saves entirely.

**Custom Event Attributes** — `onrender`, `onbeforesave`, `onclickaway`, `onpagemutation`, `onclone` for declarative behavior.

**DOM Helpers** — Every element gets `el.nearest`, `el.val`, `el.text`, `el.exec` for navigating to nearby elements without worrying about DOM hierarchy.

**All.js** — jQuery-like DOM manipulation: `All.card.classList.toggle('active')`, `All('.item').filter(fn).remove()`.

**Sortable** — Add `sortable` attribute for drag-and-drop reordering. Use `sortable="group"` for cross-list dragging.

**Template-Clone Pattern** — For lists, keep a hidden template element and clone it: `this.nearest.task.before(this.nearest.task.cloneNode(true))`.

**Tailwind CSS** — Add `<link rel="stylesheet" href="/tailwindcss/YOUR-APP-NAME.css">` and CSS auto-generates on save.

## Detailed API Reference

The sections below document each HyperclayJS module in detail.
