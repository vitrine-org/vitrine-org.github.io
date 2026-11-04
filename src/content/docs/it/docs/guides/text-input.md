---
title: Inserimento di testo
description: Chiedi all'utente una riga di testo con prompt(), perché i widget non ricevono mai il focus della tastiera.
sidebar:
  order: 9
---

I widget vivono sotto le icone del desktop e non ricevono mai il focus della tastiera, quindi dentro un
widget non esistono campi di testo. `prompt()` chiede a Vitrine di mostrare una piccola finestra di
dialogo accanto al widget e si risolve con ciò che l'utente ha scritto.

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

Per ricevere il clic il widget deve avere `"interactive": true`.

## API

```ts
prompt(options?: { title?: string; placeholder?: string; value?: string }): Promise<string | null>
```

| Opzione | Significato | Limite |
|---|---|---|
| `title` | Titolo della finestra, per esempio "Nuova attività" | 80 caratteri |
| `placeholder` | Suggerimento mostrato a campo vuoto | 120 caratteri |
| `value` | Testo iniziale, per la modifica | 2.000 caratteri |

I caratteri di controllo vengono rimossi. La promise si risolve con il testo quando l'utente conferma
e con `null` quando annulla. La finestra è un campo a riga singola in stile Windows 11, si apre sotto
l'angolo in basso a sinistra del widget e usa la lingua dell'interfaccia di Vitrine per i pulsanti.

## Linee guida

- **Chiamala da un clic.** Una finestra che compare da sola ruba il focus a ciò che l'utente sta
  facendo.
- **Tratta `null` come "nessuna modifica"** e la stringa vuota come una risposta voluta: per esempio,
  svuotare il testo di un'attività può significare eliminarla, purché il segnaposto lo dica ("Lascia
  vuoto per eliminare").
- **Salva il risultato nello [storage](/it/docs/guides/storage/)** se deve sopravvivere ai riavvii.
- **Una riga alla volta.** Per dati strutturati, concatena brevi richieste oppure sposta l'opzione
  nelle [impostazioni](/it/docs/guides/settings/).

:::note
`prompt()` restituisce `null` anche su un Vitrine privo del supporto ai prompt e in `vitrine render`,
che non mostra mai finestre di dialogo. Un widget che dipende dal testo digitato dovrebbe offrire
un'alternativa, come un campo nelle impostazioni che ne inizializzi il contenuto.
:::
