---
title: System metrics
description: Read CPU, memory, battery, drives, processes and network throughput with useSystem.
sidebar:
  order: 6
---

`useSystem(metrics, intervalMs)` subscribes to system metrics and returns a signal with the latest
snapshot. Each metric needs its `system.<metric>` permission in the widget's manifest entry.

```tsx
import { formatBytes, mount, useSize, useSystem } from "@vitrine/sdk";

function Bar(props: { label: string; value: number | null; detail: string; width: number }) {
  const v = () => Math.min(100, Math.max(0, props.value ?? 0));
  return (
    <view style={{ flexDirection: "column", gap: 4 }}>
      <view style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <text style={{ fontSize: 12, fontWeight: 600 }}>{props.label}</text>
        <text style={{ fontSize: 12, opacity: 0.7 }}>{props.value === null ? "–" : `${Math.round(v())}%  ${props.detail}`}</text>
      </view>
      <view style={{ width: props.width, height: 4, borderRadius: 2, background: "rgba(255, 255, 255, 0.15)" }}>
        {/* A width in DIPs, not "%": only plain numbers are interpolated. */}
        <view style={{ width: (props.width * v()) / 100, height: 4, borderRadius: 2, background: "#60CDFF", transition: "width 700ms ease" }} />
      </view>
    </view>
  );
}

function System() {
  const sys = useSystem(["cpu", "memory"], 2000);
  const size = useSize();
  const inner = () => Math.max(0, size().width - 32);

  return (
    <view style={{ width: "100%", height: "100%", flexDirection: "column", justifyContent: "center", gap: 12, padding: 16, borderRadius: 12, background: "rgba(32, 32, 32, 0.55)" }}>
      <Bar label="CPU" value={sys().cpu?.usage ?? null} detail={`${sys().cpu?.cores ?? ""} cores`} width={inner()} />
      <Bar
        label="Memory"
        value={sys().memory?.load ?? null}
        detail={sys().memory ? `${formatBytes(sys().memory!.used)} of ${formatBytes(sys().memory!.total)}` : ""}
        width={inner()}
      />
    </view>
  );
}

mount(() => <System />);
```

```json
"permissions": ["system.cpu", "system.memory"]
```

## What you get

Every field is optional in the snapshot: it starts empty and fills in as samples arrive, so read it
with `?.` and show a placeholder until then.

| Metric | Fields |
|---|---|
| `cpu` | `usage`: percent of all cores, 0–100, one decimal; `cores`: logical processors |
| `memory` | `total`, `available`, `used`: bytes; `load`: percent in use, 0–100 |
| `battery` | `hasBattery`; `charging`; `level`: percent or `null`; `remainingSeconds`: estimate or `null`; `powerSource`: `"ac"`, `"battery"` or `"unknown"`; `saver`: battery saver on |
| `drives` | Fixed drives: `[{ name: "C:", label, total, free, used }]`, bytes |
| `processes` | The ten processes with the largest working set: `[{ name, pid, memory }]` |
| `network` | `rxPerSec`, `txPerSec`: bytes per second over all active interfaces |

`cpu` and `network` are rates, measured between two samples: their first value is `0`.
`formatBytes(n)` turns byte counts into `1.2 GB`, `340 MB`.

:::caution
The SDK type also lists a `system` metric (host name, OS, uptime), but there is no permission for it
in Vitrine 2.x, so it is never delivered. Don't rely on it.
:::

## How sampling works

- **Shared and on demand.** Vitrine samples only the metrics some widget asked for, once, and hands
  each widget the metrics it is permitted. Ten CPU widgets cost one CPU reading.
- **Interval.** Each metric is sampled at the fastest interval any widget requested, never faster
  than once a second. Several `useSystem` calls in one widget merge into one subscription.
- **Battery.** In battery saver, or on battery with **Save battery** on in the control panel, every
  interval doubles.
- **Paused.** While widgets are paused (locked session, display off, full-screen app), nothing is
  sampled.
- **Denied.** A metric without its permission is dropped from the subscription, with a warning in the
  log.

Pick the slowest interval that still reads as live: 2 s suits CPU and network, 10 s or more suits
memory, and drives or battery change slowly enough for 30–60 s.

:::tip
The interval argument is read once. To let users choose it in settings, create the subscription in a
memo: `const sys = createMemo(() => useSystem(["cpu"], s().interval * 1000))`, then read `sys()()`.
:::

## Presenting metrics

- Transition the numbers you draw (bar widths, ring `strokeDasharray`) over roughly the sample
  interval, so values glide instead of jumping; see [Animations](/docs/guides/animations/).
- Bar widths must be numbers in DIPs for the transition to run: compute them from `useSize()`.
- Flag thresholds with colour sparingly, for example from 90%, and keep the value readable as text.
