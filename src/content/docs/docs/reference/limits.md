---
title: Limits
description: The limits the engine enforces on widget scripts, network requests, system metrics and packs.
sidebar:
  order: 8
---

Values below are the engine's defaults in Vitrine 2.0. They are not configurable by a pack.

## Scripts

Every instance runs in its own QuickJS runtime. All runtimes are driven by Vitrine's main thread, so
a slow handler in one widget delays every widget: keep work short.

| Limit | Value | When exceeded |
| --- | --- | --- |
| Memory per instance | 48 MB | Allocation fails and a JavaScript out-of-memory error is thrown. |
| Stack per instance | 4 MB | Stack overflow error. |
| Start-up budget | 3000 ms to evaluate the bundle | Evaluation is interrupted; the instance fails to load and shows nothing. The error is logged. |
| Time slice | 250 ms per entry into JavaScript (an event, a timer, a batch of promise jobs) | Execution is interrupted with an error, which is logged. The instance keeps running. |
| Promise jobs per slice | 10,000 | Remaining jobs run on the next entry. |

The garbage-collection threshold is 4 MB. Errors thrown by event handlers and timers
are logged with their stack and do not stop the widget.

## Timers and rendering

- Timers and frames pause while the desktop cannot be seen: session locked,
  display off, a full-screen application in front, or the user paused Vitrine.
- `setInterval` has a minimum period of 1 ms; prefer [`useClock("minute")`](/docs/reference/sdk/#useclock)
  over short intervals.
- A frame is painted only when something changed. See [Performance](/docs/guides/performance/).

## System metrics

| Limit | Value |
| --- | --- |
| Minimum interval | 1000 ms (shorter requests are raised to 1 s) |
| Power saving | Intervals double when battery saver is on, or on battery power while the "pause on battery saver" setting is enabled (the default) |
| `processes` | Top 10 by memory |

## Network

| Limit | Value |
| --- | --- |
| Hosts | Only those declared as [`net:<host>`](/docs/reference/permissions/#nethost) |
| Schemes | `http://`, `https://` |
| Timeout | 20 s for the whole request |
| Response body | First 5 MB, read as UTF-8 text; the rest is dropped without error |
| Request body | String only |
| User agent | `Vitrine/<engine version>` |

Requests run on background threads; the response is delivered to the widget as an event.

## Text prompt

[`prompt()`](/docs/reference/sdk/#prompt) options are truncated to 80 characters (`title`), 120
(`placeholder`) and 2000 (`value`), after removing control characters.

## Packs

Checked when a `.vitrine` file is installed or rendered:

| Limit | Value |
| --- | --- |
| Entries in the archive | 2000 |
| Uncompressed size | 64 MB, checked both on the sizes declared in the archive and on the bytes actually written |
| `vitrine.json` | 1 MB |
| Entry paths | [Safe relative paths](/docs/reference/manifest/#paths); no symbolic links, no duplicate entries |

The store adds a limit of **50 MB** for the `.vitrine` file itself; see
[Publishing](/docs/publishing/#store-checks).

## Grid

| Limit | Value |
| --- | --- |
| Widget size | At least 1 × 1 cells; the default `max` is 16 × 16 |
| Cell | 64 × 64 DIPs, 8 DIPs gap, 24 DIPs margin (defaults of the `grid` object in `layout.json`) |

## Not limited

Engine 2.0 sets no limit on the size of [`useStorage`](/docs/reference/sdk/#usestorage) data (the
instance's storage file is rewritten on every write), on the number of concurrent `fetch()` requests,
or on the number of nodes in the UI tree. Keep all three modest.
