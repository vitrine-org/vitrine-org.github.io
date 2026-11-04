---
title: Fonts and assets
description: Use Windows fonts, bundle your own, and ship images and vector icons inside a pack.
sidebar:
  order: 11
---

## System fonts

`fontFamily` takes a family name installed in Windows. Text defaults to **Segoe UI Variable Text**,
14 DIPs, white. The Windows 11 type ramp uses three optical sizes:

| Family | For |
|---|---|
| `Segoe UI Variable Display` | Large numbers and headings |
| `Segoe UI Variable Text` | Body text |
| `Segoe UI Variable Small` | Captions and small labels |

Only the first name of a list is used (`"Inter, sans-serif"` means `Inter`): there is no CSS
fallback chain. Segoe UI Variable ships with Windows 11; Windows 10 substitutes another font, so check
a widget there or bundle the font you depend on.

## Bundled fonts

List font files in the pack manifest:

```json
{
  "id": "dev.you.posters",
  "fonts": ["assets/fonts/BebasNeue-Regular.ttf", "assets/fonts/Montserrat-Regular.ttf"],
  "widgets": [ … ]
}
```

Every widget of the pack can then use them by family name, the name stored in the font file, case
insensitive:

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

- TTF and OTF files work. Ship one file per weight and style you use: a `fontWeight: 700` with only
  the regular file gets a synthesised bold, not the real one.
- Fonts are loaded with each widget, from memory, and never installed in Windows.
- Respect the font's licence; open licences such as the SIL OFL ask you to include the licence text,
  for example in the pack's `LICENSE`.

## Images

`<image src={…} objectFit="contain" | "cover" | "fill" />` draws a bitmap. Give it a `width` and
`height`; images are decoded by Windows (WIC), so PNG and JPEG are safe choices.

Import images from code. The SDK build inlines them into the widget bundle as `data:` URIs, so they
travel inside the pack with nothing else to declare. TypeScript needs to know what an image import is;
add a declaration file to `src/`:

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
`vitrine-widget build` copies into the pack only the files the manifest references (entries,
settings, previews, fonts) plus `README.md`, `LICENSE` and `icon.png`. A path such as
`src="assets/photo.png"` would point at a file that isn't in the pack; import the image instead.
:::

Inlined images grow the bundle, which Vitrine parses every time the widget starts. Resize images to
the largest size you draw at (×2 for high-DPI screens) and compress them.

## Vector icons

For icons, use SVG elements rather than images: they are sharp at any scale, take colours from the
palette and cost a few bytes.

```tsx
<svg width={18} height={18} viewBox="0 0 18 18">
  <path d="M 9 4 L 9 14 M 4 9 L 14 9" stroke="#60CDFF" strokeWidth={1.6} strokeLinecap="round" />
</svg>
```

`svg` takes `viewBox`, `width` and `height`; inside it, `g`, `circle`, `ellipse`, `rect`, `line` and
`path` take `fill`, `stroke`, `strokeWidth`, `strokeDasharray`, `strokeLinecap`, `opacity` and
`transform`. SVG files are not supported as `image` sources: paste the path data into a component.
The [elements reference](/docs/reference/elements/) lists every attribute.

Pack size and file limits are in [Limits](/docs/reference/limits/).
