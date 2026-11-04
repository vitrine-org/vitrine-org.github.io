---
title: Costruire un widget
description: Un timer di concentrazione dal manifest al desktop, con impostazioni, clic, stato persistente, dimensioni e aspetto.
sidebar:
  order: 1
---

In questa guida costruiamo un timer di concentrazione: un anello che si svuota nel corso della
sessione, avviato e messo in pausa con un clic, che continua a contare anche dopo un riavvio. Tocca
ogni parte di un widget. Parti da un pack creato come in [Il tuo primo widget](/it/docs/getting-started/first-widget/)
e tieni attivo il [ciclo di sviluppo](/it/docs/getting-started/dev-loop/).

## 1. Dichiara il widget

Aggiungi una voce a `widgets` in `vitrine.json`:

```json
{
  "id": "focus",
  "name": "Focus timer",
  "description": "A Pomodoro-style timer",
  "entry": "src/focus/index.tsx",
  "settings": "src/focus/settings.json",
  "size": { "default": [2, 2], "min": [2, 2], "max": [4, 4] },
  "interactive": true,
  "permissions": []
}
```

- `id` è stabile: istanze e dati vi fanno riferimento. Usa `a-z`, `0-9` e `-`.
- `size` è espresso in celle della griglia; l'utente può ridimensionare tra `min` e `max`.
- `interactive: true` instrada i clic verso il widget. Senza, il widget lascia passare i clic come lo
  sfondo del desktop. Vedi [Interattività](/it/docs/guides/interactivity/).
- `permissions` resta vuoto: il timer non legge metriche di sistema e non usa la rete.

## 2. Descrivi le impostazioni

`src/focus/settings.json` elenca le opzioni mostrate dal pannello di controllo:

```json
[
  {
    "title": "Timer",
    "settings": {
      "minutes": { "type": "number", "default": 25, "label": "Session length (minutes)", "min": 5, "max": 90, "step": 5 },
      "label": { "type": "string", "default": "Focus", "label": "Label" }
    }
  }
]
```

Un `number` intero con `min`, `max` e `step` diventa un campo numerico con frecce; Vitrine limita il
valore all'intervallo prima che arrivi al codice. [Impostazioni](/it/docs/guides/settings/) descrive
tutti i tipi di campo.

## 3. Scrivi il componente

`src/focus/index.tsx`:

```tsx
import { createEffect, createMemo } from "solid-js";
import { mount, useAppearance, useClock, useSettings, useSize, useStorage } from "@vitrine/sdk";

interface Timer {
  /** Epoch ms when the running session ends; null while stopped. */
  endsAt: number | null;
  /** Ms left when stopped. */
  left: number;
}

const R = 44;
const CIRC = 2 * Math.PI * R;

function Focus() {
  const s = useSettings({ minutes: 25, label: "Focus" });
  const size = useSize();
  const look = useAppearance();
  const full = () => s().minutes * 60_000;

  const [timer, setTimer] = useStorage<Timer>("timer", { endsAt: null, left: full() });
  const running = () => timer().endsAt !== null;

  // A per-second clock exists only while the timer runs: the memo disposes it on stop.
  const tick = createMemo(() => (running() ? useClock("second") : null));
  const left = () => {
    const t = timer();
    if (t.endsAt === null) return t.left;
    tick()?.(); // re-evaluate on every tick
    return Math.max(0, t.endsAt - Date.now());
  };

  // Stop at zero.
  createEffect(() => {
    if (running() && left() === 0) setTimer({ endsAt: null, left: 0 });
  });

  const toggle = () => {
    const t = timer();
    if (t.endsAt !== null) setTimer({ endsAt: null, left: left() });
    else setTimer({ endsAt: Date.now() + (t.left > 0 ? t.left : full()), left: 0 });
  };
  const reset = () => setTimer({ endsAt: null, left: full() });

  const fg = () => (look().dark ? "#ffffff" : "#1b1b1b");
  const ring = () => Math.max(48, Math.min(size().width, size().height) - 32);
  const mmss = () => {
    const sec = Math.ceil(left() / 1000);
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
  };

  return (
    <view
      onClick={toggle}
      style={{
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        background: look().dark ? "rgba(32, 32, 32, 0.45)" : "rgba(255, 255, 255, 0.55)",
        backdropFilter: "blur(16px) saturate(1.6)",
        color: fg(),
      }}
    >
      <view style={{ width: ring(), height: ring() }}>
        <svg width={ring()} height={ring()} viewBox="0 0 100 100">
          <circle cx={50} cy={50} r={R} fill="none" stroke={fg()} strokeOpacity={0.15} strokeWidth={6} />
          <circle
            cx={50}
            cy={50}
            r={R}
            fill="none"
            stroke={look().accent}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={`${((CIRC * left()) / full()).toFixed(2)} ${CIRC.toFixed(2)}`}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dasharray 900ms linear" }}
          />
        </svg>
        <view style={{ position: "absolute", inset: 0, flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <text style={{ fontFamily: "Segoe UI Variable Display", fontSize: Math.round(ring() * 0.24), fontWeight: 600 }}>
            {mmss()}
          </text>
          <text style={{ fontSize: 12, opacity: 0.7 }}>{running() ? s().label : left() === 0 ? "Done" : left() === full() ? "Ready" : "Paused"}</text>
        </view>
      </view>
      <view
        onClick={(e) => (e.stopPropagation(), reset())}
        style={{ position: "absolute", right: 10, bottom: 8, paddingHorizontal: 6, paddingVertical: 2 }}
      >
        <text style={{ fontSize: 11, opacity: 0.6 }}>Reset</text>
      </view>
    </view>
  );
}

mount(() => <Focus />);
```

Salva: il ciclo di sviluppo lo ricarica. Oppure guardane l'anteprima senza desktop:

```sh
vitrine render dist focus --cells 2x2 --out focus.png
```

## Come funziona

**Uno stato che sopravvive ai riavvii.** Con `useStorage` il timer salva *quando finisce*, non quanto
manca. Vitrine può riavviare un widget in qualsiasi momento (aggiornamento del pack, cambio di lingua,
accesso a Windows) e il timer riprende dal secondo giusto, perché `left()` è calcolato da
`Date.now()`. Ogni chiamata a `setTimer` scrive un oggetto nuovo: i valori in storage si confrontano
per identità e ogni scrittura va su disco. Vedi [Storage](/it/docs/guides/storage/).

**Svegliarsi solo quando serve.** `useClock("second")` sveglia il widget una volta al secondo. Creato
dentro `createMemo`, esiste solo finché `running()` è vero: quando il timer si ferma, la memo viene
rivalutata e SolidJS elimina l'orologio precedente con il suo timer. Un timer fermo non costa nulla.
Lo stesso schema ricrea un hook quando cambia un'impostazione; vedi [Prestazioni](/it/docs/guides/performance/).

**Dimensioni.** Il widget riempie le sue celle (`width: "100%"`) e `useSize()` ne fornisce le
dimensioni in DIP: l'anello si calcola da lì e segue il ridimensionamento dal vivo in Modifica layout.
La dimensione delle celle varia leggermente da monitor a monitor, quindi non scriverla mai nel codice.

**Clic.** L'intero widget avvia e ferma il timer. **Reset** chiama `e.stopPropagation()` perché il
clic non arrivi anche all'`onClick` del genitore. Gli eventi risalgono dall'elemento più interno che
ha un gestore.

**Un anello fluido.** `transition: "stroke-dasharray 900ms linear"` interpola tra i valori di ogni
secondo, così l'arco scorre invece di procedere a scatti. Le transizioni valgono solo per valori
numerici; vedi [Animazioni](/it/docs/guides/animations/).

**Aspetto.** `useAppearance()` segue in tempo reale tema chiaro/scuro e colore principale di Windows,
e `backdropFilter` dà allo sfondo un vero effetto vetro smerigliato sopra lo sfondo del desktop. Vedi
[Aspetto](/it/docs/guides/appearance/) e [Vetro e leggibilità](/it/docs/guides/glass-and-legibility/).

## Distribuiscilo

```sh
npm run pack
```

Installa il `.vitrine`, aggiungi **Focus timer** dalla galleria, poi segui
[Pubblicazione](/it/docs/publishing/) per condividerlo. Prima di pubblicare leggi le
[linee guida di design](/it/docs/design/guidelines/).
