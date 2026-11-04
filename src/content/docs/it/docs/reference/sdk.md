---
title: SDK
description: Tutte le funzioni, gli hook e i tipi esportati da @vitrine/sdk, con firme, comportamento ed esempi.
sidebar:
  order: 3
---

`@vitrine/sdk` è la libreria TypeScript, con relativi strumenti, per scrivere widget. Si basa su
SolidJS: gli hook restituiscono accessor di Solid (`() => T`) e dentro un widget funziona qualsiasi
primitiva di Solid (`createSignal`, `createMemo`, `createResource`, `Show`, `For`, …).

Questa pagina documenta la **v2.2.0** (`github:vitrine-org/sdk#v2.3.0`). Le API segnate **da 2.2.0**
non esistono nelle versioni precedenti.

| Import | Contenuto |
| --- | --- |
| `@vitrine/sdk` | Tutto ciò che è in questa pagina. L'import installa anche i [globali di runtime](#globali-di-runtime). |
| `@vitrine/sdk/renderer` | Il renderer universale di Solid. Lo importa il compilatore JSX, non i widget. |
| `@vitrine/sdk/vite` | `vitrinePlugins()` e `buildWidget()`, usati dalla [CLI](/it/docs/reference/cli/). |

## Riepilogo

| Export | Tipo | Scopo |
| --- | --- | --- |
| [`mount`](#mount) | funzione | Disegna il widget |
| [`useClock`](#useclock) | hook | Ora corrente, allineata al secondo o al minuto |
| [`useSettings`](#usesettings) | hook | Impostazioni dell'istanza, aggiornate dal vivo |
| [`useSize`](#usesize) | hook | Dimensione del widget in DIP, aggiornata dal vivo |
| [`useResponsive`](#useresponsive) | hook | Forma e scala per layout responsive (**dalla 2.3.0**) |
| [`useAppearance`](#useappearance) | hook | Tema chiaro/scuro e colore principale di Windows, dal vivo |
| [`useSystem`](#usesystem) | hook | Metriche di sistema |
| [`useStorage`](#usestorage) | hook | Valore salvato per istanza |
| [`useLanguage`](#uselanguage) | hook | Lingua dell'interfaccia di Vitrine (**da 2.2.0**) |
| [`prompt`](#prompt) | funzione | Chiede all'utente una riga di testo |
| [`openUrl`](#openurl) | funzione | Apre un link nel browser predefinito |
| [`formatDate`](#formatdate), [`formatTime`](#formattime), [`localeInfo`](#localeinfo) | funzioni | Date localizzate senza `Intl` |
| [`formatBytes`](#formatbytes) | funzione | `1.5 KB`, `8 GB` |
| [`localized`](#localized) | funzione | Sceglie un testo in base alla lingua (**da 2.2.0**) |
| [`widgetInfo`](#widgetinfo) | funzione | Identità dell'istanza in esecuzione |
| [`on`](#on) | funzione | Eventi del motore a basso livello |
| [Tipi](#tipi) | tipi | `Style`, `VitrineElements`, `PointerEventData`, … |

## mount

```ts
function mount(app: () => JSX.Element): void
```

Disegna il widget nel nodo radice dell'istanza e invia subito il primo gruppo di modifiche. Va
chiamata una volta, al livello più alto del file di ingresso del widget.

```tsx
import { mount } from "@vitrine/sdk";

function App() {
  return <text>Hello</text>;
}

mount(() => <App />);
```

Dopo il primo disegno, le modifiche vengono raggruppate e inviate al motore in un microtask.

## useClock

```ts
function useClock(granularity?: "second" | "minute"): Accessor<Date>
```

L'ora corrente, aggiornata subito dopo ogni cambio di secondo o di minuto. Predefinito: `"minute"`.
Con la granularità al minuto il motore si sveglia 60 volte meno spesso: usala ogni volta che i
secondi non sono visibili. Ogni chiamata ha un proprio timer, cancellato quando il componente che la
possiede viene distrutto.

```tsx
import { formatTime, useClock } from "@vitrine/sdk";

export function Time() {
  const now = useClock("minute");
  return <text style={{ fontSize: 40 }}>{formatTime(now())}</text>;
}
```

## useSettings

```ts
function useSettings<T extends Record<string, unknown>>(defaults: T): Accessor<T>
```

Le impostazioni dell'istanza, sovrapposte a `defaults`. Il motore invia i predefiniti dello
[schema delle impostazioni](/it/docs/reference/settings-schema/) con sopra i valori dell'utente,
quindi ogni chiave dello schema è presente; `defaults` copre le chiavi fuori dallo schema e
l'esecuzione fuori dal motore. L'accessor si aggiorna dal vivo quando l'utente modifica le
impostazioni nel pannello di controllo.

```tsx
import { useSettings } from "@vitrine/sdk";

export function Label() {
  const settings = useSettings({ title: "Today", accent: "#60CDFF", size: 16 });
  return <text style={{ color: settings().accent, fontSize: settings().size }}>{settings().title}</text>;
}
```

Il parametro di tipo si deduce da `defaults`; l'SDK non valida i valori a runtime (lo fa il pannello
di controllo, sullo schema). Vedi [Impostazioni](/it/docs/guides/settings/).

## useSize

```ts
function useSize(): Accessor<Size> // { width: number; height: number }
```

La dimensione del widget in DIP. Cambia quando l'utente ridimensiona l'istanza sulla griglia.

```tsx
import { useSize } from "@vitrine/sdk";

export function Big() {
  const size = useSize();
  // In proporzione al riquadro: lo stesso aspetto a ogni dimensione.
  return <text style={{ fontSize: Math.min(size().width, size().height) * 0.4 }}>42</text>;
}
```

Per i layout preferisci [`useResponsive`](#useresponsive), che dà anche la forma.

## useResponsive

**Dalla 2.3.0.**

```ts
function useResponsive(refs: References): Accessor<Responsive>
// References: [width, height] | { square?: [w, h]; wide?: [w, h]; tall?: [w, h] }
// Responsive: { width: number; height: number; shape: Shape; scale: number }
// Shape: "square" | "wide" | "tall"
```

La dimensione del widget, la sua **forma** e la **scala** di un disegno fatto a una dimensione di
riferimento. Un widget responsive sceglie il layout solo in base alla forma e moltiplica ogni misura
di quel layout (dimensioni del testo, margini, spaziature, tratti, raggi, icone) per `scale`. Un
orologio 4 × 4 è allora l'orologio 2 × 2 più grande: con la dimensione non compare e non sparisce
nulla, e i margini restano in proporzione.

- `shape` dipende dalle proporzioni del riquadro: `wide` da 1,25 : 1 (3 × 2, 4 × 2, 5 × 4 celle),
  `tall` da 1 : 1,25 (2 × 3, 4 × 5), `square` in mezzo (da 2 × 2 a 6 × 5). La galleria usa la stessa
  regola per proporre una dimensione per forma.
- `scale` adatta il riferimento della forma al riquadro senza tagli:
  `min(width / refWidth, height / refHeight)`. Una forma mancante usa il riferimento `square`.

```tsx
import { mount, useResponsive } from "@vitrine/sdk";

function Clock() {
  // Disegnato a 2 × 2 (136 × 136 DIP) e a 4 × 2 (280 × 136).
  const r = useResponsive({ square: [136, 136], wide: [280, 136] });
  const px = (v: number) => v * r().scale;
  return (
    <view style={{ width: "100%", height: "100%", padding: px(16), borderRadius: px(22) }}>
      {r().shape === "wide" ? <WorldClocks px={px} /> : <Dial px={px} />}
    </view>
  );
}
mount(() => <Clock />);
```

Le stesse regole sono esportate come funzioni: `shapeOf(width, height)`,
`fitScale(width, height, [refWidth, refHeight])` e `responsive(width, height, refs)`.

## useAppearance

```ts
function useAppearance(): Accessor<Appearance> // { dark: boolean; accent: string }
```

`dark` è vero quando la modalità app di Windows è scura; `accent` è il colore principale in formato
`#rrggbb`. Entrambi si aggiornano dal vivo. Fuori dal motore il valore è
`{ dark: true, accent: "#0078d4" }`.

```tsx
import { useAppearance } from "@vitrine/sdk";

export function Themed() {
  const look = useAppearance();
  return (
    <view style={{ padding: 12, borderRadius: 12, background: look().dark ? "rgba(32,32,32,0.6)" : "rgba(255,255,255,0.7)" }}>
      <text style={{ color: look().dark ? "#fff" : "#1b1b1b" }}>Accent</text>
      <view style={{ height: 4, borderRadius: 2, background: look().accent }} />
    </view>
  );
}
```

Vedi [Aspetto](/it/docs/guides/appearance/).

## useSystem

```ts
function useSystem(metrics: Metric[], intervalMs?: number): Accessor<SystemSnapshot>
type Metric = "system" | "cpu" | "memory" | "battery" | "drives" | "processes" | "network"
```

Si iscrive alle metriche di sistema. Intervallo predefinito 2000 ms, minimo 1000 ms. Tutte le
chiamate a `useSystem` di un widget condividono un'unica istantanea: l'iscrizione è l'unione delle
loro metriche all'intervallo più breve, e si aggiorna quando un componente chiamante viene distrutto.
Ogni consegna si fonde nell'istantanea, quindi un campo resta `undefined` fino al primo campione.

Ogni metrica richiede il [permesso](/it/docs/reference/permissions/) `system.<metrica>`
corrispondente; il motore scarta quelle senza permesso (con un avviso nel log) e campiona solo ciò che
qualche widget ha chiesto.

```tsx
import { formatBytes, useSystem } from "@vitrine/sdk";

export function Memory() {
  const sys = useSystem(["cpu", "memory"], 2000);
  return (
    <text>
      CPU {Math.round(sys().cpu?.usage ?? 0)}% · RAM {formatBytes(sys().memory?.used ?? 0)}
    </text>
  );
}
```

| Chiave | Campi |
| --- | --- |
| `cpu` | `usage` (percentuale, un decimale), `cores` |
| `memory` | `total`, `available`, `used` (byte), `load` (percentuale) |
| `battery` | `hasBattery`, `charging`, `level` (percentuale), `remainingSeconds`, `powerSource` (`"ac"`, `"battery"`), `saver` |
| `drives` | array di `{ name, label, total, free, used }` (byte; `name` è `"C:"`) |
| `processes` | array di `{ name, pid, memory }`, i 10 processi con più working set (byte) |
| `network` | `rxPerSec`, `txPerSec` (byte al secondo) |
| `system` | `hostname`, `os`, `uptime` |

:::caution
- L'uso della CPU e le velocità di rete sono differenze tra due campioni: i primi valori possono
  essere `0`.
- A runtime `battery.level` e `remainingSeconds` possono valere `null`, e `powerSource` può valere
  `"unknown"`, anche se i tipi non lo dicono.
- La metrica `system` è tipizzata, ma il motore 2.0 non accetta alcun permesso `system.system`, quindi
  l'iscrizione viene sempre scartata.
:::

Vedi [Metriche di sistema](/it/docs/guides/system-metrics/).

## useStorage

```ts
function useStorage<T>(key: string, initial: T): [Accessor<T>, (value: T) => void]
```

Un valore salvato per questa istanza. Sopravvive ai riavvii e agli aggiornamenti del pack, e viene
eliminato insieme all'istanza. I valori devono essere serializzabili in JSON. Il setter accetta un
valore, non una funzione di aggiornamento; ogni chiamata riscrive il file di storage dell'istanza. Due
chiamate a `useStorage` con la stessa chiave non condividono il segnale: usane una per chiave.

```tsx
import { useStorage } from "@vitrine/sdk";

export function Tally() {
  const [count, setCount] = useStorage("count", 0);
  return <text onClick={() => setCount(count() + 1)}>{count()}</text>;
}
```

Il motore salva i valori in `%APPDATA%\Vitrine\storage\<id istanza>.json`. Vedi
[Storage](/it/docs/guides/storage/).

## useLanguage

:::note[Da SDK 2.2.0]
Sui motori che non comunicano la lingua dell'interfaccia restituisce `"en"`.
:::

```ts
function useLanguage(): string
```

La lingua dell'interfaccia di Vitrine: `"en"`, `"it"`, `"fr"`, `"de"`, `"es"`, `"pt-BR"`, `"zh"`
(cinese semplificato), `"ru"`, `"ja"` o `"ko"`, scelta nel pannello di controllo o ereditata da
Windows. Quando cambia i widget vengono riavviati, quindi è un valore semplice e non un accessor.

```tsx
import { localized, useLanguage, widgetInfo } from "@vitrine/sdk";

const t = {
  today: { en: "Today", it: "Oggi", "pt-BR": "Hoje", zh: "今天" },
};

export function Heading() {
  const lang = useLanguage(); // "en", "it", "pt-BR", "zh", …
  return <text>{localized(t.today)} ({lang})</text>;
}

widgetInfo().language; // same value as useLanguage()
```

Vedi [Localizzazione](/it/docs/guides/localisation/).

## prompt

```ts
function prompt(options?: PromptOptions): Promise<string | null>
interface PromptOptions { title?: string; placeholder?: string; value?: string }
```

I widget non ricevono mai il focus della tastiera. `prompt()` apre una piccola finestra di testo
accanto al widget e si risolve con il testo inserito, oppure con `null` se l'utente annulla, se il
motore non supporta i prompt o durante `vitrine render`. Chiamala da un gestore del puntatore.

Il motore rimuove i caratteri di controllo e tronca `title` a 80 caratteri, `placeholder` a 120 e
`value` a 2000.

```tsx
import { prompt, useStorage } from "@vitrine/sdk";

export function Note() {
  const [note, setNote] = useStorage("note", "");
  const edit = async () => {
    const text = await prompt({ title: "Note", placeholder: "Write something", value: note() });
    if (text !== null) setNote(text);
  };
  return <text onClick={edit}>{note() || "Click to write"}</text>;
}
```

Vedi [Inserimento di testo](/it/docs/guides/text-input/).

## openUrl

```ts
function openUrl(url: string): void
```

Apre un URL `http://` o `https://` nel browser predefinito; gli altri schemi vengono ignorati. Non
richiede permessi. L'SDK la prevede in risposta a un'interazione (un clic); il motore 2.0 non lo
impone, quindi non aprire pagine senza che l'utente lo chieda.

```tsx
import { openUrl } from "@vitrine/sdk";

export function Link() {
  return <text onClick={() => openUrl("https://open-meteo.com/")}>Weather data by Open-Meteo</text>;
}
```

## formatDate

```ts
function formatDate(date: Date | number, pattern: string, locale?: string): string
```

Formatta una data con questi token; il testo tra `[parentesi quadre]` viene copiato così com'è.

| Token | Risultato | Token | Risultato |
| --- | --- | --- | --- |
| `YYYY` | `2026` | `HH` / `H` | ore 00–23 / 0–23 |
| `YY` | `26` | `hh` / `h` | ore 01–12 / 1–12 |
| `MMMM` / `MMM` | nome del mese, intero / breve | `mm` / `m` | minuti, con zero / senza |
| `MM` / `M` | mese 01–12 / 1–12 | `ss` / `s` | secondi, con zero / senza |
| `DD` / `D` | giorno 01–31 / 1–31 | `A` | indicatore AM/PM |
| `dddd` / `ddd` | giorno della settimana, intero / breve | | |

Nomi e indicatori vengono da Windows per `locale` (un nome di impostazioni locali di Windows come
`"it-IT"`) oppure, se omesso, per quelle dell'utente.

```ts
import { formatDate, formatTime, localeInfo } from "@vitrine/sdk";

const now = new Date();
formatDate(now, "dddd, D MMMM YYYY"); // "Wednesday, 4 November 2026"
formatDate(now, "[Week of] D MMM"); // text in brackets is literal
formatTime(now); // "14:05" or "2:05 PM", from the Windows 12/24-hour setting
formatDate(now, "dddd D MMMM", "it-IT"); // names from a specific Windows locale

const info = localeInfo();
const firstDay = info.firstDayOfWeek; // 0 = Sunday, 1 = Monday, …
const weekdays = info.daysShort; // Sunday first, like Date#getDay()
export { firstDay, weekdays };
```

## formatTime

```ts
function formatTime(date: Date | number, locale?: string): string
```

`HH:mm` oppure `h:mm A`, secondo la preferenza 12/24 ore delle impostazioni locali.

## localeInfo

```ts
function localeInfo(locale?: string): LocaleInfo
```

Dati locali letti da Windows, in cache per ogni locale. Se Windows non restituisce nulla, usa i
valori di `en-US`.

| Campo | Tipo | Note |
| --- | --- | --- |
| `locale` | `string` | Nome locale di Windows, ad esempio `"it-IT"` |
| `days`, `daysShort` | `string[]` | Domenica per prima, come `Date#getDay()` |
| `months`, `monthsShort` | `string[]` | Gennaio per primo |
| `am`, `pm` | `string` | Indicatori |
| `hour12` | `boolean` | Il formato orario della locale non usa le 24 ore (`H`) |
| `shortDate` | `string` | Formato data breve di Windows, ad esempio `"dd/MM/yyyy"` |
| `firstDayOfWeek` | `number` | `0` = domenica |

## formatBytes

```ts
function formatBytes(bytes: number, digits?: number): string
```

Formatta una quantità di byte con unità in base 1024: `B`, `KB`, `MB`, `GB`, `TB`. `digits` vale 1
di default; i byte non hanno mai decimali.

```ts
import { formatBytes } from "@vitrine/sdk";

formatBytes(512); // "512 B"
formatBytes(1536); // "1.5 KB"
formatBytes(8_589_934_592, 0); // "8 GB"
```

## localized

Da SDK 2.2.0.

```ts
function localized<T>(texts: Record<string, T>, language?: string): T
```

Sceglie la voce di `texts` per `language` (predefinito: [`useLanguage()`](#uselanguage)): lo stesso
tag, poi la stessa lingua di base (`pt` per `pt-BR`, `zh-CN` per `zh`; cinese semplificato e
tradizionale non si mescolano mai), poi `en`, poi la prima voce. I tag si confrontano senza badare a
maiuscole e minuscole, e `_` vale come `-`. Vedi l'esempio di [`useLanguage`](#uselanguage).

## widgetInfo

```ts
function widgetInfo(): WidgetInfo
interface WidgetInfo { instanceId: string; widgetId: string; packageId: string; engineVersion: string }
```

Identità dell'istanza in esecuzione. Fuori dal motore tutti i campi sono stringhe vuote (`language`:
`"en"`). Da 2.2.0 `WidgetInfo` ha anche `language`, lo stesso valore di
[`useLanguage()`](#uselanguage).

```ts
import { on, widgetInfo } from "@vitrine/sdk";

const { instanceId, widgetId, packageId, engineVersion } = widgetInfo();
console.log(`${packageId}/${widgetId} (${instanceId}) on Vitrine ${engineVersion}`);

const off = on("resize", (size: { width: number; height: number }) => {
  console.log("resized to", size.width, size.height);
});
off();
```

## on

```ts
function on(type: string, fn: (data: any) => void): () => void
```

Si iscrive a un evento grezzo del motore e restituisce la funzione per annullare l'iscrizione. Gli
hook descritti sopra sono costruiti su di essa: preferisci quelli. Un gestore che lancia un'eccezione
viene registrato nel log e non blocca gli altri.

| Evento | Contenuto |
| --- | --- |
| `settings` | Oggetto delle impostazioni |
| `resize` | `{ width, height }` |
| `appearance` | `{ dark, accent }` |
| `system` | `SystemSnapshot` parziale |
| `pointer` | `{ type, target, x, y, deltaY, button }` |
| `timer`, `fetch`, `prompt` | Interni all'implementazione di timer, `fetch` e `prompt()` |

## Globali di runtime

I widget girano in QuickJS, non in un browser. L'import dell'SDK installa:

| Globale | Comportamento |
| --- | --- |
| `setTimeout`, `setInterval`, `clearTimeout`, `clearInterval` | Timer del motore. In pausa quando il desktop non è visibile (sessione bloccata, schermo spento, app a schermo intero, pausa manuale). |
| `queueMicrotask` | Installato se manca. |
| `console.log`, `info`, `debug`, `warn`, `error` | Scritti nel log di Vitrine; nel terminale con `vitrine --dev`. Gli oggetti vengono convertiti in JSON. |
| `fetch(url, { method, headers, body })` | HTTP(S) verso gli host consentiti dai [permessi](/it/docs/reference/permissions/) `net:`. |

```ts
const id = setInterval(() => console.log("tick"), 5000);
setTimeout(() => clearInterval(id), 60_000);
queueMicrotask(() => console.warn("runs after the current job"));
```

`fetch` restituisce `{ ok, status, statusText, url, headers: { get, has }, text(), json() }`. `body`
deve essere una stringa. Viene rifiutata con un `TypeError` se l'host non è consentito o la richiesta
fallisce; gli stati HTTP di errore si risolvono normalmente (`ok: false`). `url` vale sempre `""`. Non
esistono `Request`, `AbortController`, streaming né corpi binari.

```tsx
import { useSettings } from "@vitrine/sdk";
import { createResource } from "solid-js";

interface Forecast {
  current: { temperature_2m: number };
}

async function load(city: { lat: number; lon: number }): Promise<Forecast> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function Temperature() {
  const settings = useSettings({ lat: 45.46, lon: 9.19 });
  const [data] = createResource(() => ({ lat: settings().lat, lon: settings().lon }), load);
  return <text>{data() ? `${Math.round(data()!.current.temperature_2m)}°` : "…"}</text>;
}
```

Timeout e limiti di dimensione sono elencati in [Limiti](/it/docs/reference/limits/). Non esistono
DOM, `localStorage`, `Intl`, `XMLHttpRequest`, `WebSocket` né `Worker`.

## Tipi

| Tipo | Definizione |
| --- | --- |
| `Style` | L'oggetto di stile; vedi [Stili](/it/docs/reference/styles/). |
| `VitrineElements` | Le prop di ogni elemento intrinseco; vedi [Elementi](/it/docs/reference/elements/). |
| `PointerHandlers` | `onClick`, `onPointerDown`, `onPointerUp`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onWheel` |
| `PointerEventData` | `{ type, x, y, deltaY?, button?, target, stopPropagation() }` |
| `Metric` | `"system" \| "cpu" \| "memory" \| "battery" \| "drives" \| "processes" \| "network"` |
| `SystemSnapshot` | `{ system?, cpu?, memory?, battery?, drives?, processes?, network? }` |
| `Size` | `{ width: number; height: number }` |
| `Appearance` | `{ dark: boolean; accent: string }` |
| `PromptOptions` | `{ title?: string; placeholder?: string; value?: string }` |
| `LocaleInfo` | Vedi [`localeInfo`](#localeinfo). |
| `WidgetInfo` | Vedi [`widgetInfo`](#widgetinfo). |

:::caution[Controllo dei tipi]
Con il `tsconfig.json` del template (`jsxImportSource: "solid-js"`), `tsc` segnala errori sugli
elementi intrinseci che Solid tipizza già come elementi DOM o SVG (`view`, `text`, `span`, `image`,
`svg`, …): l'estensione `VitrineElements` dell'SDK non li sovrascrive. La build (`vitrine-widget
build`, tramite Vite e Babel) non controlla i tipi e non ne risente. Gli esempi di questo sito sono
verificati direttamente su `VitrineElements`.
:::
