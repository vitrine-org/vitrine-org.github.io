---
title: Localisation
description: Translate pack names, settings and widget text into the ten languages of Vitrine's interface.
sidebar:
  order: 13
---

Vitrine's interface speaks ten languages. Since SDK 2.2.0 a pack can follow it everywhere it shows
text: its name in the gallery and menus, its settings form, and the widget itself. Every translation
is optional and falls back to the English text.

| Language | Tag | Language | Tag |
|---|---|---|---|
| English | `en` | Português (Brasil) | `pt-BR` |
| Italiano | `it` | 简体中文 | `zh` |
| Français | `fr` | Русский | `ru` |
| Deutsch | `de` | 日本語 | `ja` |
| Español | `es` | 한국어 | `ko` |

Vitrine follows the Windows display language unless the user picks another in the control panel
(**General → Language**). When the language changes, widgets restart.

:::note
Localisation needs `@vitrine/sdk` 2.2.0 (`github:vitrine-org/sdk#v2.2.0`) and a Vitrine release with
localisation support. Older versions of Vitrine ignore every field on this page, and `useLanguage()`
returns `"en"` on them, so a localised pack still works there, in English.
:::

## Pack and widget names

Add a `locales` object to `vitrine.json`, keyed by language tag. Each entry may translate the pack's
`name` and `description`, and each widget's `name` and `description` by widget id:

```json
"locales": {
  "it": {
    "name": "Essenziali",
    "description": "Orologi, calendario e widget di sistema",
    "widgets": { "clock": { "name": "Orologio", "description": "Ora e data" } }
  },
  "zh-CN": { "widgets": { "clock": { "name": "时钟" } } }
}
```

These names appear in the control panel, the Edit layout gallery and the Quick add menu.

## Settings

Next to each text in a settings schema, add a map by language tag: `titles` for a section's `title`,
`labels` and `descriptions` for a setting, `patternMessages` for its `patternMessage`, and `labels`
on each option.

```json
[
  {
    "title": "Clock", "titles": { "it": "Orologio", "de": "Uhr" },
    "settings": {
      "seconds": {
        "type": "boolean", "default": false,
        "label": "Show seconds", "labels": { "it": "Mostra i secondi", "de": "Sekunden anzeigen" }
      },
      "unit": {
        "type": "string", "default": "c", "label": "Unit", "labels": { "it": "Unità" },
        "options": [
          { "value": "c", "label": "Celsius" },
          { "value": "f", "label": "Fahrenheit", "labels": { "it": "Fahrenheit (°F)" } }
        ]
      }
    }
  }
]
```

Only the visible texts change. Keys and option values stay the same in every language, so instances
keep their settings when the user switches language.

## Inside the widget

`useLanguage()` returns the interface language, one of the tags above. `localized()` picks the entry
for it from a table:

```tsx
import { formatDate, localized, mount, useClock, useLanguage } from "@vitrine/sdk";

const TODAY = { en: "Today", it: "Oggi", fr: "Aujourd’hui", de: "Heute", es: "Hoy", "pt-BR": "Hoje", zh: "今天", ru: "Сегодня", ja: "今日", ko: "오늘" };

// Values can be anything, functions included: handy for plurals and placeholders.
const LEFT = {
  en: (n: number) => (n === 1 ? "1 task left" : `${n} tasks left`),
  it: (n: number) => (n === 1 ? "1 attività da fare" : `${n} attività da fare`),
};

function Today() {
  const now = useClock("minute");
  const cjk = ["zh", "ja", "ko"].includes(useLanguage());
  return (
    <view style={{ width: "100%", height: "100%", flexDirection: "column", justifyContent: "center", padding: 16 }}>
      <text style={{ fontSize: 13, fontWeight: 600, opacity: 0.7, letterSpacing: cjk ? 0 : "0.06em", textTransform: "uppercase" }}>
        {localized(TODAY)}
      </text>
      <text style={{ fontSize: 22, fontWeight: 600 }}>{formatDate(now(), "dddd D MMMM")}</text>
      <text style={{ fontSize: 12, opacity: 0.7 }}>{localized(LEFT)(3)}</text>
    </view>
  );
}

mount(() => <Today />);
```

`localized(table)` looks for the language itself, then the same language with another region
(`pt` for `pt-BR`; `zh`, `zh-CN` and `zh-Hans` for Simplified Chinese, never `zh-TW` or `zh-Hant`),
then `en`, then the first entry. An optional second argument overrides the language.

The language is a plain value, not a signal: widgets restart when it changes, so reading it once is
correct. `widgetInfo().language` carries the same value.

## Dates and numbers

`formatDate`, `formatTime` and `localeInfo` follow the **Windows regional format**, which may differ
from the interface language (an English interface with Italian dates is common). That is usually what
users want. To name days and months in the interface language instead, pass it as the locale:

```ts
formatDate(now(), "dddd D MMMM", useLanguage());
```

The order of the tokens is still yours: `"dddd D MMMM"` reads naturally in Italian or French, not in
Japanese. For CJK languages, prefer numeric patterns or a per-language pattern from `localized()`.

## Validation

`vitrine-widget build` rejects `locales` keys that aren't language tags and widget ids that don't
exist. Vitrine validates every map when it loads the pack: an empty translation or a malformed tag is
an error, just like a broken manifest.

## Guidelines

- Write English first; it is the fallback for every language you don't cover.
- Leave room: German and French run 20–30% longer than English. Use `textOverflow: "ellipsis"` with
  `whiteSpace: "nowrap"` on labels that must fit.
- Uppercase and letter spacing are Latin-script styles; drop them for Chinese, Japanese and Korean.
- Segoe UI Variable has no CJK glyphs; Windows falls back to its CJK fonts automatically, so don't
  force a Latin-only bundled font on CJK text.
