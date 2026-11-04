---
title: Build a widget
description: A focus timer from manifest to desktop, with settings, clicks, persistent state, size and appearance.
sidebar:
  order: 1
---

This guide builds a focus timer: a ring that empties over a session, started and paused with a click,
that keeps running across restarts. It touches every part of a widget. Start from a pack created as in
[Your first widget](/docs/getting-started/first-widget/) and keep the [dev loop](/docs/getting-started/dev-loop/)
running.

## 1. Declare the widget

Add an entry to `widgets` in `vitrine.json`:

```json
{
  "id": "focus",
  "name": "Focus timer",
  "description": "A Pomodoro-style timer",
  "entry": "src/focus/index.tsx",
  "settings": "src/focus/settings.json",
  "size": { "default": [2, 2], "min": [2, 2], "max": [4, 4] },
  "interactive": true,
  "permissions": []
}
```

- `id` is stable: instances and their data refer to it. Use `a-z`, `0-9` and `-`.
- `size` is in grid cells; the user can resize between `min` and `max`.
- `interactive: true` routes clicks to the widget. Without it the widget is click-through, like the
  wallpaper. See [Interactivity](/docs/guides/interactivity/).
- `permissions` stays empty: the timer reads no system metrics and calls no network.

## 2. Describe its settings

`src/focus/settings.json` lists the options the control panel shows:

```json
[
  {
    "title": "Timer",
    "settings": {
      "minutes": { "type": "number", "default": 25, "label": "Session length (minutes)", "min": 5, "max": 90, "step": 5 },
      "label": { "type": "string", "default": "Focus", "label": "Label" }
    }
  }
]
```

An integer `number` with `min`, `max` and `step` becomes a spin box; Vitrine clamps the value before
your code sees it. [Settings](/docs/guides/settings/) covers every field type.

## 3. Write the component

`src/focus/index.tsx`:

```tsx
import { createEffect, createMemo } from "solid-js";
import { mount, useAppearance, useClock, useSettings, useSize, useStorage } from "@vitrine/sdk";

interface Timer {
  /** Epoch ms when the running session ends; null while stopped. */
  endsAt: number | null;
  /** Ms left when stopped. */
  left: number;
}

const R = 44;
const CIRC = 2 * Math.PI * R;

function Focus() {
  const s = useSettings({ minutes: 25, label: "Focus" });
  const size = useSize();
  const look = useAppearance();
  const full = () => s().minutes * 60_000;

  const [timer, setTimer] = useStorage<Timer>("timer", { endsAt: null, left: full() });
  const running = () => timer().endsAt !== null;

  // A per-second clock exists only while the timer runs: the memo disposes it on stop.
  const tick = createMemo(() => (running() ? useClock("second") : null));
  const left = () => {
    const t = timer();
    if (t.endsAt === null) return t.left;
    tick()?.(); // re-evaluate on every tick
    return Math.max(0, t.endsAt - Date.now());
  };

  // Stop at zero.
  createEffect(() => {
    if (running() && left() === 0) setTimer({ endsAt: null, left: 0 });
  });

  const toggle = () => {
    const t = timer();
    if (t.endsAt !== null) setTimer({ endsAt: null, left: left() });
    else setTimer({ endsAt: Date.now() + (t.left > 0 ? t.left : full()), left: 0 });
  };
  const reset = () => setTimer({ endsAt: null, left: full() });

  const fg = () => (look().dark ? "#ffffff" : "#1b1b1b");
  const ring = () => Math.max(48, Math.min(size().width, size().height) - 32);
  const mmss = () => {
    const sec = Math.ceil(left() / 1000);
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
  };

  return (
    <view
      onClick={toggle}
      style={{
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        background: look().dark ? "rgba(32, 32, 32, 0.45)" : "rgba(255, 255, 255, 0.55)",
        backdropFilter: "blur(16px) saturate(1.6)",
        color: fg(),
      }}
    >
      <view style={{ width: ring(), height: ring() }}>
        <svg width={ring()} height={ring()} viewBox="0 0 100 100">
          <circle cx={50} cy={50} r={R} fill="none" stroke={fg()} strokeOpacity={0.15} strokeWidth={6} />
          <circle
            cx={50}
            cy={50}
            r={R}
            fill="none"
            stroke={look().accent}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={`${((CIRC * left()) / full()).toFixed(2)} ${CIRC.toFixed(2)}`}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dasharray 900ms linear" }}
          />
        </svg>
        <view style={{ position: "absolute", inset: 0, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <text style={{ fontFamily: "Segoe UI Variable Display", fontSize: Math.round(ring() * 0.24), fontWeight: 600 }}>
            {mmss()}
          </text>
          <text style={{ fontSize: 12, opacity: 0.7 }}>{running() ? s().label : left() === 0 ? "Done" : left() === full() ? "Ready" : "Paused"}</text>
        </view>
      </view>
      <view
        onClick={(e) => (e.stopPropagation(), reset())}
        style={{ position: "absolute", right: 10, bottom: 8, paddingHorizontal: 6, paddingVertical: 2 }}
      >
        <text style={{ fontSize: 11, opacity: 0.6 }}>Reset</text>
      </view>
    </view>
  );
}

mount(() => <Focus />);
```

Save: the dev loop reloads it. Or preview it without the desktop:

```sh
vitrine render dist focus --cells 2x2 --out focus.png
```

## How it works

**State that survives restarts.** The timer stores *when it ends*, not how much is left, with
`useStorage`. Vitrine can restart a widget at any time (a pack update, a language change, sign-in),
and the timer resumes at the right second because `left()` is computed from `Date.now()`. Each call
to `setTimer` writes a new object: storage values are compared by identity, and every write goes to disk.
See [Storage](/docs/guides/storage/).

**Waking only when needed.** `useClock("second")` wakes the widget once a second. Created inside
`createMemo`, it exists only while `running()` is true: when the timer stops, the memo re-runs and
SolidJS disposes the previous clock and its timer. A stopped timer costs nothing. The same pattern
rebuilds a hook when a setting changes; see [Performance](/docs/guides/performance/).

**Size.** The widget fills its cells (`width: "100%"`) and `useSize()` gives the size in DIPs, so the
ring is computed from it and follows live resizing in Edit layout. Cell size varies slightly with the
monitor, so never hard-code it.

**Clicks.** The whole widget toggles the timer. **Reset** calls `e.stopPropagation()` so the click
doesn't also reach the parent's `onClick`. Events bubble from the deepest element with a handler.

**Smooth ring.** `transition: "stroke-dasharray 900ms linear"` interpolates between the per-second
values, so the arc glides instead of stepping. Transitions run only on numeric values; see
[Animations](/docs/guides/animations/).

**Appearance.** `useAppearance()` follows Windows light/dark mode and accent colour live, and
`backdropFilter` gives the background real frosted glass over the wallpaper. See
[Appearance](/docs/guides/appearance/) and [Glass and legibility](/docs/guides/glass-and-legibility/).

## Ship it

```sh
npm run pack
```

Install the `.vitrine`, add **Focus timer** from the gallery, then follow
[Publishing](/docs/publishing/) to share it. Before publishing, read the
[design guidelines](/docs/design/guidelines/).
