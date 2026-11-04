---
title: Settings
description: Declare per-instance options in a settings schema, show them conditionally and read them live in the widget.
sidebar:
  order: 2
---

Each widget can declare a settings schema. The control panel builds its form from it, validates what
the user types, and delivers the values to every instance live. Each instance has its own values.

## The schema

The `settings` file named in the widget's manifest entry is a JSON array of sections. Each section has
a `title` and a `settings` object; keys keep their order in the form and must be unique across all
sections.

```json
[
  {
    "title": "Clock",
    "settings": {
      "hourFormat": {
        "type": "string", "default": "auto", "label": "Time format",
        "options": [
          { "value": "auto", "label": "Follow Windows" },
          { "value": "12", "label": "12-hour" },
          { "value": "24", "label": "24-hour" }
        ]
      },
      "showSeconds": { "type": "boolean", "default": false, "label": "Show seconds" },
      "size": { "type": "number", "default": 40, "label": "Text size", "min": 24, "max": 96, "step": 4 }
    }
  },
  {
    "title": "Appearance",
    "settings": {
      "background": {
        "type": "string", "default": "card", "label": "Background",
        "options": [ { "value": "card", "label": "Acrylic card" }, { "value": "none", "label": "None" } ]
      },
      "shadow": {
        "type": "boolean", "default": true, "label": "Text shadow",
        "description": "Keeps text legible on bright or busy wallpapers",
        "visibleWhen": { "key": "background", "value": "none" }
      },
      "opacity": { "type": "number", "default": 0.55, "label": "Card opacity", "min": 0, "max": 1, "step": 0.05,
        "visibleWhen": { "key": "background", "value": "card" } },
      "systemAccent": { "type": "boolean", "default": true, "label": "Use the Windows accent color" },
      "accent": {
        "type": "string", "default": "#60CDFF", "label": "Accent color",
        "pattern": "^#[0-9a-fA-F]{6}$", "patternMessage": "Use a hex color such as #60CDFF",
        "disabledWhen": { "key": "systemAccent", "value": true }
      }
    }
  }
]
```

## Field types and controls

There are three types; `options`, and for numbers the bounds, decide the control.

| Declaration | Control | Value |
|---|---|---|
| `"type": "boolean"` | switch | `true` / `false` |
| `"type": "number"` with whole `min`, `max`, `step` (or none) | spin box | integer |
| `"type": "number"` with a fractional `min`, `max` or `step` | decimal text field | number |
| `"type": "string"` | text field | string |
| any type with `options` | drop-down | the chosen option's `value` |

Every field also takes:

| Field | Meaning |
|---|---|
| `default` | Initial value. Without it: `false`, `min` (or `0`), or `""` |
| `label` | Text next to the control; the key is shown when missing |
| `description` | Secondary line under the label |
| `options` | `[{ "value": …, "label": "…" }]`; string or number values |
| `min`, `max` | Numbers are clamped to this range |
| `step` | Spin box increment (default `1`) |
| `pattern` | Regular expression a string must match |
| `patternMessage` | Error shown when `pattern` fails |
| `visibleWhen`, `disabledWhen` | Conditions, below |

Every text can also be translated with `titles`, `labels`, `descriptions`, `patternMessages` and
option `labels` (SDK 2.2.0; versions of Vitrine without localisation ignore them): see
[Localisation](/docs/guides/localisation/). The complete
format is in the [settings schema reference](/docs/reference/settings-schema/).

## Validation

Vitrine normalises values before your code sees them: `"true"` and `"false"` become booleans, numeric
text becomes a number, numbers are clamped to `min`/`max`, and values outside `options` or failing
`pattern` are rejected. A rejected value shows its error under the field and is not applied, so a
widget never receives a value its schema forbids. Keys that are not in the schema are dropped.

`pattern` uses the syntax of Rust's `regex` crate: the usual classes, anchors and quantifiers, but no
lookaround or backreferences. Anchor it with `^…$` to match the whole value.

:::caution
A schema with a duplicate key, an invalid `pattern`, `min` greater than `max` or a `default` of the
wrong type is rejected as a whole. `vitrine render dist <widget> --out x.png` fails with the exact
error, so run it after editing a schema.
:::

## Conditions

`visibleWhen` hides a field and `disabledWhen` greys it out, depending on another setting:

```json
"visibleWhen": { "key": "background", "value": "none" }
```

The condition holds when the other setting's current value (or its default, if the user never changed
it) equals `value`. Each field takes one condition of each kind. For anything richer, add a boolean
that drives it, like `systemAccent` above. Hidden and disabled settings keep their values and are still
delivered to the widget.

## Reading settings

```tsx
import { createMemo } from "solid-js";
import { formatDate, localeInfo, mount, useAppearance, useClock, useSettings } from "@vitrine/sdk";

const DEFAULTS = {
  hourFormat: "auto",
  showSeconds: false,
  size: 40,
  background: "card",
  shadow: true,
  opacity: 0.55,
  systemAccent: true,
  accent: "#60CDFF",
};

function Clock() {
  const s = useSettings(DEFAULTS);
  const look = useAppearance();

  // useClock() reads its argument once. Recreate it when the setting changes:
  // the memo disposes the previous clock (and its timer) on every re-run.
  const clock = createMemo(() => useClock(s().showSeconds ? "second" : "minute"));
  const now = () => clock()();

  const h12 = () => (s().hourFormat === "auto" ? localeInfo().hour12 : s().hourFormat === "12");
  const pattern = () => `${h12() ? "h" : "HH"}:mm${s().showSeconds ? ":ss" : ""}${h12() ? " A" : ""}`;
  const accent = () => (s().systemAccent ? look().accent : s().accent);
  const card = () => s().background === "card";

  return (
    <view
      style={{
        width: "100%",
        height: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        borderRadius: 12,
        background: card() ? `rgba(32, 32, 32, ${s().opacity})` : undefined,
        textShadow: !card() && s().shadow ? "0 1px 4px rgba(0, 0, 0, 0.8)" : "none",
      }}
    >
      <text style={{ fontSize: s().size, fontWeight: 600, color: "#ffffff" }}>{formatDate(now(), pattern())}</text>
      <view style={{ width: 24, height: 3, borderRadius: 2, background: accent() }} />
    </view>
  );
}

mount(() => <Clock />);
```

- `useSettings(defaults)` returns an accessor: the instance's values merged over `defaults`. Keep
  `defaults` equal to the schema defaults; they also type the result.
- The accessor changes whenever the user edits a setting, without restarting the widget. Anything that
  reads `s()` inside JSX or a memo follows along.
- Hooks such as `useClock` or `useSystem` read their arguments once, when called. Wrap them in
  `createMemo` when an argument comes from a setting, as above.

## Patterns

**Appearance trio.** A `background` (`card` / `none`), a `theme` (`auto` / `light` / `dark`) and an
`accent` that accepts `system` or a hex colour:

```json
"accent": {
  "type": "string", "default": "system", "label": "Accent color",
  "description": "system uses the Windows accent color, or enter a hex color",
  "pattern": "^(system|#[0-9a-fA-F]{6})$",
  "patternMessage": "Use system or a hex color such as #60CDFF"
}
```

[Appearance](/docs/guides/appearance/) turns these into a palette.

**Follow Windows by default.** For formats, offer `auto` first and resolve it in code, as
`hourFormat` does with `localeInfo().hour12`.

**Lists.** There is no list control. Use one text field with a separator (`"Milk; Bread; Eggs"`) or a
few numbered fields (`link1`, `link2`, …) with a format such as `Name | https://example.com`, and
parse them leniently.

**Seeds, not state.** Settings are for configuration. Data the user creates in the widget (tasks, notes,
counters) belongs in [storage](/docs/guides/storage/); a settings field can seed it once.
