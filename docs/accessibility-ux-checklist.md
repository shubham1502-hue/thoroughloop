# Accessibility And UX Checklist

Use this checklist before merging meaningful web UI changes.

## Keyboard Navigation

- [ ] Primary navigation is reachable by keyboard.
- [ ] Form controls can be reached in a sensible order.
- [ ] Buttons can be triggered with keyboard input.
- [ ] Modals or future overlays keep focus contained.

## Focus States

- [ ] Text inputs, textareas, selects, and buttons have visible focus states.
- [ ] Focus states meet contrast expectations against the page background.
- [ ] Disabled buttons have clear disabled styling.

## Forms

- [ ] Inputs have visible labels or equivalent accessible names.
- [ ] Textareas have enough height for messy founder context.
- [ ] Save actions give visible confirmation.
- [ ] Required action states are clear without relying only on color.

## Empty States

- [ ] Empty memos page explains what the page is for, why it is empty, and what to do next.
- [ ] Empty founder action queue explains what the page is for, why it is empty, and what to do next.
- [ ] Empty decision log explains what the page is for, why it is empty, and what to do next.
- [ ] Weekly review explains why no previous decision appears.

## Error States

- [ ] Unknown routes show the not-found page.
- [ ] Runtime route errors show a retry path.
- [ ] Local storage parse failures do not crash list pages.
- [ ] Error copy stays factual and does not overstate recovery.

## Color And Layout

- [ ] Text has readable contrast.
- [ ] Cards and controls have enough spacing on mobile and desktop.
- [ ] Long memo text wraps without overlapping controls.
- [ ] Tables or card lists remain readable on narrow screens.

## Mobile Viewport Sanity

- [ ] Homepage loop is usable on a small viewport.
- [ ] Workflow forms do not require horizontal scrolling.
- [ ] Saved memo cards stack cleanly.
- [ ] Action and decision controls remain editable.

## Route Readability

- [ ] Route headings match the job of the page.
- [ ] Navigation labels stay consistent: Memos, Founder Action Queue, Decision Log, Settings.
- [ ] Product copy uses founder action, memo, diagnosis, and workflow consistently.

## Persistence Clarity

- [ ] Save confirmations are visible.
- [ ] Refreshing list pages preserves saved local data.
- [ ] Local-first limitation is documented where appropriate.
