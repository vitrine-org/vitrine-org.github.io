---
title: Linee guida di design
description: Come progettare widget che sembrano nativi su Windows 11, si leggono su qualunque sfondo e non costano quasi nulla.
sidebar:
  order: 2
---

Un widget resta sul desktop di qualcuno per mesi. Viene guardato mille volte per ogni volta che
viene usato, quindi deve essere sobrio, preciso e leggibile prima ancora che ingegnoso. Queste sono
le regole che seguono i pacchetti ufficiali; per lo stile Fluent il riferimento è
[Essentials](/it/packs/#dev.vitrine.essentials).

## Essere parte di Windows 11

Vitrine disegna sotto le icone, accanto alla barra delle applicazioni, al menu Start e alla bacheca
dei widget di Windows. Un widget che ne prende il linguaggio sembra parte del sistema.

- **Carattere.** Segoe UI Variable, il carattere di sistema di Windows 11, a meno che il pacchetto non
  abbia un'identità propria. Essentials usa le sue tre dimensioni ottiche: `Segoe UI Variable Display`
  per i numeri grandi, `Segoe UI Variable Text` per il testo e `Segoe UI Variable Small` per le
  didascalie. Sono già in Windows 11, non serve includerle.
- **Forma.** Rettangoli arrotondati con raggio da 8 a 12 DIP. Le schede di Essentials usano 12; i
  controlli dentro una scheda da 4 a 8. Non mescolare raggi diversi nello stesso widget.
- **Materiale.** Acrilico, non tinta piatta: un velo traslucido sopra
  `backdropFilter: "blur(16px) saturate(1.6)"`, con un bordo sottile di 1 DIP. I riempimenti pieni
  sembrano adesivi appiccicati allo sfondo.
- **Icone.** Icone al tratto, con uno spessore di circa 1,5 DIP, disegnate come tracciati SVG: 16 o
  20 DIP per l'interfaccia, più grandi solo per il simbolo principale (una condizione meteo, una
  batteria).
- **Accento.** Segui l'accento di Windows con [`useAppearance()`](/it/docs/guides/appearance/) e usalo
  per una cosa sola per widget: la data di oggi, il valore attivo, l'azione principale.

## Stare sulla griglia

Il desktop è una griglia di **celle da 64 × 64 DIP**, con **8 DIP di spazio** fra una cella e
l'altra e un margine di 24 DIP dai bordi dell'area di lavoro. Un widget di *n* × *m* celle misura
`n × 64 + (n − 1) × 8` per `m × 64 + (m − 1) × 8` DIP.

| Celle | DIP |
| --- | --- |
| 1 | 64 |
| 2 | 136 |
| 3 | 208 |
| 4 | 280 |
| 5 | 352 |
| 6 | 424 |

- **Usa una scala di spaziature a passi di 4 DIP** dentro il widget: 4, 8, 12, 16, 24. L'orologio di
  Essentials, per esempio, ha 16 DIP di margine interno orizzontale, 24 quando è alto due celle.
- **Allinea ai bordi che condividi.** Due widget affiancati sono separati esattamente dagli 8 DIP
  della griglia: con 16 DIP di margine interno, i contenuti cadono su un ritmo comune di 32 DIP. Tieni
  lo stesso margine in tutto il pacchetto e l'intero desktop risulta allineato.
- **Scegli come predefinita la dimensione in cui il disegno rende meglio**, poi fissa `min` dove
  nulla viene tagliato e `max` dove il disegno regge ancora. Prova ogni misura intermedia in Modifica
  layout.
- **Scala con lo spazio.** Leggi [`useSize()`](/it/docs/reference/sdk/) e ricava da lì dimensioni del
  testo e spaziature, invece di fissarle per la misura predefinita.

## Leggibile su qualunque sfondo

Non sai mai cosa c'è dietro il widget: una foto bianca, una nera, una piena di dettagli.

- **Su scheda**: l'acrilico dà uno sfondo prevedibile qualunque sia la foto. Mantieni un contrasto
  del testo di almeno 4,5:1 rispetto alla tinta della scheda, misurato sia sopra uno sfondo bianco
  sia sopra uno nero.
- **Nudo**: ciò che è disegnato direttamente sullo sfondo ha bisogno di un `textShadow` gaussiano
  morbido: una sfocatura scura sotto il testo chiaro (`0 1px 4px rgba(0, 0, 0, 0.8)`), un alone chiaro
  sotto quello scuro. Ai tratti SVG si aggiunge sotto un tratto più largo e tenue. Vedi
  [Vetro e leggibilità](/it/docs/guides/glass-and-legibility/).
- **Gerarchia con dimensione e peso, non con il grigio.** Testo secondario al 78-80 % di opacità,
  terziario fra il 55 e il 70 %. Più tenue di così, su metà degli sfondi sparisce.
- **Numeri**: cifre tabulari per i valori che cambiano, così l'impaginazione non tremola a ogni
  secondo.
- **Dimensione minima**: 12 DIP per qualsiasi testo, 14 per ciò che va letto e non solo intravisto.

## Seguire chiaro e scuro

Windows ha una modalità chiara e una scura, e gli utenti le cambiano, a volte a orari fissi. Offri
un'impostazione **Tema** con *Sistema*, *Chiaro* e *Scuro*, con *Sistema* come predefinito, e leggi il
valore dal vivo con `useAppearance()`: il widget cambia insieme a Windows, senza riavvii. Progetta
entrambe le palette con cura: lo scuro non è il chiaro invertito. Il testo chiaro su acrilico scuro
chiede un filo di peso in più del testo scuro su acrilico chiaro per leggersi allo stesso modo.

Nei temi nudi "chiaro" e "scuro" descrivono il **testo**, non la modalità: un widget nudo su uno
sfondo scuro vuole testo chiaro anche quando Windows è in modalità chiara. Chiama le opzioni così,
come fa Sargas con *Light (dark wallpaper)* e *Dark (light wallpaper)*.

## Muoversi con misura

Sul desktop il movimento si vede con la coda dell'occhio, dove distrae di più.

- **Anima i cambi di stato, mai l'attesa.** Un valore che si aggiorna può scivolare verso la nuova
  posizione; nulla deve ripetersi, pulsare o "respirare" quando non succede niente.
- **Brevi e morbide**: 150 ms per il riscontro al passaggio del mouse, da 300 a 600 ms per un valore
  che si sposta (un indicatore, una barra), con una curva in uscita.
- **Anima ciò che si interpola**: `opacity`, dimensioni e posizioni in DIP, `borderRadius` e i valori
  dei tratti SVG. Trasformazioni e colori cambiano di colpo, quindi per l'hover sfuma l'`opacity` di
  un livello invece del suo colore. L'elenco completo è in [Animazioni](/it/docs/guides/animations/).
- **Aggiorna al ritmo giusto.** Un orologio senza secondi usa `useClock("minute")` e ridisegna una
  volta al minuto. Vedi [Prestazioni ed energia](/it/docs/guides/performance/).

## Interazioni chiare e sicure

Ricevono il mouse solo i widget con `"interactive": true`, e dove ci sono le icone del desktop vincono
sempre le icone. Vedi [Interattività](/it/docs/guides/interactivity/).

- **Bersagli di almeno 32 DIP** per tutto ciò che si clicca, con uno stato hover visibile (un velo
  dell'8-10 %) e uno stato premuto.
- **Niente gesti nascosti.** Se la rotellina o un clic fanno qualcosa, mostra un controllo che lo
  suggerisca.
- **Il testo si inserisce con [`prompt()`](/it/docs/guides/text-input/)**, il riquadro di Windows 11:
  i widget non ricevono il focus della tastiera.
- **Chiedi prima di distruggere.** Svuotare un elenco o azzerare un contatore deve richiedere un clic
  voluto, non uno scappato sul desktop.

## Accessibilità

- **Contrasto** di 4,5:1 per il testo e 3:1 per la grafica che porta significato, in entrambi i temi
  e sui due estremi di sfondo.
- **Mai solo il colore.** Abbina l'accento a peso, posizione o un'icona: un'attività completata è sia
  spuntata sia barrata.
- **Rispetta la scala dell'utente.** I widget seguono il ridimensionamento dello schermo di Windows;
  lascia scegliere un widget più grande invece di rimpicciolire il testo per farci stare di più.
- **Localizza** nomi, impostazioni e testi visibili, e formatta date e numeri con l'SDK perché seguano
  il formato regionale di Windows. Vedi [Localizzazione](/it/docs/guides/localisation/).

## Prima di pubblicare

- Il widget sembra voluto alla dimensione minima, predefinita e massima.
- Si legge su uno sfondo bianco, su uno nero e su uno movimentato, sia su scheda sia nudo.
- Chiaro, Scuro e Sistema funzionano, e cambiare la modalità di Windows lo aggiorna dal vivo.
- Nulla si muove quando nulla cambia.
- Ogni elemento cliccabile misura almeno 32 DIP e ha gli stati hover e premuto.
- Le anteprime sono generate alla dimensione predefinita con `--scale 2`.
