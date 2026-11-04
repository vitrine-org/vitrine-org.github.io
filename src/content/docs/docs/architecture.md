---
title: Architecture
description: How Vitrine embeds into the desktop, renders widgets and stays power efficient.
---

## Desktop embedding

Windows composes the desktop from a few shell windows: `Progman`, the icon view `SHELLDLL_DefView` and
a `WorkerW` that paints the wallpaper. Vitrine places one transparent window per widget **between the
wallpaper and the icon view**, so icons are always drawn on top. On Windows 11 24H2 and later the
hierarchy changed, and Vitrine detects both layouts.

## Input beneath the icons

The icon view normally receives every click on the desktop. When a widget is interactive, Vitrine
watches the pointer and, if a click or scroll lands on a widget **and not on an icon**, delivers it to
the widget instead.

## Rendering pipeline

1. A widget's JSX updates a retained node tree through SolidJS fine-grained reactivity.
2. Changed nodes are laid out with Taffy and painted with Direct2D and DirectWrite.
3. The result is presented to the widget's window, and only the widgets that changed are redrawn.

## Power efficiency

- System metrics are collected only for what widgets subscribe to.
- Clocks wake up on second or minute boundaries, not continuously.
- Rendering pauses when a full-screen app is in front, the session is locked or the display is off.
- Background threads run with Windows EcoQoS, and intervals stretch on battery saver.

## Frosted glass beneath the icons

Widgets live under the icon view, where Windows offers no backdrop material. For `backdropFilter`,
Vitrine recomposes each monitor's wallpaper itself: once per monitor and per filter it draws the
wallpaper at reduced resolution, blurs and saturates it with Direct2D effects, and caches the result
as one small bitmap shared by every widget on that monitor. Painting a glass box is then a single
bitmap fill, and the cache is rebuilt only when the wallpaper or the monitor layout changes.

## Sandboxed scripts

Each widget instance runs in its own QuickJS runtime with a memory limit and an interrupt handler, so
a runaway script is stopped instead of freezing the desktop. A widget only reaches the outside world
through the host API: system metrics, HTTP to the hosts it declared, its own storage and the user's
settings. See [Permissions](/docs/reference/permissions/) and [Limits](/docs/reference/limits/).
