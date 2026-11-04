---
title: Install Vitrine
description: Install Vitrine on Windows, arrange widgets on the desktop grid and install packs.
sidebar:
  order: 1
---

Vitrine runs on Windows 10 and 11. It installs per user, needs no administrator rights and lives in
the notification area.

## Install

1. Download `VitrineSetup-<version>.exe` from
   [GitHub Releases](https://github.com/vitrine-org/vitrine/releases).
2. Run it. Vitrine goes to `%LOCALAPPDATA%\Programs\Vitrine`; the optional **Start with Windows**
   component adds it to your sign-in programs.
3. On first run Vitrine installs the bundled **Essentials** pack and places a Clock and a System
   widget in the top-right corner of the main display.

The installer also associates `.vitrine` files with Vitrine, so a pack installs with a double-click.

## The tray icon

Click the Vitrine icon in the notification area to open its menu:

| Item | What it does |
|---|---|
| **Add widgets…** | Opens Edit layout with the widget gallery |
| **Quick add** | Adds any installed widget at its default size in the first free spot |
| **Edit layout** | Move and resize widgets (<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>V</kbd>) |
| **Settings…** | Opens the control panel |
| **Pause widgets** | Freezes every widget until you turn it off |
| **Start with Windows** | Starts Vitrine when you sign in |
| **Open data folder** | `%APPDATA%\Vitrine`: layout, settings, packs, storage and logs |
| **Get more widgets** | Opens this website, where the [packs page](/packs/) lists packs to install |
| **Quit Vitrine** | Closes Vitrine and removes its widgets from the desktop |

## Edit layout

Your desktop is a grid of cells, one grid per monitor. Press <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>V</kbd>
(or choose **Edit layout**) and open windows step aside so you can see the desktop:

- **drag** a widget to move it; it snaps to the grid;
- **drag the corner dot** to resize it, within the sizes the widget allows;
- hover a widget for its **settings** and **remove** buttons;
- **Add widget** in the floating toolbar opens the gallery: drag a widget onto the desktop, or click it
  to place it in the first free spot;
- **Done** or <kbd>Esc</kbd> ends editing.

The shortcut can be changed in the control panel (**General → Edit layout shortcut**); the new one
applies the next time Vitrine starts.

:::tip
Widgets are drawn beneath the desktop icons. Where a widget and an icon overlap, the icon wins:
arrange icons and widgets so they don't share cells.
:::

## The control panel

Open it from **Settings…** in the tray menu.

- **My widgets**: every instance on your desktops. **Settings** opens its options; changes apply to
  the widget immediately, without restarting it. **Reset to defaults** restores the pack's values.
- **Add widgets**: browse installed widgets with live previews, pick a size, then **Add to desktop**
  or **Place it myself…** to drop it in Edit layout.
- **Packages**: installed packs, **Install package…** and **Uninstall**.
- **General**: Start with Windows, **Save battery** (system widgets update less often on battery
  power), the Edit layout shortcut, the interface **Language** and the data folder.

A single widget can run as many **instances** as you like, each with its own settings and size. Right-click
an interactive widget for **Widget settings…**, **Edit layout** and **Remove widget**.

:::note
The control panel is still growing: a store page and search in **Add widgets** are on the way.
:::

## Install a pack

A **pack** is a `.vitrine` file with one or more widgets. Find packs on the [packs page](/packs/), then
install one in any of these ways:

- double-click the `.vitrine` file;
- control panel → **Packages** → **Install package…**;
- from a terminal: `vitrine install <file.vitrine>`.

Installing a pack with the same id as an installed one replaces it, and its running widgets restart
on the new version. Your instances, settings and stored data are kept.

`vitrine.exe` is not added to `PATH`. To use the command line, run it from
`%LOCALAPPDATA%\Programs\Vitrine` or add that folder to `PATH`; see the [CLI reference](/docs/reference/cli/).

## When widgets pause

Vitrine stops timers, sampling and drawing while the session is locked, the display is off, a
full-screen app or presentation is running, or you chose **Pause widgets**. Widgets resume where
they were. [Performance](/docs/guides/performance/) explains what this means for widget code.

## Uninstall

Remove Vitrine from **Settings → Apps** in Windows. The uninstaller asks whether to delete your
widgets, layout and settings in `%APPDATA%\Vitrine` too.

Next: [build your first widget](/docs/getting-started/first-widget/).
