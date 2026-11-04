---
title: Schema delle impostazioni
description: Lo schema JSON che definisce la pagina delle impostazioni di un widget nel pannello di controllo.
sidebar:
  order: 5
---

Il campo `settings` di un widget in [`vitrine.json`](/it/docs/reference/manifest/#campi-del-widget)
punta a un file JSON che ne descrive le impostazioni. Il pannello di controllo costruisce da qui la
pagina delle impostazioni e valida ogni modifica; il widget legge i valori con
[`useSettings`](/it/docs/reference/sdk/#usesettings).

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

## Struttura

Il file è un array di **sezioni**, mostrate in ordine:

| Campo | Tipo | Obbligatorio | Note |
| --- | --- | --- | --- |
| `title` | string | no | Titolo della sezione. |
| `titles` | object | no | Titoli localizzati, per tag di lingua. |
| `settings` | object | sì | Impostazioni per nome, mostrate nell'ordine del file. |

Le chiavi devono essere uniche in tutto il file, non solo nella sezione: sono i nomi delle proprietà
che il widget riceve.

## Campi di un'impostazione

| Campo | Tipo | Vale per | Note |
| --- | --- | --- | --- |
| `type` | `"boolean"`, `"number"`, `"string"` | tutti | Obbligatorio. |
| `default` | valore | tutti | Deve essere convertibile in `type`. Senza: `false`, `min` (o `0`), `""`. |
| `label` | string | tutti | Etichetta della riga. Senza, compare la chiave. |
| `labels` | object | tutti | Etichette localizzate. |
| `description` | string | tutti | Testo secondario sotto l'etichetta. |
| `descriptions` | object | tutti | Descrizioni localizzate. |
| `options` | `{ value, label, labels? }[]` | tutti | Trasforma la riga in un menu a tendina; il valore deve essere una delle opzioni. Un'opzione senza `label` mostra il proprio valore. |
| `min`, `max` | number | `number` | I valori fuori intervallo vengono riportati nei limiti, non rifiutati. `min > max` è un errore. |
| `step` | number | `number` | Incremento della casella numerica (solo interi, vedi sotto). |
| `pattern` | string | `string` | Espressione regolare a cui il valore deve corrispondere. |
| `patternMessage` | string | `string` | Errore mostrato se `pattern` non corrisponde. Predefinito: ``value does not match `<pattern>` ``. |
| `patternMessages` | object | `string` | `patternMessage` localizzato. |
| `visibleWhen` | `{ key, value }` | tutti | Mostra la riga solo se l'impostazione `key` vale `value`. |
| `disabledWhen` | `{ key, value }` | tutti | Disattiva la riga se l'impostazione `key` vale `value`. |

I campi sconosciuti vengono ignorati.

## Controlli

| Impostazione | Controllo |
| --- | --- |
| Qualsiasi tipo con `options` | Menu a tendina |
| `boolean` | Interruttore |
| `number` con `min`, `max` e `step` tutti interi o assenti | Casella numerica; `step` vale 1 di default, intervallo ±1.000.000 se non limitato |
| `number` con `min`, `max` o `step` non interi | Campo di testo decimale |
| `string` | Campo di testo |

Le modifiche si applicano dal vivo: il pannello valida ogni modifica e il widget in esecuzione riceve
i nuovi valori tramite `useSettings`. Un valore non valido mostra l'errore sulla riga e non viene
salvato.

## Validazione

Al caricamento dello schema:

- il file deve essere un array JSON di sezioni, ognuna con un oggetto `settings`;
- `type` deve essere uno dei tre tipi;
- le chiavi devono essere uniche tra tutte le sezioni;
- `pattern` deve essere un'espressione valida;
- `min` non può superare `max`;
- `default` deve essere convertibile in `type` (non viene confrontato con `options` o `pattern`);
- le mappe localizzate devono usare tag di lingua validi e testi non vuoti.

Quando un valore viene salvato, è convertito nel tipo dell'impostazione, riportato nei limiti e poi
controllato:

| Tipo | Input accettato | Salvato come |
| --- | --- | --- |
| `boolean` | `true`, `false`, `"true"`, `"false"` (maiuscole o minuscole) | booleano |
| `number` | numero finito o stringa numerica | intero se senza decimali, altrimenti decimale |
| `string` | stringa, numero o booleano | stringa |

Poi si verificano l'appartenenza a `options` (i numeri si confrontano per valore) e `pattern`.

:::caution
`pattern` è compilato dalla libreria Rust `regex` del motore, non da JavaScript. Lookaround e
backreference non sono supportati, e un'espressione trova corrispondenze in qualsiasi punto del valore
se non è ancorata con `^…$`.
:::

## Condizioni

`visibleWhen` e `disabledWhen` confrontano un'altra impostazione con un valore, usando il valore
effettivo (quello salvato o il predefinito). Non esistono combinazioni `and`/`or`. Le impostazioni
nascoste o disattivate mantengono il loro valore e arrivano comunque al widget.

## Valori ricevuti dal widget

Il widget riceve tutte le chiavi dello schema: i predefiniti con sopra i valori dell'utente. Il motore
salva solo i valori diversi dal predefinito, nella voce dell'istanza in
`%APPDATA%\Vitrine\layout.json`; un aggiornamento del pack che cambia un predefinito raggiunge quindi
tutte le istanze in cui l'utente non ha toccato quell'impostazione.

## Etichette localizzate

`titles`, `labels`, `descriptions`, `patternMessages` e le `labels` di ogni opzione associano tag di
lingua a testi:

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

I tag seguono le stesse regole e lo stesso abbinamento dei
[`locales`](/it/docs/reference/manifest/#testi-localizzati) del manifest: vince il tag più vicino alla
lingua dell'interfaccia, e una traduzione mancante ricade sul campo semplice. Tutte le mappe sono
facoltative; i motori precedenti le ignorano.

Vedi [Impostazioni](/it/docs/guides/settings/) e [Localizzazione](/it/docs/guides/localisation/).
