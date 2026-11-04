---
title: Performance
description: What costs CPU and energy in a widget, when Vitrine pauses widgets, and how to write code that stays idle.
sidebar:
  order: 12
---

A widget stays on screen all day, on laptops too. Vitrine is built to be idle when nothing changes: it
redraws a widget only when its tree changed, runs no code between events and pauses everything when
nobody can see the desktop. Widget code should keep that promise.

## What wakes a widget

| Source | Cost | Keep it cheap |
|---|---|---|
| Timers (`setTimeout`, `setInterval`, `useClock`) | A JavaScript run and usually a repaint per tick | `useClock("minute")` unless seconds are on screen: 60× fewer wake-ups |
| Transitions | Frames at display rate while running | Short durations; prefer `opacity` and `transform` changes, which skip layout |
| `useSystem` | Sampling on a background thread | The slowest interval that reads as live; `processes` is the heaviest metric |
| `fetch` | Network and a JSON parse | Cache in storage, refresh in minutes, not seconds |
| `useStorage` sets | A file write each time | Write on user actions and finished fetches only |
| Pointer moves | A JavaScript run per move over an interactive element | Keep `onPointerMove` handlers trivial, or use enter and leave |

What is cheap: a static tree, glass (`backdropFilter` reuses a cached, blurred wallpaper), text
shadows, SVG, and any number of widgets that are not changing.

## When Vitrine pauses

Widgets are paused while:

- the session is locked;
- the display is off;
- a full-screen app, a game or a presentation is running (checked every few seconds);
- the user chose **Pause widgets** in the tray menu.

While paused, timers don't fire, nothing is drawn and no metrics are sampled. Settings changes and
pending `fetch` responses are still delivered. On resume, timers that came due fire once and drawing
catches up.

In battery saver, or on battery with **Save battery** turned on, metric sampling runs at half rate.
Widgets keep running otherwise: they should already be cheap.

:::tip
Never count ticks to measure time: after a pause a minute-long interval may have fired once in an
hour. Store timestamps and derive from `Date.now()`, as the
[focus timer](/docs/guides/building-a-widget/) does.
:::

## Create work only when needed

Hooks start their work when called. Wrap them in `createMemo` to create them conditionally, or to
recreate them when a setting changes; SolidJS disposes the previous instance and its timer:

```ts
// Ticks every second only while seconds are visible, every minute otherwise.
const clock = createMemo(() => useClock(s().showSeconds ? "second" : "minute"));
const now = () => clock()();

// No clock at all while the timer is stopped.
const tick = createMemo(() => (running() ? useClock("second") : null));
```

Calling `useClock(s().showSeconds ? "second" : "minute")` directly reads the setting once: turning
seconds on in the control panel would not change the tick rate until the widget restarts.

## Limits that protect the desktop

Each widget runs in its own QuickJS runtime with a memory limit, and each entry into JavaScript (the
initial script, an event, a timer) has a time budget. A script that exceeds it is interrupted and the
error is logged. The values are in [Limits](/docs/reference/limits/). In practice:

- never do heavy work synchronously in an event handler or timer;
- keep bundles small: every byte is parsed each time the widget starts;
- render lists with `<For>` or `<Index>` so SolidJS updates rows instead of rebuilding them.

## Checking

Run with `vitrine --dev dist` and `VITRINE_DEBUG=1` to see pauses and warnings in the terminal, and
watch `vitrine.exe` in Task Manager with your widget on the desktop: idle should mean close to 0% CPU
between ticks.
