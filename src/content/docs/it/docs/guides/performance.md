---
title: Prestazioni
description: Che cosa costa CPU ed energia in un widget, quando Vitrine sospende i widget e come scrivere codice che resta inattivo.
sidebar:
  order: 12
---

Un widget resta sullo schermo tutto il giorno, anche sui portatili. Vitrine è progettato per restare
inattivo quando nulla cambia: ridisegna un widget solo quando il suo albero è cambiato, non esegue
codice tra un evento e l'altro e sospende tutto quando nessuno può vedere il desktop. Il codice dei
widget deve mantenere questa promessa.

## Che cosa sveglia un widget

| Origine | Costo | Come contenerlo |
|---|---|---|
| Timer (`setTimeout`, `setInterval`, `useClock`) | Un'esecuzione JavaScript e di solito un ridisegno a ogni tick | `useClock("minute")` a meno che i secondi non siano a schermo: 60 risvegli in meno |
| Transizioni | Fotogrammi alla frequenza dello schermo finché durano | Durate brevi; preferisci modifiche a `opacity` e `transform`, che saltano il layout |
| `useSystem` | Campionamento su un thread separato | L'intervallo più lungo che sembri ancora dal vivo; `processes` è la metrica più pesante |
| `fetch` | Rete e analisi del JSON | Cache nello storage, aggiornamenti ogni qualche minuto, non ogni secondo |
| Scritture con `useStorage` | Una scrittura su file ogni volta | Scrivi solo su azioni dell'utente e download completati |
| Movimenti del puntatore | Un'esecuzione JavaScript per ogni movimento sopra un elemento interattivo | Gestori `onPointerMove` banali, oppure ingresso e uscita |

Costano poco: un albero statico, il vetro (`backdropFilter` riusa uno sfondo sfocato già in cache), le
ombre del testo, l'SVG e qualunque numero di widget in cui non cambia nulla.

## Quando Vitrine sospende i widget

I widget vengono sospesi mentre:

- la sessione è bloccata;
- lo schermo è spento;
- è in esecuzione un'app a schermo intero, un gioco o una presentazione (verificato ogni pochi
  secondi);
- l'utente ha scelto **Sospendi widget** dal menu dell'area di notifica.

Durante la sospensione i timer non scattano, non si disegna nulla e non si campionano metriche. Le
modifiche alle impostazioni e le risposte di `fetch` in sospeso vengono comunque consegnate. Alla
ripresa, i timer scaduti scattano una volta e il disegno si rimette in pari.

Con il risparmio energia attivo, o a batteria con **Risparmia batteria** acceso, il campionamento delle
metriche procede a metà frequenza. Per il resto i widget continuano a girare: devono già essere
leggeri.

:::tip
Non contare i tick per misurare il tempo: dopo una sospensione, un intervallo di un minuto può essere
scattato una sola volta in un'ora. Salva istanti e ricava tutto da `Date.now()`, come fa il
[timer di concentrazione](/it/docs/guides/building-a-widget/).
:::

## Creare lavoro solo quando serve

Gli hook avviano il loro lavoro quando vengono chiamati. Avvolgili in `createMemo` per crearli solo a
certe condizioni, o per ricrearli quando cambia un'impostazione; SolidJS elimina l'istanza precedente
e il suo timer:

```ts
// Ticks every second only while seconds are visible, every minute otherwise.
const clock = createMemo(() => useClock(s().showSeconds ? "second" : "minute"));
const now = () => clock()();

// No clock at all while the timer is stopped.
const tick = createMemo(() => (running() ? useClock("second") : null));
```

Chiamare direttamente `useClock(s().showSeconds ? "second" : "minute")` legge l'impostazione una sola
volta: attivare i secondi dal pannello di controllo non cambierebbe la frequenza dei tick fino al
riavvio del widget.

## Limiti che proteggono il desktop

Ogni widget gira nel proprio runtime QuickJS con un limite di memoria, e ogni ingresso in JavaScript
(lo script iniziale, un evento, un timer) ha un budget di tempo. Uno script che lo supera viene
interrotto e l'errore finisce nel log. I valori sono in [Limiti](/it/docs/reference/limits/). In
pratica:

- non fare mai lavoro pesante in modo sincrono in un gestore di eventi o in un timer;
- tieni piccoli i bundle: ogni byte viene analizzato a ogni avvio del widget;
- disegna gli elenchi con `<For>` o `<Index>`, così SolidJS aggiorna le righe invece di ricostruirle.

## Verificare

Avvia `vitrine --dev dist` con `VITRINE_DEBUG=1` per vedere sospensioni e avvisi nel terminale, e
osserva `vitrine.exe` in Gestione attività con il widget sul desktop: inattivo deve significare una CPU
vicina allo 0% tra un tick e l'altro.
