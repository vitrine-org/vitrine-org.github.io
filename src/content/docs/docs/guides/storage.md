---
title: Storage
description: Persist per-instance state with useStorage, and the patterns that keep it correct and cheap.
sidebar:
  order: 4
---

`useStorage(key, initial)` is a signal that survives restarts. Use it for what the user creates in
the widget: tasks, notes, counters, a running timer, a cached response.

```tsx
import { mount, useStorage } from "@vitrine/sdk";

interface Tally {
  count: number;
  since: number;
}

function Water() {
  const [tally, setTally] = useStorage<Tally>("tally", { count: 0, since: Date.now() });

  // Always store a new object: the value is compared by identity.
  const drink = () => setTally({ ...tally(), count: tally().count + 1 });
  const reset = () => setTally({ count: 0, since: Date.now() });

  return (
    <view onClick={drink} style={{ width: "100%", height: "100%", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
      <text style={{ fontSize: 36, fontWeight: 600 }}>{tally().count}</text>
      <text style={{ fontSize: 12, opacity: 0.7 }}>glasses today</text>
      <view onClick={(e) => (e.stopPropagation(), reset())} style={{ position: "absolute", top: 6, right: 8 }}>
        <text style={{ fontSize: 11, opacity: 0.6 }}>Reset</text>
      </view>
    </view>
  );
}

mount(() => <Water />);
```

## How it behaves

- **Per instance.** Two copies of the same widget have separate storage. Nothing is shared between
  instances or widgets.
- **JSON only.** Values go through `JSON.stringify`: plain objects, arrays, strings, numbers,
  booleans and `null`. Store dates as epoch milliseconds. Setting `undefined` deletes the key.
- **Read once, written on every set.** The stored value is read when `useStorage` is called; each
  set updates the signal and rewrites the instance's file,
  `%APPDATA%\Vitrine\storage\<instance-id>.json`.
- **Identity.** Like any signal, setting the same object again does not notify. Build a new object or
  array (`{ ...old, count: old.count + 1 }`, `[...items, item]`) instead of mutating.
- **Lifetime.** Storage survives restarts, pack updates and language changes. It is deleted when the
  user removes the instance. `vitrine render` always starts with empty storage.

:::caution
Call `useStorage` once per key and pass the accessor down. Two calls with the same key create two
independent signals that drift apart.
:::

## Patterns

**Store facts, derive the rest.** Persist when a timer ends, not the seconds left; when the data was
fetched, not whether it is stale. Derived values are then right after any restart.
[Build a widget](/docs/guides/building-a-widget/) uses this for a timer.

**Cache network data with its inputs.** Keep the response with the time it was fetched and the
settings it was fetched for, show it immediately on start, and refresh only when it is too old or the
inputs changed. [Fetch and permissions](/docs/guides/fetch-and-permissions/) has the full pattern.

**Don't write per frame.** Every set is a disk write. Write on user actions and completed fetches,
never from a fast timer or a pointer-move handler; keep transient state such as hover or scroll
position in `createSignal`.

**Version your shape.** If the stored shape may change, store `{ v: 1, … }` and migrate right after
reading it, so an update never meets data it doesn't understand.

**Seed from settings once.** To let users prefill a list from the control panel, remember the seed
you already applied in storage and add only new entries; the list itself stays in storage, where the
widget edits it.
