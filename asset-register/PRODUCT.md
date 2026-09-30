# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

IT and facilities staff who look after physical equipment (laptops, monitors, peripherals, AV equipment, tools, furniture) across several sites. Their work is mixed: desk work on a laptop (finding assets, editing records, assigning them to people) and field work on a phone while walking a site, recording condition checks one asset at a time.

## Product Purpose

A register of the organisation's physical assets: where each one is (site), who has it (assigned user), what state it is in (status), and how it is holding up (a 1–5 condition rating from periodic checks). Success is a register people trust: records are quick to find and correct, and a condition check can be logged on the spot in seconds.

## Operating Context

- Runs as a Power Apps Code App inside the Power Apps host frame; data lives in Dataverse (tables: assets, sites, condition checks, users).
- Navigation is hash-based (`#/` home, `#/assets` list, `#/assets/{id}`, `#/assets/new`, `#/assets/{id}/check`) because the app is framed.
- Staff usually work within one site; the chosen site is remembered per device.
- Assets are identified by name, asset tag and serial number.

## Capabilities and Constraints

- Asset list: debounced text search (name, tag, serial), site scoping, 50 rows per page with "Load more".
- Asset create/edit: name, tag, serial, category, status, site, purchase date and cost, notes (100 chars), assigned user.
- Condition check: 1–5 rating (Poor, Fair, Good, Very good, Excellent), date (today or earlier), checked-by user, comments (100 chars). Saving also updates the asset's latest rating and last-checked date.
- Recent checks history per asset (latest 20).
- Statuses: Available, Assigned, In Repair, Retired. Categories: AV Equipment, Furniture, Laptop, Monitor, Peripheral, Tool.
- Data access goes only through the generated Dataverse services; UI work must not change them, `power.config.json`, or `src/data/assetRegister.ts`.
- Fonts must be system or bundled via npm; no external font CDNs inside the Power Apps frame.
- Not yet built (do not imply they exist): sorting, status/category filters, barcode scanning, photos, overdue rules.

## Evidence on Hand

No real asset data is in the repository. Screens are reviewed with development-only sample data, which must never ship in the production build.

## Product Principles

1. The check is the heartbeat: recording a condition check must be the fastest, most obvious path on any screen that offers it.
2. Trust over flourish: every save confirms itself, every error says what to do next.
3. One site at a time: scope is always visible and easy to change.
4. Works in the hand: every field task is completable one-handed on a phone.

## Accessibility & Inclusion

No formal standard is required. Good practice is expected: readable contrast in light and dark themes, full keyboard use with visible focus, comfortable touch targets on phones, and respect for reduced-motion settings.
