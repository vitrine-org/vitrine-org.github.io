---
title: Interattività
description: Clic, passaggio del puntatore e rotellina su un widget che vive sotto le icone del desktop, e dove il desktop conserva la precedenza.
sidebar:
  order: 3
---

I widget stanno tra lo sfondo e le icone del desktop, quindi non ricevono mai l'input direttamente.
Vitrine osserva il puntatore e lo inoltra a un widget solo quando nient'altro sul desktop deve
riceverlo. Questa guida mostra l'API e le regole.

## Attivare l'interattività

Imposta `"interactive": true` sul widget in `vitrine.json`. Senza, il widget lascia passare tutto:
clic, trascinamenti e selezioni a rettangolo vanno al desktop, esattamente come sullo sfondo. Lascialo
disattivato per i widget che mostrano soltanto informazioni.

## Gestori

I gestori del puntatore si mettono su qualsiasi elemento:

```tsx
import { createSignal } from "solid-js";
import { mount, openUrl } from "@vitrine/sdk";

function Counter() {
  const [count, setCount] = createSignal(0);
  const [hover, setHover] = createSignal(false);

  return (
    <view
      onClick={() => setCount(count() + 1)}
      onWheel={(e) => setCount(count() - Math.sign(e.deltaY ?? 0))}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      style={{
        width: "100%",
        height: "100%",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        borderRadius: 12,
        background: "rgba(32, 32, 32, 0.55)",
        border: hover() ? "1px solid rgba(255, 255, 255, 0.35)" : "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <text style={{ fontSize: 40, fontWeight: 600 }}>{count()}</text>
      <view
        onClick={(e) => {
          e.stopPropagation(); // don't count this click
          openUrl("https://vitrine-org.github.io/docs/guides/interactivity/");
        }}
        style={{ paddingHorizontal: 8, paddingVertical: 2 }}
      >
        <text style={{ fontSize: 12, color: "#60CDFF" }}>How it works</text>
      </view>
    </view>
  );
}

mount(() => <Counter />);
```

| Gestore | Quando scatta |
|---|---|
| `onPointerDown`, `onPointerUp` | Il tasto sinistro viene premuto o rilasciato |
| `onClick` | Pressione e rilascio sono avvenuti sullo stesso elemento |
| `onPointerEnter`, `onPointerLeave` | Il puntatore entra nell'elemento sotto di sé o ne esce |
| `onPointerMove` | Il puntatore si muove sopra l'elemento |
| `onWheel` | La rotellina gira; `deltaY` vale `100` per scatto, positivo verso l'utente |

Ogni gestore riceve `{ type, x, y, deltaY, button, target, stopPropagation() }`. `x` e `y` sono in DIP
dall'angolo in alto a sinistra del widget, non dell'elemento. `button` vale sempre `0`: il tasto
destro è riservato al menu del widget.

## Hit-testing e propagazione

Il bersaglio è l'elemento più interno sotto il puntatore che ha un gestore. Gli elementi senza gestori
sono trasparenti all'hit-testing, e `overflow: "hidden"` lo ritaglia: un figlio fuori dal ritaglio del
genitore non si può colpire. Dal bersaglio l'evento risale gli antenati eseguendo ogni gestore, finché
uno non chiama `e.stopPropagation()`.

Anche ingresso e uscita risalgono. Passando da un pulsante all'altro dentro una scheda, la scheda
riceve un'uscita (dal primo pulsante) e un ingresso (dal secondo). Tieni lo stato di hover
sull'elemento a cui appartiene, come fa l'helper `usePress` qui sotto.

## Stato di hover e pressione

I colori di sfondo non si animano, quindi il riempimento di hover è un livello di cui si anima
l'opacità:

```tsx
import { createSignal, type JSX } from "solid-js";

/** Hover and pressed state for one interactive element. */
export function usePress() {
  const [hover, setHover] = createSignal(false);
  const [down, setDown] = createSignal(false);
  const handlers = {
    onPointerEnter: () => setHover(true),
    onPointerLeave: () => (setHover(false), setDown(false)),
    onPointerDown: () => setDown(true),
    onPointerUp: () => setDown(false),
  };
  return { hover, down, handlers };
}

export function Button(props: { label: string; onClick: () => void }): JSX.Element {
  const press = usePress();
  return (
    <view onClick={props.onClick} {...press.handlers} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
      {/* Background colours don't animate: fade a layer's opacity instead. */}
      <view
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 6,
          background: press.down() ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.10)",
          opacity: press.hover() ? 1 : 0,
          transition: "opacity 150ms ease",
        }}
      />
      <text style={{ fontSize: 13 }}>{props.label}</text>
    </view>
  );
}
```

Mostra i controlli secondari (una matita per modificare, un pulsante per eliminare) solo al passaggio
del puntatore: il desktop resta calmo e il widget si rivela interattivo quando serve.

## Dove vince il desktop

Un evento del puntatore raggiunge un widget solo se valgono tutte queste condizioni:

- il widget è interattivo e il punto è al suo interno;
- **lì non c'è un'icona del desktop**: l'intera casella di ogni icona, etichetta compresa, conserva
  clic, doppi clic, trascinamenti e menu contestuale;
- **sotto il puntatore c'è il desktop stesso**: qualunque finestra davanti, barra delle applicazioni e
  notifiche comprese, riceve l'input al suo posto;
- Modifica layout non è attivo e non c'è un menu di Vitrine aperto.

Entro queste regole:

- **Il tasto destro** apre sempre il menu del widget (**Impostazioni widget…**, **Modifica layout**,
  **Rimuovi widget**); i widget non lo vedono mai.
- **I doppi clic** vengono assorbiti perché il desktop non reagisca; il widget riceve due clic
  distinti.
- **Non c'è tastiera.** I widget non ricevono mai il focus. Per il testo usa
  [`prompt()`](/it/docs/guides/text-input/).
- **I clic sulle parti vuote di un widget interattivo** non arrivano nemmeno al desktop: sopra un
  widget interattivo non si può iniziare una selezione a rettangolo. Dimensiona i widget interattivi
  sul loro contenuto.

## Aprire link

`openUrl(url)` apre un URL `http://` o `https://` nel browser predefinito; gli altri schemi vengono
ignorati. Chiamalo da un clic, mai da un timer: aprire un browser senza che l'utente lo chieda è
ostile.

Prossimo passo: lo [storage](/it/docs/guides/storage/) conserva ciò che l'utente fa anche dopo un riavvio.
