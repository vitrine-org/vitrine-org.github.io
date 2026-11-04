---
title: Manifest
description: Tutti i campi di vitrine.json, le regole di validazione del motore e i testi localizzati.
sidebar:
  order: 4
---

`vitrine.json` sta nella radice di un pack e descrive il pack e i suoi widget. Il motore lo valida
quando il pack viene installato, letto all'avvio o aperto con `vitrine --dev`; un pack non valido non
viene caricato e il motivo finisce nel log.

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

## Campi del pack

| Campo | Tipo | Obbligatorio | Regole |
| --- | --- | --- | --- |
| `id` | string | sì | Reverse-DNS: `^[a-z0-9]+(\.[a-z0-9-]+)+$`, minuscolo, almeno due segmenti. Il primo segmento non può essere un nome di dispositivo di Windows (`con`, `prn`, `aux`, `nul`, `com0`–`com9`, `lpt0`–`lpt9`). Lo [store](/it/docs/publishing/) chiede almeno tre segmenti (`dev.you.widgets`). |
| `name` | string | sì | Non vuoto. |
| `version` | string | sì | Versione semantica `major.minor.patch`, con `-prerelease` e `+build` facoltativi; niente zeri iniziali. |
| `author` | string | no | Predefinito `""`. |
| `description` | string | no | Predefinito `""`. |
| `homepage` | string | no | Non validato. |
| `minEngine` | string | no | Versione semantica del Vitrine più vecchio in grado di eseguire il pacchetto. I motori più vecchi si rifiutano di installarlo o caricarlo, con un messaggio che invita ad aggiornare Vitrine. |
| `fonts` | string[] | no | [Percorsi sicuri](#percorsi) a file TTF o OTF, che devono esistere. I font vengono registrati per tutti i widget del pack; vedi [Font e risorse](/it/docs/guides/fonts-and-assets/). |
| `widgets` | object[] | sì | Almeno un widget. |
| `locales` | object | no | Nomi e descrizioni localizzati; vedi [Testi localizzati](#testi-localizzati). |

I campi sconosciuti vengono ignorati. Il file non può superare 1 MB.

## Campi del widget

| Campo | Tipo | Obbligatorio | Regole |
| --- | --- | --- | --- |
| `id` | string | sì | `^[a-z0-9-]+$`, unico nel pack. Mantienilo stabile tra le versioni: le istanze vi fanno riferimento. |
| `name` | string | sì | Non vuoto. Compare nella galleria, nel pannello di controllo e nei menu. |
| `description` | string | no | Predefinito `""`. |
| `entry` | string | sì | Percorso sicuro all'ingresso del widget. Nei sorgenti punta al file TSX; `vitrine-widget build` lo riscrive in `widgets/<id>/index.js`, il bundle eseguito dal motore. |
| `settings` | string | no | Percorso sicuro a uno [schema delle impostazioni](/it/docs/reference/settings-schema/). |
| `preview` | string | no | Percorso sicuro a un'immagine di anteprima, mostrata nella galleria del pannello di controllo. Obbligatoria per lo [store](/it/docs/publishing/#controlli-dello-store). |
| `size` | object | no | Dimensione in celle della griglia; vedi sotto. |
| `interactive` | boolean | no | Predefinito `false`. Con `true` il widget riceve l'input del puntatore (clic, passaggio, rotellina). |
| `permissions` | string[] | no | Predefinito `[]`. Vedi [Permessi](/it/docs/reference/permissions/). |

### size

`size` contiene tre coppie `[colonne, righe]`, tutte obbligatorie quando `size` è presente:

| Chiave | Predefinito |
| --- | --- |
| `default` | `[4, 3]` |
| `min` | `[1, 1]` |
| `max` | `[16, 16]` |

Ogni valore deve essere almeno 1 e, su ciascun asse, `min ≤ default ≤ max`. Una cella misura
64 × 64 DIP con 8 DIP di spazio tra celle, quindi un widget largo `w` celle misura `64w + 8(w − 1)` DIP
(4 celle: 280 DIP).

## Percorsi

Ogni percorso del manifest (`entry`, `settings`, `preview`, `fonts`) è relativo alla radice del pack e
deve essere **sicuro**:

- solo barre in avanti, nessuna `/` iniziale o finale;
- nessun carattere `\`, `:` o NUL, quindi niente lettere di unità;
- nessun segmento vuoto, `.` o `..`;
- nessun segmento che termini con `.` o con uno spazio, e niente `<`, `>`, `"`, `|`, `?` o `*`.

Ogni file citato deve esistere nel pack.

## Testi localizzati

`locales` traduce `name` e `description` del pack e dei widget. Le chiavi sono tag di lingua; ogni
valore può impostare un sottoinsieme qualsiasi dei testi, e ciò che manca ricade sul testo del
manifest (in inglese).

```json
"locales": {
  "it": { "name": "Meteo", "description": "Condizioni attuali e previsioni" },
  "pt-BR": { "widgets": { "now": { "name": "Agora" } } },
  "zh": { "widgets": { "now": { "name": "现在", "description": "温度和天气" } } }
}
```

| Regola | |
| --- | --- |
| Tag | `^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$`, ad esempio `it`, `pt-BR`, `zh-Hans`. |
| Testi | `name` e `description`, se presenti, non possono essere vuoti. |
| `widgets` | Le chiavi devono essere id di widget dichiarati in `widgets`. |

Le lingue dell'interfaccia di Vitrine sono `en`, `it`, `fr`, `de`, `es`, `pt-BR`, `zh` (cinese
semplificato), `ru`, `ja` e `ko`. Il motore sceglie la voce più vicina a quella corrente: lo stesso tag
(senza distinguere maiuscole e minuscole, con `_` letto come `-`), poi qualsiasi tag con la stessa
lingua di base (`pt` per `pt-BR`, `zh-CN` per `zh`). Cinese semplificato e tradizionale (`zh-Hant`,
`zh-TW`, `zh-HK`, `zh-MO`) non si mescolano mai.

I nomi localizzati compaiono nel pannello di controllo, nella galleria e nei menu. Le etichette delle
impostazioni si localizzano nello [schema delle impostazioni](/it/docs/reference/settings-schema/#etichette-localizzate);
i testi disegnati dal widget si localizzano nel codice (vedi
[Localizzazione](/it/docs/guides/localisation/)).

:::note
`locales` è arrivato nel motore insieme alle dieci lingue dell'interfaccia. I motori precedenti lo
ignorano, dato che i campi sconosciuti vengono ignorati. `vitrine-widget build` lo copia invariato e,
da SDK 2.2.0, ne controlla tag e id dei widget.
:::

## Cosa controlla la build dell'SDK

`vitrine-widget build` si ferma subito se trova: un `id` non reverse-DNS, una `version` che non
inizia con `major.minor.patch`, un array `widgets` vuoto, un `id` di widget non valido, un `entry`
mancante, un file indicato da `settings`, `preview` o `fonts` che non esiste e (da 2.2.0) un tag non
valido o un id di widget sconosciuto in `locales`. I controlli del motore descritti sopra sono più
severi; `vitrine render dist <widget>` o `vitrine --dev dist` li applicano al pack compilato.
