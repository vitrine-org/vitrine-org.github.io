---
title: Aspetto
description: Segui il tema chiaro o scuro e il colore principale di Windows con useAppearance, e costruisci una palette che l'utente può personalizzare.
sidebar:
  order: 7
---

I widget stanno sul desktop dell'utente, accanto alle superfici di Windows. Seguire tema e colore
principale del sistema li fa sentire a casa.

## useAppearance

```ts
const look = useAppearance(); // () => { dark: boolean; accent: string }
```

- `dark` è la **modalità delle app** di Windows (Impostazioni → Personalizzazione → Colori → *Scegli
  la modalità predefinita per le app*), lo stesso interruttore che seguono le applicazioni.
- `accent` è il colore principale scelto dall'utente, nel formato `#rrggbb`.

Entrambi si aggiornano dal vivo, senza riavviare il widget, quando l'utente li cambia.

## Una palette personalizzabile

Seguire Windows è la scelta predefinita giusta, ma un widget su uno sfondo chiaro può aver bisogno di
testo scuro anche in modalità scura. Lo schema usato dal pack Essentials: un'impostazione `theme`
(`auto`, `light`, `dark`) e una `accent` (`system` o un colore esadecimale, vedi
[Impostazioni](/it/docs/guides/settings/#schemi-ricorrenti)), risolte in una palette in un unico punto.

```ts
import { useAppearance } from "@vitrine/sdk";

export interface Palette {
  dark: boolean;
  surface: string;
  border: string;
  text: string;
  text2: string;
  accent: string;
  onAccent: string;
}

/** Mixes a #rrggbb colour toward white (t > 0) or black (t < 0). */
function mix(hex: string, t: number): string {
  const to = t > 0 ? 255 : 0;
  const a = Math.abs(t);
  const ch = (i: number) => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - a) + to * a);
  return "#" + [1, 3, 5].map((i) => ch(i).toString(16).padStart(2, "0")).join("");
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Tokens for the widget. `theme` is "auto" | "light" | "dark", `accent` is "system" or #rrggbb.
 * Like Fluent, the Windows accent is lightened on dark surfaces and darkened on light ones.
 */
export function usePalette(settings: () => { theme: string; accent: string }): () => Palette {
  const system = useAppearance();
  return () => {
    const { theme, accent } = settings();
    const dark = theme === "auto" ? system().dark : theme === "dark";
    const custom = /^#[0-9a-fA-F]{6}$/.test(accent);
    const acc = custom ? accent : mix(system().accent, dark ? 0.45 : -0.2);
    return {
      dark,
      surface: dark ? "rgba(32, 32, 32, 0.55)" : "rgba(255, 255, 255, 0.62)",
      border: dark ? "rgba(255, 255, 255, 0.10)" : "rgba(255, 255, 255, 0.70)",
      text: dark ? "#F4F4F4" : "#141414",
      text2: dark ? "rgba(255, 255, 255, 0.72)" : "rgba(20, 20, 20, 0.70)",
      accent: acc,
      onAccent: luminance(acc) > 0.35 ? "#000000" : "#FFFFFF",
    };
  };
}
```

E in un componente:

```tsx
import { mount, useSettings } from "@vitrine/sdk";
import { usePalette } from "./palette";

function Badge() {
  const s = useSettings({ theme: "auto", accent: "system" });
  const p = usePalette(s);
  return (
    <view style={{ width: "100%", height: "100%", padding: 16, gap: 10, alignItems: "center", borderRadius: 12, background: p().surface, border: `1px solid ${p().border}` }}>
      <view style={{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", background: p().accent }}>
        <text style={{ fontSize: 14, fontWeight: 700, color: p().onAccent }}>V</text>
      </view>
      <view style={{ flexDirection: "column" }}>
        <text style={{ fontSize: 14, fontWeight: 600, color: p().text }}>Vitrine</text>
        <text style={{ fontSize: 12, color: p().text2 }}>{p().dark ? "Dark theme" : "Light theme"}</text>
      </view>
    </view>
  );
}

mount(() => <Badge />);
```

Perché è fatta così:

- **Un'unica fonte per i colori.** I componenti leggono token (`text`, `text2`, `accent`), mai valori
  esadecimali diretti: chiaro e scuro non possono divergere e un cambio di tema ridipinge tutto
  insieme.
- **Contrasto del colore principale.** Il colore principale di Windows è un tono intermedio. Come
  Fluent, la palette lo schiarisce sulle superfici scure e lo scurisce su quelle chiare, perché anelli
  e link restino leggibili.
- **Testo sul colore principale.** `onAccent` sceglie nero o bianco in base alla luminanza del colore;
  non dare mai per scontato il bianco.
- **Superfici traslucide.** Le superfici sono semitrasparenti perché si intraveda lo sfondo; per un
  vero vetro smerigliato aggiungi `backdropFilter`, vedi
  [Vetro e leggibilità](/it/docs/guides/glass-and-legibility/).

:::tip
Il colore predefinito del testo è il bianco. Un widget che non imposta mai `color` diventa illeggibile
su uno sfondo chiaro con il tema chiaro: impostalo sulla radice, dalla palette.
:::

Per scelte di colore e tipografia in linea con Windows 11, vedi le
[linee guida di design](/it/docs/design/guidelines/).
