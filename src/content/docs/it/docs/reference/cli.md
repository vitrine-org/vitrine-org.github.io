---
title: CLI
description: Gli strumenti vitrine-widget e tutti i comandi e le opzioni dell'eseguibile vitrine.
sidebar:
  order: 7
---

Nello sviluppo dei widget entrano in gioco due strumenti a riga di comando:

- **`vitrine-widget`**, da `@vitrine/sdk` (Node 20 o successivo): crea, compila e impacchetta.
- **`vitrine`**, l'eseguibile di Vitrine: avvia, genera anteprime, installa e controlla l'app in
  esecuzione.

## vitrine-widget

Le opzioni hanno la forma `--nome=valore`. L'argomento `folder` è la cartella corrente se omesso.

| Comando | Scopo |
| --- | --- |
| `create <folder> [--id=<id del pack>]` | Crea un pack dal template dell'SDK |
| `build [folder] [--no-minify]` | Compila tutti i widget in `dist/` |
| `pack [folder]` | Compila, poi comprime `dist/` in un pack `.vitrine` |
| `dev [folder]` | Compila e ricompila i bundle a ogni modifica |

Senza comando stampa l'uso; con un comando sconosciuto lo stampa ed esce con codice 1.

### create

```sh
npx github:vitrine-org/sdk#v2.3.0 create my-widgets --id=dev.you.widgets
cd my-widgets && npm install
```

Copia il template (un widget orologio con schema delle impostazioni) in `<folder>`, che deve essere
vuota o non esistere. `--id` imposta l'id del pack; il predefinito è `dev.example.<nome cartella>`. Il
`package.json` generato dipende da `github:vitrine-org/sdk#v2.3.0` e definisce gli script `build`,
`pack` e `dev`.

### build

1. Legge `vitrine.json` e lo controlla (vedi [Manifest](/it/docs/reference/manifest/#cosa-controlla-la-build-dellsdk)).
2. Elimina `dist/`.
3. Crea con Vite il bundle dell'`entry` di ogni widget in `dist/widgets/<id widget>/index.js`: un solo
   script classico (IIFE), target ES2020, minificato con esbuild salvo `--no-minify`, con
   `process.env.NODE_ENV` impostato a `"production"`. Le risorse importate vengono incorporate come
   URI `data:`.
4. Copia `settings` e `preview` di ogni widget e i `fonts` del pack negli stessi percorsi relativi,
   più `README.md`, `LICENSE` e `icon.png` se presenti nella radice.
5. Scrive `dist/vitrine.json` con ogni `entry` riscritto in `widgets/<id widget>/index.js`.

Nient'altro viene copiato: i file citati solo dal codice vanno importati.

### pack

Esegue `build`, poi comprime tutti i file di `dist/` in `<ultimo segmento dell'id>-<versione>.vitrine`
nella cartella del pack (`dev.you.widgets` 1.0.0 → `widgets-1.0.0.vitrine`), con compressione
deflate. Il formato è descritto in [Pubblicazione](/it/docs/publishing/#il-formato-vitrine).

### dev

Compila una volta, poi lascia Vite in ascolto e ricompila il bundle di un widget quando cambiano i suoi
sorgenti. `dist/` non viene svuotata prima. Schemi delle impostazioni, anteprime e font vengono copiati
solo all'avvio: riavvia `dev` dopo averli modificati. Usalo insieme a `vitrine --dev dist`; vedi
[Ciclo di sviluppo](/it/docs/getting-started/dev-loop/).

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

| Comando | Comportamento |
| --- | --- |
| `vitrine` | Avvia Vitrine. Se è già in esecuzione nella sessione, chiede a quell'istanza di ricaricare pack e layout ed esce. `--background` è equivalente. |
| `vitrine --dev <dir>` | Modalità sviluppo; vedi [sotto](#vitrine-dev). |
| `vitrine --panel [--instance <id>]` | Apre il pannello di controllo in un processo separato, eventualmente sulle impostazioni di un'istanza. |
| `vitrine --edit` | Attiva o disattiva la modalità modifica nel Vitrine in esecuzione. |
| `vitrine --gallery` | Apre la galleria dei widget, entrando prima in modalità modifica. |
| `vitrine --quit` | Chiude il Vitrine in esecuzione. |
| `vitrine install <file.vitrine>` | Installa un pack; vedi [sotto](#vitrine-install). |
| `vitrine <file.vitrine>` | Ciò che esegue il doppio clic su un pack: lo installa, poi ricarica il Vitrine in esecuzione o lo avvia. |
| `vitrine render …` | Disegna un widget in un PNG; vedi [sotto](#vitrine-render). |
| `vitrine --version`, `-V` | Stampa `vitrine <versione>`. |
| `vitrine --help`, `-h` | Stampa l'uso. |

`--edit`, `--gallery` e `--quit` stampano `Vitrine is not running` ed escono con codice 1 se nessuna
istanza è in esecuzione. Un comando senza l'argomento obbligatorio stampa l'uso ed esce con codice 2.

La variabile d'ambiente `VITRINE_LANGUAGE` (ad esempio `it` o `pt-BR`) ha la precedenza
sull'impostazione della lingua dell'interfaccia: utile per provare i pack localizzati.

### vitrine --dev

```sh
vitrine --dev dist
```

- Valida la cartella come pack (con le [regole del manifest](/it/docs/reference/manifest/) del motore)
  ed esce con un errore se non è valida.
- Non parte se un altro Vitrine è in esecuzione: chiudilo prima con `vitrine --quit`.
- Carica la cartella sopra i pack installati; un pack installato con lo stesso id viene nascosto.
- Crea un'istanza per ogni widget del pack che non ne ha ancora una, alla dimensione predefinita, sul
  monitor principale.
- Controlla la cartella ogni 700 ms e riavvia i widget del pack quando un file cambia.
- Scrive il log nel terminale, compreso l'output di `console.*`. Si ferma con Ctrl+C o
  `vitrine --quit`.

### vitrine install

```sh
vitrine install widgets-1.0.0.vitrine
```

Estrae e valida il pack (vedi [Limiti](/it/docs/reference/limits/#pack)), poi lo sposta in
`%APPDATA%\Vitrine\packages\<id del pack>\`, sostituendo l'eventuale versione precedente (con
ripristino se lo spostamento fallisce). Istanze, impostazioni e storage restano. Stampa
`installed <id> <version> (<n> widgets)` e chiede al Vitrine in esecuzione di ricaricare; in caso di
errore esce con codice 1 e il motivo.

### vitrine render

Esegue un widget fuori schermo e scrive un PNG, senza installare nulla. Serve per anteprime,
screenshot e controlli in CI.

```sh
vitrine render dist clock --cells 4x2 --out previews/clock.png
```

| Argomento | Predefinito | Significato |
| --- | --- | --- |
| `<package>` | obbligatorio | Una cartella di pack non compresso (come `dist`) o un file `.vitrine`. |
| `<widget>` | obbligatorio | Id del widget. |
| `--cells WxH` | | Dimensione in celle della griglia (64 DIP per cella, 8 DIP di spazio). Prevale su `--size`. |
| `--size WxH` | `280x136` (4 × 2 celle) | Dimensione in DIP. |
| `--scale S` | `2` | Pixel per DIP; il PNG misura `dimensione × scala` pixel. |
| `--settings JSON` | | Oggetto sovrapposto ai predefiniti dello schema, ad esempio `'{"showSeconds":true}'`. |
| `--wait MS` | `300` | Per quanto tempo gira il widget prima della cattura. |
| `--network` | disattivo | Esegue le richieste `fetch()`. Senza, vengono rifiutate con `network disabled (use --network)`. |
| `--backdrop IMAGE` | gradiente tenue | Immagine visibile attraverso [`backdropFilter`](/it/docs/reference/styles/#backdropfilter). |
| `--out FILE` | `widget.png` | Percorso di uscita. |

Durante il render i permessi valgono come sempre, le metriche richieste vengono campionate due volte
(a 400 ms di distanza, così CPU e rete hanno valori reali), `prompt()` restituisce `null`, lo storage
parte vuoto e non viene salvato, e le transizioni in corso vengono portate al valore finale prima della
cattura.
