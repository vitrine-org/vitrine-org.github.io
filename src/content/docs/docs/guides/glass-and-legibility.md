---
title: Glass and legibility
description: Frosted glass with backdropFilter, and text shadows that keep widgets readable on any wallpaper.
sidebar:
  order: 8
---

A widget has no idea what is behind it: a dark photo, a white desktop, a busy pattern. Two tools keep
it readable everywhere: an acrylic card that blurs the wallpaper, or no card at all with a shadow
under the text. Offer both, as a `background` setting.

```tsx
import type { JSX } from "solid-js";
import { mount, useSettings, type Style } from "@vitrine/sdk";

/** Acrylic card, or nothing at all with a legibility shadow under the text. */
function Surface(props: { bare: boolean; children: JSX.Element }) {
  const card: Style = {
    background: "linear-gradient(160deg, rgba(56, 58, 64, 0.58), rgba(22, 23, 27, 0.50))",
    backdropFilter: "blur(16px) saturate(1.6)",
    border: "1px solid rgba(255, 255, 255, 0.13)",
    overflow: "hidden",
  };
  const bare: Style = { textShadow: "0 1px 4px rgba(0, 0, 0, 0.8)" };
  return (
    <view
      style={{
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "center",
        padding: 16,
        borderRadius: 12,
        color: "#ffffff",
        ...(props.bare ? bare : card),
      }}
    >
      {props.children}
    </view>
  );
}

function Quote() {
  const s = useSettings({ background: "card" });
  return (
    <Surface bare={s().background === "none"}>
      <text style={{ fontSize: 18, fontWeight: 600 }}>Simplicity is prerequisite for reliability.</text>
      <text style={{ fontSize: 12, marginTop: 6, opacity: 0.8 }}>Edsger W. Dijkstra</text>
    </Surface>
  );
}

mount(() => <Quote />);
```

## Frosted glass

`backdropFilter` works like CSS `backdrop-filter`, with two functions:

| Value | Effect |
|---|---|
| `blur(16px)` | Gaussian blur of the wallpaper; the radius is in DIPs |
| `saturate(1.6)` or `saturate(160%)` | Saturation; `1` leaves colours unchanged |
| `blur(16px) saturate(1.6)` | Both, in either order |
| `none` | No backdrop |

The blurred wallpaper of the monitor under the widget is drawn inside the box, clipped to its
`borderRadius`, **under** the box's own `background`. Keep that background translucent (alpha around
0.4–0.6): it tints the glass, and an opaque one hides it.

What shows through is the **wallpaper only**. Widgets live beneath the icons, where Windows offers no
backdrop, so Vitrine recomposes the wallpaper itself: other widgets, icons and windows never appear
in the glass. The filter is not inherited and applies only to the element that declares it.

:::tip
Vitrine blurs each monitor's wallpaper once per distinct filter value and shares the result between
all widgets on that monitor; painting glass is then a single bitmap fill. Use the same value
everywhere (`blur(16px) saturate(1.6)` is the Windows 11 acrylic look) and glass stays almost free.
:::

To give the card the inner highlight of Fluent acrylic, overlay an absolutely positioned
`linear-gradient` from a bright 1 px top edge to a faint shade at the bottom; there is no inset
`boxShadow`.

## Text shadows

`textShadow` takes `"dx dy blur color"` and draws a real Gaussian blur under the text. It is
inherited, so set it once on the widget root; `textShadow: "none"` turns it off for a subtree.

| Text | Shadow |
|---|---|
| Light on unknown wallpaper | `0 1px 4px rgba(0, 0, 0, 0.8)` |
| Dark on unknown wallpaper | `0 0 6px rgba(255, 255, 255, 0.75)`, a glow rather than a drop |
| On a glass card | `none`: the card already provides contrast |

Shadows don't apply to SVG. Give icons and strokes the same protection with a soft copy underneath:
the same shape offset by 1 DIP at about 35% opacity in the shadow colour, or a slightly wider stroke
in the shadow colour under a ring.

## Checking legibility

Preview both modes against real wallpapers before shipping:

```sh
vitrine render dist quote --backdrop photo.jpg --out card.png
vitrine render dist quote --settings '{"background":"none"}' --out bare.png
```

`--backdrop` replaces the default gradient behind glass. A bare render is transparent, so look at it
over both a light and a dark background. Then follow the contrast rules in the
[design guidelines](/docs/design/guidelines/).
