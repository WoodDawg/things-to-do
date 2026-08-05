# Design plan — Things To Do

A private field utility used one-handed, outdoors, often in direct sunlight. Every choice below
is judged against that, not against looking good in a screenshot.

## Palette

| Name | Hex | Role |
|---|---|---|
| `gravel` | `#212824` | Primary text and icons — near-black with a green cast, not pure black |
| `limestone` | `#F3F5F1` | App background — cool pale gray-green, deliberately not warm cream |
| `spruce` | `#2C5E45` | Primary actions, active states, links |
| `blaze` | `#D9480F` | Priority markers and destructive confirms only — hunting-vest orange, used sparingly |
| `mist` | `#5C6B60` | Secondary text, metadata (AA against limestone) |
| `card` | `#FFFFFF` | Card and input surfaces |

Single light theme, on purpose: the primary use case is sunlight, where a light UI with dark
text is the most legible option. No dark mode in v1 = no half-tested second contrast system.

## Type

- **Display: Barlow Condensed (600/700)** — Barlow derives from California highway signage;
  a places/wayfinding app gets its character from road-sign DNA. Used only for page titles,
  section labels, and the wordmark. Never for body text.
- **Body: Atkinson Hyperlegible** — designed by the Braille Institute for maximum character
  distinction. Chosen specifically for the sunlight/legibility requirement, not for looks.

## Layout concept

Single column, cards on `limestone`. A **fixed bottom action bar** holds the primary
"+ Add place" button and nav — the thumb zone owns the most-used action; nothing critical
lives top-right. Filter chips (Phase 3) scroll horizontally under a compact sticky header.
Minimum tap target 44px. Base text 16px, metadata never below 14px.

## Signature element

**The trail blaze.** Every place row carries a small painted-blaze rectangle (rounded 2px,
~10×16px) color-coded by status: outlined `spruce` = want to go, filled `spruce` = been,
filled `blaze` orange = favorite, gray strike = ruled out. The same blaze becomes the map
marker in Phase 4 — one status language everywhere, legible at a glance in sun.

## Self-critique (per brief §9)

- *Green accent for an outdoors app — default or decision?* On-the-nose but earned: it comes
  from signage (park wayfinding, trail blazes), and it dodges all three banned defaults
  (no cream+terracotta, no near-black+acid-green, no hairline broadsheet). Kept.
- *Barlow Condensed risk:* uppercase condensed everywhere reads like a sportsbook. Constrained
  to titles/labels only; body is always Atkinson.
- *Blaze orange vs "terracotta":* `#D9480F` is a vivid safety orange, not a muted terracotta
  wash, and it is an accent-of-last-resort (priority, delete), not the brand color. Kept.
- *White cards on pale gray:* borderline generic. Earns its place because card edges +
  strong shadows are what survive glare; revised to use a visible `1px` gravel-tinted border
  rather than shadow-only separation.

## Quality floor (non-negotiable, from brief)

375px min width, visible `:focus-visible` rings (2px `spruce`), `prefers-reduced-motion`
respected, WCAG AA contrast throughout, real empty states with a recovery action, error text
that says what happened and what to do next.
