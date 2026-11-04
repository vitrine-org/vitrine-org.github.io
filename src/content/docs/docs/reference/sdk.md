---
title: SDK
description: Every function, hook and type exported by @vitrine/sdk, with signatures, behaviour and examples.
sidebar:
  order: 3
---

`@vitrine/sdk` is the TypeScript library and toolchain for widgets. It is built on SolidJS: hooks
return Solid accessors (`() => T`), and any Solid primitive (`createSignal`, `createMemo`,
`createResource`, `Show`, `For`, …) works inside a widget.

This page documents **v2.2.0** (`github:vitrine-org/sdk#v2.2.0`). APIs marked **since 2.2.0** are
not available in earlier versions.

| Import | Contents |
| --- | --- |
| `@vitrine/sdk` | Everything on this page. Importing it also installs the [runtime globals](#runtime-globals). |
| `@vitrine/sdk/renderer` | The Solid universal renderer. The JSX compiler imports it; widgets do not. |
| `@vitrine/sdk/vite` | `vitrinePlugins()` and `buildWidget()`, used by the [CLI](/docs/reference/cli/). |

## Summary

| Export | Kind | Purpose |
| --- | --- | --- |
| [`mount`](#mount) | function | Render the widget |
| [`useClock`](#useclock) | hook | Current time, aligned to second or minute boundaries |
| [`useSettings`](#usesettings) | hook | Instance settings, live |
| [`useSize`](#usesize) | hook | Widget size in DIPs, live |
| [`useAppearance`](#useappearance) | hook | Windows light/dark mode and accent colour, live |
| [`useSystem`](#usesystem) | hook | System metrics |
| [`useStorage`](#usestorage) | hook | Value persisted per instance |
| [`useLanguage`](#uselanguage) | hook | Vitrine's UI language (**since 2.2.0**) |
| [`prompt`](#prompt) | function | Ask the user for a line of text |
| [`openUrl`](#openurl) | function | Open a link in the default browser |
| [`formatDate`](#formatdate), [`formatTime`](#formattime), [`localeInfo`](#localeinfo) | functions | Locale-aware dates without `Intl` |
| [`formatBytes`](#formatbytes) | function | `1.5 KB`, `8 GB` |
| [`localized`](#localized) | function | Pick a text by language (**since 2.2.0**) |
| [`widgetInfo`](#widgetinfo) | function | Identity of the running instance |
| [`on`](#on) | function | Low-level engine events |
| [Types](#types) | types | `Style`, `VitrineElements`, `PointerEventData`, … |

## mount

```ts
function mount(app: () => JSX.Element): void
```

Renders the widget into the instance's root node and sends the first batch of changes immediately.
Call it once, at the top level of the widget's entry file.

```tsx
import { mount } from "@vitrine/sdk";

function App() {
  return <text>Hello</text>;
}

mount(() => <App />);
```

Changes after the first render are batched and sent to the engine on a microtask.

## useClock

```ts
function useClock(granularity?: "second" | "minute"): Accessor<Date>
```

The current time, updated just after every second or minute boundary. Default: `"minute"`.
Minute granularity wakes the engine 60 times less often: use it whenever seconds are not shown.
Each call owns a timer, cleared when the owning component is disposed.

```tsx
import { formatTime, useClock } from "@vitrine/sdk";

export function Time() {
  const now = useClock("minute");
  return <text style={{ fontSize: 40 }}>{formatTime(now())}</text>;
}
```

## useSettings

```ts
function useSettings<T extends Record<string, unknown>>(defaults: T): Accessor<T>
```

The instance's settings, merged over `defaults`. The engine sends the defaults of the widget's
[settings schema](/docs/reference/settings-schema/) with the user's values on top, so every schema key
is present; `defaults` covers keys outside the schema and running outside the engine. The accessor
updates live when the user edits the settings in the control panel.

```tsx
import { useSettings } from "@vitrine/sdk";

export function Label() {
  const settings = useSettings({ title: "Today", accent: "#60CDFF", size: 16 });
  return <text style={{ color: settings().accent, fontSize: settings().size }}>{settings().title}</text>;
}
```

The type parameter is inferred from `defaults`; values are not validated at runtime by the SDK (the
control panel validates them against the schema). See [Settings](/docs/guides/settings/).

## useSize

```ts
function useSize(): Accessor<Size> // { width: number; height: number }
```

The widget's size in DIPs. It changes when the user resizes the instance on the grid.

```tsx
import { useSize } from "@vitrine/sdk";

export function Adaptive() {
  const size = useSize();
  const compact = () => size().height < 140;
  return <text style={{ fontSize: compact() ? 24 : 48 }}>{compact() ? "S" : "L"}</text>;
}
```

## useAppearance

```ts
function useAppearance(): Accessor<Appearance> // { dark: boolean; accent: string }
```

`dark` is true when Windows' app mode is dark; `accent` is the accent colour as `#rrggbb`. Both update
live. Outside the engine the value is `{ dark: true, accent: "#0078d4" }`.

```tsx
import { useAppearance } from "@vitrine/sdk";

export function Themed() {
  const look = useAppearance();
  return (
    <view style={{ padding: 12, borderRadius: 12, background: look().dark ? "rgba(32,32,32,0.6)" : "rgba(255,255,255,0.7)" }}>
      <text style={{ color: look().dark ? "#fff" : "#1b1b1b" }}>Accent</text>
      <view style={{ height: 4, borderRadius: 2, background: look().accent }} />
    </view>
  );
}
```

See [Appearance](/docs/guides/appearance/).

## useSystem

```ts
function useSystem(metrics: Metric[], intervalMs?: number): Accessor<SystemSnapshot>
type Metric = "system" | "cpu" | "memory" | "battery" | "drives" | "processes" | "network"
```

Subscribes to system metrics. Default interval 2000 ms, minimum 1000 ms. All `useSystem` calls in a
widget share one snapshot: the subscription is the union of their metrics at the shortest interval,
and is updated when a calling component is disposed. Each delivery merges into the snapshot, so a
field is `undefined` until its first sample.

Each metric needs the matching `system.<metric>` [permission](/docs/reference/permissions/); metrics
without one are dropped by the engine (with a warning in the log). The engine samples only what some
widget asked for.

```tsx
import { formatBytes, useSystem } from "@vitrine/sdk";

export function Memory() {
  const sys = useSystem(["cpu", "memory"], 2000);
  return (
    <text>
      CPU {Math.round(sys().cpu?.usage ?? 0)}% · RAM {formatBytes(sys().memory?.used ?? 0)}
    </text>
  );
}
```

| Key | Fields |
| --- | --- |
| `cpu` | `usage` (percent, one decimal), `cores` |
| `memory` | `total`, `available`, `used` (bytes), `load` (percent) |
| `battery` | `hasBattery`, `charging`, `level` (percent), `remainingSeconds`, `powerSource` (`"ac"`, `"battery"`), `saver` |
| `drives` | array of `{ name, label, total, free, used }` (bytes; `name` is `"C:"`) |
| `processes` | array of `{ name, pid, memory }`, the top 10 by working set (bytes) |
| `network` | `rxPerSec`, `txPerSec` (bytes per second) |
| `system` | `hostname`, `os`, `uptime` |

:::caution
- CPU usage and network rates are differences between two samples; the first values can be `0`.
- At runtime `battery.level` and `remainingSeconds` can be `null`, and `powerSource` can be
  `"unknown"`, although the types do not say so.
- The `system` metric is typed, but engine 2.0 accepts no `system.system` permission string, so a
  subscription to it is always dropped.
:::

See [System metrics](/docs/guides/system-metrics/).

## useStorage

```ts
function useStorage<T>(key: string, initial: T): [Accessor<T>, (value: T) => void]
```

A value persisted for this instance. It survives restarts and pack updates and is deleted with the
instance. Values must be JSON-serialisable. The setter takes a value, not an updater function; each
call writes the instance's storage file. Two `useStorage` calls with the same key do not share a
signal: keep one per key.

```tsx
import { useStorage } from "@vitrine/sdk";

export function Tally() {
  const [count, setCount] = useStorage("count", 0);
  return <text onClick={() => setCount(count() + 1)}>{count()}</text>;
}
```

The engine stores the values in `%APPDATA%\Vitrine\storage\<instance id>.json`. See
[Storage](/docs/guides/storage/).

## useLanguage

:::note[Since SDK 2.2.0]
Engines that do not report the UI language yield `"en"`.
:::

```ts
function useLanguage(): string
```

Vitrine's UI language: `"en"`, `"it"`, `"fr"`, `"de"`, `"es"`, `"pt-BR"`, `"zh"` (Simplified Chinese),
`"ru"`, `"ja"` or `"ko"`, as chosen in the control panel or inherited from Windows. Widgets are
restarted when it changes, so it is a plain value, not an accessor. `"en"` on engines that do not
report it.

```tsx
import { localized, useLanguage, widgetInfo } from "@vitrine/sdk";

const t = {
  today: { en: "Today", it: "Oggi", "pt-BR": "Hoje", zh: "今天" },
};

export function Heading() {
  const lang = useLanguage(); // "en", "it", "pt-BR", "zh", …
  return <text>{localized(t.today)} ({lang})</text>;
}

widgetInfo().language; // same value as useLanguage()
```

See [Localisation](/docs/guides/localisation/).

## prompt

```ts
function prompt(options?: PromptOptions): Promise<string | null>
interface PromptOptions { title?: string; placeholder?: string; value?: string }
```

Widgets never receive keyboard focus. `prompt()` opens a small text dialog next to the widget and
resolves to the entered text, or `null` when the user cancels, when the engine has no prompt support,
or under `vitrine render`. Call it from a pointer handler.

The engine strips control characters and truncates `title` to 80, `placeholder` to 120 and `value`
to 2000 characters.

```tsx
import { prompt, useStorage } from "@vitrine/sdk";

export function Note() {
  const [note, setNote] = useStorage("note", "");
  const edit = async () => {
    const text = await prompt({ title: "Note", placeholder: "Write something", value: note() });
    if (text !== null) setNote(text);
  };
  return <text onClick={edit}>{note() || "Click to write"}</text>;
}
```

See [Text input](/docs/guides/text-input/).

## openUrl

```ts
function openUrl(url: string): void
```

Opens an `http://` or `https://` URL in the default browser; other schemes are ignored. Needs no
permission. The SDK documents it for user interactions (a click); engine 2.0 does not enforce this,
so do not open pages unprompted.

```tsx
import { openUrl } from "@vitrine/sdk";

export function Link() {
  return <text onClick={() => openUrl("https://open-meteo.com/")}>Weather data by Open-Meteo</text>;
}
```

## formatDate

```ts
function formatDate(date: Date | number, pattern: string, locale?: string): string
```

Formats a date with these tokens; text in `[brackets]` is copied literally.

| Token | Output | Token | Output |
| --- | --- | --- | --- |
| `YYYY` | `2026` | `HH` / `H` | hours 00–23 / 0–23 |
| `YY` | `26` | `hh` / `h` | hours 01–12 / 1–12 |
| `MMMM` / `MMM` | month name, full / short | `mm` / `m` | minutes, padded / not |
| `MM` / `M` | month 01–12 / 1–12 | `ss` / `s` | seconds, padded / not |
| `DD` / `D` | day 01–31 / 1–31 | `A` | AM/PM designator |
| `dddd` / `ddd` | weekday, full / short | | |

Names and designators come from Windows for `locale` (a Windows locale name such as `"it-IT"`), or
for the user's locale when omitted.

```ts
import { formatDate, formatTime, localeInfo } from "@vitrine/sdk";

const now = new Date();
formatDate(now, "dddd, D MMMM YYYY"); // "Wednesday, 4 November 2026"
formatDate(now, "[Week of] D MMM"); // text in brackets is literal
formatTime(now); // "14:05" or "2:05 PM", from the Windows 12/24-hour setting
formatDate(now, "dddd D MMMM", "it-IT"); // names from a specific Windows locale

const info = localeInfo();
const firstDay = info.firstDayOfWeek; // 0 = Sunday, 1 = Monday, …
const weekdays = info.daysShort; // Sunday first, like Date#getDay()
export { firstDay, weekdays };
```

## formatTime

```ts
function formatTime(date: Date | number, locale?: string): string
```

`HH:mm` or `h:mm A`, following the locale's 12/24-hour preference.

## localeInfo

```ts
function localeInfo(locale?: string): LocaleInfo
```

Locale data read from Windows, cached per locale. Falls back to `en-US` values when Windows returns
nothing.

| Field | Type | Notes |
| --- | --- | --- |
| `locale` | `string` | Windows locale name, e.g. `"it-IT"` |
| `days`, `daysShort` | `string[]` | Sunday first, like `Date#getDay()` |
| `months`, `monthsShort` | `string[]` | January first |
| `am`, `pm` | `string` | Designators |
| `hour12` | `boolean` | The locale's time format has no 24-hour `H` |
| `shortDate` | `string` | Windows short date pattern, e.g. `"dd/MM/yyyy"` |
| `firstDayOfWeek` | `number` | `0` = Sunday |

## formatBytes

```ts
function formatBytes(bytes: number, digits?: number): string
```

Formats a byte count with 1024-based units `B`, `KB`, `MB`, `GB`, `TB`. `digits` defaults to 1;
bytes are never shown with decimals.

```ts
import { formatBytes } from "@vitrine/sdk";

formatBytes(512); // "512 B"
formatBytes(1536); // "1.5 KB"
formatBytes(8_589_934_592, 0); // "8 GB"
```

## localized

Since SDK 2.2.0.

```ts
function localized<T>(texts: Record<string, T>, language?: string): T
```

Picks the entry of `texts` for `language` (default: [`useLanguage()`](#uselanguage)): the same tag,
then the same base language (`pt` for `pt-BR`, `zh-CN` for `zh`; Simplified and Traditional Chinese
are never mixed), then `en`, then the first entry. Tags are compared case-insensitively, and `_` is
treated as `-`. See the example under [`useLanguage`](#uselanguage).

## widgetInfo

```ts
function widgetInfo(): WidgetInfo
interface WidgetInfo { instanceId: string; widgetId: string; packageId: string; engineVersion: string }
```

Identity of the running instance. Outside the engine all fields are empty strings (`language`:
`"en"`). Since 2.2.0, `WidgetInfo` also has `language`, the value of [`useLanguage()`](#uselanguage).

```ts
import { on, widgetInfo } from "@vitrine/sdk";

const { instanceId, widgetId, packageId, engineVersion } = widgetInfo();
console.log(`${packageId}/${widgetId} (${instanceId}) on Vitrine ${engineVersion}`);

const off = on("resize", (size: { width: number; height: number }) => {
  console.log("resized to", size.width, size.height);
});
off();
```

## on

```ts
function on(type: string, fn: (data: any) => void): () => void
```

Subscribes to a raw engine event and returns an unsubscribe function. The hooks above are built on
it; prefer them. A handler that throws is logged and does not stop other handlers.

| Event | Payload |
| --- | --- |
| `settings` | Settings object |
| `resize` | `{ width, height }` |
| `appearance` | `{ dark, accent }` |
| `system` | Partial `SystemSnapshot` |
| `pointer` | `{ type, target, x, y, deltaY, button }` |
| `timer`, `fetch`, `prompt` | Internal to the timer, `fetch` and `prompt()` implementations |

## Runtime globals

Widgets run in QuickJS, not a browser. Importing the SDK installs:

| Global | Behaviour |
| --- | --- |
| `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval` | Engine timers. Paused while the desktop is not visible (locked session, display off, full-screen app, user pause). |
| `queueMicrotask` | Installed if missing. |
| `console.log`, `info`, `debug`, `warn`, `error` | Written to the Vitrine log; to the terminal with `vitrine --dev`. Objects are JSON-stringified. |
| `fetch(url, { method, headers, body })` | HTTP(S) to hosts allowed by `net:` [permissions](/docs/reference/permissions/). |

```ts
const id = setInterval(() => console.log("tick"), 5000);
setTimeout(() => clearInterval(id), 60_000);
queueMicrotask(() => console.warn("runs after the current job"));
```

`fetch` returns `{ ok, status, statusText, url, headers: { get, has }, text(), json() }`. `body` must
be a string. It rejects with a `TypeError` when the host is not permitted or the request fails;
HTTP error statuses resolve normally (`ok: false`). `url` is always `""`. There is no `Request`,
`AbortController`, streaming or binary body.

```tsx
import { useSettings } from "@vitrine/sdk";
import { createResource } from "solid-js";

interface Forecast {
  current: { temperature_2m: number };
}

async function load(city: { lat: number; lon: number }): Promise<Forecast> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function Temperature() {
  const settings = useSettings({ lat: 45.46, lon: 9.19 });
  const [data] = createResource(() => ({ lat: settings().lat, lon: settings().lon }), load);
  return <text>{data() ? `${Math.round(data()!.current.temperature_2m)}°` : "…"}</text>;
}
```

Timeouts and size caps are listed under [Limits](/docs/reference/limits/). There is no DOM,
`localStorage`, `Intl`, `XMLHttpRequest`, `WebSocket` or `Worker`.

## Types

| Type | Definition |
| --- | --- |
| `Style` | The style object; see [Styles](/docs/reference/styles/). |
| `VitrineElements` | Props of every intrinsic element; see [Elements](/docs/reference/elements/). |
| `PointerHandlers` | `onClick`, `onPointerDown`, `onPointerUp`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onWheel` |
| `PointerEventData` | `{ type, x, y, deltaY?, button?, target, stopPropagation() }` |
| `Metric` | `"system" \| "cpu" \| "memory" \| "battery" \| "drives" \| "processes" \| "network"` |
| `SystemSnapshot` | `{ system?, cpu?, memory?, battery?, drives?, processes?, network? }` |
| `Size` | `{ width: number; height: number }` |
| `Appearance` | `{ dark: boolean; accent: string }` |
| `PromptOptions` | `{ title?: string; placeholder?: string; value?: string }` |
| `LocaleInfo` | See [`localeInfo`](#localeinfo). |
| `WidgetInfo` | See [`widgetInfo`](#widgetinfo). |

:::caution[Type checking]
With the template's `tsconfig.json` (`jsxImportSource: "solid-js"`), `tsc` reports errors on
intrinsic elements whose names Solid already types as DOM or SVG elements (`view`, `text`, `span`,
`image`, `svg`, …): the SDK's `VitrineElements` augmentation does not override them. The build
(`vitrine-widget build`, through Vite and Babel) does not type-check and is unaffected. The samples on
this site are checked against `VitrineElements` directly.
:::
