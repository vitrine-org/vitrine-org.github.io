---
title: Design guidelines
description: How to design widgets that feel native on Windows 11, read on any wallpaper and cost almost nothing to run.
sidebar:
  order: 2
---

A widget lives on someone's desktop for months. It is seen a thousand times for every time it is
used, so it should be quiet, exact and legible before it is clever. These guidelines are the
rules the official packs follow; [Essentials](/packs/#dev.vitrine.essentials) is the reference
implementation for the Fluent style.

## Belong to Windows 11

Vitrine draws beneath the icons, next to the taskbar, the Start menu and the Windows widgets
board. A widget that borrows their language feels like part of the system.

- **Typeface.** Use Segoe UI Variable, the Windows 11 system face, unless the pack has its own
  identity. Essentials uses its three optical sizes: `Segoe UI Variable Display` for large numbers,
  `Segoe UI Variable Text` for body text and `Segoe UI Variable Small` for captions. These ship
  with Windows 11, so they need no bundling.
- **Shape.** Rounded rectangles with a radius of 8 to 12 DIPs. Essentials cards use 12; controls
  inside a card use 4 to 8. Don't mix radii within one widget.
- **Material.** Acrylic, not flat colour: a translucent tint over `backdropFilter: "blur(16px)
  saturate(1.6)"`, with a 1 DIP hairline edge. Solid fills look like stickers on the wallpaper.
- **Iconography.** Outline icons at a 1.5 DIP stroke, drawn as SVG paths, sized 16 or 20 DIPs for UI
  and larger only for the main glyph of a widget (a weather condition, a battery).
- **Accent.** Follow the Windows accent through [`useAppearance()`](/docs/guides/appearance/) and use
  it for one thing per widget: today's date, the active value, the primary action.

## Sit on the grid

The desktop is a grid of **64 × 64 DIP cells** with an **8 DIP gap** and a 24 DIP margin from the
edges of the work area. A widget of *n* × *m* cells measures `n × 64 + (n − 1) × 8` by
`m × 64 + (m − 1) × 8` DIPs.

| Cells | DIPs |
| --- | --- |
| 1 | 64 |
| 2 | 136 |
| 3 | 208 |
| 4 | 280 |
| 5 | 352 |
| 6 | 424 |

- **Use a 4 DIP spacing scale** inside the widget: 4, 8, 12, 16, 24. A card, for example, pads
  its content by 16 DIPs horizontally and 24 when it is two cells tall.
- **Align to the edges you share.** Two widgets side by side are separated by exactly the 8 DIP gap,
  so a 16 DIP inner padding puts their content on a common 32 DIP rhythm. Keep the padding identical
  across a pack and the whole desktop lines up.
- **Pick the default size where the design is best**, then set `min` to the size where nothing is cut
  and `max` to where the design still holds. Test every size in between in edit layout.
- **Be responsive: shape picks the layout, size only scales it.** Draw one design per shape you
  support (square, wide, tall) and scale every dimension with
  [`useResponsive()`](/docs/reference/sdk/#useresponsive). Never add or drop elements at a size
  threshold: a user who enlarges a widget expects the same widget, larger. If a larger layout shows
  more (a forecast, a month), give it its own shape and list it in
  [`variants`](/docs/reference/manifest/#variants), or make it a separate widget.

## Be legible on any wallpaper

You never know what is behind your widget: a white photo, a black one, a busy one.

- **Card**: acrylic gives a predictable background whatever the wallpaper. Keep text contrast at
  4.5:1 or more against the card's tint, measured over both a white and a black wallpaper.
- **Bare**: content drawn straight on the wallpaper needs a soft Gaussian `textShadow`: a dark blur
  under light text (`0 1px 4px rgba(0, 0, 0, 0.8)`), a light glow under dark text. SVG strokes
  get a wider, faint stroke underneath, as a halo. See [Glass and legibility](/docs/guides/glass-and-legibility/).
- **Hierarchy through size and weight, not grey.** Secondary text at 78 to 80 % opacity, tertiary at
  55 to 70 %. Anything fainter disappears on half the wallpapers.
- **Numbers**: use tabular figures for values that change, so the layout doesn't shimmer every
  second.
- **Minimum size**: 12 DIPs for any text, 14 for anything the user has to read, not just glance at.

## Follow light and dark

Windows has a light and a dark mode, and users switch them, sometimes on a schedule. Offer a
**Theme** setting with *System*, *Light* and *Dark*, default to *System*, and read the live value from
`useAppearance()`, so the widget changes with Windows without a restart. Design both palettes
deliberately: dark is not light inverted. Light text on dark acrylic needs a little more weight than
dark text on light acrylic to read the same.

For bare themes, "light" and "dark" describe the **text**, not the mode: a bare widget on a dark
wallpaper wants light text even when Windows is in light mode. Label the options that way, as Sargas
does with *Light (dark wallpaper)* and *Dark (light wallpaper)*.

## Move with restraint

Motion on the desktop is seen in peripheral vision, where it is most distracting.

- **Animate state changes, never idle.** A value that updates can ease to its new position; nothing
  should loop, pulse or breathe while nothing is happening.
- **Short and soft**: 150 ms for hover feedback, 300 to 600 ms for a value that moves (a gauge, a
  progress bar), with an ease-out curve.
- **Animate what interpolates**: `opacity`, sizes and positions in DIPs, `borderRadius` and SVG
  stroke values. Transforms and colours switch instantly, so fade a hover layer's `opacity` instead of
  its colour. The list is in [Animations](/docs/guides/animations/).
- **Tick at the right rate.** A clock without seconds uses `useClock("minute")` and redraws once a
  minute. See [Performance and energy](/docs/guides/performance/).

## Make interaction obvious and safe

Only widgets marked `"interactive": true` receive the mouse, and the desktop icons always win where
they are. See [Interactivity](/docs/guides/interactivity/).

- **Targets of 32 DIPs or more** for anything clickable, with a visible hover state (an 8 to 10 %
  overlay) and a pressed state.
- **No hidden gestures.** If the wheel or a click does something, show a control that hints at it.
- **Text entry goes through [`prompt()`](/docs/guides/text-input/)**, the Windows 11 flyout; widgets
  have no keyboard focus.
- **Ask before destroying.** Clearing a list or resetting a counter should take a deliberate click,
  not a stray one on the desktop.

## Accessibility

- **Contrast** of 4.5:1 for text and 3:1 for meaningful graphics, in both themes and on both
  extremes of wallpaper.
- **Never colour alone.** Pair the accent with weight, position or an icon: a checked task is both
  ticked and struck through.
- **Respect the user's size.** Widgets scale with Windows display scaling; let users choose a larger
  widget rather than shrinking type to fit more.
- **Localise** names, settings and visible text, and format dates and numbers with the SDK so they
  follow the Windows regional format. See [Localisation](/docs/guides/localisation/).

## Before you publish

- The widget looks intentional at every size between its min and max, and identical (only larger) at every size of the same shape.
- It reads on a white, a black and a busy wallpaper, as a card and bare.
- Light, dark and System all work, and switching Windows' mode updates it live.
- Nothing animates while nothing changes.
- Every clickable thing is at least 32 DIPs and has hover and pressed states.
- Previews are rendered at the default size and `--scale 2`.
