---
title: Manifest
description: Every field of vitrine.json, the validation rules the engine applies, and localised texts.
sidebar:
  order: 4
---

`vitrine.json` sits at the root of a pack and describes the pack and its widgets. The engine
validates it when a pack is installed, scanned at start-up or opened with `vitrine --dev`; a pack that
fails validation is not loaded and the reason is written to the log.

```json
{
  "id": "dev.you.weather",
  "name": "Weather",
  "version": "1.2.0",
  "author": "You",
  "description": "Current conditions and forecast",
  "homepage": "https://github.com/you/weather",
  "minEngine": "2.0.0",
  "fonts": ["assets/fonts/Inter-Variable.ttf"],
  "widgets": [
    {
      "id": "now",
      "name": "Now",
      "description": "Temperature and conditions",
      "entry": "src/now/index.tsx",
      "settings": "src/now/settings.json",
      "preview": "previews/now.png",
      "size": { "default": [4, 2], "min": [2, 2], "max": [8, 4] },
      "interactive": false,
      "permissions": ["net:api.open-meteo.com"]
    }
  ],
  "locales": {
    "it": {
      "name": "Meteo",
      "widgets": { "now": { "name": "Adesso", "description": "Temperatura e condizioni" } }
    }
  }
}
```

## Package fields

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | string | yes | Reverse-DNS: `^[a-z0-9]+(\.[a-z0-9-]+)+$`, lowercase, at least two segments. The first segment cannot be a Windows device name (`con`, `prn`, `aux`, `nul`, `com0`–`com9`, `lpt0`–`lpt9`). The [store](/docs/publishing/) requires at least three segments (`dev.you.widgets`). |
| `name` | string | yes | Not blank. |
| `version` | string | yes | Semantic version `major.minor.patch`, optional `-prerelease` and `+build`; no leading zeros. |
| `author` | string | no | Default `""`. |
| `description` | string | no | Default `""`. |
| `homepage` | string | no | Not validated. |
| `minEngine` | string | no | Must be a semantic version. Engine 2.0 validates the format but does not compare it with its own version. |
| `fonts` | string[] | no | [Safe paths](#paths) to TTF or OTF files. Each must exist. Fonts are registered for every widget in the pack; see [Fonts and assets](/docs/guides/fonts-and-assets/). |
| `widgets` | object[] | yes | At least one widget. |
| `locales` | object | no | Localised names and descriptions; see [Localised texts](#localised-texts). |

Unknown fields are ignored. The file must be at most 1 MB.

## Widget fields

| Field | Type | Required | Rules |
| --- | --- | --- | --- |
| `id` | string | yes | `^[a-z0-9-]+$`, unique within the pack. Keep it stable across versions: instances refer to it. |
| `name` | string | yes | Not blank. Shown in the gallery, control panel and menus. |
| `description` | string | no | Default `""`. |
| `entry` | string | yes | Safe path to the widget's entry. In your sources it points to the TSX file; `vitrine-widget build` rewrites it to `widgets/<id>/index.js`, the bundle the engine runs. |
| `settings` | string | no | Safe path to a [settings schema](/docs/reference/settings-schema/). |
| `preview` | string | no | Safe path to a preview image, shown in the control panel gallery. Required by the [store](/docs/publishing/#store-checks). |
| `size` | object | no | Grid size in cells; see below. |
| `interactive` | boolean | no | Default `false`. When `true`, the widget receives pointer input (clicks, hover, wheel). |
| `permissions` | string[] | no | Default `[]`. See [Permissions](/docs/reference/permissions/). |

### size

`size` has three `[columns, rows]` pairs, all required when `size` is present:

| Key | Default |
| --- | --- |
| `default` | `[4, 3]` |
| `min` | `[1, 1]` |
| `max` | `[16, 16]` |

Every value must be at least 1, and on each axis `min ≤ default ≤ max`. A cell is 64 × 64 DIPs with
8 DIPs between cells, so a widget `w` cells wide is `64w + 8(w − 1)` DIPs wide (4 cells: 280 DIPs).

## Paths

Every path in the manifest (`entry`, `settings`, `preview`, `fonts`) is relative to the pack root
and must be **safe**:

- forward slashes only, no leading or trailing `/`;
- no `\`, `:` or NUL character, so no drive letters;
- no empty, `.` or `..` segments;
- no segment ending in `.` or a space, and no `<`, `>`, `"`, `|`, `?` or `*`.

Each referenced file must exist in the pack.

## Localised texts

`locales` translates the pack's and widgets' `name` and `description`. Keys are language tags; each
value may set any subset of the texts, and anything missing falls back to the manifest's own
(English) text.

```json
"locales": {
  "it": { "name": "Meteo", "description": "Condizioni attuali e previsioni" },
  "pt-BR": { "widgets": { "now": { "name": "Agora" } } },
  "zh": { "widgets": { "now": { "name": "现在", "description": "温度和天气" } } }
}
```

| Rule | |
| --- | --- |
| Tag | `^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$`, e.g. `it`, `pt-BR`, `zh-Hans`. |
| Texts | `name` and `description`, when present, must not be blank. |
| `widgets` | Keys must be widget ids declared in `widgets`. |

Vitrine's UI languages are `en`, `it`, `fr`, `de`, `es`, `pt-BR`, `zh` (Simplified Chinese), `ru`, `ja`
and `ko`. The engine picks the closest entry for the current one: the same tag (case-insensitive,
`_` read as `-`), then any tag with the same base language (`pt` for `pt-BR`, `zh-CN` for `zh`).
Simplified and Traditional Chinese (`zh-Hant`, `zh-TW`, `zh-HK`, `zh-MO`) are never mixed.

Localised names appear in the control panel, gallery and menus. Settings labels are localised in the
[settings schema](/docs/reference/settings-schema/#localised-labels); text drawn by the widget is
localised in code (see [Localisation](/docs/guides/localisation/)).

:::note
`locales` arrived in the engine with the ten UI languages. Older engines ignore it, since unknown
fields are ignored. `vitrine-widget build` passes it through unchanged and, since SDK 2.2.0, checks
its tags and widget ids.
:::

## What the SDK build checks

`vitrine-widget build` fails early on: an `id` that is not reverse-DNS, a `version` that does not
start with `major.minor.patch`, an empty `widgets` array, an invalid widget `id`, a missing `entry`,
a missing file named by `settings`, `preview` or `fonts`, and (since 2.2.0) an invalid `locales` tag
or an unknown widget id in `locales`. The engine's checks above are stricter;
`vitrine render dist <widget>` or `vitrine --dev dist` runs them against the built pack.
