---
title: Limiti
description: I limiti che il motore impone a script dei widget, richieste di rete, metriche di sistema e pack.
sidebar:
  order: 8
---

I valori che seguono sono i predefiniti del motore in Vitrine 2.0 e un pack non può modificarli.

## Script

Ogni istanza gira nel proprio runtime QuickJS. Tutti i runtime sono gestiti dal thread principale di
Vitrine, quindi un gestore lento in un widget rallenta tutti gli altri: mantieni il lavoro breve.

| Limite | Valore | Se superato |
| --- | --- | --- |
| Memoria per istanza | 48 MB | L'allocazione fallisce e viene lanciato un errore JavaScript di memoria esaurita. |
| Stack per istanza | 4 MB | Errore di stack overflow. |
| Budget di avvio | 3000 ms per valutare il bundle | La valutazione viene interrotta; l'istanza non si carica e non mostra nulla. L'errore finisce nel log. |
| Finestra di esecuzione | 250 ms per ogni ingresso in JavaScript (un evento, un timer, un gruppo di job delle promise) | L'esecuzione viene interrotta con un errore, registrato nel log. L'istanza continua a funzionare. |
| Job delle promise per finestra | 10.000 | I job rimanenti girano all'ingresso successivo. |

La soglia del garbage collector è di 4 MB. Gli errori lanciati da gestori di eventi e timer vengono
registrati con il loro stack e non fermano il widget.

## Timer e disegno

- Timer e fotogrammi si fermano quando il desktop non è visibile: sessione bloccata, schermo spento,
  un'applicazione a schermo intero in primo piano o Vitrine messo in pausa dall'utente.
- `setInterval` ha un periodo minimo di 1 ms; al posto di intervalli brevi preferisci
  [`useClock("minute")`](/it/docs/reference/sdk/#useclock).
- Un fotogramma viene disegnato solo quando qualcosa è cambiato. Vedi
  [Prestazioni](/it/docs/guides/performance/).

## Metriche di sistema

| Limite | Valore |
| --- | --- |
| Intervallo minimo | 1000 ms (le richieste più brevi vengono portate a 1 s) |
| Risparmio energetico | Gli intervalli raddoppiano con il risparmio batteria attivo, oppure a batteria quando l'impostazione "pausa con risparmio batteria" è attiva (predefinito) |
| `processes` | I primi 10 per memoria |

## Rete

| Limite | Valore |
| --- | --- |
| Host | Solo quelli dichiarati come [`net:<host>`](/it/docs/reference/permissions/#nethost) |
| Schemi | `http://`, `https://` |
| Timeout | 20 s per l'intera richiesta |
| Corpo della risposta | Primi 5 MB, letti come testo UTF-8; il resto viene scartato senza errore |
| Corpo della richiesta | Solo stringa |
| User agent | `Vitrine/<versione del motore>` |

Le richieste girano su thread in background; la risposta arriva al widget come evento.

## Prompt di testo

Le opzioni di [`prompt()`](/it/docs/reference/sdk/#prompt) vengono troncate a 80 caratteri (`title`),
120 (`placeholder`) e 2000 (`value`), dopo aver rimosso i caratteri di controllo.

## Pack

Controllati quando un file `.vitrine` viene installato o usato da `vitrine render`:

| Limite | Valore |
| --- | --- |
| Voci nell'archivio | 2000 |
| Dimensione non compressa | 64 MB, verificata sia sulle dimensioni dichiarate nell'archivio sia sui byte effettivamente scritti |
| `vitrine.json` | 1 MB |
| Percorsi delle voci | [Percorsi relativi sicuri](/it/docs/reference/manifest/#percorsi); niente collegamenti simbolici né voci duplicate |

Lo store aggiunge un limite di **50 MB** per il file `.vitrine`; vedi
[Pubblicazione](/it/docs/publishing/#controlli-dello-store).

## Griglia

| Limite | Valore |
| --- | --- |
| Dimensione del widget | Almeno 1 × 1 celle; il `max` predefinito è 16 × 16 |
| Cella | 64 × 64 DIP, 8 DIP di spazio, 24 DIP di margine (predefiniti dell'oggetto `grid` in `layout.json`) |

## Senza limiti

Il motore 2.0 non limita la dimensione dei dati di [`useStorage`](/it/docs/reference/sdk/#usestorage)
(il file di storage dell'istanza viene riscritto a ogni scrittura), il numero di richieste `fetch()`
contemporanee né il numero di nodi dell'albero dell'interfaccia. Mantienili tutti e tre contenuti.
