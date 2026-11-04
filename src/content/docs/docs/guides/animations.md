---
title: Animations
description: CSS-like transitions on numeric properties, static transforms, and motion that doesn't cost energy.
sidebar:
  order: 10
---

Vitrine animates with transitions: declare which properties ease and for how long, change the value,
and the engine draws the frames in between. Your code runs once per change, not once per frame.

```tsx
import { createSignal } from "solid-js";
import { mount } from "@vitrine/sdk";

function Agenda() {
  const [open, setOpen] = createSignal(false);

  return (
    <view
      onClick={() => setOpen(!open())}
      style={{ width: "100%", height: "100%", flexDirection: "column", padding: 14, borderRadius: 12, background: "rgba(32, 32, 32, 0.55)" }}
    >
      <view style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <text style={{ fontSize: 14, fontWeight: 600 }}>Today</text>
        <svg width={12} height={12} viewBox="0 0 12 12">
          {/* transform switches instantly; it is not interpolated */}
          <path d="M 3 4.5 L 6 7.5 L 9 4.5" fill="none" stroke="#ffffff" strokeWidth={1.4} transform={open() ? "rotate(180 6 6)" : ""} />
        </svg>
      </view>
      <view
        style={{
          height: open() ? 44 : 0,
          opacity: open() ? 1 : 0,
          overflow: "hidden",
          transition: "height 250ms ease-out, opacity 200ms ease",
        }}
      >
        <text style={{ fontSize: 12, marginTop: 8, opacity: 0.8 }}>10:00 Design review</text>
        <text style={{ fontSize: 12, opacity: 0.8 }}>14:30 Dentist</text>
      </view>
    </view>
  );
}

mount(() => <Agenda />);
```

## transition

```ts
transition: "height 250ms ease-out, opacity 200ms ease 50ms"
```

Each comma-separated entry is a property (camelCase or kebab-case, or `all`), a duration in `ms` or
`s`, an optional easing and an optional delay. Easings: `ease` (the default), `linear`, `ease-in`,
`ease-out`, `ease-in-out`.

A transition starts whenever the property's value changes while the element declares it. It starts
from the value currently on screen, so interrupting a running transition reverses smoothly.

## What interpolates

Only **numbers**: plain numbers and `px` lengths, or lists of them.

| Interpolates | Switches at once |
|---|---|
| `width`, `height`, `top`, `left`, `right`, `bottom` | colours: `color`, `background`, `borderColor` |
| `margin*`, `padding*`, `gap` | gradients |
| `opacity`, `borderRadius` | `transform` |
| SVG attributes: `r`, `cx`, `x`, `strokeWidth`, `strokeDashoffset`, `strokeDasharray` | percentages (`"40%"`), `"auto"` |

Work with that:

- **Fade instead of recolouring.** For a hover fill, stack a layer with the new colour and transition
  its `opacity` ([example](/docs/guides/interactivity/#hover-and-press-state)).
- **Use DIPs for bars.** Compute `width` from `useSize()` rather than `"%"`
  ([example](/docs/guides/system-metrics/)).
- **Rings** transition `strokeDasharray` as `"<arc> <circumference>"`
  ([example](/docs/guides/building-a-widget/)).
- **Name the properties.** `all` also catches strings that can't interpolate; list what you mean.

:::note
`cubic-bezier(…)` easings are not reliable inside a `transition` value in Vitrine 2.x (the list is
split on commas); stick to the named easings.
:::

## Transforms

`transform` takes `translate(x, y)`, `translateX`, `translateY`, `scale(s)` or `scale(x, y)`,
`scaleX`, `scaleY` and `rotate(deg)`, combined in order and applied around the box centre. It is
paint-only, so it is ideal for static effects: a pressed button at `scale(0.96)`, a tilted label,
an icon flipped by state. SVG elements take the SVG `transform` attribute, e.g. `rotate(-90 50 50)` to
start a ring at the top. Neither is interpolated: a change of transform shows at once.

## Motion and energy

- The engine draws frames, at display rate, only while a transition runs, then goes idle. A widget
  with nothing changing costs nothing.
- `opacity`, `borderRadius` and `transform` changes repaint without layout. Transitions on sizes and
  margins lay the widget out on every frame: fine for a short reveal, wasteful as a constant effect.
- There is no `requestAnimationFrame`, on purpose. Don't emulate it with a fast `setInterval`: a
  16 ms timer keeps the engine awake forever. For something continuous, such as a seconds hand, update
  once a second and let a transition smooth the step, or simply step.
- Vitrine itself fades widgets in and out when they are added or removed; don't add your own
  entrance animation to the root.

Everything stops while widgets are [paused](/docs/guides/performance/).
