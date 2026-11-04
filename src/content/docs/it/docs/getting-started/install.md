---
title: Installare Vitrine
description: Installa Vitrine su Windows, disponi i widget sulla griglia del desktop e installa i pack.
sidebar:
  order: 1
---

Vitrine funziona su Windows 10 e 11. Si installa per l'utente corrente, non richiede diritti di
amministratore e risiede nell'area di notifica.

## Installazione

1. Scarica `VitrineSetup-<versione>.exe` dalle
   [release su GitHub](https://github.com/vitrine-org/vitrine/releases).
2. Avvialo. Vitrine viene installato in `%LOCALAPPDATA%\Programs\Vitrine`; il componente facoltativo
   **Avvia con Windows** lo aggiunge ai programmi eseguiti all'accesso.
3. Al primo avvio Vitrine installa il pack incluso, **Essentials**, e mette un Orologio e un widget di
   Sistema nell'angolo in alto a destra dello schermo principale.

L'installer associa inoltre i file `.vitrine` a Vitrine: un pack si installa con un doppio clic.

## L'icona nell'area di notifica

Fai clic sull'icona di Vitrine nell'area di notifica per aprire il menu:

| Voce | Cosa fa |
|---|---|
| **Aggiungi widget…** | Apre Modifica layout con la galleria dei widget |
| **Aggiunta rapida** | Aggiunge un widget installato, alle dimensioni predefinite, nel primo spazio libero |
| **Modifica layout** | Sposta e ridimensiona i widget (<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>V</kbd>) |
| **Impostazioni…** | Apre il pannello di controllo |
| **Sospendi widget** | Ferma tutti i widget finché non lo disattivi |
| **Avvia con Windows** | Avvia Vitrine all'accesso |
| **Apri cartella dei dati** | `%APPDATA%\Vitrine`: layout, impostazioni, pack, storage e log |
| **Trova altri widget** | Apre questo sito, dove la [pagina dei pack](/packs/) elenca quelli da installare |
| **Esci da Vitrine** | Chiude Vitrine e toglie i widget dal desktop |

## Modifica layout

Il desktop è una griglia di celle, una per ogni monitor. Premi <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>V</kbd>
(o scegli **Modifica layout**): le finestre aperte si fanno da parte e il desktop torna visibile.

- **trascina** un widget per spostarlo: si aggancia alla griglia;
- **trascina il punto nell'angolo** per ridimensionarlo, entro le dimensioni che il widget consente;
- passa sopra un widget per i pulsanti **impostazioni** e **rimuovi**;
- **Aggiungi widget**, nella barra mobile, apre la galleria: trascina un widget sul desktop oppure
  fai clic per metterlo nel primo spazio libero;
- **Fine** o <kbd>Esc</kbd> chiudono la modifica.

La scelta rapida si cambia nel pannello di controllo (**Generale → Scelta rapida per Modifica layout**)
e vale dal successivo avvio di Vitrine.

:::tip
I widget sono disegnati sotto le icone del desktop: dove un widget e un'icona si sovrappongono vince
l'icona. Disponi icone e widget in modo che non condividano celle.
:::

## Il pannello di controllo

Si apre con **Impostazioni…** dal menu dell'area di notifica.

- **I miei widget**: tutte le istanze sui tuoi desktop. **Impostazioni** apre le opzioni
  dell'istanza; le modifiche si applicano subito, senza riavviare il widget. **Ripristina
  impostazioni predefinite** torna ai valori del pack.
- **Aggiungi widget**: sfoglia i widget installati con anteprime dal vivo, scegli le dimensioni, poi
  **Aggiungi al desktop** oppure **Posiziona manualmente…** per collocarlo in Modifica layout.
- **Pacchetti**: i pack installati, **Installa pacchetto…** e **Disinstalla**.
- **Generale**: Avvia con Windows, **Risparmia batteria** (a batteria i widget di sistema si
  aggiornano meno spesso), la scelta rapida per Modifica layout, la **Lingua** dell'interfaccia e la
  cartella dei dati.

Lo stesso widget può avere tutte le **istanze** che vuoi, ognuna con impostazioni e dimensioni
proprie. Con il tasto destro su un widget interattivo trovi **Impostazioni widget…**,
**Modifica layout** e **Rimuovi widget**.

:::note
Il pannello di controllo è in crescita: sono in arrivo una pagina store e la ricerca in
**Aggiungi widget**.
:::

## Installare un pack

Un **pack** è un file `.vitrine` con uno o più widget. Li trovi nella [pagina dei pack](/packs/); per
installarne uno puoi:

- fare doppio clic sul file `.vitrine`;
- aprire il pannello di controllo → **Pacchetti** → **Installa pacchetto…**;
- da terminale: `vitrine install <file.vitrine>`.

Un pack con lo stesso id di uno già installato lo sostituisce, e i suoi widget in esecuzione si
riavviano sulla nuova versione. Istanze, impostazioni e dati salvati restano.

`vitrine.exe` non viene aggiunto al `PATH`. Per usare la riga di comando avvialo da
`%LOCALAPPDATA%\Programs\Vitrine` oppure aggiungi quella cartella al `PATH`; vedi il
[riferimento della CLI](/it/docs/reference/cli/).

## Quando i widget si fermano

Vitrine sospende timer, campionamento e disegno mentre la sessione è bloccata, lo schermo è spento,
è in esecuzione un'app a schermo intero o una presentazione, oppure hai scelto **Sospendi widget**.
Alla ripresa i widget continuano da dove erano. [Prestazioni](/it/docs/guides/performance/) spiega
cosa comporta per il codice dei widget.

## Disinstallazione

Rimuovi Vitrine da **Impostazioni → App** di Windows. Il programma di disinstallazione chiede se
eliminare anche widget, layout e impostazioni in `%APPDATA%\Vitrine`.

Prossimo passo: [il tuo primo widget](/it/docs/getting-started/first-widget/).
