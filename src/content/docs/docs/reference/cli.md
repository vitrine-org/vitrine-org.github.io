---
title: CLI
description: The vitrine-widget toolchain and every command and flag of the vitrine executable.
sidebar:
  order: 7
---

Two command-line tools take part in widget development:

- **`vitrine-widget`**, from `@vitrine/sdk` (Node 20 or later): scaffold, build and pack.
- **`vitrine`**, the Vitrine executable: run, preview, install and control the running app.

## vitrine-widget

Flags use the `--name=value` form. The `folder` argument defaults to the current directory.

| Command | Purpose |
| --- | --- |
| `create <folder> [--id=<pack id>]` | Scaffold a pack from the SDK template |
| `build [folder] [--no-minify]` | Build every widget into `dist/` |
| `pack [folder]` | Build, then zip `dist/` into a `.vitrine` pack |
| `dev [folder]` | Build and rebuild bundles on change |

Run without a command it prints the usage; an unknown command also exits with code 1.

### create

```sh
npx github:vitrine-org/sdk#v2.2.1 create my-widgets --id=dev.you.widgets
cd my-widgets && npm install
```

Copies the template (a clock widget with a settings schema) into `<folder>`, which must be empty or
not exist. `--id` sets the pack id; the default is `dev.example.<folder name>`. The generated
`package.json` depends on `github:vitrine-org/sdk#v2.2.1` and defines the scripts `build`, `pack` and
`dev`.

### build

1. Reads `vitrine.json` and checks it (see [Manifest](/docs/reference/manifest/#what-the-sdk-build-checks)).
2. Deletes `dist/`.
3. Bundles each widget's `entry` with Vite into `dist/widgets/<widget id>/index.js`: one classic
   script (IIFE), target ES2020, minified with esbuild unless `--no-minify`, `process.env.NODE_ENV`
   set to `"production"`. Imported assets are inlined as `data:` URIs.
4. Copies each widget's `settings` and `preview` and the pack's `fonts` to the same relative paths,
   plus `README.md`, `LICENSE` and `icon.png` when present at the root.
5. Writes `dist/vitrine.json` with each `entry` rewritten to `widgets/<widget id>/index.js`.

Nothing else is copied: files referenced only from code must be imported.

### pack

Runs `build`, then zips every file in `dist/` into `<last segment of id>-<version>.vitrine` in the
pack folder (`dev.you.widgets` 1.0.0 → `widgets-1.0.0.vitrine`), deflate-compressed. See
[Publishing](/docs/publishing/#the-vitrine-format) for the format.

### dev

Builds once, then keeps Vite in watch mode and rebuilds a widget's bundle when its sources change.
`dist/` is not deleted first. Settings schemas, previews and fonts are copied only at start: restart
`dev` after changing them. Pair it with `vitrine --dev dist`; see
[Dev loop](/docs/getting-started/dev-loop/).

## vitrine

```
vitrine                         run Vitrine (tray icon, widgets on the desktop)
vitrine --dev <package-dir>     run and live-reload an unpacked widget package
vitrine --panel                 open the control panel
vitrine --edit | --quit         toggle edit mode / quit the running instance
vitrine install <file.vitrine>  install a widget package
vitrine render <package> <widget> [--cells WxH | --size WxH] [--scale S]
               [--settings JSON] [--wait MS] [--network] [--backdrop IMAGE]
               --out <file.png>
vitrine --version
```

| Command | Behaviour |
| --- | --- |
| `vitrine` | Starts Vitrine. If it is already running in the session, asks that instance to reload packs and layout, then exits. `--background` is equivalent. |
| `vitrine --dev <dir>` | Development mode; see [below](#vitrine-dev). |
| `vitrine --panel [--instance <id>]` | Opens the control panel in its own process, optionally on the settings of one instance. |
| `vitrine --edit` | Toggles edit mode in the running Vitrine. |
| `vitrine --gallery` | Opens the widget gallery, entering edit mode first. |
| `vitrine --quit` | Quits the running Vitrine. |
| `vitrine install <file.vitrine>` | Installs a pack; see [below](#vitrine-install). |
| `vitrine <file.vitrine>` | What a double-click on a pack runs: installs it, then reloads the running Vitrine or starts it. |
| `vitrine render …` | Renders one widget to a PNG; see [below](#vitrine-render). |
| `vitrine --version`, `-V` | Prints `vitrine <version>`. |
| `vitrine --help`, `-h` | Prints the usage. |

`--edit`, `--gallery` and `--quit` print `Vitrine is not running` and exit with code 1 when no
instance is running. A command missing its required argument prints the usage and exits with code 2.

The environment variable `VITRINE_LANGUAGE` (for example `it` or `pt-BR`) overrides the UI language
setting, which is useful to test localised packs.

### vitrine --dev

```sh
vitrine --dev dist
```

- Validates the folder as a pack (the engine's [manifest rules](/docs/reference/manifest/)) and exits
  with an error if it is invalid.
- Refuses to start while another Vitrine is running: quit it first with `vitrine --quit`.
- Loads the folder on top of the installed packs; an installed pack with the same id is hidden.
- Gives each widget of the pack an instance at its default size on the primary monitor, if it has
  none yet.
- Checks the folder for changes every 700 ms and restarts the pack's widgets when a file changes.
- Logs to the terminal, including `console.*` output. Stop it with Ctrl+C or `vitrine --quit`.

### vitrine install

```sh
vitrine install widgets-1.0.0.vitrine
```

Extracts and validates the pack (see [Limits](/docs/reference/limits/#packs)), then moves it to
`%APPDATA%\Vitrine\packages\<pack id>\`, replacing any previous version (rolled back if the move
fails). Instances, their
settings and their storage are kept. Prints `installed <id> <version> (<n> widgets)` and asks the
running Vitrine to reload; exits with code 1 and the reason on failure.

### vitrine render

Runs one widget off-screen and writes a PNG, without installing anything. Use it for previews,
screenshots and checks in CI.

```sh
vitrine render dist clock --cells 4x2 --out previews/clock.png
```

| Argument | Default | Meaning |
| --- | --- | --- |
| `<package>` | required | An unpacked pack folder (such as `dist`) or a `.vitrine` file. |
| `<widget>` | required | Widget id. |
| `--cells WxH` | | Size in grid cells (64 DIPs per cell, 8 DIPs gap). Wins over `--size`. |
| `--size WxH` | `280x136` (4 × 2 cells) | Size in DIPs. |
| `--scale S` | `2` | Pixels per DIP; the PNG is `size × scale` pixels. |
| `--settings JSON` | | Object merged over the schema defaults, e.g. `'{"showSeconds":true}'`. |
| `--wait MS` | `300` | How long the widget runs before the frame is captured. |
| `--network` | off | Performs `fetch()` requests. Without it they reject with `network disabled (use --network)`. |
| `--backdrop IMAGE` | soft gradient | Image shown through [`backdropFilter`](/docs/reference/styles/#backdropfilter). |
| `--out FILE` | `widget.png` | Output path. |

During a render, permissions are enforced as usual, subscribed metrics are sampled twice (400 ms
apart, so CPU and network rates are real), `prompt()` resolves to `null`, storage starts empty and is
not saved, and running transitions are settled to their final values before capture.
