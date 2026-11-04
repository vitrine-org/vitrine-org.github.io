---
title: Settings schema
description: The JSON schema that defines a widget's settings page in the control panel.
sidebar:
  order: 5
---

A widget's `settings` field in [`vitrine.json`](/docs/reference/manifest/#widget-fields) points to a
JSON file that describes its settings. The control panel builds the settings page from it, validates
every edit, and the widget reads the values with
[`useSettings`](/docs/reference/sdk/#usesettings).

```json
[
  {
    "title": "Appearance",
    "titles": { "it": "Aspetto" },
    "settings": {
      "accent": {
        "type": "string",
        "default": "#60CDFF",
        "label": "Accent color",
        "labels": { "it": "Colore di risalto" },
        "pattern": "^#[0-9a-fA-F]{6}$",
        "patternMessage": "Use a hex color such as #60CDFF",
        "patternMessages": { "it": "Usa un colore esadecimale come #60CDFF" }
      },
      "showSeconds": { "type": "boolean", "default": false, "label": "Show seconds" }
    }
  },
  {
    "title": "Units",
    "settings": {
      "unit": {
        "type": "string",
        "default": "c",
        "label": "Temperature",
        "options": [
          { "value": "c", "label": "Celsius" },
          { "value": "f", "label": "Fahrenheit" }
        ]
      },
      "refresh": { "type": "number", "default": 15, "min": 5, "max": 120, "step": 5, "label": "Refresh (minutes)" },
      "customCity": { "type": "boolean", "default": false, "label": "Choose a city" },
      "city": {
        "type": "string",
        "default": "",
        "label": "City",
        "visibleWhen": { "key": "customCity", "value": true }
      }
    }
  }
]
```

## Structure

The file is an array of **sections**, shown in order:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `title` | string | no | Section heading. |
| `titles` | object | no | Localised headings by language tag. |
| `settings` | object | yes | Settings keyed by name, shown in file order. |

Keys must be unique across the whole file, not only within a section. They are the property names
your widget receives.

## Setting fields

| Field | Type | Applies to | Notes |
| --- | --- | --- | --- |
| `type` | `"boolean"`, `"number"`, `"string"` | all | Required. |
| `default` | value | all | Must be convertible to `type`. Without it: `false`, `min` (or `0`), `""`. |
| `label` | string | all | Row label. Without it, the key is shown. |
| `labels` | object | all | Localised labels. |
| `description` | string | all | Secondary text under the label. |
| `descriptions` | object | all | Localised descriptions. |
| `options` | `{ value, label, labels? }[]` | all | Turns the row into a drop-down; the value must be one of the options. An option without `label` shows its value. |
| `min`, `max` | number | `number` | Values outside are clamped, not rejected. `min > max` is an error. |
| `step` | number | `number` | Spin-box increment (integers only, see below). |
| `pattern` | string | `string` | Regular expression the value must match. |
| `patternMessage` | string | `string` | Error shown when `pattern` fails. Default: ``value does not match `<pattern>` ``. |
| `patternMessages` | object | `string` | Localised `patternMessage`. |
| `visibleWhen` | `{ key, value }` | all | Show the row only when setting `key` equals `value`. |
| `disabledWhen` | `{ key, value }` | all | Grey the row out when setting `key` equals `value`. |

Unknown fields are ignored.

## Controls

| Setting | Control |
| --- | --- |
| Any type with `options` | Drop-down |
| `boolean` | Switch |
| `number` whose `min`, `max` and `step` are all integers or absent | Spin box; `step` defaults to 1, range ±1,000,000 when unbounded |
| `number` with a fractional `min`, `max` or `step` | Decimal text field |
| `string` | Text field |

Changes apply live: the panel validates each edit and the running widget receives the new values
through `useSettings`. An invalid value shows its error on the row and is not saved.

## Validation

When the schema is loaded:

- the file must be a JSON array of sections, each with a `settings` object;
- `type` must be one of the three types;
- keys must be unique across sections;
- `pattern` must compile;
- `min` must not exceed `max`;
- `default` must be convertible to `type` (it is not checked against `options` or `pattern`);
- localised maps must use valid language tags and non-blank texts.

When a value is saved, it is converted to the setting's type, clamped, then checked:

| Type | Accepted input | Stored as |
| --- | --- | --- |
| `boolean` | `true`, `false`, `"true"`, `"false"` (any case) | boolean |
| `number` | finite number or numeric string | integer when whole, otherwise float |
| `string` | string, number or boolean | string |

Then `options` membership (numbers compare numerically) and `pattern` are checked.

:::caution
`pattern` is compiled by the engine's Rust `regex` crate, not by JavaScript. Look-around and
back-references are not supported, and a pattern matches anywhere in the value unless anchored with
`^…$`.
:::

## Conditions

`visibleWhen` and `disabledWhen` compare one other setting with a value, using the effective value
(the saved one, or the default). There are no `and`/`or` combinations. Hidden and disabled settings
keep their values and are still delivered to the widget.

## Values the widget receives

The widget receives every key of the schema: the defaults with the user's values on top. The engine
saves only the values that differ from the defaults, in the instance entry of
`%APPDATA%\Vitrine\layout.json`; a pack update that changes a default therefore reaches every
instance where the user did not change that setting.

## Localised labels

`titles`, `labels`, `descriptions`, `patternMessages` and each option's `labels` map language tags
to texts:

```json
"unit": {
  "type": "string",
  "default": "c",
  "label": "Temperature",
  "labels": { "it": "Temperatura", "pt-BR": "Temperatura" },
  "options": [
    { "value": "c", "label": "Celsius", "labels": { "it": "Celsius (°C)" } },
    { "value": "f", "label": "Fahrenheit" }
  ]
}
```

Tags follow the same rules and matching as the manifest's
[`locales`](/docs/reference/manifest/#localised-texts): the closest tag for the UI language wins, and
a missing translation falls back to the plain field. All maps are optional. Older engines ignore them.

See [Settings](/docs/guides/settings/) and [Localisation](/docs/guides/localisation/).
