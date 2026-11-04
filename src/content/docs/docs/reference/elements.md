---
title: Elements
description: The intrinsic elements a Vitrine widget can render, their props and attributes.
sidebar:
  order: 1
---

A widget's UI is a tree of intrinsic elements written in TSX. There is no DOM: the engine keeps its
own node tree, lays it out with Taffy and paints it with Direct2D. Element names and props below are
the ones typed by `@vitrine/sdk` 2.2.0 (`VitrineElements`).

| Element | Role | Laid out | Children |
| --- | --- | --- | --- |
| `view` | Box: flex or grid container | yes | any element, bare text |
| `text` | Paragraph of styled text | yes | text, `span`, `br`, nested `text` |
| `span` | Same node type as `text`; use it for inline runs | yes, when not inside a `text` | as `text` |
| `br` | Line break inside a `text` | no | none |
| `image` | Bitmap | yes | none |
| `svg` | Vector canvas | yes | `g`, `circle`, `ellipse`, `rect`, `line`, `path` |
| `g`, `circle`, `ellipse`, `rect`, `line`, `path` | Shapes inside an `svg` | no | `g` only: shapes |

## Common props

Every element except `br` accepts:

| Prop | Type | Notes |
| --- | --- | --- |
| `style` | `Style` object or CSS string | See [Styles](/docs/reference/styles/). A string such as `"padding: 8px; border-radius: 12px"` is parsed as inline CSS; kebab-case names are converted to camelCase. |
| `ref` | any | Solid ref; not sent to the engine. |
| `onClick`, `onPointerDown`, `onPointerUp`, `onPointerEnter`, `onPointerLeave`, `onPointerMove`, `onWheel` | `(e: PointerEventData) => void` | Pointer handlers. The widget must set `"interactive": true` in its [manifest](/docs/reference/manifest/). |

`class`, `className` and `key` are accepted by the engine and ignored.

## view

A box. Its default layout is `display: "flex"` with `flexDirection: "row"`, like a `<div>` with
`display: flex`. A bare string child becomes its own text node with the inherited text style, so
`<view>Hello</view>` renders text.

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

The widget's root node is a `view` sized `100%` × `100%` of the instance; your top-level element is its
child, so give it `width: "100%"` and `height: "100%"` to fill the cell area.

## text, span, br

A `text` is one paragraph laid out by DirectWrite. Everything inside it (strings, `span`, nested
`text` or `view`, `br`) is flattened into styled runs of the same paragraph.

- **Per run** (may differ inside a paragraph): `color`, `fontFamily`, `fontSize`, `fontWeight`,
  `fontStyle`, `letterSpacing`, `textDecoration` and `textTransform`.
- **Per paragraph** (taken from the outer `text`): `textAlign`, `lineHeight`, `whiteSpace`,
  `textOverflow` and `textShadow`.
- Box styles (`background`, `padding`, `opacity`, …) apply only to the outer `text`, not to runs
  inside it.
- `image` and `svg` inside a `text` are ignored.
- `br` inserts a line break; outside a `text` it renders nothing.

`span` is the same node type as `text`. Inside a `text` it is an inline run; used on its own it is a
paragraph.

:::note
Runs inside a paragraph are not separate layout nodes, so pointer handlers on a nested `span` never
fire. Put handlers on the outer `text` or on a `view`.
:::

## image

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `src` | `string` | required | Path relative to the pack root, or a `data:` URI (base64 or percent-encoded). Paths containing `..` are refused. |
| `objectFit` | `"contain"` \| `"cover"` \| `"fill"` | `"contain"` | The engine also accepts `fit` as an alias (untyped). |

Images are decoded with the Windows Imaging Component, so any format WIC reads works (PNG and JPEG
among them). Without an explicit size, the image's natural size is used for layout.

:::caution
`vitrine-widget build` copies only the files named in `vitrine.json` (settings, previews, fonts) plus
`README.md`, `LICENSE` and `icon.png`. An image referenced by a path string is not copied into the
pack. Import it from code instead (`import sun from "./sun.png"`): Vite inlines imported assets as
`data:` URIs in the bundle. See [Fonts and assets](/docs/guides/fonts-and-assets/).
:::

## svg

| Prop | Type | Notes |
| --- | --- | --- |
| `viewBox` | `string` | `"minX minY width height"`. Content is scaled uniformly and centred (like `xMidYMid meet`). Without it, user units are DIPs. |
| `width`, `height` | `number` | Default size when the style sets none. With only one dimension known, the other follows the `viewBox` aspect ratio; with neither, the `viewBox` size is used. |

`color` on the `svg` (style or prop) is the value of `currentColor` for its shapes.

## Shapes

Shapes are painted inside their `svg` and are not layout nodes. Pointer handlers on shapes never
fire: put them on the `svg`.

| Element | Geometry attributes |
| --- | --- |
| `circle` | `cx`, `cy` (default 0), `r` |
| `ellipse` | `cx`, `cy` (default 0), `rx`, `ry` |
| `rect` | `x`, `y` (default 0), `width`, `height`, `rx`, `ry` (either one sets both) |
| `line` | `x1`, `y1`, `x2`, `y2` |
| `path` | `d`: full SVG path syntax, absolute and relative (`M L H V C S Q T A Z`) |
| `g` | Group: no geometry |

Presentation attributes, shared by all shapes:

| Attribute | Type | Default | Notes |
| --- | --- | --- | --- |
| `fill` | colour, `"none"` | black; `none` for `line` and `g` | `currentColor` allowed. |
| `fillOpacity` | `number` | `1` | |
| `stroke` | colour, `"none"` | none | `currentColor` allowed. |
| `strokeOpacity` | `number` | `1` | |
| `strokeWidth` | `number` | `1` | In `viewBox` units. |
| `strokeDasharray` | `string` \| `number[]` | none | `"4 2"`, `"4,2"` or `[4, 2]`. |
| `strokeDashoffset` | `number` | `0` | |
| `strokeLinecap` | `"butt"` \| `"round"` \| `"square"` | `"butt"` | |
| `strokeLinejoin` | `"miter"` \| `"round"` \| `"bevel"` | `"miter"` | |
| `opacity` | `number` | `1` | Multiplies with the opacity of enclosing groups. |
| `transform` | `string` | none | SVG transform list: `translate`, `scale`, `rotate(a)`, `rotate(a cx cy)`, `matrix(a b c d e f)`. |
| `color` | colour | inherited | Sets `currentColor` for this shape (and, on `g`, for its children). |

A `g` passes its `transform`, `opacity` and `color` down to its children. `fill` and `stroke` are
**not** inherited from a `g`: set them on each shape. Kebab-case attribute names (`stroke-width`) are
converted to camelCase by the engine, but the SDK types only the camelCase forms. Any attribute may
also be given through `style`.

Numeric attributes can be animated with a `transition` (in the shape's `style` or as a `transition`
attribute), for example `strokeDasharray` on a progress ring:

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

A group with inherited colour and transform:

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

## Pointer events

Handlers receive a `PointerEventData`:

| Field | Type | Notes |
| --- | --- | --- |
| `type` | `string` | `click`, `pointerdown`, `pointerup`, `pointermove`, `pointerenter`, `pointerleave`, `wheel` |
| `x`, `y` | `number` | Pointer position in widget coordinates (DIPs). |
| `deltaY` | `number` | `wheel` only: 100 per notch, positive when scrolling down. `0` otherwise. |
| `button` | `number` | Always `0`: the right button opens the widget's context menu and is not delivered. |
| `target` | `number` | Engine id of the node that was hit. |
| `stopPropagation()` | function | Stops bubbling to ancestors. |

Rules, as implemented in engine 2.0:

- The hit target is the deepest laid-out node **that has a handler** under the pointer. Nodes
  without handlers are transparent to hit testing; `overflow: "hidden"` also clips hit testing.
- Every event, `pointerenter` and `pointerleave` included, bubbles from the target through its
  ancestors in the SDK, calling each ancestor's handler for that type.
- `click` fires on `pointerup` over the same node that received `pointerdown`.
- Input is suspended in edit mode. Widgets never receive keyboard focus; use
  [`prompt()`](/docs/reference/sdk/#prompt) to ask for text.

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

## Untyped engine aliases

The engine maps a few other tag names, which the SDK does not type: `p` and `label` (same as `text`),
`img` (same as `image`). Any unknown tag is treated as a `view`.
