---
title: Fetch and permissions
description: Declare the hosts and metrics a widget uses, call HTTP APIs with fetch, and cache responses.
sidebar:
  order: 5
---

A widget can only reach what its manifest declares. Permissions are per widget, listed in its entry
in `vitrine.json`:

```json
"permissions": ["net:api.open-meteo.com", "system.cpu", "system.memory"]
```

| Permission | Grants |
|---|---|
| `net:<host>` | `fetch` to that exact host, over `http` or `https`, on any port |
| `system.cpu`, `system.memory`, `system.battery`, `system.drives`, `system.processes`, `system.network` | The metric through [`useSystem`](/docs/guides/system-metrics/) |

Hosts match exactly and case-insensitively. Wildcards are not accepted: declare `api.example.com` and
`cdn.example.com` separately. An unknown or malformed permission makes the manifest invalid, and
Vitrine refuses to install the pack. Declare only what the widget uses; the
[permissions reference](/docs/reference/permissions/) has the full rules.

## fetch

`fetch` is a global, as on the web, implemented by the engine:

```ts
const r = await fetch("https://api.example.com/v1/items", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ q: "vitrine" }),
});
```

It supports `method`, `headers` and a string `body`. The response has `ok`, `status`, `statusText`,
`headers.get()` / `headers.has()`, `text()` and `json()`. It is deliberately small:

- the body is read as UTF-8 text, up to 5 MB; there is no `blob()` or `arrayBuffer()`;
- a request has 20 seconds to complete; there is no `AbortController`;
- HTTP error statuses resolve normally with `ok: false`; network errors, timeouts and hosts without
  permission reject with a `TypeError` whose message says why;
- requests run off the main thread, so a slow server never stalls the desktop;
- there is no CORS (it isn't a browser), and the user agent is `Vitrine/<version>`.

## A cached request

The pattern below serves most widgets that show remote data: show the cached value at once, refresh
when it is old or the inputs changed, survive being offline.

```tsx
import { createEffect, createSignal, on, onCleanup } from "solid-js";
import { mount, useSettings, useStorage } from "@vitrine/sdk";

interface Cache {
  place: string; // the settings the data was fetched for
  at: number;
  temp: number;
}

const MAX_AGE = 30 * 60_000;

function Weather() {
  const s = useSettings({ latitude: 41.9, longitude: 12.5 });
  const place = () => `${s().latitude},${s().longitude}`;
  const [cache, setCache] = useStorage<Cache | null>("cache", null);
  const [error, setError] = createSignal<string | null>(null);

  async function refresh() {
    const c = cache();
    if (c && c.place === place() && Date.now() - c.at < MAX_AGE) return;
    try {
      const r = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${s().latitude}&longitude=${s().longitude}&current=temperature_2m`,
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      setCache({ place: place(), at: Date.now(), temp: Math.round(j.current.temperature_2m) });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e)); // offline, timeout or not permitted
    }
  }

  createEffect(on(place, () => void refresh())); // now, and whenever the location changes
  const timer = setInterval(() => void refresh(), 5 * 60_000);
  onCleanup(() => clearInterval(timer));

  const data = () => (cache()?.place === place() ? cache() : null);

  return (
    <view style={{ width: "100%", height: "100%", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <text style={{ fontSize: 40, fontWeight: 600 }}>{data() ? `${data()!.temp}°` : "–"}</text>
      <text style={{ fontSize: 11, opacity: 0.6 }}>{error() && !data() ? "Offline" : "Open-Meteo"}</text>
    </view>
  );
}

mount(() => <Weather />);
```

With `"permissions": ["net:api.open-meteo.com"]` on the widget. Why it is built this way:

- **The cache lives in storage** with the inputs and the time of the fetch, so a restart shows data
  immediately and makes no request when the data is still fresh.
- **The timer checks often, the network rarely.** A five-minute check against a thirty-minute age
  catches up quickly after the PC wakes up: timers don't run while widgets are
  [paused](/docs/guides/performance/), so a long interval would leave stale data on screen.
- **Errors keep the last good value.** Show stale data with a quiet hint rather than an empty widget.
- **Respect the API.** Keep the refresh interval reasonable and choose APIs that allow keyless,
  client-side use; never ship secrets inside a pack, anyone can unzip it.

Preview it with the network on: `vitrine render dist weather --network --wait 3000 --out weather.png`.
