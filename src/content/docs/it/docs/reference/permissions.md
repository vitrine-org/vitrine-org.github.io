---
title: Permessi
description: Tutte le stringhe di permesso che un widget può dichiarare, e cosa concedono.
sidebar:
  order: 6
---

Un widget dichiara ciò di cui ha bisogno nell'array `permissions` della propria
[voce del manifest](/it/docs/reference/manifest/#campi-del-widget). I permessi sono per widget, non per
pack. Una stringa sconosciuta o malformata rende non valido l'intero manifest, e il pack non viene
caricato.

Senza permessi un widget può comunque disegnare e usare timer, impostazioni, dimensione, aspetto,
storage, dati locali, [`prompt()`](/it/docs/reference/sdk/#prompt) e
[`openUrl()`](/it/docs/reference/sdk/#openurl).

| Permesso | Nome | Concede |
| --- | --- | --- |
| `system.cpu` | Uso del processore | `cpu`: percentuale d'uso totale e numero di core. |
| `system.memory` | Uso della memoria | `memory`: memoria fisica totale, disponibile e usata, carico della memoria. |
| `system.battery` | Stato della batteria | `battery`: presenza, livello di carica, ricarica in corso, autonomia, alimentazione, risparmio batteria. |
| `system.drives` | Unità | `drives`: lettera, etichetta, spazio totale, libero e usato di ogni unità. |
| `system.processes` | Processi in esecuzione | `processes`: nome, id e memoria dei dieci processi che usano più memoria. |
| `system.network` | Attività di rete | `network`: byte ricevuti e inviati al secondo. |
| `net:<host>` | Accesso di rete a *host* | `fetch()` verso `http://<host>` e `https://<host>`, con qualsiasi porta e percorso. |

## system.\*

Ogni permesso `system.<metrica>` sblocca una chiave di
[`useSystem`](/it/docs/reference/sdk/#usesystem). Le metriche richieste senza permesso vengono
scartate e registrate con un avviso; le altre continuano ad arrivare.

L'SDK tipizza anche una metrica `system` (nome host, sistema operativo, tempo di attività), ma il
motore 2.0 non ha una stringa di permesso per essa (`system.system` viene rifiutata), quindi non può
essere concessa.

## net:\<host\>

- `<host>` è un nome host: etichette di lettere, cifre e `-` separate da punti, al massimo 253
  caratteri. Viene salvato in minuscolo.
- Corrisponde esattamente all'host della richiesta. I sottodomini non sono inclusi: `net:example.com`
  non consente `api.example.com`; dichiara ogni host.
- Niente schema, porta, percorso o caratteri jolly: `net:https://x.com`, `net:x.com:8080`,
  `net:x.com/api` e `net:*.x.com` non sono validi.
- Si possono richiedere solo URL `http://` e `https://`. Credenziali nell'URL (`utente@host`) e porta
  vengono ignorate nel confronto.

Una richiesta verso un host non dichiarato fallisce con un `TypeError` (`host not allowed by
permissions: <url>`) e viene registrata nel log.

```json
"permissions": ["system.cpu", "system.memory", "net:api.open-meteo.com"]
```

## Revisione

I revisori dello store verificano che i permessi siano il minimo indispensabile per i widget e che gli
host di rete siano motivati. Vedi [Pubblicazione](/it/docs/publishing/#revisione) e
[Fetch e permessi](/it/docs/guides/fetch-and-permissions/).
