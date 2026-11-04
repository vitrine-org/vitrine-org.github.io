---
title: Vetro e leggibilità
description: Vetro smerigliato con backdropFilter e ombre del testo che mantengono i widget leggibili su qualsiasi sfondo.
sidebar:
  order: 8
---

Un widget non sa che cosa c'è dietro di sé: una foto scura, un desktop bianco, una trama fitta. Due
strumenti lo mantengono leggibile ovunque: una scheda acrilica che sfoca lo sfondo, oppure nessuna
scheda e un'ombra sotto il testo. Offrili entrambi, con un'impostazione `background`.

```tsx
import type { JSX } from "solid-js";
import { mount, useSettings, type Style } from "@vitrine/sdk";

/** Acrylic card, or nothing at all with a legibility shadow under the text. */
function Surface(props: { bare: boolean; children: JSX.Element }) {
  const card: Style = {
    background: "linear-gradient(160deg, rgba(56, 58, 64, 0.58), rgba(22, 23, 27, 0.50))",
    backdropFilter: "blur(16px) saturate(1.6)",
    border: "1px solid rgba(255, 255, 255, 0.13)",
    overflow: "hidden",
  };
  const bare: Style = { textShadow: "0 1px 4px rgba(0, 0, 0, 0.8)" };
  return (
    <view
      style={{
        width: "100%",
        height: "100%",
        flexDirection: "column",
        justifyContent: "center",
        padding: 16,
        borderRadius: 12,
        color: "#ffffff",
        ...(props.bare ? bare : card),
      }}
    >
      {props.children}
    </view>
  );
}

function Quote() {
  const s = useSettings({ background: "card" });
  return (
    <Surface bare={s().background === "none"}>
      <text style={{ fontSize: 18, fontWeight: 600 }}>Simplicity is prerequisite for reliability.</text>
      <text style={{ fontSize: 12, marginTop: 6, opacity: 0.8 }}>Edsger W. Dijkstra</text>
    </Surface>
  );
}

mount(() => <Quote />);
```

## Vetro smerigliato

`backdropFilter` funziona come `backdrop-filter` in CSS, con due funzioni:

| Valore | Effetto |
|---|---|
| `blur(16px)` | Sfocatura gaussiana dello sfondo; il raggio è in DIP |
| `saturate(1.6)` o `saturate(160%)` | Saturazione; `1` lascia i colori invariati |
| `blur(16px) saturate(1.6)` | Entrambe, in qualsiasi ordine |
| `none` | Nessun effetto |

Lo sfondo sfocato del monitor sotto il widget viene disegnato dentro il riquadro, ritagliato sul suo
`borderRadius`, **sotto** il `background` del riquadro stesso. Tieni quel background traslucido
(alfa tra 0,4 e 0,6 circa): colora il vetro, mentre uno opaco lo nasconde.

Attraverso il vetro si vede **solo lo sfondo del desktop**. I widget vivono sotto le icone, dove
Windows non offre alcun backdrop, perciò Vitrine ricompone lo sfondo da sé: altri widget, icone e
finestre non compaiono mai nel vetro. Il filtro non viene ereditato e vale solo per l'elemento che lo
dichiara.

:::tip
Vitrine sfoca lo sfondo di ogni monitor una volta per ciascun valore distinto del filtro e condivide
il risultato tra tutti i widget di quel monitor; disegnare il vetro diventa così un singolo
riempimento bitmap. Usa ovunque lo stesso valore (`blur(16px) saturate(1.6)` è l'aspetto acrilico di
Windows 11) e il vetro resta quasi gratuito.
:::

Per dare alla scheda il riflesso interno dell'acrilico Fluent, sovrapponi un `linear-gradient` in
posizione assoluta che vada da un bordo superiore chiaro di 1 px a un'ombra leggera in basso: non
esiste un `boxShadow` interno.

## Ombre del testo

`textShadow` accetta `"dx dy blur colore"` e disegna sotto il testo una vera sfocatura gaussiana. Viene
ereditata, quindi impostala una volta sulla radice del widget; `textShadow: "none"` la disattiva per
un sottoalbero.

| Testo | Ombra |
|---|---|
| Chiaro su uno sfondo qualsiasi | `0 1px 4px rgba(0, 0, 0, 0.8)` |
| Scuro su uno sfondo qualsiasi | `0 0 6px rgba(255, 255, 255, 0.75)`, un alone più che un'ombra |
| Su una scheda di vetro | `none`: il contrasto lo dà già la scheda |

Le ombre non si applicano all'SVG. Dai la stessa protezione a icone e tratti con una copia morbida
sotto: la stessa forma spostata di 1 DIP, al 35% circa di opacità, nel colore dell'ombra, oppure un
tratto un po' più largo nel colore dell'ombra sotto un anello.

## Verificare la leggibilità

Prima di pubblicare, guarda entrambe le modalità su sfondi reali:

```sh
vitrine render dist quote --backdrop photo.jpg --out card.png
vitrine render dist quote --settings '{"background":"none"}' --out bare.png
```

`--backdrop` sostituisce la sfumatura predefinita dietro il vetro. Un render senza scheda è
trasparente: guardalo sia su un fondo chiaro sia su uno scuro. Poi segui le regole di contrasto delle
[linee guida di design](/it/docs/design/guidelines/).
