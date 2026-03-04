# SmartFinance — Design System

**Philosophy**: iOS iPhone 16 / Safari PWA aesthetic. Clean, minimal, no harsh borders. Elevation through shadow and background opacity, not outlines.

## Color Palette

| Role | Light | Dark | Usage |
|------|-------|------|-------|
| Primary action | `sky-500` | `sky-400` | FAB, active nav, CTA buttons |
| Background | `slate-100→white` gradient | `slate-950→slate-900` gradient | Page body |
| Surface (card) | `white/90` | `slate-800/80` | Main panel cards |
| Surface (muted) | `slate-50/80` | `slate-900/60` | Secondary surfaces |
| Income | `blue-50/80` | `blue-950/40` | Income summary card |
| Expense | `red-50/80` | `red-950/40` | Expense summary card |
| Paid | `green-50/80` | `green-950/40` | Paid summary card |
| Balance | `white/80` | `slate-800/60` | Balance summary card |
| Premium | `amber-500 → orange-500` | same | Upgrade badges, premium UI |
| Danger | `red-500` | `red-400` | Delete actions |
| Text primary | `slate-900` | `white` | Headings, values |
| Text secondary | `slate-600` | `slate-300` | Body text |
| Text muted | `slate-500` | `slate-400` | Labels, hints |

## Typography

Font family: **Inter** (Google Fonts)

| Scale | Class | Usage |
|-------|-------|-------|
| 2xl bold | `text-2xl font-bold` | Page titles (Settings, etc.) |
| xl semibold | `text-xl font-semibold` | App name in header |
| lg semibold | `text-lg font-semibold` | Section headings |
| 2xl semibold | `text-2xl font-semibold` | Financial values in cards |
| sm medium | `text-sm font-medium` | Card titles, list labels |
| sm | `text-sm` | Body, descriptions |
| xs | `text-xs` | Hints, labels, badges |
| xs uppercase | `text-xs uppercase tracking-wider` | Section overline labels |

## Spacing

| Context | Classes | Notes |
|---------|---------|-------|
| Page sections gap | `space-y-5` to `space-y-6` | Between major cards |
| Card internal | `p-5 sm:p-6` | Main panel padding |
| Compact card | `p-4` | Secondary panels |
| Settings rows | `px-4 py-3.5` | iOS settings list rows |
| Item gap (inline) | `gap-3` | Icon + label spacing |
| Tight gap | `gap-1` to `gap-2` | Chips, tags |

## Border Radius

| Token | Class | Usage |
|-------|-------|-------|
| Full (circle/pill) | `rounded-full` | FAB, toggles, avatar |
| 3XL | `rounded-3xl` | Main panel cards (`panelClasses`) |
| 2XL | `rounded-2xl` | Settings groups, sub-panels |
| XL | `rounded-xl` | Input fields |
| LG | `rounded-lg` | Small cards, buttons |
| MD | `rounded-md` | Compact UI elements |

## Shadows (no hard borders)

| Level | Class | Usage |
|-------|-------|-------|
| Card elevation | `shadow-xl shadow-slate-900/5 dark:shadow-black/30` | Main `panelClasses` |
| Subtle card | `shadow-sm shadow-[color]/50` | Summary metric cards |
| FAB | `shadow-lg shadow-sky-900/30` | Floating action button |
| Settings group | `shadow-sm shadow-slate-900/5 dark:shadow-black/20` | iOS grouped list |

## Touch Targets

Minimum: **44×44px** (`min-h-[44px] min-w-[44px]`)

- FAB: 56×56px (`w-14 h-14`)
- Nav tabs: `min-h-[44px] px-3`
- Settings rows: `min-h-[52px]`
- Icon buttons: `p-2.5` on 20px icon = ~44px effective

## Layout

- Max width: `max-w-md` (448px)
- Center aligned: `mx-auto`
- Mobile padding: `px-3 sm:px-0`
- Bottom nav height: ~56px + safe area
- Body padding-bottom: `pb-28` (accounts for nav + FAB overhang)

## Dark Mode

Strategy: Tailwind `class`-based (`darkMode: 'class'` in index.html config).
Applied via `document.documentElement.classList.toggle('dark')`.
Every component **must** have `dark:` variants for all color classes.

## Animations

| Interaction | Class |
|-------------|-------|
| FAB press | `active:scale-95 transition-transform` |
| Cards drag | `active:scale-[0.99] transition` |
| Theme switch | `transition-colors duration-500` on body |
| List items | `.list-item-enter` → `slideIn` keyframe in index.css |
| Modal | `.modal-overlay` + `.modal-container` transitions |

## iOS Toggle Switch Pattern

```jsx
<button role="switch" aria-checked={checked}
  className={`relative w-11 h-6 rounded-full transition-colors
    ${checked ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
    ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
</button>
```
