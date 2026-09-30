---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/components/AssetList.tsx","src/components/AssetDetail.tsx","src/components/ConditionCheckForm.tsx"]
---

# Surface brief: Asset Register app (all screens)

Scope: whole app shell plus Asset List, Asset Detail/Edit, Condition Check. Mode: Operate.
Audience/job: IT and facilities staff; desk triage and editing on laptops, one-handed condition checks on phones at a site.
Constraints: data layer, generated services, power.config.json and hash routes untouched; every existing feature kept; fonts bundled via npm; small bundle; light and dark.
Approved flow fixes: "Check saved" confirmation, history above the form on phones, one primary action per screen, focus and scroll to messages, number beside condition pips.

## Direction contract

THESIS: Graphite. A quiet, instrument-grade register where condition is the one live signal. It refuses the stock Fluent admin (blue pills, card-plus-aside, Segoe) and any dashboard chrome.

OWN-WORLD: Cool graphite neutrals (light #f7f8f8 canvas, #ffffff panes, #16181d ink; dark #0f1011 / #17181b / #f7f8f8), 1px hairlines instead of shadows, indigo #4f5bd5 / #8a93f0 only for primary actions, focus and selection. Inter Variable with tabular figures on one tight 1.125 scale; system mono for tags and serials. Status is a small dot plus a word, never a filled pill. Condition is a five-segment meter with its number.
Raise (from the step-row challenger): the rating keys form one unbroken segmented row, and lit segments are the only saturated colour on a row.
Raise (from the same challenger's state discipline): condition states read distinctly: 1–2 warn/danger tint, 3 neutral, 4–5 calm.

STORY: Staff open the list scoped to their site, spot low or stale condition at a glance, open an asset, and log a check in seconds with a confirmation they can see.

FIRST VIEWPORT: A slim top bar (wordmark, site scope pill). Below it, the page title and count, one row of search plus site select, then a dense hairline table: tabular dates, mono tags, meters aligned right. The primary "New asset" action sits top right. On phones: compact cards, as the user asked for a phone card layout (name and ids, status and meter, site and last checked, assignee when set), with a 44px Check action per card.

FORM: Linear-inspired calm product UI, user-pinned over roll (seed ad64080a, assigned 5 overridden by user choice).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
