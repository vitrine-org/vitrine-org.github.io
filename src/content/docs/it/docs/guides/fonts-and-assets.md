---
title: Font e risorse
description: Usa i font di Windows, includi i tuoi e distribuisci immagini e icone vettoriali dentro un pack.
sidebar:
  order: 11
---

## Font di sistema

`fontFamily` accetta il nome di una famiglia installata in Windows. Il testo usa per impostazione
predefinita **Segoe UI Variable Text**, 14 DIP, bianco. La scala tipografica di Windows 11 usa tre
dimensioni ottiche:

| Famiglia | Per |
|---|---|
| `Segoe UI Variable Display` | Numeri grandi e titoli |
| `Segoe UI Variable Text` | Testo corrente |
| `Segoe UI Variable Small` | Didascalie ed etichette piccole |

Di un elenco viene usato solo il primo nome (`"Inter, sans-serif"` significa `Inter`): non esiste una
catena di ripiego come in CSS. Segoe UI Variable è inclusa in Windows 11; Windows 10 la sostituisce
con un altro font, quindi prova lì il widget oppure includi il font da cui dipendi.

## Font inclusi nel pack

Elenca i file dei font nel manifest del pack:

```json
{
  "id": "dev.you.posters",
  "fonts": ["assets/fonts/BebasNeue-Regular.ttf", "assets/fonts/Montserrat-Regular.ttf"],
  "widgets": [ … ]
}
```

Ogni widget del pack può poi usarli con il nome di famiglia, quello registrato nel file del font, senza
distinzione tra maiuscole e minuscole:

```tsx
import { formatDate, mount, useClock } from "@vitrine/sdk";
import logo from "./logo.png";

function Poster() {
  const now = useClock("minute");
  return (
    <view style={{ width: "100%", height: "100%", alignItems: "center", gap: 12, padding: 16 }}>
      <image src={logo} objectFit="contain" style={{ width: 56, height: 56, flexShrink: 0 }} />
      <view style={{ flexDirection: "column" }}>
        <text style={{ fontFamily: "Bebas Neue", fontSize: 48, lineHeight: 1, letterSpacing: "0.04em" }}>{formatDate(now(), "HH:mm")}</text>
        <text style={{ fontFamily: "Montserrat", fontSize: 12, textTransform: "uppercase" }}>{formatDate(now(), "dddd")}</text>
      </view>
    </view>
  );
}

mount(() => <Poster />);
```

- Funzionano i file TTF e OTF. Includi un file per ogni peso e stile che usi: un `fontWeight: 700` con
  il solo file regular ottiene un grassetto sintetizzato, non quello vero.
- I font vengono caricati in memoria insieme a ogni widget e non vengono mai installati in Windows.
- Rispetta la licenza del font; licenze aperte come la SIL OFL chiedono di includerne il testo, per
  esempio nel `LICENSE` del pack.

## Immagini

`<image src={…} objectFit="contain" | "cover" | "fill" />` disegna una bitmap. Assegnale `width` e
`height`; le immagini vengono decodificate da Windows (WIC), quindi PNG e JPEG sono scelte sicure.

Importa le immagini dal codice. La build dell'SDK le incorpora nel bundle del widget come URI `data:`,
così viaggiano dentro il pack senza dichiarare altro. TypeScript deve sapere che cos'è l'import di
un'immagine; aggiungi un file di dichiarazioni in `src/`:

```ts
// Image imports are inlined into the bundle as data: URIs.
declare module "*.png" {
  const src: string;
  export default src;
}
declare module "*.jpg" {
  const src: string;
  export default src;
}
```

:::caution
`vitrine-widget build` copia nel pack solo i file citati dal manifest (entry, impostazioni, anteprime,
font) più `README.md`, `LICENSE` e `icon.png`. Un percorso come `src="assets/photo.png"` punterebbe a
un file che nel pack non c'è: importa l'immagine.
:::

Le immagini incorporate fanno crescere il bundle, che Vitrine analizza a ogni avvio del widget.
Ridimensionale alla dimensione massima a cui le disegni (×2 per gli schermi ad alta densità) e
comprimile.

## Icone vettoriali

Per le icone usa elementi SVG anziché immagini: restano nitide a ogni scala, prendono i colori dalla
palette e pesano pochi byte.

```tsx
<svg width={18} height={18} viewBox="0 0 18 18">
  <path d="M 9 4 L 9 14 M 4 9 L 14 9" stroke="#60CDFF" strokeWidth={1.6} strokeLinecap="round" />
</svg>
```

`svg` accetta `viewBox`, `width` e `height`; al suo interno `g`, `circle`, `ellipse`, `rect`, `line` e
`path` accettano `fill`, `stroke`, `strokeWidth`, `strokeDasharray`, `strokeLinecap`, `opacity` e
`transform`. I file SVG non sono supportati come sorgente di `image`: copia i dati del tracciato in un
componente. Tutti gli attributi sono nel [riferimento degli elementi](/it/docs/reference/elements/).

Dimensioni del pack e limiti sul numero di file sono in [Limiti](/it/docs/reference/limits/).
