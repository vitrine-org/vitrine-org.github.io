---
title: Appearance
description: Follow Windows light and dark mode and the accent colour with useAppearance, and build a palette users can override.
sidebar:
  order: 7
---

Widgets sit on the user's desktop, next to Windows' own surfaces. Following the system theme and
accent makes them belong there.

## useAppearance

```ts
const look = useAppearance(); // () => { dark: boolean; accent: string }
```

- `dark` is Windows' **app mode** (Settings → Personalization → Colors → *Choose your default app
  mode*), the same switch apps follow.
- `accent` is the user's accent colour as `#rrggbb`.

Both update live, without restarting the widget, when the user changes them.

## A palette with overrides

Following Windows is the right default, but a widget on a bright wallpaper may need dark text in dark
mode. The pattern used by the Essentials pack: a `theme` setting (`auto`, `light`, `dark`) and an
`accent` setting (`system` or a hex colour, see [Settings](/docs/guides/settings/#patterns)), resolved
into a palette in one place.

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

Use it in a component:

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

Why it is shaped like this:

- **One source of colour.** Components read tokens (`text`, `text2`, `accent`), never raw hex
  values, so light and dark can't drift apart and a theme switch repaints everything at once.
- **Accent contrast.** The Windows accent is a mid tone. Like Fluent, the palette lightens it on dark
  surfaces and darkens it on light ones, so rings and links stay readable.
- **Text on accent.** `onAccent` picks black or white from the accent's luminance; never assume
  white.
- **Translucent surfaces.** Surfaces are semi-transparent so the wallpaper shows through; for real
  frosted glass add `backdropFilter`, see [Glass and legibility](/docs/guides/glass-and-legibility/).

:::tip
The default text colour is white. A widget that never sets `color` is unreadable on a light
wallpaper with a light theme: set it on the root, from the palette.
:::

For colour and type choices that match Windows 11, see the [design guidelines](/docs/design/guidelines/).
