---
title: Localizzazione
description: Traduci nomi dei pack, impostazioni e testi dei widget nelle dieci lingue dell'interfaccia di Vitrine.
sidebar:
  order: 13
---

L'interfaccia di Vitrine parla dieci lingue. Dall'SDK 2.2.0 un pack può seguirla ovunque mostri del
testo: il suo nome nella galleria e nei menu, il modulo delle impostazioni e il widget stesso. Ogni
traduzione è facoltativa e, se manca, si usa il testo inglese.

| Lingua | Tag | Lingua | Tag |
|---|---|---|---|
| English | `en` | Português (Brasil) | `pt-BR` |
| Italiano | `it` | 简体中文 | `zh` |
| Français | `fr` | Русский | `ru` |
| Deutsch | `de` | 日本語 | `ja` |
| Español | `es` | 한국어 | `ko` |

Vitrine segue la lingua di visualizzazione di Windows, a meno che l'utente non ne scelga un'altra nel
pannello di controllo (**Generale → Lingua**). Quando la lingua cambia, i widget si riavviano.

:::note
La localizzazione richiede `@vitrine/sdk` 2.2.0 (`github:vitrine-org/sdk#v2.2.0`) e una versione di
Vitrine che la supporti. Le versioni precedenti di Vitrine ignorano tutti i campi descritti in questa
pagina e su di esse `useLanguage()` restituisce `"en"`: un pack localizzato funziona comunque, in
inglese.
:::

## Nomi del pack e dei widget

Aggiungi a `vitrine.json` un oggetto `locales` indicizzato per tag di lingua. Ogni voce può tradurre
`name` e `description` del pack e, per id, `name` e `description` di ogni widget:

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

Questi nomi compaiono nel pannello di controllo, nella galleria di Modifica layout e nel menu Aggiunta
rapida.

## Impostazioni

Accanto a ogni testo di uno schema di impostazioni aggiungi una mappa per tag di lingua: `titles` per
il `title` di una sezione, `labels` e `descriptions` per un'impostazione, `patternMessages` per il suo
`patternMessage`, e `labels` su ogni opzione.

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

Cambiano solo i testi visibili. Chiavi e valori delle opzioni restano identici in ogni lingua, quindi
le istanze mantengono le loro impostazioni quando l'utente cambia lingua.

## Dentro il widget

`useLanguage()` restituisce la lingua dell'interfaccia, uno dei tag qui sopra. `localized()` sceglie
la voce corrispondente da una tabella:

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

`localized(tabella)` cerca la lingua esatta, poi la stessa lingua con un'altra regione (`pt` per
`pt-BR`; `zh`, `zh-CN` e `zh-Hans` per il cinese semplificato, mai `zh-TW` o `zh-Hant`), poi `en`,
infine la prima voce. Un secondo argomento facoltativo forza la lingua.

La lingua è un valore semplice, non un segnale: i widget si riavviano quando cambia, quindi leggerla
una volta è corretto. `widgetInfo().language` contiene lo stesso valore.

## Date e numeri

`formatDate`, `formatTime` e `localeInfo` seguono il **formato regionale di Windows**, che può essere
diverso dalla lingua dell'interfaccia (un'interfaccia in inglese con date in italiano è frequente). Di
solito è ciò che l'utente vuole. Per avere giorni e mesi nella lingua dell'interfaccia, passala come
locale:

```ts
formatDate(now(), "dddd D MMMM", useLanguage());
```

L'ordine dei token resta tuo: `"dddd D MMMM"` suona naturale in italiano o in francese, non in
giapponese. Per le lingue CJK preferisci formati numerici o un formato per lingua scelto con
`localized()`.

## Validazione

`vitrine-widget build` rifiuta chiavi di `locales` che non sono tag di lingua e id di widget
inesistenti. Vitrine valida ogni mappa quando carica il pack: una traduzione vuota o un tag malformato
sono errori, come un manifest non valido.

## Linee guida

- Scrivi prima in inglese: è il ripiego per tutte le lingue che non copri.
- Lascia spazio: tedesco e francese sono più lunghi dell'inglese del 20–30%. Sulle etichette che
  devono entrare usa `textOverflow: "ellipsis"` con `whiteSpace: "nowrap"`.
- Maiuscolo e spaziatura tra le lettere sono stili delle scritture latine; toglili per cinese,
  giapponese e coreano.
- Segoe UI Variable non ha glifi CJK; Windows ripiega automaticamente sui suoi font CJK, quindi non
  imporre al testo CJK un font incluso che contiene solo caratteri latini.
