---
title: Permissions
description: Every permission string a widget can declare, and what it grants.
sidebar:
  order: 6
---

A widget declares what it needs in the `permissions` array of its
[manifest entry](/docs/reference/manifest/#widget-fields). Permissions are per widget, not per pack.
An unknown or malformed string makes the whole manifest invalid, so the pack does not load.

Without any permission a widget can still render, use timers, settings, size, appearance, storage,
locale data, [`prompt()`](/docs/reference/sdk/#prompt) and [`openUrl()`](/docs/reference/sdk/#openurl).

| Permission | Name | Grants |
| --- | --- | --- |
| `system.cpu` | Processor usage | `cpu`: total usage percentage and number of cores. |
| `system.memory` | Memory usage | `memory`: total, available and used physical memory, memory load. |
| `system.battery` | Battery status | `battery`: presence, charge level, charging state, remaining time, power source, battery saver. |
| `system.drives` | Drives | `drives`: letter, label, total, free and used space of each drive. |
| `system.processes` | Running processes | `processes`: name, process id and memory of the ten processes using the most memory. |
| `system.network` | Network activity | `network`: bytes received and sent per second. |
| `net:<host>` | Network access to *host* | `fetch()` to `http://<host>` and `https://<host>`, any port and path. |

## system.\*

Each `system.<metric>` permission unlocks one key of [`useSystem`](/docs/reference/sdk/#usesystem).
Metrics requested without their permission are dropped and a warning is logged; the others are still
delivered.

The SDK also types a `system` metric (hostname, OS, uptime), but engine 2.0 has no permission string
for it (`system.system` is rejected), so it cannot be granted.

## net:\<host\>

- `<host>` is a host name: labels of letters, digits and `-`, separated by dots, at most 253
  characters. It is stored in lower case.
- It matches the request's host exactly. Subdomains are not included: `net:example.com` does not
  allow `api.example.com`; declare each host.
- No scheme, port, path or wildcard: `net:https://x.com`, `net:x.com:8080`, `net:x.com/api` and
  `net:*.x.com` are all invalid.
- Only `http://` and `https://` URLs can be fetched. Credentials in the URL (`user@host`) and the
  port are ignored when matching.

A request to a host that is not declared fails with a `TypeError` (`host not allowed by
permissions: <url>`) and is logged.

```json
"permissions": ["system.cpu", "system.memory", "net:api.open-meteo.com"]
```

## Review

Store reviewers check that permissions are the minimum the widgets need and that network hosts are
explained. See [Publishing](/docs/publishing/#review) and
[Fetch and permissions](/docs/guides/fetch-and-permissions/).
