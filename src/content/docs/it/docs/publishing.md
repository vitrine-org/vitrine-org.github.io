---
title: Pubblicazione
description: Pubblicare un pack su GitHub, inserirlo nello store di Vitrine e distribuire gli aggiornamenti.
sidebar:
  order: 9
---

Un pack si distribuisce come file `.vitrine` allegato a una release di GitHub. Lo store di Vitrine è
un elenco di repository: un job periodico legge l'ultima release di ciascuno, controlla il pack e
pubblica un catalogo, che la [pagina dei pack](/it/packs/) del sito legge. Si pubblica una volta sola
con una pull request; gli aggiornamenti sono semplici nuove release.

## Prima di pubblicare

- **Anteprime.** Lo store richiede un'immagine `preview` per ogni widget. Generala dal pack compilato,
  alla dimensione predefinita del widget, e indicala in `vitrine.json`:

  ```sh
  npm run build
  vitrine render dist clock --cells 4x2 --out previews/clock.png
  ```

  Le anteprime vengono pubblicate come `.png`: usa file PNG.
- **Permessi.** Dichiara solo ciò che i widget usano e preparati a motivare ogni host di rete. Vedi
  [Permessi](/it/docs/reference/permissions/).
- **Diritti.** Devi poter distribuire tutto ciò che è nel pack, font e immagini compresi.
- **Versione.** Aumenta `version` in `vitrine.json` a ogni release: deve coincidere con il tag.
- **Id.** Mantieni stabili l'`id` del pack e quello di ogni widget tra una versione e l'altra: le
  istanze installate, con impostazioni e storage, vi fanno riferimento.

Poi compila il pack:

```sh
npm run pack        # → widgets-1.2.0.vitrine
```

## Il formato .vitrine

Un file `.vitrine` è un archivio ZIP (voci memorizzate o compresse con deflate) la cui radice è la
radice del pack:

```
widgets-1.2.0.vitrine
├── vitrine.json                 manifest, entries rewritten by the build
├── widgets/
│   └── clock/
│       └── index.js             bundle the engine runs
├── src/clock/settings.json      settings schema, at its source path
├── previews/clock.png           preview, at its source path
├── assets/fonts/…               fonts listed in "fonts"
├── README.md                    optional
├── LICENSE                      optional
└── icon.png                     optional
```

Il motore accetta un pack quando:

- `vitrine.json` è nella radice, non supera 1 MB e rispetta le [regole del manifest](/it/docs/reference/manifest/);
- ogni file citato dal manifest esiste;
- ogni nome di voce è un [percorso relativo sicuro](/it/docs/reference/manifest/#percorsi), senza
  collegamenti simbolici né duplicati;
- ci sono al massimo 2000 voci e 64 MB non compressi.

L'installazione estrae l'archivio in una cartella temporanea, lo valida e poi sostituisce
`%APPDATA%\Vitrine\packages\<id del pack>\`. Qualsiasi strumento ZIP può produrre un pack valido, ma la
strada supportata è `vitrine-widget pack`.

## Release su GitHub

1. Usa un repository **pubblico**.
2. Crea una release con tag `v<versione>` (per `1.2.0`: `v1.2.0`).
3. Allega il file `.vitrine` come **unico** asset `.vitrine` della release.

```sh
gh release create v1.2.0 widgets-1.2.0.vitrine --title "1.2.0" --notes "Changes in this version"
```

Lo store legge l'**ultima** release del repository secondo l'API di GitHub, che esclude bozze e
pre-release.

## Inserire il pack nello store

Apri una pull request su [vitrine-org/store](https://github.com/vitrine-org/store) che aggiunge
`packs/<id del pack>.json`:

```json
{
  "id": "dev.you.widgets",
  "repo": "you/my-widgets",
  "license": "MIT",
  "tags": ["clock", "minimal"]
}
```

| Campo | Obbligatorio | Regole |
| --- | --- | --- |
| `id` | sì | L'id del pack da `vitrine.json`, con almeno tre segmenti (`^[a-z0-9]+(\.[a-z0-9-]+){2,}$`). Il file deve chiamarsi `<id>.json`. |
| `repo` | sì | `proprietario/nome` del repository GitHub con le release. |
| `license` | no | Identificativo SPDX. Predefinito: la licenza del repository rilevata da GitHub. |
| `tags` | no | Fino a 6 parole di 2–24 caratteri: lettere minuscole, cifre e `-`. Servono alla ricerca. |

Qualsiasi altro campo viene rifiutato. Nome, autore, descrizione, homepage e widget vengono presi dal
tuo `vitrine.json`, così la scheda coincide sempre con ciò che gli utenti installano.

## Controlli dello store

La pull request esegue la build del catalogo, che scarica la tua ultima release e fallisce se:

- la release non ha esattamente un asset `.vitrine`;
- il file supera i **50 MB** o non è uno ZIP leggibile (voci memorizzate o deflate);
- un percorso è assoluto, inizia con una lettera di unità o contiene `..`;
- `vitrine.json` manca nella radice o non è JSON valido;
- l'`id` del manifest è diverso da quello della voce;
- la `version` del manifest è diversa dal tag della release senza la `v` iniziale;
- il manifest non ha widget;
- un widget non ha `preview`, o il file di anteprima manca nell'archivio.

Questi controlli sono più leggeri di quelli del motore: prima di pubblicare esegui `vitrine install`
sul file (o `vitrine render` su di esso) per intercettare tutto il resto.

## Revisione

Le pull request vengono esaminate a mano prima del merge. I revisori verificano che:

- i permessi siano il minimo indispensabile per i widget;
- gli host di rete siano motivati;
- tu possa distribuire tutto ciò che è nel pack, font e immagini compresi.

Un pack può essere rimosso dallo store se una release successiva viola queste regole.

## Il catalogo

Dopo il merge, il workflow dello store pubblica:

- `https://vitrine-org.github.io/store/index.json`: ogni pack con versione, URL di download,
  dimensione, SHA-256, motore minimo (`minEngine`, `2.0.0` se assente), licenza, tag, stelle, data di
  pubblicazione e widget (nome, descrizione, dimensione, interattività, permessi);
- `https://vitrine-org.github.io/store/previews/<id del pack>/<id del widget>.png`: le anteprime,
  estratte dal tuo pack.

I pack si scaricano dalla tua release, senza copie altrove. I pack dei repository `vitrine-org/` sono
segnati come ufficiali e compaiono per primi; gli altri seguono in ordine di nome.

## Aggiornamenti

Pubblica una nuova release con una versione più alta: non serve alcuna pull request. Il catalogo viene
ricostruito ogni sei ore, a ogni push sullo store e su richiesta, quindi una release compare entro
poche ore. Se la nuova release non supera i controlli, la build periodica fallisce e il catalogo non
viene ripubblicato: resta online quello precedente finché non arriva una release valida (o la voce
viene rimossa).

Per l'utente, installare un `.vitrine` più recente (doppio clic o `vitrine install`) sostituisce la
versione precedente sul posto; istanze, impostazioni e storage restano. Le impostazioni mai modificate
dall'utente adottano i nuovi predefiniti del tuo schema. Un id di widget che sparisce dal pack lascia
le sue istanze senza widget: mantieni stabili gli id. La consultazione dello store dal pannello di
controllo è in sviluppo.
