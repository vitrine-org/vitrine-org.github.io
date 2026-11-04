---
title: Impostazioni
description: Dichiara le opzioni di ogni istanza in uno schema, mostrale in modo condizionale e leggile dal vivo nel widget.
sidebar:
  order: 2
---

Ogni widget può dichiarare uno schema di impostazioni. Il pannello di controllo ne ricava il modulo,
valida ciò che l'utente scrive e consegna i valori a ogni istanza in tempo reale. Ogni istanza ha i
suoi valori.

## Lo schema

Il file `settings` indicato nella voce del widget nel manifest è un array JSON di sezioni. Ogni
sezione ha un `title` e un oggetto `settings`; le chiavi mantengono il loro ordine nel modulo e devono
essere uniche in tutto lo schema.

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

## Tipi di campo e controlli

I tipi sono tre; il controllo dipende da `options` e, per i numeri, dai limiti.

| Dichiarazione | Controllo | Valore |
|---|---|---|
| `"type": "boolean"` | interruttore | `true` / `false` |
| `"type": "number"` con `min`, `max`, `step` interi (o assenti) | campo numerico con frecce | intero |
| `"type": "number"` con `min`, `max` o `step` decimali | campo di testo decimale | numero |
| `"type": "string"` | campo di testo | stringa |
| qualsiasi tipo con `options` | elenco a discesa | il `value` dell'opzione scelta |

Ogni campo accetta inoltre:

| Campo | Significato |
|---|---|
| `default` | Valore iniziale. Se manca: `false`, `min` (o `0`), oppure `""` |
| `label` | Testo accanto al controllo; se manca compare la chiave |
| `description` | Riga secondaria sotto l'etichetta |
| `options` | `[{ "value": …, "label": "…" }]`; valori stringa o numero |
| `min`, `max` | I numeri vengono limitati a questo intervallo |
| `step` | Incremento del campo numerico (predefinito `1`) |
| `pattern` | Espressione regolare che una stringa deve soddisfare |
| `patternMessage` | Errore mostrato quando `pattern` non è soddisfatto |
| `visibleWhen`, `disabledWhen` | Condizioni, più sotto |

Ogni testo si può anche tradurre con `titles`, `labels`, `descriptions`, `patternMessages` e le
`labels` delle opzioni (SDK 2.2.0; le versioni di Vitrine senza localizzazione le ignorano): vedi
[Localizzazione](/it/docs/guides/localisation/). Il formato completo è nel
[riferimento dello schema delle impostazioni](/it/docs/reference/settings-schema/).

## Validazione

Vitrine normalizza i valori prima che arrivino al codice: `"true"` e `"false"` diventano booleani, il
testo numerico diventa un numero, i numeri vengono limitati a `min`/`max`, e i valori fuori da
`options` o che non soddisfano `pattern` vengono rifiutati. Un valore rifiutato mostra l'errore sotto
il campo e non viene applicato: un widget non riceve mai un valore che il suo schema vieta. Le chiavi
che non compaiono nello schema vengono scartate.

`pattern` usa la sintassi del crate `regex` di Rust: classi, ancore e quantificatori consueti, ma
niente lookaround né backreference. Ancoralo con `^…$` per verificare l'intero valore.

:::caution
Uno schema con una chiave duplicata, un `pattern` non valido, `min` maggiore di `max` o un `default`
del tipo sbagliato viene rifiutato per intero. `vitrine render dist <widget> --out x.png` fallisce
indicando l'errore esatto: lancialo dopo ogni modifica allo schema.
:::

## Condizioni

`visibleWhen` nasconde un campo e `disabledWhen` lo disattiva, in base a un'altra impostazione:

```json
"visibleWhen": { "key": "background", "value": "none" }
```

La condizione è vera quando il valore attuale dell'altra impostazione (o il suo predefinito, se
l'utente non l'ha mai cambiata) è uguale a `value`. Ogni campo accetta una condizione per tipo. Per
logiche più ricche aggiungi un booleano che le guidi, come `systemAccent` qui sopra. Le impostazioni
nascoste o disattivate conservano i loro valori e arrivano comunque al widget.

## Leggere le impostazioni

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

- `useSettings(defaults)` restituisce un accessor: i valori dell'istanza uniti a `defaults`. Tieni
  `defaults` uguali ai predefiniti dello schema; servono anche a tipizzare il risultato.
- L'accessor cambia a ogni modifica dell'utente, senza riavviare il widget. Tutto ciò che legge `s()`
  nel JSX o in una memo si aggiorna di conseguenza.
- Hook come `useClock` o `useSystem` leggono i loro argomenti una sola volta, quando vengono chiamati.
  Se un argomento viene da un'impostazione, avvolgili in `createMemo` come sopra.

## Schemi ricorrenti

**Il trio dell'aspetto.** Un `background` (`card` / `none`), un `theme` (`auto` / `light` / `dark`) e
un `accent` che accetta `system` o un colore esadecimale:

```json
"accent": {
  "type": "string", "default": "system", "label": "Accent color",
  "description": "system uses the Windows accent color, or enter a hex color",
  "pattern": "^(system|#[0-9a-fA-F]{6})$",
  "patternMessage": "Use system or a hex color such as #60CDFF"
}
```

[Aspetto](/it/docs/guides/appearance/) li trasforma in una palette.

**Segui Windows per impostazione predefinita.** Per i formati, offri `auto` come prima scelta e
risolvilo nel codice, come fa `hourFormat` con `localeInfo().hour12`.

**Elenchi.** Non esiste un controllo per gli elenchi. Usa un solo campo di testo con un separatore
(`"Milk; Bread; Eggs"`) oppure alcuni campi numerati (`link1`, `link2`, …) con un formato come
`Name | https://example.com`, e interpretali con tolleranza.

**Semi, non stato.** Le impostazioni servono alla configurazione. I dati che l'utente crea nel widget
(attività, note, contatori) vanno nello [storage](/it/docs/guides/storage/); un campo delle
impostazioni può inizializzarli una volta.
