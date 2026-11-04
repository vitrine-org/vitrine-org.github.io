---
title: Interactivity
description: Clicks, hover and the mouse wheel on a widget that lives beneath the desktop icons, and where the desktop keeps priority.
sidebar:
  order: 3
---

Widgets sit between the wallpaper and the desktop icons, so they never receive input directly.
Vitrine watches the pointer and forwards it to a widget only when nothing else on the desktop should
get it. This guide shows the API and the rules.

## Opt in

Set `"interactive": true` on the widget in `vitrine.json`. Without it the widget is fully
click-through: clicks, drags and rubber-band selections go to the desktop, exactly as on the
wallpaper. Leave it off for widgets that only display information.

## Handlers

Pointer handlers go on any element:

```tsx
import { createSignal } from "solid-js";
import { mount, openUrl } from "@vitrine/sdk";

function Counter() {
  const [count, setCount] = createSignal(0);
  const [hover, setHover] = createSignal(false);

  return (
    <view
      onClick={() => setCount(count() + 1)}
      onWheel={(e) => setCount(count() - Math.sign(e.deltaY ?? 0))}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      style={{
        width: "100%",
        height: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        borderRadius: 12,
        background: "rgba(32, 32, 32, 0.55)",
        border: hover() ? "1px solid rgba(255, 255, 255, 0.35)" : "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <text style={{ fontSize: 40, fontWeight: 600 }}>{count()}</text>
      <view
        onClick={(e) => {
          e.stopPropagation(); // don't count this click
          openUrl("https://vitrine-org.github.io/docs/guides/interactivity/");
        }}
        style={{ paddingHorizontal: 8, paddingVertical: 2 }}
      >
        <text style={{ fontSize: 12, color: "#60CDFF" }}>How it works</text>
      </view>
    </view>
  );
}

mount(() => <Counter />);
```

| Handler | Fires when |
|---|---|
| `onPointerDown`, `onPointerUp` | The left button goes down or up |
| `onClick` | Down and up happened on the same element |
| `onPointerEnter`, `onPointerLeave` | The pointer enters or leaves the element under it |
| `onPointerMove` | The pointer moves over the element |
| `onWheel` | The wheel turns; `deltaY` is `100` per notch, positive toward the user |

Every handler receives `{ type, x, y, deltaY, button, target, stopPropagation() }`. `x` and `y` are in
DIPs from the widget's top-left corner, not the element's. `button` is always `0`: right-click is
reserved for the widget menu.

## Hit-testing and bubbling

The target is the deepest element under the pointer that has a handler. Elements without handlers
are transparent to hit-testing, and `overflow: "hidden"` clips it: a child outside its parent's clip
can't be hit. From the target the event bubbles through its ancestors, running each handler, until one
calls `e.stopPropagation()`.

Enter and leave bubble too. Moving between two buttons inside a card sends the card a leave (from the
first button) and an enter (from the second). Keep hover state on the element that owns it, as the
`usePress` helper below does.

## Hover and press state

Background colours don't animate, so a hover fill is a layer whose opacity transitions:

```tsx
import { createSignal, type JSX } from "solid-js";

/** Hover and pressed state for one interactive element. */
export function usePress() {
  const [hover, setHover] = createSignal(false);
  const [down, setDown] = createSignal(false);
  const handlers = {
    onPointerEnter: () => setHover(true),
    onPointerLeave: () => (setHover(false), setDown(false)),
    onPointerDown: () => setDown(true),
    onPointerUp: () => setDown(false),
  };
  return { hover, down, handlers };
}

export function Button(props: { label: string; onClick: () => void }): JSX.Element {
  const press = usePress();
  return (
    <view onClick={props.onClick} {...press.handlers} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
      {/* Background colours don't animate: fade a layer's opacity instead. */}
      <view
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 6,
          background: press.down() ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.10)",
          opacity: press.hover() ? 1 : 0,
          transition: "opacity 150ms ease",
        }}
      />
      <text style={{ fontSize: 13 }}>{props.label}</text>
    </view>
  );
}
```

Show secondary controls (an edit pencil, a delete button) only on hover: the desktop stays calm and
the widget still reads as interactive when it matters.

## Where the desktop wins

A pointer event reaches a widget only when all of these hold:

- the widget is interactive and the point is inside it;
- **no desktop icon is there**: the whole grid slot of each icon, label included, keeps its clicks,
  double-clicks, drags and context menu;
- **the desktop itself is under the pointer**: any window in front, including the taskbar and
  notifications, gets the input instead;
- Edit layout is not active and no Vitrine menu is open.

Within those rules:

- **Right-click** always opens the widget menu (**Widget settings…**, **Edit layout**,
  **Remove widget**); widgets never see it.
- **Double-clicks** are swallowed so the desktop doesn't act on them; widgets get two separate
  clicks.
- **There is no keyboard.** Widgets never get focus. For text, use
  [`prompt()`](/docs/guides/text-input/).
- **Clicks on empty parts of an interactive widget** don't reach the desktop either: the area under an
  interactive widget can't start a rubber-band selection. Size interactive widgets to their content.

## Opening links

`openUrl(url)` opens an `http://` or `https://` URL in the default browser; other schemes are
ignored. Call it from a click, never on a timer: opening a browser unprompted is hostile.

Next: [Storage](/docs/guides/storage/) keeps what the user does across restarts.
