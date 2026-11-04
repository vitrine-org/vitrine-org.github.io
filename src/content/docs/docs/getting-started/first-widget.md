---
title: Your first widget
description: Scaffold a pack with the SDK, edit a widget in TSX and install it, in five minutes.
sidebar:
  order: 2
---

You need [Vitrine](/docs/getting-started/install/), [Node.js](https://nodejs.org/) 20 or later and
Git (npm fetches the SDK from GitHub).

## 1. Scaffold a pack

```sh
npx github:vitrine-org/sdk#v2.3.0 create my-widgets --id=dev.you.widgets
cd my-widgets
npm install
```

`--id` is the pack's reverse-DNS id: lowercase, at least two segments, unique to you. It names the
installed pack, so pick it once and keep it. Without `--id` the SDK uses `dev.example.<folder>`.

The scaffold is a pack with one widget, a clock:

```
my-widgets/
├── vitrine.json            pack manifest: id, name, version, widgets
├── package.json            depends on github:vitrine-org/sdk#v2.3.0
├── tsconfig.json
└── src/clock/
    ├── index.tsx           the widget
    └── settings.json       options shown in the control panel
```

In `vitrine.json`, each entry of `widgets` points at its TSX `entry`, its `settings` schema and its
grid `size` in cells (`default`, `min`, `max`). The [manifest reference](/docs/reference/manifest/) lists
every field.

## 2. Edit the widget

A widget is a SolidJS component passed to `mount()`. Instead of HTML it uses Vitrine's elements:
`view` is a flex box, `text` holds text, `span` styles part of it. Open `src/clock/index.tsx`, add a
greeting above the time:

```tsx {3-7,28}
import { formatDate, mount, useClock, useSettings } from "@vitrine/sdk";

function greeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Clock() {
  const settings = useSettings({ accent: "#60CDFF", showSeconds: false });
  const now = useClock(settings().showSeconds ? "second" : "minute");

  return (
    <view
      style={{
        width: "100%",
        height: "100%",
        padding: 20,
        borderRadius: 12,
        justifyContent: "center",
        flexDirection: "column",
        background: "rgba(32, 32, 32, 0.55)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        color: "#ffffff",
        fontFamily: "Segoe UI Variable Display",
      }}
    >
      <text style={{ fontSize: 13, marginBottom: 4, opacity: 0.7 }}>{greeting(now().getHours())}</text>
      <text style={{ fontSize: 44, fontWeight: 600, lineHeight: 1 }}>
        {formatDate(now(), "HH")}
        <span style={{ color: settings().accent }}>{formatDate(now(), settings().showSeconds ? ":mm:ss" : ":mm")}</span>
      </text>
      <text style={{ fontSize: 14, marginTop: 6, opacity: 0.7 }}>{formatDate(now(), "dddd D MMMM")}</text>
    </view>
  );
}

mount(() => <Clock />);
```

What's going on:

- `useClock("minute")` is a signal that changes on every minute boundary. Everything that reads
  `now()` updates, and nothing else runs in between: SolidJS updates only the text nodes that depend on
  it, and Vitrine redraws only when something changed.
- `useSettings(defaults)` returns the instance's settings from the control panel, merged over the
  defaults, and updates live.
- `formatDate` follows the Windows regional format (QuickJS, the engine that runs widgets, has no
  `Intl`).

## 3. Pack and install

```sh
npm run pack
```

This builds every widget and writes `widgets-1.0.0.vitrine` (the last segment of the id, then the
version). Double-click it: Vitrine installs the pack. Open **Add widgets…** from the tray, find
**Clock** in the gallery and drop it on the desktop.

Change `name` in `vitrine.json` to give the pack its real name, and bump `version` for every
release: installing a newer pack replaces the old one and restarts its widgets.

:::tip
Packing and reinstalling for every change is slow. The [dev loop](/docs/getting-started/dev-loop/)
reloads your widget on the desktop each time you save.
:::

## Next

- [Dev loop](/docs/getting-started/dev-loop/): live reload, logs and headless previews.
- [Build a widget step by step](/docs/guides/building-a-widget/): settings, clicks, storage and size.
- [Elements](/docs/reference/elements/) and [styles](/docs/reference/styles/) reference.
