---
title: Ciclo di sviluppo
description: Ricaricamento dal vivo con npm run dev e vitrine --dev, log, build e pack, anteprime headless con vitrine render.
sidebar:
  order: 3
---

Il ciclo si regge su due processi: l'SDK ricompila i bundle quando salvi, Vitrine li ricarica sul
desktop.

## Ricaricamento dal vivo

Per prima cosa chiudi il Vitrine in esecuzione (la modalità sviluppo non parte accanto a un'altra
istanza):

```sh
vitrine --quit
```

Poi, nella cartella del pack, avvia ciascun comando nel proprio terminale:

```sh
npm run dev                # rebuild into dist/ on every save
vitrine --dev dist         # run Vitrine with the unpacked pack in dist/
```

`vitrine --dev` carica `dist/` come se fosse installato, al posto di un eventuale pack installato con lo
stesso id. Ogni widget del pack che non ha ancora un'istanza ne riceve una in uno spazio libero.
Vitrine osserva la cartella e riavvia i widget del pack entro un secondo da ogni modifica. Per
fermarlo: <kbd>Ctrl</kbd>+<kbd>C</kbd> oppure `vitrine --quit`.

Un riavvio è una partenza da zero per il codice: segnali e timer ricominciano. Resta invece ciò che ha
impostato l'utente: impostazioni dell'istanza, valori di `useStorage`, posizione e dimensioni.

:::caution
`npm run dev` copia in `dist/` il `vitrine.json`, gli schemi delle impostazioni, le anteprime e i font
una sola volta, all'avvio; al salvataggio vengono ricompilati solo i bundle TSX. Dopo aver modificato
uno di quei file, riavvia `npm run dev`.
:::

Le istanze create in modalità sviluppo restano nel layout. Fuori dalla modalità sviluppo serve il pack
installato; altrimenti rimuovile dal pannello di controllo, in **I miei widget**.

## Log

In modalità sviluppo Vitrine scrive i log nel terminale. Lì compaiono `console.log`, `info`, `warn` ed
`error` del widget, con il prefisso `[id-pack/id-widget]`, insieme agli errori di script e agli
avvisi del motore (per esempio una `fetch` verso un host per cui il widget non ha il permesso).
`console.debug` appare solo con la variabile d'ambiente `VITRINE_DEBUG`:

```powershell
$env:VITRINE_DEBUG = "1"; vitrine --dev dist
```

Fuori dalla modalità sviluppo le stesse righe finiscono in
`%APPDATA%\Vitrine\logs\vitrine-AAAA-MM-GG.log` (vengono conservati sette giorni).

## Build e pack

```sh
npm run build    # dist/: the pack as Vitrine installs it
npm run pack     # build, then zip dist/ into <last-id-segment>-<version>.vitrine
```

Prima di compilare, `build` controlla il manifest: `id` in notazione DNS inversa, `version` semver,
almeno un widget, id dei widget fatti di `a-z`, `0-9` e `-`, entry esistenti e tag `locales` validi.
Ogni widget diventa un unico script autosufficiente, `dist/widgets/<id>/index.js`, con dentro SolidJS
e l'SDK. In `dist/` finiscono anche gli schemi delle impostazioni, le anteprime e i font citati dal
manifest, più `README.md`, `LICENSE` e `icon.png` se presenti. Con `vitrine-widget build --no-minify`
il bundle resta leggibile.

Il file `.vitrine` è ciò che condividi e [pubblichi](/it/docs/publishing/).

## Anteprime headless

`vitrine render` esegue un widget fuori schermo e scrive un PNG, senza installare nulla:

```sh
vitrine render dist clock --cells 4x2 --out clock.png
vitrine render widgets-1.0.0.vitrine clock --settings '{"showSeconds":true}' --out clock-seconds.png
```

Il primo argomento è una cartella di pack non compressa o un file `.vitrine`. In Windows PowerShell 5.1
le virgolette interne di `--settings` vanno protette: `'{\"showSeconds\":true}'`.

| Opzione | Predefinito | Significato |
|---|---|---|
| `--cells LxA` | `4x2` | Dimensioni in celle (celle da 64 DIP, spazi da 8 DIP) |
| `--size LxA` | | Dimensioni in DIP anziché in celle |
| `--scale S` | `2` | Pixel per DIP |
| `--settings JSON` | | Sostituisce i valori predefiniti dello schema |
| `--wait MS` | `300` | Per quanto tempo gira il widget prima dello scatto |
| `--network` | disattivato | Permette a `fetch` di raggiungere gli host autorizzati |
| `--backdrop IMMAGINE` | sfumatura tenue | Sfondo dietro il vetro di `backdropFilter` |
| `--out FILE` | `widget.png` | PNG di destinazione |

Il render è un'esecuzione pulita e isolata: lo storage parte vuoto, `prompt()` restituisce `null`, le
metriche di sistema vengono campionate una volta e le transizioni in corso sono mostrate nello stato
finale. Uno script che non si carica o uno schema di impostazioni non valido fanno fallire il render
con il relativo messaggio: `vitrine render` è quindi anche un controllo rapido in CI. Ed è il modo per
generare l'immagine `preview` che il widget mostra nel pannello di controllo. Tutte le opzioni sono
nel [riferimento della CLI](/it/docs/reference/cli/).

Prossimo passo: [costruire un widget passo per passo](/it/docs/guides/building-a-widget/).
