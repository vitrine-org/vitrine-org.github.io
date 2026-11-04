---
title: Stili
description: Tutte le proprietà di stile comprese dal renderer di Vitrine, con valori, predefiniti, ereditarietà e differenze dal CSS.
sidebar:
  order: 2
---

Gli stili sono in camelCase e somigliano al CSS. Si passano come oggetto (`style={{ fontSize: 14 }}`,
di tipo `Style`) o come stringa CSS in linea (`style="font-size: 14px"`). Non esistono selettori,
classi né cascata: ogni elemento porta il proprio stile, e solo le proprietà del testo si ereditano.

Un valore non interpretabile viene ignorato e la proprietà mantiene il suo predefinito.

## Tipi di valore

| Tipo | Forme accettate |
| --- | --- |
| Lunghezza | Un numero (DIP), `"12px"`, `"50%"`, `"auto"`. Niente `em`, `rem`, `vw` o `calc()` (salvo dove indicato per `letterSpacing` e `lineHeight`). |
| Colore | `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`; `rgb()` / `rgba()` con virgole o spazi, `/ alfa` facoltativo, canali 0–255 o in `%`; `hsl()` / `hsla()`; `transparent`; `currentColor`; colori con nome: `black`, `white`, `red`, `green`, `lime`, `blue`, `yellow`, `orange`, `purple`, `gray`/`grey`, `silver`, `cyan`/`aqua`, `magenta`/`fuchsia`, `pink`, `navy`, `teal`, `maroon`, `olive`. |
| Durata | `"0.4s"`, `"200ms"`. |

Le scorciatoie di riquadro (`margin`, `padding`, `borderRadius`) accettano un numero o una stringa da
1 a 4 valori, nell'ordine del CSS: `"8 16"` → sopra/sotto 8, sinistra/destra 16.

## Layout

| Proprietà | Valori | Predefinito | Ereditata |
| --- | --- | --- | --- |
| `display` | `"flex"`, `"grid"`, `"none"` | `"flex"` | no |
| `position` | `"relative"`, `"absolute"` | `"relative"` | no |
| `top`, `right`, `bottom`, `left` | Lunghezza | `auto` | no |
| `inset` | Lunghezza (tutti e quattro i lati; vince la proprietà del singolo lato) | `auto` | no |
| `width`, `height` | Lunghezza | `auto` | no |
| `minWidth`, `minHeight`, `maxWidth`, `maxHeight` | Lunghezza | `auto` | no |
| `aspectRatio` | numero (larghezza ÷ altezza) | nessuno | no |
| `overflow` | `"visible"`, `"hidden"` | `"visible"` | no |

`overflow: "hidden"` ritaglia disegno e hit test sul riquadro, angoli arrotondati compresi. Il motore
accetta anche `display: "block"`, che l'SDK non tipizza.

## Spaziature

| Proprietà | Valori | Predefinito | Ereditata |
| --- | --- | --- | --- |
| `margin` | Lunghezza, 1–4 valori | `0` | no |
| `marginTop`, `marginRight`, `marginBottom`, `marginLeft` | Lunghezza | `0` | no |
| `marginHorizontal`, `marginVertical` | Lunghezza (sinistra + destra, sopra + sotto) | `0` | no |
| `padding` | Lunghezza (senza `auto`), 1–4 valori | `0` | no |
| `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft` | Lunghezza | `0` | no |
| `paddingHorizontal`, `paddingVertical` | Lunghezza | `0` | no |
| `gap` | Lunghezza | `0` | no |
| `rowGap`, `columnGap` | Lunghezza (prevale su `gap`) | `0` | no |

Precedenza: la proprietà del singolo lato (`marginTop`) prevale sulla scorciatoia; `marginHorizontal`
e `marginVertical` riempiono solo i lati non impostati altrimenti. Un margine `"auto"` esplicito
funziona come in flexbox.

## Flexbox

| Proprietà | Valori | Predefinito | Ereditata |
| --- | --- | --- | --- |
| `flexDirection` | `"row"`, `"column"`, `"row-reverse"`, `"column-reverse"` | `"row"` | no |
| `flexWrap` | `"nowrap"`, `"wrap"`, `"wrap-reverse"` | `"nowrap"` | no |
| `flex` | numero `n` → grow `n`, shrink 1, basis 0 | nessuno | no |
| `flexGrow` | numero | `0` | no |
| `flexShrink` | numero | `1` | no |
| `flexBasis` | Lunghezza | `auto` | no |
| `alignItems` | `"flex-start"`/`"start"`, `"flex-end"`/`"end"`, `"center"`, `"baseline"`, `"stretch"` | `"stretch"` | no |
| `alignSelf` | come `alignItems` | l'`alignItems` del genitore | no |
| `justifyContent` | `"flex-start"`/`"start"`, `"flex-end"`/`"end"`, `"center"`, `"space-between"`, `"space-around"`, `"space-evenly"` | `"flex-start"` | no |
| `alignContent` | come `justifyContent`, più `"stretch"` | `"stretch"` | no |

`flexGrow`, `flexShrink` e `flexBasis` prevalgono sui valori impostati da `flex`.

## Grid

| Proprietà | Valori | Predefinito | Ereditata |
| --- | --- | --- | --- |
| `gridTemplateColumns`, `gridTemplateRows` | Un numero `N` (N tracce uguali da `1fr`) o una lista di tracce | nessuno | no |
| `gridColumn`, `gridRow` | `2`, `"2"`, `"1 / 3"`, `"span 2"`, `"2 / span 2"` | `auto` | no |

Le liste di tracce accettano numeri o `px`, `%`, `fr`, `auto`, `minmax(min, max)` (min: `auto` o px;
max: `auto`, px o `fr`) e `repeat(n, tracce)`. Linee con nome, `auto-fill`/`auto-fit` e aree del
template non sono supportate. Il motore legge anche `justifyItems` e `justifySelf` (stessi valori di
`alignItems`), che l'SDK non tipizza.

## Disegno del riquadro

| Proprietà | Valori | Predefinito | Ereditata |
| --- | --- | --- | --- |
| `background` | Colore, `linear-gradient(…)`, `radial-gradient(…)` | nessuno | no |
| `backgroundColor` | come `background` (usato se `background` manca) | nessuno | no |
| `border` | `"1px solid <colore>"`: uno spessore e un colore; la parola dello stile è ignorata | nessuno | no |
| `borderWidth` | numero | `0` | no |
| `borderColor` | Colore | `currentColor` se c'è uno spessore | no |
| `borderRadius` | numero o `"ss sd id is"` (1–4 valori, px) | `0` | no |
| `borderTopLeftRadius`, `borderTopRightRadius`, `borderBottomRightRadius`, `borderBottomLeftRadius` | numero | `0` | no |
| `boxShadow` | `"dx dy sfocatura colore"` | nessuna | no |
| `backdropFilter` | `"blur(16px)"`, `"saturate(1.6)"`, entrambe, o `"none"` | nessuno | no |
| `opacity` | numero, limitato a 0–1 | `1` | no (vale per il sottoalbero) |
| `transform` | `translate(x, y)`, `translateX()`, `translateY()`, `scale(s)`, `scale(sx, sy)`, `scaleX()`, `scaleY()`, `rotate(deg)`, `matrix(a, b, c, d, e, f)` | nessuna | no (vale per il sottoalbero) |

Note:

- **Gradienti.** `linear-gradient` ha un primo argomento facoltativo: un angolo in `deg` (0 punta in
  alto, 90 a destra) oppure `to top|right|bottom|left` e i quattro angoli; il predefinito è `180deg`
  (verso il basso). Gli stop sono `colore [posizione%]`; quelli senza posizione si distribuiscono in
  modo uniforme. `radial-gradient` accetta solo gli stop: un `circle` o `ellipse` iniziale viene
  saltato, dimensione e posizione non sono supportate.
- **Bordi.** Il bordo è disegnato all'interno del contorno, sopra il contenuto. `borderWidth` occupa
  anche spazio nel layout (come nel CSS); la scorciatoia `border` disegna soltanto, senza cambiare il
  layout. I bordi sono uniformi: niente spessori o colori per singolo lato.
- **I raggi** sono in DIP; le percentuali non sono supportate.
- **`boxShadow`** usa la prima ombra di una lista. `dx` e `dy` sono obbligatori, la sfocatura è
  facoltativa; una quarta lunghezza (spread) e la parola `inset` vengono ignorate. Il colore
  predefinito è `rgba(0,0,0,0.35)`. La sfocatura è approssimata con rettangoli arrotondati
  semitrasparenti sovrapposti, non è una vera gaussiana. Per il testo, `textShadow` usa invece una vera
  sfocatura gaussiana.
- **`opacity`** è un'opacità di gruppo: il riquadro e i suoi discendenti vengono composti insieme.
- **`transform`** si applica attorno al centro del riquadro (non esiste `transformOrigin`), dopo il
  layout, e si estende ai discendenti. Sono comprese solo le unità `px` e `deg`, non `%`, `rad` o
  `turn`. Le funzioni si compongono come nel CSS (quella più a destra si applica per prima).
- **L'ordine di disegno** è l'ordine dell'albero; non esiste `zIndex`.

### backdropFilter

Vetro smerigliato. Lo sfondo del desktop dietro il riquadro viene sfocato e saturato, ritagliato sul
`borderRadius` del riquadro e disegnato sotto il suo `background`: tieni quel fondo semitrasparente.

- `blur(r)`: sfocatura gaussiana, `r` in DIP (come in CSS `backdrop-filter`).
- `saturate(f)`: fattore (`1.6`) o percentuale (`160%`); `1` lascia i colori invariati.
- Le funzioni possono comparire in qualsiasi ordine; quelle ripetute si compongono come nel CSS; le
  altre funzioni di filtro vengono ignorate; un valore malformato, o che non cambia nulla, disattiva
  l'effetto.
- Attraverso il vetro si vede solo lo sfondo del desktop, mai altri widget o finestre. In
  [`vitrine render`](/it/docs/reference/cli/#vitrine-render) lo sfondo è un gradiente tenue, oppure
  l'immagine passata con `--backdrop`.

Vedi [Vetro e leggibilità](/it/docs/guides/glass-and-legibility/).

```tsx
import { mount } from "@vitrine/sdk";

function Glass() {
  return (
    <view
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 8,
        padding: 12,
        borderRadius: 16,
        background: "rgba(32, 32, 32, 0.35)",
        backdropFilter: "blur(16px) saturate(1.6)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      <view style={{ gridColumn: "span 2", height: 4, borderRadius: 2, background: "linear-gradient(90deg, #60CDFF, #A78BFA)" }} />
      <text style={{ fontSize: 28, fontWeight: 600, textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}>42%</text>
      <text style={{ textAlign: "end", whiteSpace: "nowrap", textOverflow: "ellipsis", opacity: 0.7 }}>CPU</text>
    </view>
  );
}

mount(() => <Glass />);
```

## Testo

Tutte le proprietà del testo sono ereditate da ogni discendente, compresi `textAlign`, `whiteSpace`,
`textOverflow` e `textDecoration`. Quali possono variare dentro un paragrafo è indicato in
[Elementi](/it/docs/reference/elements/#text-span-br).

| Proprietà | Valori | Predefinito | Ereditata |
| --- | --- | --- | --- |
| `color` | Colore | `#ffffff` | sì |
| `fontFamily` | Nome di famiglia; in una lista si usa solo la prima, senza virgolette | `"Segoe UI Variable Text"` | sì |
| `fontSize` | numero (DIP) o `"14px"` | `14` | sì |
| `fontWeight` | `100`–`900`, `"normal"` (400), `"bold"` (700) | `400` | sì |
| `fontStyle` | `"normal"`, `"italic"` | `"normal"` | sì |
| `letterSpacing` | numero (DIP) o `"0.05em"` | `0` | sì |
| `lineHeight` | numero ≤ 4: multiplo di `fontSize`; numero > 4: DIP; `"20px"`; `"1.5rem"` (× 16); `"1.4"` | quella naturale del font | sì |
| `textAlign` | `"left"`/`"start"`, `"center"`, `"right"`/`"end"`, `"justify"` | `"start"` | sì |
| `textTransform` | `"none"`, `"uppercase"`, `"lowercase"`, `"capitalize"` | `"none"` | sì |
| `whiteSpace` | `"normal"`, `"nowrap"` | `"normal"` | sì |
| `textOverflow` | `"clip"`, `"ellipsis"` | `"clip"` | sì |
| `textShadow` | `"dx dy sfocatura colore"`, `"none"` | nessuna | sì |
| `textDecoration`, `textDecorationLine` | `"none"`, `"underline"`, `"line-through"`, `"underline line-through"` | `"none"` | sì |

Note:

- `fontFamily` cerca tra i font installati in Windows e quelli dichiarati nei
  [`fonts`](/it/docs/reference/manifest/#campi-del-pack) del pack. Vedi
  [Font e risorse](/it/docs/guides/fonts-and-assets/).
- Il motore accetta anche `fontWeight: "lighter"` (300) e `"bolder"` (800) come pesi fissi, non
  relativi al genitore; `fontStyle: "oblique"` viene reso come corsivo; `whiteSpace: "pre"` si
  comporta come `"nowrap"`.
- `lineHeight` si eredita come valore assoluto e viene riscalata quando un discendente cambia
  `fontSize` senza impostare una propria `lineHeight`.
- `textOverflow: "ellipsis"` tronca a livello di carattere quando il testo non entra nel riquadro.
- `textShadow` usa una vera sfocatura gaussiana; `currentColor` indica il colore del testo.

:::note[Da SDK 2.2.0]
`textDecoration` e `textDecorationLine` sono tipizzate da SDK 2.2.0. Con la 2.1.0 l'oggetto tipizzato
le rifiuta; uno stile come stringa in linea (`style="text-decoration: underline"`) è accettato.
:::

## Transizioni

| Proprietà | Valori | Predefinito | Ereditata |
| --- | --- | --- | --- |
| `transition` | `"<proprietà> <durata> [easing] [ritardo]"`, separate da virgole | nessuna | no |

- `<proprietà>` è una chiave di stile in camelCase o kebab-case (`width`, `stroke-dasharray`) oppure
  `all`.
- La prima durata è la lunghezza dell'animazione, la seconda il ritardo.
- Easing: `linear`, `ease` (predefinito), `ease-in`, `ease-out`, `ease-in-out`,
  `cubic-bezier(x1, y1, x2, y2)`.
- **Cosa si anima**: numeri, lunghezze in `px`, liste di numeri (come `strokeDasharray`) e
  `transform`. Le trasformazioni seguono il CSS: liste con le stesse funzioni si interpolano funzione
  per funzione, `none` vale come identità e liste diverse si interpolano tramite le matrici.
  Colori, percentuali e gradienti cambiano di colpo.
- Una transizione parte quando viene applicato un nuovo oggetto di stile che contiene sia
  `transition` sia un valore cambiato. Il valore deve essere già numerico prima del cambio: una
  proprietà che compare per la prima volta non si anima.
- Si animano anche gli attributi delle forme, se lo `style` della forma (o un attributo
  `transition`) li nomina.

```tsx
import { mount } from "@vitrine/sdk";
import { createSignal } from "solid-js";

function Bar() {
  const [w, setW] = createSignal(20);
  return (
    <view style={{ width: "100%", height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)" }} onClick={() => setW(w() === 20 ? 160 : 20)}>
      <view style={{ width: w(), height: 8, borderRadius: 4, background: "#60CDFF", transition: "width 0.4s ease-out" }} />
    </view>
  );
}

mount(() => <Bar />);
```

Vedi [Animazioni](/it/docs/guides/animations/).

## Stringhe CSS in linea

Uno stile stringa viene diviso su `;` e `:`; i nomi diventano camelCase e ogni valore passa come
stringa, quindi `"12px"` e `"12"` si equivalgono. Una stringa sostituisce l'intero stile
dell'elemento.

```tsx
import { mount } from "@vitrine/sdk";

mount(() => <view style="padding: 12px; border-radius: 12px; background: rgba(0,0,0,0.4)"><text>Inline CSS string</text></view>);
```

## Differenze dal CSS

- **Ogni `view` è un contenitore flex**, disposto in riga per impostazione predefinita. Non esiste un
  flusso a blocchi o in linea: per impilare i figli usa `flexDirection: "column"`.
- **I figli si restringono.** `flexShrink` vale `1` di default, come in flexbox, quindi in una riga
  affollata gli elementi a misura fissa (separatori, icone) vengono schiacciati: dagli
  `flexShrink: 0`.
- **`flex` accetta un solo numero** (`flex: 1` = grow 1, shrink 1, basis 0); la forma a più valori non
  è interpretata.
- **Niente cascata.** Niente selettori, classi, `!important` o proprietà personalizzate; le proprietà
  del testo passano a tutti i discendenti, anche quelle che nel CSS non si ereditano.
- **Le unità** sono solo DIP, `px` e `%`.
- **`border` è solo grafico** e uniforme; **`boxShadow`** ha un'unica ombra approssimata, senza
  spread né inset.
- **Le transizioni animano solo numeri, lunghezze e trasformazioni**; non esistono animazioni a keyframe.
- **`transform`** ha l'origine fissa al centro e non influisce sul layout.
- **`backdropFilter`** sfoca solo lo sfondo del desktop.
- **Niente `Intl`.** QuickJS non ha `Intl`, quindi `toLocaleString` e `Intl.DateTimeFormat` non danno
  testi localizzati. Usa [`formatDate`](/it/docs/reference/sdk/#formatdate) e
  [`localeInfo`](/it/docs/reference/sdk/#localeinfo), che leggono nomi e formati da Windows.
