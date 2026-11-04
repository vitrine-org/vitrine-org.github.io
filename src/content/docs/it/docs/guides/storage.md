---
title: Storage
description: Conserva lo stato di ogni istanza con useStorage, e gli schemi che lo mantengono corretto ed economico.
sidebar:
  order: 4
---

`useStorage(key, initial)` è un segnale che sopravvive ai riavvii. Usalo per ciò che l'utente crea nel
widget: attività, note, contatori, un timer in corso, una risposta di rete in cache.

```tsx
import { mount, useStorage } from "@vitrine/sdk";

interface Tally {
  count: number;
  since: number;
}

function Water() {
  const [tally, setTally] = useStorage<Tally>("tally", { count: 0, since: Date.now() });

  // Always store a new object: the value is compared by identity.
  const drink = () => setTally({ ...tally(), count: tally().count + 1 });
  const reset = () => setTally({ count: 0, since: Date.now() });

  return (
    <view onClick={drink} style={{ width: "100%", height: "100%", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4 }}>
      <text style={{ fontSize: 36, fontWeight: 600 }}>{tally().count}</text>
      <text style={{ fontSize: 12, opacity: 0.7 }}>glasses today</text>
      <view onClick={(e) => (e.stopPropagation(), reset())} style={{ position: "absolute", top: 6, right: 8 }}>
        <text style={{ fontSize: 11, opacity: 0.6 }}>Reset</text>
      </view>
    </view>
  );
}

mount(() => <Water />);
```

## Come si comporta

- **Per istanza.** Due copie dello stesso widget hanno storage separati. Nulla è condiviso tra istanze
  o widget.
- **Solo JSON.** I valori passano da `JSON.stringify`: oggetti semplici, array, stringhe, numeri,
  booleani e `null`. Salva le date come millisecondi dall'epoch. Impostare `undefined` elimina la
  chiave.
- **Letto una volta, scritto a ogni modifica.** Il valore salvato viene letto quando si chiama
  `useStorage`; ogni modifica aggiorna il segnale e riscrive il file dell'istanza,
  `%APPDATA%\Vitrine\storage\<id-istanza>.json`.
- **Identità.** Come ogni segnale, reimpostare lo stesso oggetto non notifica nulla. Crea un nuovo
  oggetto o array (`{ ...old, count: old.count + 1 }`, `[...items, item]`) invece di modificarlo.
- **Durata.** Lo storage sopravvive a riavvii, aggiornamenti del pack e cambi di lingua. Viene
  eliminato quando l'utente rimuove l'istanza. `vitrine render` parte sempre con lo storage vuoto.

:::caution
Chiama `useStorage` una sola volta per chiave e passa l'accessor ai componenti. Due chiamate con la
stessa chiave creano due segnali indipendenti che finiscono per divergere.
:::

## Schemi ricorrenti

**Salva i fatti, ricava il resto.** Salva quando finisce un timer, non i secondi mancanti; quando sono
stati scaricati i dati, non se sono scaduti. I valori derivati restano così corretti dopo qualsiasi
riavvio. [Costruire un widget](/it/docs/guides/building-a-widget/) lo applica a un timer.

**Metti in cache i dati di rete insieme ai loro input.** Conserva la risposta con l'ora del download e
le impostazioni per cui è stata scaricata, mostrala subito all'avvio e aggiornala solo quando è troppo
vecchia o gli input sono cambiati. [Fetch e permessi](/it/docs/guides/fetch-and-permissions/) mostra lo
schema completo.

**Non scrivere a ogni frame.** Ogni modifica è una scrittura su disco. Scrivi in risposta ad azioni
dell'utente e a download completati, mai da un timer veloce o da un gestore di movimento del
puntatore; tieni lo stato transitorio, come hover o scorrimento, in `createSignal`.

**Versiona la struttura.** Se la forma dei dati può cambiare, salva `{ v: 1, … }` e migra subito dopo
la lettura, così un aggiornamento non incontra mai dati che non capisce.

**Inizializza dalle impostazioni una volta sola.** Per far precompilare un elenco dal pannello di
controllo, ricorda nello storage il seme già applicato e aggiungi solo le voci nuove; l'elenco vero
resta nello storage, dove il widget lo modifica.
