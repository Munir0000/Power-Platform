---
name: Asset Register
description: A quiet, instrument-grade register of physical assets where condition is the one live signal.
colors:
  canvas: "#f7f8f8"
  pane: "#ffffff"
  sunken: "#f1f2f4"
  hover: "#f5f6f8"
  ink: "#16181d"
  ink-2: "#3d414a"
  muted: "#626873"
  line: "#e4e6ea"
  line-2: "#d3d6dc"
  control: "#8c929c"
  accent: "#4f5bd5"
  accent-hover: "#4450c6"
  accent-press: "#3a45b0"
  accent-soft: "#eceefc"
  accent-ink: "#3b45b5"
  on-accent: "#ffffff"
  ok: "#1f9255"
  ok-ink: "#16683d"
  ok-soft: "#e7f5ed"
  info: "#3d8ac4"
  info-ink: "#235f8c"
  info-soft: "#e6f1f9"
  warn: "#cf8413"
  warn-ink: "#8a5300"
  warn-soft: "#fcf2e0"
  danger: "#d14343"
  danger-ink: "#a52a2a"
  danger-soft: "#fcebeb"
  neutral: "#6b717c"
  neutral-soft: "#eef0f2"
  seg-off: "#e1e4e8"
  canvas-dark: "#0f1011"
  pane-dark: "#16171a"
  sunken-dark: "#1d1f23"
  hover-dark: "#1b1c20"
  ink-dark: "#f2f3f5"
  ink-2-dark: "#c9ced6"
  muted-dark: "#8f96a1"
  line-dark: "#25272c"
  line-2-dark: "#31343b"
  control-dark: "#636a75"
  accent-dark: "#8a93f0"
  accent-hover-dark: "#9ea6f4"
  accent-press-dark: "#7a83e6"
  accent-soft-dark: "#23264a"
  accent-ink-dark: "#b9befa"
  on-accent-dark: "#0f1011"
  ok-dark: "#3fb97a"
  ok-ink-dark: "#82d8a8"
  ok-soft-dark: "#152a1f"
  info-dark: "#5aa7e0"
  info-ink-dark: "#9ccbef"
  info-soft-dark: "#14253a"
  warn-dark: "#e0a040"
  warn-ink-dark: "#f1c47e"
  warn-soft-dark: "#2d2313"
  danger-dark: "#ef6b6b"
  danger-ink-dark: "#f6a7a7"
  danger-soft-dark: "#331a1b"
  neutral-dark: "#a3aab5"
  neutral-soft-dark: "#24262b"
  seg-off-dark: "#2e3137"
typography:
  headline:
    fontFamily: "'Inter Variable', 'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  numeral:
    fontFamily: "'Inter Variable', 'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.2
    fontFeature: "'tnum'"
  title:
    fontFamily: "'Inter Variable', 'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  body:
    fontFamily: "'Inter Variable', 'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Inter Variable', 'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.5
  caption:
    fontFamily: "'Inter Variable', 'Segoe UI Variable Text', 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
  mono:
    fontFamily: "ui-monospace, 'Cascadia Mono', 'SF Mono', Menlo, Consolas, monospace"
    fontSize: "0.95em"
    fontWeight: 400
    letterSpacing: "-0.01em"
rounded:
  seg: "2px"
  kbd: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  pill: "999px"
spacing:
  s-1: "4px"
  s-2: "8px"
  s-3: "12px"
  s-4: "16px"
  s-5: "20px"
  s-6: "24px"
  s-7: "32px"
  s-8: "48px"
  control-h: "36px"
  touch: "44px"
  topbar-h: "52px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-primary-active:
    backgroundColor: "{colors.accent-press}"
  button-secondary:
    backgroundColor: "{colors.pane}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "36px"
  button-secondary-hover:
    backgroundColor: "{colors.sunken}"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "30px"
  button-quiet-hover:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink}"
  input:
    backgroundColor: "{colors.pane}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "36px"
  scope-pill:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "3px 8px 3px 6px"
  chip:
    backgroundColor: "{colors.pane}"
    textColor: "{colors.ink-2}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "1px 8px"
  pane:
    backgroundColor: "{colors.pane}"
    rounded: "{rounded.lg}"
    padding: "24px"
  rating-key:
    backgroundColor: "{colors.pane}"
    textColor: "{colors.ink}"
    typography: "{typography.numeral}"
    height: "68px"
  alert-success:
    backgroundColor: "{colors.ok-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  alert-error:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
---

# Design System: Asset Register

## Overview

**Creative North Star: "Graphite"**

A quiet, instrument-grade register. The interface is cool graphite neutrals held together by 1px hairlines, so that the only thing on screen with real colour is the thing staff came to read: an asset's condition. Everything else (layout, navigation, forms) recedes into calm, Linear-like product UI: a slim top bar, a single content column capped at 1200px, dense hairline tables on the desk, compact cards in the hand.

Density is deliberate. Body text sits at 14px with tabular figures everywhere numbers appear, tags and serials are set in the system monospace, and controls are 36px on the desk and 44px on phones. The indigo accent is rationed: it appears on the one primary action per screen, on focus, and on selection, never as decoration. The system rejects the stock Fluent admin look (blue filled pills, Segoe-only type, card-plus-sidebar dashboards) and any dashboard chrome.

Both themes are first class. Light is near-white graphite on a faintly cool canvas; dark is a deep near-black graphite with lifted, desaturated state colours. Every token has a paired value, switched by `prefers-color-scheme`.

**Key Characteristics:**
- Cool graphite neutrals; hairlines, not shadows, carry structure.
- One indigo accent, reserved for primary action, focus and selection.
- Condition shown as a five-segment meter with its number; status as a dot plus a word.
- Inter Variable with tabular figures; system monospace for tags and serials.
- Dense hairline table on desk and tablet; compact cards with 44px targets on phones.
- Short, ease-out motion (120ms / 200ms) that honours reduced-motion.

## Colors

A cool, low-chroma graphite scale with one indigo accent and four muted state hues that exist to encode status and condition.

### Primary
- **Graphite Indigo** (accent; dark: accent-dark): the primary button fill, focus outline and field focus ring, text caret, `accent-color` for native controls. Hover and press step darker in light (accent-hover, accent-press) and lighter in dark.
- **Indigo Wash** (accent-soft): text selection background and the brief highlight on a freshly saved history entry.
- **Indigo Ink** (accent-ink): link text on panes.

### Tertiary (state hues)
Each state has three roles: a saturated mark (dot, lit segment, icon), an ink for text on a tint, and a soft tint for backgrounds.
- **Calm Green** (ok / ok-ink / ok-soft): status Available, condition 4 and 5, success alerts and the "Saved" confirmation.
- **Steel Blue** (info / info-ink / info-soft): status Assigned.
- **Amber** (warn / warn-ink / warn-soft): status In Repair, condition 2.
- **Brick Red** (danger / danger-ink / danger-soft): condition 1, error alerts, field errors.
- **Graphite Grey** (neutral / neutral-soft): status Retired, condition 3, and "Not rated".

### Neutral
- **Cool Canvas** (canvas): page background and the top bar.
- **Pane White** (pane): tables, panes, cards, inputs, secondary buttons.
- **Sunken** (sunken): button hover, "previous check" strip, skeleton blocks.
- **Row Hover** (hover): table row and rating key hover.
- **Graphite Ink** (ink): primary text, headings, asset names, numbers.
- **Ink 2** (ink-2): table cell text, secondary content, group legends.
- **Muted** (muted): metadata, table headers, placeholders, relative dates, hints.
- **Hairline** (line): every structural border and divider.
- **Hairline 2** (line-2): button borders, rating key dividers, keyboard hint border.
- **Control Stroke** (control): input and select borders; the rating row's outer border.
- **Segment Off** (seg-off): unlit meter segments.

### Named Rules
**The Rationed Indigo Rule.** Indigo is for the single primary action on a screen, focus, and selection. Never for headings, icons, backgrounds or decoration.

**The Live Signal Rule.** Condition is the live signal: lit meter segments and the selected rating key are where state colour lives. Map condition 1 to danger, 2 to warn, 3 to neutral, 4 and 5 to ok; never change this mapping.

**The Tint Plus Ink Rule.** State colour on a background always uses the soft tint with the matching `-ink` text (or plain ink), never the saturated mark colour as a text colour.

## Typography

**Body Font:** Inter Variable (bundled from npm, Latin subset, no CDN), falling back to Segoe UI Variable Text, Segoe UI, system-ui.
**Label/Mono Font:** the system monospace stack (ui-monospace, Cascadia Mono, SF Mono, Menlo, Consolas).

**Character:** One neutral, precise sans in a narrow ramp from 12px to 22px, with tabular figures so dates, counts and ratings line up like an instrument readout. Mono appears only where an identifier is being read character by character.

### Hierarchy
- **Headline** (600, 1.375rem / 22px, 1.25, -0.015em): the page title (asset name, "Assets", "New asset"). One per screen.
- **Numeral** (600, 1.125rem / 18px, 1.2, tabular): rating key numbers and the large current-condition number.
- **Title** (600, 1rem / 16px, -0.01em): pane headings, empty-state headings, the rating question legend. Also the phone input size (stops iOS zoom).
- **Body** (400, 0.875rem / 14px, 1.5): the default for everything, including buttons (weight 500) and table cells.
- **Label** (500, 0.8125rem / 13px): field labels, table headers, chips, scope pill, small buttons, group legends (600, ink-2).
- **Caption** (400–500, 0.75rem / 12px): relative dates, "Required", character counters, rating key words, "checked by" lines.
- **Mono** (0.95em of context, -0.01em): asset tags and serial numbers, in lists, chips and their input fields.

### Named Rules
**The Tabular Figures Rule.** Any number a person compares (dates, counts, ratings, costs, character counters) uses `font-variant-numeric: tabular-nums`.

**The Mono For Identifiers Rule.** Tags and serials are mono; names, labels and prose never are.

## Layout

A single content column centred at a 1200px maximum, under a sticky 52px top bar with a hairline bottom border. Content padding is 32px top / 24px sides / 48px bottom on desktop. Spacing follows a 4px rhythm (4, 8, 12, 16, 20, 24, 32, 48); page sections stack at 20px, form groups at 24px separated by hairlines, form fields sit in a two-column grid with 16px row and 20px column gaps.

- **List:** page header (title plus count on the left, the primary "New asset" top right), a toolbar grid of search (flexible) and site select (200–260px), then one hairline table in a 12px-rounded pane. Rows are 12px/16px padded; the whole row is a stretched link, with a quiet "Check" action sitting above it at the right.
- **Detail:** a two-column grid, form plus a 320px condition pane that sticks below the top bar. A new asset uses a single 760px column. Narrow forms (condition check) cap at 680px.
- **Tablet (≤900px):** side padding drops to 20px; the detail becomes one column with the condition pane first (history above the form); the table hides Category and Assigned columns, tightens cell padding to 12px and scrolls horizontally rather than clipping.
- **Phone (≤640px):** side padding 16px; `control-h` becomes the 44px touch size; inputs go to 16px text; the toolbar stacks; form grids go single column; panes pad 16px. Table rows become compact 12px-rounded cards (name and ids; status and meter; site and relative last-checked; "Assigned to" when set) with a 44px Check action spanning the card's right edge, 8px apart. Long forms pin their action bar to the bottom with safe-area padding, and its buttons fill the width at 44px.

## Elevation & Depth

Flat by default. Depth comes from tonal layering (canvas, then pane, then sunken) and 1px hairlines; there is no card shadow anywhere. Exactly one true shadow exists, for the one surface that floats over content: the pinned phone action bar. Focus uses rings, not lift.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 -1px 0 var(--line), 0 -8px 24px -12px rgb(16 18 24 / 0.12)`; dark uses `rgb(0 0 0 / 0.6)`): only the sticky save bar on phones.
- **Field focus ring** (`box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 28%, transparent)` with an accent border): inputs, selects, textareas.
- **Inset focus / selection** (`box-shadow: inset 0 0 0 2px var(--accent)` or `var(--tone)`): focused table rows and rating keys; the selected rating key uses its condition tone.

### Named Rules
**The Hairline Rule.** Structure is drawn with 1px `line` borders and tonal steps. A new container gets a hairline border, not a shadow.

## Shapes

Gently rounded, never soft. Radii step from 6px (small things: chips, brand mark, back link) to 8px (controls: buttons, inputs, alerts, history rows) to 12px (containers: panes, the table wrap, phone cards, the rating row). Meter segments are 2px-rounded 10×6px bars (20×8px in the detail pane); the keyboard hint is 4px. Only the top-bar site scope and status dots are fully round. Everything else is rectangular with a single hairline border.

## Components

### Buttons
Calm, bordered, 36px tall (44px on phones), 8px radius, 14px weight-500 text, with 120ms colour transitions.
- **Primary:** accent fill and border, on-accent text; hover accent-hover, active accent-press. One per screen: "New asset", "Log check", "Save".
- **Secondary (default):** pane fill, line-2 border, ink text; hover sunken with control border; active line fill.
- **Quiet:** transparent, ink-2 text, sunken on hover. Used for retry and the per-row Check action (small size: 30px, 12px padding, 13px text; on phones the row action gets a line-2 border and 44px height).
- **Disabled:** 55% opacity.

### Status
A small 8px dot in the state colour followed by the status word in ink-2. Never a filled pill.

### Condition Meter (signature)
Five 10×6px segments 2px apart; lit segments take the condition tone, unlit use seg-off. The number sits beside it in ink, weight 600, tabular, so the meter reads without colour; an optional word label follows. "Not rated" shows as muted text. In the detail pane it scales to 20×8px segments with an 18px number.

### Rating Input (signature)
One unbroken row of five keys inside a single 12px-rounded control-stroke border, divided by line-2 hairlines. Each key is 68px tall (76px on phones), number over word. The selected key fills with its condition's soft tint, takes its tone ink, and draws a 2px inset ring in its tone; it is the only saturated colour in the row. Keyboard focus draws an inset accent ring.

### Chips
- **Scope pill:** top-bar site scope; hairline border, 999px radius, muted 13px text with a pin icon.
- **Chip:** 6px radius, hairline border, pane fill, ink-2 13px text; mostly holds a mono asset tag.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** pane on canvas.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px line.
- **Internal Padding:** 24px (16px on phones). Empty states pad 48px/24px and centre a 16px heading, a muted line capped at 46ch, and one action.

### Inputs / Fields
- **Style:** pane fill, 1px control border, 8px radius, 36px height (44px and 16px text on phones), 12px horizontal padding; selects use a custom chevron and optional leading icon.
- **Label row:** 13px weight-500 ink label, a muted 12px "Required", and a right-aligned tabular character counter.
- **Hover / Focus:** border to muted on hover; on focus the border turns accent with a 3px 28% accent ring.
- **Error:** danger border and a 13px danger-ink message with an alert icon beneath.

### Alerts
Inline, 8px radius, 12px/16px padding, a leading 16px icon. Error: danger-soft with a 30% danger border. Success: ok-soft with a 30% ok border, entering with a 200ms settle. Alerts that report a result take focus and scroll into view.

### Navigation
A sticky 52px top bar on the canvas colour with a hairline bottom: the wordmark (24px ink square with a tag icon, then "Asset Register" in 14px/600) on the left, the scope pill on the right. Inside pages, a muted "back" link with a chevron sits above the title and turns ink on a sunken wash when hovered. A skip link appears on focus.

### Icons
A hand-authored inline SVG set on a 24px grid with a 1.75 stroke, round caps and joins, drawn in `currentColor`, usually at 14 to 16px. No icon library or font.

### Loading
Skeleton bars (12px tall, 4px radius, sunken) breathe between full and 45% opacity over 1.6s; on phones they take the card shape they resolve into. Stale results fade to 55% while a new query loads.

## Do's and Don'ts

### Do:
- **Do** keep indigo to one primary button per screen, focus and selection.
- **Do** show status as an 8px dot plus the word, and condition as the five-segment meter with its number.
- **Do** map condition 1 to danger, 2 to warn, 3 to neutral, 4 and 5 to ok, everywhere.
- **Do** draw containers with a 1px line border on pane over canvas, 12px radius.
- **Do** use tabular figures for every date, count, rating and counter, and mono for tags and serials.
- **Do** give every phone action a 44px target, and pin long-form actions to the bottom on phones.
- **Do** pair every token change across both themes; nothing ships light-only.
- **Do** keep motion to 120ms for colour changes and 200ms ease-out (`cubic-bezier(0.22, 1, 0.36, 1)`) for entrances, and let reduced-motion flatten it.

### Don't:
- **Don't** use filled status pills, blue admin chrome, or a card-plus-aside dashboard layout.
- **Don't** add drop shadows to cards, panes or tables; the float shadow belongs only to the pinned phone action bar.
- **Don't** use indigo for headings, icons, backgrounds or decorative accents.
- **Don't** load fonts or icons from a CDN; Inter is bundled and icons are inline SVG.
- **Don't** convey condition by colour alone; the number always accompanies the meter.
- **Don't** set names, labels or prose in monospace.
