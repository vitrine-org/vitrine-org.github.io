---
title: Architettura
description: Come Vitrine si integra nel desktop, disegna i widget e consuma poca energia.
---

## Integrazione nel desktop

Windows compone il desktop con alcune finestre della shell: `Progman`, la vista delle icone
`SHELLDLL_DefView` e una `WorkerW` che disegna lo sfondo. Vitrine posiziona una finestra trasparente per
ogni widget **tra lo sfondo e la vista delle icone**, così le icone restano sempre sopra. Da Windows 11
24H2 la gerarchia è cambiata, e Vitrine riconosce entrambe le strutture.

## Input sotto le icone

Normalmente ogni clic sul desktop arriva alla vista delle icone. Quando un widget è interattivo, Vitrine
osserva il puntatore e, se un clic o uno scroll cade su un widget **e non su un'icona**, lo consegna al
widget.

## Pipeline di rendering

1. Il JSX del widget aggiorna un albero di nodi persistente tramite la reattività a grana fine di
   SolidJS.
2. I nodi modificati vengono impaginati con Taffy e disegnati con Direct2D e DirectWrite.
3. Il risultato viene presentato nella finestra del widget, e si ridisegnano solo i widget cambiati.

## Efficienza energetica

- Le metriche di sistema vengono raccolte solo per ciò a cui i widget sono iscritti.
- Gli orologi si svegliano allo scoccare del secondo o del minuto, non di continuo.
- Il rendering si ferma con un'app a schermo intero davanti, con la sessione bloccata o con lo schermo
  spento.
- I thread in background girano con EcoQoS di Windows, e gli intervalli si allungano con il risparmio
  energetico.

## Vetro smerigliato sotto le icone

I widget vivono sotto la vista delle icone, dove Windows non offre materiali di sfondo. Per
`backdropFilter` Vitrine ricompone da sé lo sfondo di ogni monitor: una volta per monitor e per filtro
disegna lo sfondo a risoluzione ridotta, lo sfoca e lo satura con gli effetti di Direct2D, e tiene il
risultato in una piccola bitmap condivisa da tutti i widget di quel monitor. Disegnare un riquadro di
vetro diventa un semplice riempimento con quella bitmap, e la cache si ricostruisce solo quando
cambiano lo sfondo o la disposizione dei monitor.

## Script isolati

Ogni istanza di widget gira in un proprio runtime QuickJS, con un limite di memoria e un gestore di
interruzione: uno script fuori controllo viene fermato invece di bloccare il desktop. Il widget
raggiunge il mondo esterno solo attraverso l'API dell'host: metriche di sistema, HTTP verso gli host
dichiarati, il proprio spazio di archiviazione e le impostazioni dell'utente. Vedi
[Permessi](/it/docs/reference/permissions/) e [Limiti](/it/docs/reference/limits/).
