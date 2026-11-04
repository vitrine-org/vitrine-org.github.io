---
title: Dev loop
description: Live reload with npm run dev and vitrine --dev, logs, build and pack, headless previews with vitrine render.
sidebar:
  order: 3
---

Two processes make the loop: the SDK rebuilds your bundles when you save, and Vitrine reloads them
on the desktop.

## Live reload

Quit the running Vitrine first (dev mode refuses to start next to it):

```sh
vitrine --quit
```

Then, in the pack folder, run each command in its own terminal:

```sh
npm run dev                # rebuild into dist/ on every save
vitrine --dev dist         # run Vitrine with the unpacked pack in dist/
```

`vitrine --dev` loads `dist/` as if it were installed, replacing an installed pack with the same id.
Every widget of the pack that has no instance yet gets one in a free spot. Vitrine watches the folder
and restarts the pack's widgets within a second of any change. Stop with <kbd>Ctrl</kbd>+<kbd>C</kbd>
or `vitrine --quit`.

A restart is a fresh start for your code: signals and timers begin again. What the user set is kept:
instance settings, `useStorage` values, position and size.

:::caution
`npm run dev` copies `vitrine.json`, settings schemas, previews and fonts into `dist/` once, when it
starts; only the TSX bundles are rebuilt on save. After editing any of those files, restart
`npm run dev`.
:::

Instances created in dev mode stay in your layout. Once you leave dev mode they need the pack
installed; otherwise remove them in the control panel under **My widgets**.

## Logs

In dev mode Vitrine logs to the terminal. `console.log`, `info`, `warn` and `error` from your widget
appear there, prefixed with `[pack-id/widget-id]`, along with script errors and engine warnings
(for example a `fetch` to a host the widget has no permission for). `console.debug` is shown only
with the `VITRINE_DEBUG` environment variable set:

```powershell
$env:VITRINE_DEBUG = "1"; vitrine --dev dist
```

Outside dev mode the same lines go to `%APPDATA%\Vitrine\logs\vitrine-YYYY-MM-DD.log` (seven days
are kept).

## Build and pack

```sh
npm run build    # dist/: the pack as Vitrine installs it
npm run pack     # build, then zip dist/ into <last-id-segment>-<version>.vitrine
```

`build` checks the manifest before bundling: a reverse-DNS `id`, a semver `version`, at least one
widget, widget ids made of `a-z`, `0-9` and `-`, entries that exist, and valid `locales` tags. Each
widget becomes one self-contained script, `dist/widgets/<id>/index.js`, with SolidJS and the SDK
inside. `dist/` also gets the settings schemas, previews and fonts the manifest references, plus
`README.md`, `LICENSE` and `icon.png` when present. `vitrine-widget build --no-minify` keeps the
bundle readable.

The `.vitrine` file is what you share and [publish](/docs/publishing/).

## Headless previews

`vitrine render` runs one widget off-screen and writes a PNG, without installing anything:

```sh
vitrine render dist clock --cells 4x2 --out clock.png
vitrine render widgets-1.0.0.vitrine clock --settings '{"showSeconds":true}' --out clock-seconds.png
```

The first argument is an unpacked pack folder or a `.vitrine` file. In Windows PowerShell 5.1, escape
the inner quotes of `--settings`: `'{\"showSeconds\":true}'`.

| Option | Default | Meaning |
|---|---|---|
| `--cells WxH` | `4x2` | Size in grid cells (64 DIP cells, 8 DIP gaps) |
| `--size WxH` | | Size in DIPs instead of cells |
| `--scale S` | `2` | Pixels per DIP |
| `--settings JSON` | | Overrides the schema defaults |
| `--wait MS` | `300` | How long the widget runs before the frame is taken |
| `--network` | off | Lets `fetch` reach the hosts the widget is permitted |
| `--backdrop IMAGE` | soft gradient | Wallpaper behind `backdropFilter` glass |
| `--out FILE` | `widget.png` | Output PNG |

The render is a clean, isolated run: storage starts empty, `prompt()` resolves to `null`, system
metrics are sampled once and running transitions are shown at their end state. A script that fails to load or an
invalid settings schema fails the render with the message, which makes `vitrine render` a quick check
in CI. It is also how you produce the `preview` image a widget shows in the control panel. All options
are in the [CLI reference](/docs/reference/cli/).

Next: [build a widget step by step](/docs/guides/building-a-widget/).
