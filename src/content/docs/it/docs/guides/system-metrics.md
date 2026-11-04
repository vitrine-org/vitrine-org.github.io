---
title: Metriche di sistema
description: Leggi CPU, memoria, batteria, unità, processi e traffico di rete con useSystem.
sidebar:
  order: 6
---

`useSystem(metrics, intervalMs)` si iscrive alle metriche di sistema e restituisce un segnale con
l'ultima istantanea. Ogni metrica richiede il permesso `system.<metrica>` nella voce del widget nel
manifest.

```tsx
import { formatBytes, mount, useSize, useSystem } from "@vitrine/sdk";

function Bar(props: { label: string; value: number | null; detail: string; width: number }) {
  const v = () => Math.min(100, Math.max(0, props.value ?? 0));
  return (
    <view style={{ flexDirection: "column", gap: 4 }}>
      <view style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <text style={{ fontSize: 12, fontWeight: 600 }}>{props.label}</text>
        <text style={{ fontSize: 12, opacity: 0.7 }}>{props.value === null ? "–" : `${Math.round(v())}%  ${props.detail}`}</text>
      </view>
      <view style={{ width: props.width, height: 4, borderRadius: 2, background: "rgba(255, 255, 255, 0.15)" }}>
        {/* A width in DIPs, not "%": only plain numbers are interpolated. */}
        <view style={{ width: (props.width * v()) / 100, height: 4, borderRadius: 2, background: "#60CDFF", transition: "width 700ms ease" }} />
      </view>
    </view>
  );
}

function System() {
  const sys = useSystem(["cpu", "memory"], 2000);
  const size = useSize();
  const inner = () => Math.max(0, size().width - 32);

  return (
    <view style={{ width: "100%", height: "100%", flexDirection: "column", justifyContent: "center", gap: 12, padding: 16, borderRadius: 12, background: "rgba(32, 32, 32, 0.55)" }}>
      <Bar label="CPU" value={sys().cpu?.usage ?? null} detail={`${sys().cpu?.cores ?? ""} cores`} width={inner()} />
      <Bar
        label="Memory"
        value={sys().memory?.load ?? null}
        detail={sys().memory ? `${formatBytes(sys().memory!.used)} of ${formatBytes(sys().memory!.total)}` : ""}
        width={inner()}
      />
    </view>
  );
}

mount(() => <System />);
```

```json
"permissions": ["system.cpu", "system.memory"]
```

## Cosa ricevi

Nell'istantanea ogni campo è facoltativo: parte vuota e si riempie man mano che arrivano i campioni,
quindi leggila con `?.` e mostra un segnaposto nel frattempo.

| Metrica | Campi |
|---|---|
| `cpu` | `usage`: percentuale su tutti i core, 0–100, un decimale; `cores`: processori logici |
| `memory` | `total`, `available`, `used`: byte; `load`: percentuale in uso, 0–100 |
| `battery` | `hasBattery`; `charging`; `level`: percentuale o `null`; `remainingSeconds`: stima o `null`; `powerSource`: `"ac"`, `"battery"` o `"unknown"`; `saver`: risparmio energia attivo |
| `drives` | Unità fisse: `[{ name: "C:", label, total, free, used }]`, in byte |
| `processes` | I dieci processi con il working set più grande: `[{ name, pid, memory }]` |
| `network` | `rxPerSec`, `txPerSec`: byte al secondo su tutte le interfacce attive |

`cpu` e `network` sono velocità misurate tra due campioni: il primo valore è `0`. `formatBytes(n)`
trasforma i byte in `1.2 GB`, `340 MB`.

:::caution
Il tipo dell'SDK elenca anche una metrica `system` (nome host, sistema operativo, uptime), ma in
Vitrine 2.x non esiste un permesso che la conceda, quindi non viene mai consegnata. Non farci
affidamento.
:::

## Come funziona il campionamento

- **Condiviso e su richiesta.** Vitrine campiona solo le metriche richieste da qualche widget, una
  volta sola, e consegna a ogni widget quelle per cui ha il permesso. Dieci widget della CPU costano
  una sola lettura.
- **Intervallo.** Ogni metrica viene campionata all'intervallo più breve richiesto, mai più spesso di
  una volta al secondo. Più chiamate a `useSystem` nello stesso widget confluiscono in un'unica
  iscrizione.
- **Batteria.** Con il risparmio energia attivo, o a batteria con **Risparmia batteria** acceso nel
  pannello di controllo, ogni intervallo raddoppia.
- **Sospensione.** Mentre i widget sono sospesi (sessione bloccata, schermo spento, app a schermo
  intero) non si campiona nulla.
- **Permessi mancanti.** Una metrica senza permesso viene tolta dall'iscrizione, con un avviso nel log.

Scegli l'intervallo più lungo che sembri ancora dal vivo: 2 s vanno bene per CPU e rete, 10 s o più
per la memoria, mentre unità e batteria cambiano abbastanza lentamente da reggere 30–60 s.

:::tip
L'argomento dell'intervallo viene letto una volta. Per farlo scegliere nelle impostazioni, crea
l'iscrizione in una memo: `const sys = createMemo(() => useSystem(["cpu"], s().interval * 1000))`, poi
leggi `sys()()`.
:::

## Presentare le metriche

- Applica una transizione ai numeri che disegni (larghezza delle barre, `strokeDasharray` degli
  anelli) lunga più o meno quanto l'intervallo di campionamento, così i valori scorrono invece di
  saltare; vedi [Animazioni](/it/docs/guides/animations/).
- Perché la transizione parta, la larghezza delle barre deve essere un numero in DIP: ricavala da
  `useSize()`.
- Usa il colore per le soglie con parsimonia, per esempio dal 90%, e mantieni il valore leggibile come
  testo.
