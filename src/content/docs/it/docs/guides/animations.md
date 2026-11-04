---
title: Animazioni
description: Transizioni in stile CSS sulle proprietà numeriche, trasformazioni statiche e movimento che non consuma energia.
sidebar:
  order: 10
---

Vitrine anima con le transizioni: dichiari quali proprietà sfumano e per quanto tempo, cambi il valore
e il motore disegna i fotogrammi intermedi. Il tuo codice gira una volta per ogni cambiamento, non a
ogni fotogramma.

```tsx
import { createSignal } from "solid-js";
import { mount } from "@vitrine/sdk";

function Agenda() {
  const [open, setOpen] = createSignal(false);

  return (
    <view
      onClick={() => setOpen(!open())}
      style={{ width: "100%", height: "100%", flexDirection: "column", padding: 14, borderRadius: 12, background: "rgba(32, 32, 32, 0.55)" }}
    >
      <view style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <text style={{ fontSize: 14, fontWeight: 600 }}>Today</text>
        <svg width={12} height={12} viewBox="0 0 12 12">
          {/* transform switches instantly; it is not interpolated */}
          <path d="M 3 4.5 L 6 7.5 L 9 4.5" fill="none" stroke="#ffffff" strokeWidth={1.4} transform={open() ? "rotate(180 6 6)" : ""} />
        </svg>
      </view>
      <view
        style={{
          height: open() ? 44 : 0,
          opacity: open() ? 1 : 0,
          overflow: "hidden",
          transition: "height 250ms ease-out, opacity 200ms ease",
        }}
      >
        <text style={{ fontSize: 12, marginTop: 8, opacity: 0.8 }}>10:00 Design review</text>
        <text style={{ fontSize: 12, opacity: 0.8 }}>14:30 Dentist</text>
      </view>
    </view>
  );
}

mount(() => <Agenda />);
```

## transition

```ts
transition: "height 250ms ease-out, opacity 200ms ease 50ms"
```

Ogni voce separata da virgola è una proprietà (in camelCase o kebab-case, oppure `all`), una durata in
`ms` o `s`, un'andatura facoltativa e un ritardo facoltativo. Andature: `ease` (predefinita),
`linear`, `ease-in`, `ease-out`, `ease-in-out`.

Una transizione parte ogni volta che il valore della proprietà cambia mentre l'elemento la dichiara, e
parte dal valore visibile in quel momento: interrompere una transizione in corso la inverte senza
scatti.

## Che cosa si interpola

Solo i **numeri**: numeri semplici e lunghezze in `px`, o elenchi di questi.

| Si interpolano | Cambiano di colpo |
|---|---|
| `width`, `height`, `top`, `left`, `right`, `bottom` | colori: `color`, `background`, `borderColor` |
| `margin*`, `padding*`, `gap` | sfumature (gradienti) |
| `opacity`, `borderRadius` | `transform` |
| attributi SVG: `r`, `cx`, `x`, `strokeWidth`, `strokeDashoffset`, `strokeDasharray` | percentuali (`"40%"`), `"auto"` |

Come regolarsi:

- **Dissolvi invece di ricolorare.** Per un riempimento di hover, sovrapponi un livello con il nuovo
  colore e anima la sua `opacity` ([esempio](/it/docs/guides/interactivity/#stato-di-hover-e-pressione)).
- **Usa i DIP per le barre.** Calcola `width` da `useSize()` invece di usare `"%"`
  ([esempio](/it/docs/guides/system-metrics/)).
- **Gli anelli** animano `strokeDasharray` come `"<arco> <circonferenza>"`
  ([esempio](/it/docs/guides/building-a-widget/)).
- **Elenca le proprietà.** `all` cattura anche stringhe che non si possono interpolare; scrivi quelle
  che intendi.

:::note
In Vitrine 2.x le andature `cubic-bezier(…)` non sono affidabili dentro un valore di `transition`
(l'elenco viene diviso sulle virgole); usa le andature con nome.
:::

## Trasformazioni

`transform` accetta `translate(x, y)`, `translateX`, `translateY`, `scale(s)` o `scale(x, y)`,
`scaleX`, `scaleY` e `rotate(deg)`, combinate nell'ordine scritto e applicate attorno al centro del
riquadro. Agisce solo sul disegno, quindi è ideale per effetti statici: un pulsante premuto a
`scale(0.96)`, un'etichetta inclinata, un'icona capovolta in base allo stato. Gli elementi SVG usano
l'attributo `transform` dell'SVG, per esempio `rotate(-90 50 50)` per far partire un anello dall'alto.
Nessuno dei due si interpola: un cambio di trasformazione appare subito.

## Movimento ed energia

- Il motore disegna fotogrammi, alla frequenza dello schermo, solo mentre una transizione è in corso,
  poi torna inattivo. Un widget in cui non cambia nulla non costa nulla.
- Le modifiche a `opacity`, `borderRadius` e `transform` ridisegnano senza ricalcolare il layout. Le
  transizioni su dimensioni e margini ricalcolano il layout a ogni fotogramma: vanno bene per una breve
  apertura, sono uno spreco come effetto continuo.
- `requestAnimationFrame` non esiste, di proposito. Non emularlo con un `setInterval` veloce: un timer
  da 16 ms tiene il motore sveglio per sempre. Per qualcosa di continuo, come una lancetta dei
  secondi, aggiorna una volta al secondo e lascia che una transizione ammorbidisca il passo, oppure
  procedi a scatti.
- Vitrine fa già comparire e scomparire i widget con una dissolvenza quando vengono aggiunti o rimossi;
  non aggiungere una tua animazione d'ingresso alla radice.

Tutto si ferma mentre i widget sono [sospesi](/it/docs/guides/performance/).
