---
title: Elementi
description: Gli elementi intrinseci che un widget Vitrine può disegnare, con le loro prop e i loro attributi.
sidebar:
  order: 1
---

L'interfaccia di un widget è un albero di elementi intrinseci scritto in TSX. Non esiste un DOM: il
motore mantiene un proprio albero di nodi, lo impagina con Taffy e lo disegna con Direct2D. Nomi e
prop riportati qui sono quelli tipizzati da `@vitrine/sdk` 2.2.0 (`VitrineElements`).

| Elemento | Ruolo | Impaginato | Figli |
| --- | --- | --- | --- |
| `view` | Riquadro: contenitore flex o grid | sì | qualsiasi elemento, testo semplice |
| `text` | Paragrafo di testo formattato | sì | testo, `span`, `br`, `text` annidati |
| `span` | Stesso tipo di nodo di `text`; si usa per i tratti in linea | sì, se non è dentro un `text` | come `text` |
| `br` | A capo dentro un `text` | no | nessuno |
| `image` | Immagine bitmap | sì | nessuno |
| `svg` | Area di disegno vettoriale | sì | `g`, `circle`, `ellipse`, `rect`, `line`, `path` |
| `g`, `circle`, `ellipse`, `rect`, `line`, `path` | Forme dentro un `svg` | no | solo `g`: forme |

## Prop comuni

Tutti gli elementi tranne `br` accettano:

| Prop | Tipo | Note |
| --- | --- | --- |
| `style` | oggetto `Style` o stringa CSS | Vedi [Stili](/it/docs/reference/styles/). Una stringa come `"padding: 8px; border-radius: 12px"` viene letta come CSS in linea; i nomi in kebab-case diventano camelCase. |
| `ref` | any | Ref di Solid; non viene inviato al motore. |
| `onClick`, `onPointerDown`, `onPointerUp`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onWheel` | `(e: PointerEventData) => void` | Gestori del puntatore. Il widget deve impostare `"interactive": true` nel [manifest](/it/docs/reference/manifest/). |

`class`, `className` e `key` sono accettati dal motore e ignorati.

## view

Un riquadro. Il layout predefinito è `display: "flex"` con `flexDirection: "row"`, come un `<div>`
con `display: flex`. Una stringa figlia diventa un nodo di testo con lo stile ereditato, quindi
`<view>Ciao</view>` mostra del testo.

```tsx
import { mount } from "@vitrine/sdk";

function Card() {
  return (
    <view style={{ width: "100%", height: "100%", flexDirection: "column", gap: 8, padding: 16 }}>
      <text style={{ fontSize: 13, opacity: 0.7 }}>
        Today
        <br />
        <span style={{ fontWeight: 600, opacity: 1 }}>Clear, 21°</span>
      </text>
      <image src="assets/sun.png" objectFit="contain" style={{ width: 48, height: 48 }} />
    </view>
  );
}

mount(() => <Card />);
```

Il nodo radice del widget è una `view` grande `100%` × `100%` dell'istanza; l'elemento di primo
livello è suo figlio, quindi dagli `width: "100%"` e `height: "100%"` per occupare tutte le celle.

## text, span, br

Un `text` è un paragrafo impaginato da DirectWrite. Tutto ciò che contiene (stringhe, `span`, `text`
o `view` annidati, `br`) viene appiattito in tratti formattati dello stesso paragrafo.

- **Per tratto** (possono variare dentro il paragrafo): `color`, `fontFamily`, `fontSize`,
  `fontWeight`, `fontStyle`, `letterSpacing`, `textDecoration` e `textTransform`.
- **Per paragrafo** (presi dal `text` esterno): `textAlign`, `lineHeight`, `whiteSpace`,
  `textOverflow` e `textShadow`.
- Gli stili del riquadro (`background`, `padding`, `opacity`, …) valgono solo per il `text`
  esterno, non per i tratti interni.
- `image` e `svg` dentro un `text` vengono ignorati.
- `br` inserisce un a capo; fuori da un `text` non disegna nulla.

`span` è lo stesso tipo di nodo di `text`: dentro un `text` è un tratto in linea, da solo è un
paragrafo.

:::note
I tratti di un paragrafo non sono nodi di layout separati, quindi i gestori del puntatore su uno
`span` annidato non scattano mai. Mettili sul `text` esterno o su una `view`.
:::

## image

| Prop | Tipo | Predefinito | Note |
| --- | --- | --- | --- |
| `src` | `string` | obbligatoria | Percorso relativo alla radice del pack, oppure un URI `data:` (base64 o percent-encoded). I percorsi con `..` vengono rifiutati. |
| `objectFit` | `"contain"` \| `"cover"` \| `"fill"` | `"contain"` | Il motore accetta anche l'alias `fit` (non tipizzato). |

Le immagini sono decodificate dal Windows Imaging Component: funziona qualsiasi formato letto da WIC,
PNG e JPEG compresi. Senza dimensioni esplicite, il layout usa la dimensione naturale dell'immagine.

:::caution
`vitrine-widget build` copia solo i file indicati in `vitrine.json` (impostazioni, anteprime, font)
più `README.md`, `LICENSE` e `icon.png`. Un'immagine citata con una stringa di percorso non finisce
nel pack. Importala dal codice (`import sun from "./sun.png"`): Vite incorpora le risorse importate
come URI `data:` nel bundle. Vedi [Font e risorse](/it/docs/guides/fonts-and-assets/).
:::

## svg

| Prop | Tipo | Note |
| --- | --- | --- |
| `viewBox` | `string` | `"minX minY larghezza altezza"`. Il contenuto viene scalato in modo uniforme e centrato (come `xMidYMid meet`). Senza `viewBox`, le unità sono DIP. |
| `width`, `height` | `number` | Dimensione predefinita quando lo stile non ne indica. Se è nota una sola dimensione, l'altra segue le proporzioni del `viewBox`; se non è nota nessuna, si usa la dimensione del `viewBox`. |

Il `color` dell'`svg` (da stile o prop) è il valore di `currentColor` per le sue forme.

## Forme

Le forme sono disegnate dentro il loro `svg` e non sono nodi di layout. I gestori del puntatore sulle
forme non scattano mai: mettili sull'`svg`.

| Elemento | Attributi geometrici |
| --- | --- |
| `circle` | `cx`, `cy` (predefinito 0), `r` |
| `ellipse` | `cx`, `cy` (predefinito 0), `rx`, `ry` |
| `rect` | `x`, `y` (predefinito 0), `width`, `height`, `rx`, `ry` (uno dei due imposta entrambi) |
| `line` | `x1`, `y1`, `x2`, `y2` |
| `path` | `d`: sintassi completa dei path SVG, assoluta e relativa (`M L H V C S Q T A Z`) |
| `g` | Gruppo: nessuna geometria |

Attributi di presentazione, comuni a tutte le forme:

| Attributo | Tipo | Predefinito | Note |
| --- | --- | --- | --- |
| `fill` | colore, `"none"` | nero; `none` per `line` e `g` | Ammette `currentColor`. |
| `fillOpacity` | `number` | `1` | |
| `stroke` | colore, `"none"` | nessuno | Ammette `currentColor`. |
| `strokeOpacity` | `number` | `1` | |
| `strokeWidth` | `number` | `1` | In unità del `viewBox`. |
| `strokeDasharray` | `string` \| `number[]` | nessuno | `"4 2"`, `"4,2"` o `[4, 2]`. |
| `strokeDashoffset` | `number` | `0` | |
| `strokeLinecap` | `"butt"` \| `"round"` \| `"square"` | `"butt"` | |
| `strokeLinejoin` | `"miter"` \| `"round"` \| `"bevel"` | `"miter"` | |
| `opacity` | `number` | `1` | Si moltiplica con l'opacità dei gruppi che la contengono. |
| `transform` | `string` | nessuna | Lista di trasformazioni SVG: `translate`, `scale`, `rotate(a)`, `rotate(a cx cy)`, `matrix(a b c d e f)`. |
| `color` | colore | ereditato | Imposta `currentColor` per la forma (e, su un `g`, per i suoi figli). |

Un `g` trasmette ai figli `transform`, `opacity` e `color`. `fill` e `stroke` **non** si ereditano da
un `g`: impostali su ogni forma. Il motore converte in camelCase i nomi in kebab-case
(`stroke-width`), ma l'SDK tipizza solo la forma camelCase. Ogni attributo può essere passato anche
tramite `style`.

Gli attributi numerici si possono animare con una `transition` (nello `style` della forma o come
attributo `transition`), per esempio `strokeDasharray` in un anello di avanzamento:

```tsx
import { mount } from "@vitrine/sdk";

function Ring(props: { value: number }) {
  const r = 32;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 88 88" width={88} height={88} style={{ color: "#60CDFF" }}>
      <circle cx={44} cy={44} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={8} />
      <circle
        cx={44}
        cy={44}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={[c * props.value, c]}
        transform="rotate(-90 44 44)"
      />
    </svg>
  );
}

mount(() => <Ring value={0.62} />);
```

Un gruppo con colore e trasformazione ereditati:

```tsx
import { mount } from "@vitrine/sdk";

const icon = (
  <svg viewBox="0 0 24 24" width={20} height={20}>
    <g transform="translate(2 2)" color="#ffffff" opacity={0.9}>
      <rect x={0} y={0} width={20} height={20} rx={5} fill="none" stroke="currentColor" strokeWidth={1.5} />
      <line x1={5} y1={10} x2={15} y2={10} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <path d="M10 5 V15" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      <ellipse cx={10} cy={10} rx={2} ry={2} fill="currentColor" />
    </g>
  </svg>
);

mount(() => icon);
```

## Eventi del puntatore

I gestori ricevono un `PointerEventData`:

| Campo | Tipo | Note |
| --- | --- | --- |
| `type` | `string` | `click`, `pointerdown`, `pointerup`, `pointermove`, `pointerenter`, `pointerleave`, `wheel` |
| `x`, `y` | `number` | Posizione del puntatore in coordinate del widget (DIP). |
| `deltaY` | `number` | Solo `wheel`: 100 per scatto, positivo scorrendo verso il basso. Altrimenti `0`. |
| `button` | `number` | Sempre `0`: il tasto destro apre il menu contestuale del widget e non viene consegnato. |
| `target` | `number` | Id, nel motore, del nodo colpito. |
| `stopPropagation()` | funzione | Ferma la risalita verso gli antenati. |

Regole, come implementate nel motore 2.0:

- Il bersaglio è il nodo impaginato più profondo sotto il puntatore **che ha un gestore**. I nodi
  senza gestori sono trasparenti all'hit test; anche `overflow: "hidden"` ritaglia l'hit test.
- Ogni evento, compresi `pointerenter` e `pointerleave`, risale nell'SDK dal bersaglio attraverso gli
  antenati, chiamando il gestore di quel tipo su ciascuno.
- `click` scatta al `pointerup` sullo stesso nodo che ha ricevuto il `pointerdown`.
- In modalità modifica l'input è sospeso. I widget non ricevono mai il focus della tastiera: per
  chiedere un testo usa [`prompt()`](/it/docs/reference/sdk/#prompt).

```tsx
import { mount } from "@vitrine/sdk";
import { createSignal } from "solid-js";

function Counter() {
  const [n, setN] = createSignal(0);
  return (
    <view
      style={{ padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.08)" }}
      onClick={() => setN(n() + 1)}
      onWheel={(e) => setN(n() - Math.sign(e.deltaY ?? 0))}
    >
      <text>{n()}</text>
    </view>
  );
}

mount(() => <Counter />);
```

## Alias del motore non tipizzati

Il motore riconosce alcuni altri nomi di tag, che l'SDK non tipizza: `p` e `label` (come `text`),
`img` (come `image`). Qualsiasi tag sconosciuto è trattato come una `view`.
