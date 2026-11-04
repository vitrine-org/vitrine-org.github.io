---
title: Text input
description: Ask the user for a line of text with prompt(), since widgets never receive keyboard focus.
sidebar:
  order: 9
---

Widgets live beneath the desktop icons and never get keyboard focus, so there are no text fields
inside a widget. `prompt()` asks Vitrine to show a small dialog next to the widget and resolves with
what the user typed.

```tsx
import { mount, prompt, useStorage } from "@vitrine/sdk";

function Note() {
  const [text, setText] = useStorage("text", "");

  const edit = async () => {
    const value = await prompt({ title: "Note", placeholder: "Write something to remember", value: text() });
    if (value !== null) setText(value.trim()); // null: cancelled
  };

  return (
    <view
      onClick={edit}
      style={{ width: "100%", height: "100%", padding: 14, borderRadius: 12, background: "rgba(255, 214, 102, 0.85)", color: "#3b2f00" }}
    >
      <text style={{ fontSize: 14, lineHeight: 1.35, opacity: text() ? 1 : 0.6 }}>{text() || "Click to write a note"}</text>
    </view>
  );
}

mount(() => <Note />);
```

The widget needs `"interactive": true` to receive the click.

## API

```ts
prompt(options?: { title?: string; placeholder?: string; value?: string }): Promise<string | null>
```

| Option | Meaning | Limit |
|---|---|---|
| `title` | Dialog heading, e.g. "New task" | 80 characters |
| `placeholder` | Hint shown while the field is empty | 120 characters |
| `value` | Initial text, for editing | 2,000 characters |

Control characters are removed. The promise resolves to the text when the user confirms, and to
`null` when they cancel. The dialog is a single-line field in the Windows 11 style, opens below the
widget's bottom-left corner and uses Vitrine's interface language for its buttons.

## Guidelines

- **Call it from a click.** A dialog that appears on its own steals focus from whatever the user is
  doing.
- **Treat `null` as "no change"**, and an empty string as a deliberate answer: for example, clearing
  a task's text can mean deleting it, as long as the placeholder says so ("Leave empty to delete").
- **Write the result to [storage](/docs/guides/storage/)** if it must survive restarts.
- **One line at a time.** For structured input, chain short prompts
  or move the option to [settings](/docs/guides/settings/).

:::note
`prompt()` also resolves to `null` on a Vitrine that has no prompt support, and in `vitrine render`,
which never shows dialogs. A widget that depends on typed text should offer a fallback, such as a
settings field that seeds the content.
:::
