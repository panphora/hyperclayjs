# Homepage Redesign Plan

## Problems (from David's feedback)

- The home page is **dense and unreadable** — small text packed into small, tight containers
- **Bright white text** makes the density feel worse; everything competes for attention
- The **yellow and orange** accents are distracting — they should be used more sparingly
- Overall the page feels **overwhelming** on first load

## What needs to change

### Text & Readability
- Increase base font sizes (body text, card descriptions, code samples)
- Add more breathing room — larger padding inside cards, more gap between cards
- Soften the primary text color — pure `#ffffff` is harsh on `#080808`; consider a slightly muted white

### Color Usage
- Pull back on yellow (`--primary-blue: #d79921`) and orange (`--orange: #E85D04`) — they're currently used for borders, headings, category labels, bullets, and accents simultaneously
- Reserve orange for truly important callouts, not every section divider
- Consider a more neutral border color for cards so the grid doesn't glow

### Layout & Density
- Cards are currently 3-up on desktop at `max-width: calc(33.333% - 0.67rem)` with only `1rem` gap — feels cramped
- Consider 2 columns or wider cards with more internal spacing
- The code samples + demo area + description inside each card creates triple-stacked density

## Completed work (prerequisites)

- [x] Extracted shared `styles.css` — all pages now use a single stylesheet
- [x] All hardcoded hex colors replaced with CSS variables
- [x] Inline `style=""` colors on index.html moved to proper CSS classes
- [x] Can now theme the entire site by editing `:root` in `styles.css`

## Next steps

- [ ] Adjust `:root` color variables for softer contrast and less aggressive accents
- [ ] Increase font sizes and spacing in card/demo components
- [ ] Revisit card grid layout (column count, gap, padding)
- [ ] Test changes visually with Playwright
