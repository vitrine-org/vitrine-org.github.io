---
title: Fetch e permessi
description: Dichiara host e metriche usati da un widget, chiama API HTTP con fetch e metti in cache le risposte.
sidebar:
  order: 5
---

Un widget può raggiungere solo ciò che il suo manifest dichiara. I permessi sono per widget, elencati
nella sua voce in `vitrine.json`:

```json
"permissions": ["net:api.open-meteo.com", "system.cpu", "system.memory"]
```

| Permesso | Concede |
|---|---|
| `net:<host>` | `fetch` verso quell'host esatto, in `http` o `https`, su qualsiasi porta |
| `system.cpu`, `system.memory`, `system.battery`, `system.drives`, `system.processes`, `system.network` | La metrica tramite [`useSystem`](/it/docs/guides/system-metrics/) |

Gli host devono corrispondere esattamente, senza distinzione tra maiuscole e minuscole. I caratteri
jolly non sono ammessi: dichiara `api.example.com` e `cdn.example.com` separatamente. Un permesso
sconosciuto o malformato rende il manifest non valido e Vitrine rifiuta di installare il pack.
Dichiara solo ciò che il widget usa; le regole complete sono nel
[riferimento dei permessi](/it/docs/reference/permissions/).

## fetch

`fetch` è una funzione globale, come sul web, implementata dal motore:

```ts
const r = await fetch("https://api.example.com/v1/items", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ q: "vitrine" }),
});
```

Supporta `method`, `headers` e un `body` di tipo stringa. La risposta ha `ok`, `status`,
`statusText`, `headers.get()` / `headers.has()`, `text()` e `json()`. È volutamente essenziale:

- il corpo viene letto come testo UTF-8, fino a 5 MB; non ci sono `blob()` né `arrayBuffer()`;
- una richiesta ha 20 secondi per completarsi; non esiste `AbortController`;
- gli stati di errore HTTP si risolvono normalmente con `ok: false`; errori di rete, timeout e host
  senza permesso rifiutano la promise con un `TypeError` che ne spiega il motivo;
- le richieste girano fuori dal thread principale, quindi un server lento non blocca mai il desktop;
- non c'è CORS (non è un browser) e lo user agent è `Vitrine/<versione>`.

## Una richiesta con cache

Lo schema qui sotto serve alla maggior parte dei widget che mostrano dati remoti: mostra subito il
valore in cache, aggiorna quando è vecchio o gli input sono cambiati, regge l'assenza di rete.

```tsx
import { createEffect, createSignal, on, onCleanup } from "solid-js";
import { mount, useSettings, useStorage } from "@vitrine/sdk";

interface Cache {
  place: string; // the settings the data was fetched for
  at: number;
  temp: number;
}

const MAX_AGE = 30 * 60_000;

function Weather() {
  const s = useSettings({ latitude: 41.9, longitude: 12.5 });
  const place = () => `${s().latitude},${s().longitude}`;
  const [cache, setCache] = useStorage<Cache | null>("cache", null);
  const [error, setError] = createSignal<string | null>(null);

  async function refresh() {
    const c = cache();
    if (c && c.place === place() && Date.now() - c.at < MAX_AGE) return;
    try {
      const r = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${s().latitude}&longitude=${s().longitude}&current=temperature_2m`,
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      setCache({ place: place(), at: Date.now(), temp: Math.round(j.current.temperature_2m) });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e)); // offline, timeout or not permitted
    }
  }

  createEffect(on(place, () => void refresh())); // now, and whenever the location changes
  const timer = setInterval(() => void refresh(), 5 * 60_000);
  onCleanup(() => clearInterval(timer));

  const data = () => (cache()?.place === place() ? cache() : null);

  return (
    <view style={{ width: "100%", height: "100%", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <text style={{ fontSize: 40, fontWeight: 600 }}>{data() ? `${data()!.temp}°` : "–"}</text>
      <text style={{ fontSize: 11, opacity: 0.6 }}>{error() && !data() ? "Offline" : "Open-Meteo"}</text>
    </view>
  );
}

mount(() => <Weather />);
```

Con `"permissions": ["net:api.open-meteo.com"]` sul widget. Perché è costruito così:

- **La cache sta nello storage** insieme agli input e all'ora del download: dopo un riavvio i dati
  compaiono subito e, se sono ancora freschi, non parte alcuna richiesta.
- **Il timer controlla spesso, la rete lavora di rado.** Un controllo ogni cinque minuti contro una
  scadenza di trenta recupera in fretta al risveglio del PC: mentre i widget sono
  [sospesi](/it/docs/guides/performance/) i timer non girano, e un intervallo lungo lascerebbe dati
  vecchi sullo schermo.
- **Gli errori conservano l'ultimo valore buono.** Meglio dati un po' vecchi con un'indicazione
  discreta che un widget vuoto.
- **Rispetta l'API.** Tieni un intervallo ragionevole e scegli API che consentono l'uso dal client
  senza chiave; non mettere mai segreti in un pack, chiunque può decomprimerlo.

Per l'anteprima con la rete attiva: `vitrine render dist weather --network --wait 3000 --out weather.png`.
