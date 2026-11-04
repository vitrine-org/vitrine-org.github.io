---
title: Styles
description: Every style property the Vitrine renderer understands, with values, defaults, inheritance and differences from CSS.
sidebar:
  order: 2
---

Styles are camelCase and CSS-like. Pass an object (`style={{ fontSize: 14 }}`, typed as `Style`) or
an inline CSS string (`style="font-size: 14px"`). There are no selectors, classes or cascade: each
element carries its own style, and only text properties are inherited.

An unparsable value is ignored and the property keeps its default.

## Value types

| Type | Accepted forms |
| --- | --- |
| Length | A number (DIPs), `"12px"`, `"50%"`, `"auto"`. No `em`, `rem`, `vw` or `calc()` (except where noted for `letterSpacing` and `lineHeight`). |
| Colour | `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`; `rgb()` / `rgba()` with commas or spaces, optional `/ alpha`, channels as 0–255 or `%`; `hsl()` / `hsla()`; `transparent`; `currentColor`; named colours: `black`, `white`, `red`, `green`, `lime`, `blue`, `yellow`, `orange`, `purple`, `gray`/`grey`, `silver`, `cyan`/`aqua`, `magenta`/`fuchsia`, `pink`, `navy`, `teal`, `maroon`, `olive`. |
| Duration | `"0.4s"`, `"200ms"`. |

Box shorthands (`margin`, `padding`, `borderRadius`) take a number or a string of 1 to 4 values,
`"8 16"` → top/bottom 8, left/right 16, in CSS order.

## Layout

| Property | Values | Default | Inherited |
| --- | --- | --- | --- |
| `display` | `"flex"`, `"grid"`, `"none"` | `"flex"` | no |
| `position` | `"relative"`, `"absolute"` | `"relative"` | no |
| `top`, `right`, `bottom`, `left` | Length | `auto` | no |
| `inset` | Length (all four sides; a side property wins) | `auto` | no |
| `width`, `height` | Length | `auto` | no |
| `minWidth`, `minHeight`, `maxWidth`, `maxHeight` | Length | `auto` | no |
| `aspectRatio` | number (width ÷ height) | none | no |
| `overflow` | `"visible"`, `"hidden"` | `"visible"` | no |

`overflow: "hidden"` clips painting and hit testing to the box, rounded corners included. The engine
also accepts `display: "block"`, which the SDK does not type.

## Spacing

| Property | Values | Default | Inherited |
| --- | --- | --- | --- |
| `margin` | Length, 1–4 values | `0` | no |
| `marginTop`, `marginRight`, `marginBottom`, `marginLeft` | Length | `0` | no |
| `marginHorizontal`, `marginVertical` | Length (left + right, top + bottom) | `0` | no |
| `padding` | Length (no `auto`), 1–4 values | `0` | no |
| `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft` | Length | `0` | no |
| `paddingHorizontal`, `paddingVertical` | Length | `0` | no |
| `gap` | Length | `0` | no |
| `rowGap`, `columnGap` | Length (wins over `gap`) | `0` | no |

Precedence: a side property (`marginTop`) wins over the shorthand; `marginHorizontal` and
`marginVertical` fill only sides not set otherwise. An explicit `"auto"` margin works as in flexbox.

## Flexbox

| Property | Values | Default | Inherited |
| --- | --- | --- | --- |
| `flexDirection` | `"row"`, `"column"`, `"row-reverse"`, `"column-reverse"` | `"row"` | no |
| `flexWrap` | `"nowrap"`, `"wrap"`, `"wrap-reverse"` | `"nowrap"` | no |
| `flex` | number `n` → grow `n`, shrink 1, basis 0 | none | no |
| `flexGrow` | number | `0` | no |
| `flexShrink` | number | `1` | no |
| `flexBasis` | Length | `auto` | no |
| `alignItems` | `"flex-start"`/`"start"`, `"flex-end"`/`"end"`, `"center"`, `"baseline"`, `"stretch"` | `"stretch"` | no |
| `alignSelf` | as `alignItems` | parent's `alignItems` | no |
| `justifyContent` | `"flex-start"`/`"start"`, `"flex-end"`/`"end"`, `"center"`, `"space-between"`, `"space-around"`, `"space-evenly"` | `"flex-start"` | no |
| `alignContent` | as `justifyContent`, plus `"stretch"` | `"stretch"` | no |

`flexGrow`, `flexShrink` and `flexBasis` override the values set by `flex`.

## Grid

| Property | Values | Default | Inherited |
| --- | --- | --- | --- |
| `gridTemplateColumns`, `gridTemplateRows` | A number `N` (N equal `1fr` tracks) or a track list | none | no |
| `gridColumn`, `gridRow` | `2`, `"2"`, `"1 / 3"`, `"span 2"`, `"2 / span 2"` | `auto` | no |

Track lists accept numbers or `px`, `%`, `fr`, `auto`, `minmax(min, max)` (min: `auto` or px; max:
`auto`, px or `fr`) and `repeat(n, tracks)`. Named lines, `auto-fill`/`auto-fit` and template areas are
not supported. The engine also reads `justifyItems` and `justifySelf` (same values as `alignItems`),
which the SDK does not type.

## Box painting

| Property | Values | Default | Inherited |
| --- | --- | --- | --- |
| `background` | Colour, `linear-gradient(…)`, `radial-gradient(…)` | none | no |
| `backgroundColor` | as `background` (used when `background` is absent) | none | no |
| `border` | `"1px solid <colour>"`: a width and a colour; the style keyword is ignored | none | no |
| `borderWidth` | number | `0` | no |
| `borderColor` | Colour | `currentColor` when a width is set | no |
| `borderRadius` | number or `"tl tr br bl"` (1–4 values, px) | `0` | no |
| `borderTopLeftRadius`, `borderTopRightRadius`, `borderBottomRightRadius`, `borderBottomLeftRadius` | number | `0` | no |
| `boxShadow` | `"dx dy blur colour"` | none | no |
| `backdropFilter` | `"blur(16px)"`, `"saturate(1.6)"`, both, or `"none"` | none | no |
| `opacity` | number, clamped to 0–1 | `1` | no (applies to the subtree) |
| `transform` | `translate(x, y)`, `translateX()`, `translateY()`, `scale(s)`, `scale(sx, sy)`, `scaleX()`, `scaleY()`, `rotate(deg)`, `matrix(a, b, c, d, e, f)` | none | no (applies to the subtree) |

Notes:

- **Gradients.** `linear-gradient` takes an optional first argument, an angle in `deg` (0 points up,
  90 right) or `to top|right|bottom|left` and the four corners; the default is `180deg` (to bottom).
  Stops are `colour [position%]`; stops without a position are spread evenly. `radial-gradient`
  takes stops only: an optional leading `circle` or `ellipse` is skipped, size and position are not
  supported.
- **Borders.** The border is drawn inside the box edge, above the content. `borderWidth` also
  reserves layout space (like CSS); the `border` shorthand only paints, it does not change layout.
  Borders are uniform: there are no per-side widths or colours.
- **Radii** are in DIPs; percentages are not supported.
- **`boxShadow`** uses the first shadow of a list. `dx` and `dy` are required, `blur` is optional;
  a fourth length (spread) and the `inset` keyword are ignored. The default colour is
  `rgba(0,0,0,0.35)`. The blur is approximated with stacked translucent rounded rectangles, not a
  true Gaussian. For text, `textShadow` uses a real Gaussian blur.
- **`opacity`** is group opacity: the box and its descendants are composited together.
- **`transform`** is applied around the box centre (there is no `transformOrigin`), after layout, and
  carries over to descendants. Only `px` and `deg` units are understood; `%`, `rad` and `turn` are not.
  Functions compose as in CSS (the rightmost applies first).
- **Paint order** is tree order; there is no `zIndex`.

### backdropFilter

Frosted glass. The desktop wallpaper behind the box is blurred and saturated, clipped to the box's
`borderRadius`, and drawn under the box's own `background`; keep that background translucent.

- `blur(r)`: Gaussian blur, `r` in DIPs (as in CSS `backdrop-filter`).
- `saturate(f)`: factor (`1.6`) or percentage (`160%`); `1` leaves colours unchanged.
- Functions can appear in any order; repeated functions compose as in CSS; other filter functions are
  ignored; a malformed value or one that changes nothing disables the effect.
- Only the wallpaper shows through, never other widgets or windows. In
  [`vitrine render`](/docs/reference/cli/#vitrine-render) the backdrop is a soft gradient, or the image
  given with `--backdrop`.

See [Glass and legibility](/docs/guides/glass-and-legibility/).

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

## Text

All text properties are inherited by every descendant, `textAlign`, `whiteSpace`, `textOverflow` and
`textDecoration` included. Which of them can vary inside one paragraph is listed under
[Elements](/docs/reference/elements/#text-span-br).

| Property | Values | Default | Inherited |
| --- | --- | --- | --- |
| `color` | Colour | `#ffffff` | yes |
| `fontFamily` | Family name; in a list only the first family is used, quotes are stripped | `"Segoe UI Variable Text"` | yes |
| `fontSize` | number (DIPs) or `"14px"` | `14` | yes |
| `fontWeight` | `100`–`900`, `"normal"` (400), `"bold"` (700) | `400` | yes |
| `fontStyle` | `"normal"`, `"italic"` | `"normal"` | yes |
| `letterSpacing` | number (DIPs) or `"0.05em"` | `0` | yes |
| `lineHeight` | number ≤ 4: multiple of `fontSize`; number > 4: DIPs; `"20px"`; `"1.5rem"` (× 16); `"1.4"` | font's natural | yes |
| `textAlign` | `"left"`/`"start"`, `"center"`, `"right"`/`"end"`, `"justify"` | `"start"` | yes |
| `textTransform` | `"none"`, `"uppercase"`, `"lowercase"`, `"capitalize"` | `"none"` | yes |
| `whiteSpace` | `"normal"`, `"nowrap"` | `"normal"` | yes |
| `textOverflow` | `"clip"`, `"ellipsis"` | `"clip"` | yes |
| `textShadow` | `"dx dy blur colour"`, `"none"` | none | yes |
| `textDecoration`, `textDecorationLine` | `"none"`, `"underline"`, `"line-through"`, `"underline line-through"` | `"none"` | yes |

Notes:

- `fontFamily` resolves against installed Windows fonts and the fonts declared in the pack's
  [`fonts`](/docs/reference/manifest/#package-fields). See [Fonts and assets](/docs/guides/fonts-and-assets/).
- The engine also accepts `fontWeight: "lighter"` (300) and `"bolder"` (800) as fixed weights, not
  relative to the parent; `fontStyle: "oblique"` renders as italic; `whiteSpace: "pre"` behaves like
  `"nowrap"`.
- `lineHeight` is inherited as an absolute value and rescaled when a descendant changes `fontSize`
  without setting its own `lineHeight`.
- `textOverflow: "ellipsis"` trims at character granularity when the text does not fit its box.
- `textShadow` is drawn with a real Gaussian blur; `currentColor` refers to the text colour.

:::note[Since SDK 2.2.0]
`textDecoration` and `textDecorationLine` are typed since SDK 2.2.0. With 2.1.0 the typed object
rejects them; an inline string style (`style="text-decoration: underline"`) is accepted.
:::

## Transitions

| Property | Values | Default | Inherited |
| --- | --- | --- | --- |
| `transition` | `"<property> <duration> [easing] [delay]"`, comma-separated | none | no |

- `<property>` is a style key in camelCase or kebab-case (`width`, `stroke-dasharray`) or `all`.
- The first duration is the length, the second the delay.
- Easing: `linear`, `ease` (default), `ease-in`, `ease-out`, `ease-in-out`, `cubic-bezier(x1, y1, x2, y2)`.
- **Only numeric values animate**: numbers, `px` lengths and number lists (such as
  `strokeDasharray`). Colours, percentages, gradients and `transform` strings change instantly.
- A transition starts when a new style object is applied that contains both `transition` and a
  changed value. The value must already be numeric before the change: a property that appears for
  the first time does not animate.
- Shape attributes animate too, when the shape's `style` (or a `transition` attribute) names them.

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

See [Animations](/docs/guides/animations/).

## Inline CSS strings

A string style is split on `;` and `:`; names are converted to camelCase and every value is passed
as a string, so `"12px"` and `"12"` are equivalent. A string replaces the whole style of the element.

```tsx
import { mount } from "@vitrine/sdk";

mount(() => <view style="padding: 12px; border-radius: 12px; background: rgba(0,0,0,0.4)"><text>Inline CSS string</text></view>);
```

## Differences from CSS

- **Every `view` is a flex container**, laid out in a row by default. There is no block or inline
  flow: stack children with `flexDirection: "column"`.
- **Children shrink.** `flexShrink` defaults to `1`, as in CSS flexbox, so fixed-size decorations
  (dividers, icons) in a crowded row get squeezed: give them `flexShrink: 0`.
- **`flex` takes a single number** (`flex: 1` = grow 1, shrink 1, basis 0); the multi-value form is
  not parsed.
- **No cascade.** No selectors, classes, `!important` or custom properties; text properties inherit
  to all descendants, including those that do not inherit in CSS.
- **Units** are DIPs, `px` and `%` only.
- **`border` is paint-only** and uniform; **`boxShadow`** has one approximate shadow, no spread or inset.
- **Transitions animate numeric values only**; there are no keyframe animations.
- **`transform`** has a fixed centre origin and does not affect layout.
- **`backdropFilter`** blurs the wallpaper only.
- **No `Intl`.** QuickJS has no `Intl`, so `toLocaleString` and `Intl.DateTimeFormat` are not
  available for locale-aware text. Use [`formatDate`](/docs/reference/sdk/#formatdate) and
  [`localeInfo`](/docs/reference/sdk/#localeinfo), which read names and formats from Windows.
