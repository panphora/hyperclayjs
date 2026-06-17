# Region attributes

A region declares how a part of the page participates in the framework using a
small set of composable naked attributes. Set one on an element and it applies to
that element and its descendants. Combine them freely.

These five attributes replace the older `save-*` / `mutations-ignore` markers,
which conflated several independent concerns. The old markers still work as
back-compat aliases (see [Legacy aliases](#legacy-aliases)).

## The attributes

| Attribute | What it does | When to use it |
|-----------|--------------|----------------|
| `no-save` | Stripped from the saved file. Still live and interactive at runtime. | Admin-only chrome that should never land in the saved page (toolbars, edit panels, CMS sidebar). |
| `no-trigger-autosave` | Saved as-is, but editing it never triggers an autosave or marks the page dirty. Still undoable. | Content you want persisted but not on every keystroke (status readouts, computed/derived fields). |
| `no-undo` | Edits here are not recorded in the undo stack. Saved and autosaved normally. | Programmatic or high-frequency regions you don't want cluttering Cmd+Z history. |
| `no-watch` | Invisible to the whole mutation system: no behaviors, no autosave, no undo. Still saved. | High-churn machine regions (clocks, counters, logs) where watching every change is wasteful. |
| `freeze` | Saved exactly as authored; runtime changes are not persisted. Still live and interactive. | Live widgets or demos whose authored starting state is what should be saved. |

## Effect matrix

| Attribute | Watched | Behaviors | Autosave + dirty | Undo | Saved to file |
|-----------|---------|-----------|------------------|------|---------------|
| (none) | yes | run | triggers | records | yes, live |
| `no-save` | yes | run | no¹ | records | **no (stripped)** |
| `no-trigger-autosave` | yes | run | **no** | records | yes, live |
| `no-undo` | yes | run | triggers | **no** | yes, live |
| `no-watch` | **no** | off | no | **no** | yes, live |
| `freeze` | yes | run | no² | records | yes, **frozen** |

¹ Nothing to save, so autosave is moot. ² Runtime changes won't persist, so autosaving them is pointless.

## Composing intents

Every intent is a composition of the attributes above:

| Use case | Attributes |
|----------|------------|
| Normal region | (none) |
| Functional but not saved (chrome, CMS panel) | `no-save` |
| Functional, saved, no autosave, still undoable | `no-trigger-autosave` |
| Saved, no autosave, not undoable (server-synced / external) | `no-trigger-autosave no-undo` |
| High-churn, saved, inert (clock, counter, log) | `no-watch` |
| High-churn, not saved, inert (debug overlay, 3rd-party churn) | `no-watch no-save` |
| Frozen (functional, saved as authored) | `freeze` |

## Implication rules

The resolver enforces a few implications automatically:

- `no-watch` ⟹ no autosave **and** no undo (you can't track what isn't watched). Still saved.
- `no-save` ⟹ no autosave (nothing to persist).
- `freeze` ⟹ no autosave (runtime changes won't persist).
- `no-save` and `freeze` are mutually exclusive. If both are present, `no-save` wins.

## Legacy aliases

The old markers still work and resolve to bundles of the new attributes. Each
legacy marker also implies `no-undo` (matching its historical behavior); the new
`no-save` / `freeze` keep undo on, the cleaner default.

| Legacy | Resolves to |
|--------|-------------|
| `mutations-ignore` | `no-watch` |
| `save-remove` | `no-save no-undo` |
| `save-ignore` | `no-trigger-autosave no-undo` |
| `save-freeze` | `freeze no-undo` |

## Example

```html
<!-- Admin toolbar: live in edit mode, never written to the saved file -->
<div no-save class="admin-toolbar">…</div>

<!-- Live clock: saved, but its ticking never marks the page dirty or floods undo -->
<span no-watch id="clock">12:00</span>

<!-- Interactive demo: saved exactly as authored, edits don't persist -->
<div freeze>
  <div contenteditable>Try editing — it won't save.</div>
</div>

<!-- Derived field: persisted, but recomputing it doesn't trigger autosave -->
<output no-trigger-autosave id="total">$0.00</output>
```

## Implementation

The model lives in `src/utilities/region-policy.js`. `resolveRegionPolicy(node)`
walks an element's self-or-ancestor chain once and returns the four independent
axes the rest of the framework keys off: `{ watched, autosaveTriggered, undoable,
persist }`. The save serializer (`src/core/snapshot.js`), autosave
(`src/core/autosave.js`), and undo all consume this single resolver, so the
attributes can never drift apart.
