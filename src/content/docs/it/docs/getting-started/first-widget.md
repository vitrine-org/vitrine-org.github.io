---
title: Il tuo primo widget
description: Crea un pack con l'SDK, modifica un widget in TSX e installalo, in cinque minuti.
sidebar:
  order: 2
---

Servono [Vitrine](/it/docs/getting-started/install/), [Node.js](https://nodejs.org/) 20 o successivo
e Git (npm scarica l'SDK da GitHub).

## 1. Crea il pack

```sh
npx github:vitrine-org/sdk#v2.2.1 create my-widgets --id=dev.you.widgets
cd my-widgets
npm install
```

`--id` è l'identificativo del pack in notazione DNS inversa: minuscolo, almeno due segmenti, solo
tuo. Dà il nome al pack installato, quindi sceglilo una volta e non cambiarlo più. Senza `--id` l'SDK
usa `dev.example.<cartella>`.

Lo scheletro è un pack con un solo widget, un orologio:

```
my-widgets/
├── vitrine.json            pack manifest: id, name, version, widgets
├── package.json            depends on github:vitrine-org/sdk#v2.2.1
├── tsconfig.json
└── src/clock/
    ├── index.tsx           the widget
    └── settings.json       options shown in the control panel
```

In `vitrine.json` ogni voce di `widgets` indica il file TSX (`entry`), lo schema delle impostazioni
(`settings`) e le dimensioni sulla griglia in celle (`size`: `default`, `min`, `max`). Tutti i campi
sono nel [riferimento del manifest](/it/docs/reference/manifest/).

## 2. Modifica il widget

Un widget è un componente SolidJS passato a `mount()`. Al posto dell'HTML usa gli elementi di
Vitrine: `view` è un contenitore flex, `text` contiene testo, `span` ne formatta una parte. Apri
`src/clock/index.tsx` e aggiungi un saluto sopra l'ora:

```tsx {3-7,28}
import { formatDate, mount, useClock, useSettings } from "@vitrine/sdk";

function greeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function Clock() {
  const settings = useSettings({ accent: "#60CDFF", showSeconds: false });
  const now = useClock(settings().showSeconds ? "second" : "minute");

  return (
    <view
      style={{
        width: "100%",
        height: "100%",
        padding: 20,
        borderRadius: 12,
        justifyContent: "center",
        flexDirection: "column",
        background: "rgba(32, 32, 32, 0.55)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        color: "#ffffff",
        fontFamily: "Segoe UI Variable Display",
      }}
    >
      <text style={{ fontSize: 13, marginBottom: 4, opacity: 0.7 }}>{greeting(now().getHours())}</text>
      <text style={{ fontSize: 44, fontWeight: 600, lineHeight: 1 }}>
        {formatDate(now(), "HH")}
        <span style={{ color: settings().accent }}>{formatDate(now(), settings().showSeconds ? ":mm:ss" : ":mm")}</span>
      </text>
      <text style={{ fontSize: 14, marginTop: 6, opacity: 0.7 }}>{formatDate(now(), "dddd D MMMM")}</text>
    </view>
  );
}

mount(() => <Clock />);
```

Cosa succede:

- `useClock("minute")` è un segnale che cambia allo scoccare di ogni minuto. Si aggiorna tutto ciò che
  legge `now()` e nient'altro gira nel frattempo: SolidJS aggiorna solo i nodi di testo che ne
  dipendono, e Vitrine ridisegna solo quando qualcosa è cambiato.
- `useSettings(defaults)` restituisce le impostazioni dell'istanza dal pannello di controllo, unite ai
  valori predefiniti, e si aggiorna in tempo reale.
- `formatDate` segue il formato regionale di Windows (QuickJS, il motore che esegue i widget, non ha
  `Intl`).

## 3. Crea il pacchetto e installalo

```sh
npm run pack
```

Il comando compila tutti i widget e scrive `widgets-1.0.0.vitrine` (l'ultimo segmento dell'id, poi la
versione). Fai doppio clic sul file: Vitrine installa il pack. Apri **Aggiungi widget…** dall'area di
notifica, trova **Clock** nella galleria e trascinalo sul desktop.

Cambia `name` in `vitrine.json` per dare al pack il suo vero nome e aumenta `version` a ogni rilascio:
un pack più recente sostituisce il vecchio e ne riavvia i widget.

:::tip
Ricreare e reinstallare il pack a ogni modifica è lento. Il [ciclo di sviluppo](/it/docs/getting-started/dev-loop/)
ricarica il widget sul desktop a ogni salvataggio.
:::

## Prossimi passi

- [Ciclo di sviluppo](/it/docs/getting-started/dev-loop/): ricaricamento dal vivo, log e anteprime headless.
- [Costruire un widget passo per passo](/it/docs/guides/building-a-widget/): impostazioni, clic, storage e dimensioni.
- Riferimento degli [elementi](/it/docs/reference/elements/) e degli [stili](/it/docs/reference/styles/).
