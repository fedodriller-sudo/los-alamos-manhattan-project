# Collaudo finale integrato — 27 ottobre 2026

Release pubblica verificata: `fe451b9`. Sessione unica dalle 02:41 alle 02:54 Europe/Rome (01:41–01:54 UTC), conclusa entro il limite di 35 minuti. Tre schede del browser in-app sul sito GitHub Pages: H · Host e P · Personale a 1280×720, S · Spie a 390×844. Un unico invito per tutti. Nessun reset di storage/cache, nessuna modifica artificiale di progresso o timer, nessun riavvio della sessione per mascherare errori.

## Esito: PASS

| Fase                | Evidenza osservata                                                                                                                                                                                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Riferimento singolo | All’ingresso diario 0, nessun comando Riprendi. Completata dalla UI “Una strada verso la mesa”; “Cinque lezioni per cominciare” lasciata a 1/2 passaggi. Capitolo 1943, diario 1/8. Menu → Riprendi conserva tutto.                                                                                   |
| Ingresso condiviso  | Tre partecipanti entrati dallo stesso link, roster 3/8 identico. H e P nel Personale, S nelle Spie. Avvio dell’host sincronizzato, progressi iniziali 0/4 e 0/3. Conferma copia link leggibile dentro la lobby.                                                                                       |
| Collaborazione      | H completa Demon Core; P completa Glove box e Trinity. S completa Fuchs e Rosenberg. Dopo ogni missione, conteggi uguali su tutte le schede: Personale 1→2→3/4 e Spie 1→2/3.                                                                                                                          |
| Vittoria Personale  | S lascia aperto Seborer al primo passaggio. H completa gli otto visitatori dell’Ingresso. Tutti vedono “Ha vinto il Personale”, Personale 4/4, Spie 2/3, tempo 7 min 22 s. Il dialogo missione di S viene sostituito dalla vittoria. Rivincita visibile solo all’host.                                |
| Rivincita           | Un solo comando Rivincita dell’host. Stessi tre partecipanti e squadre, conteggi 0/4 e 0/3, risultato precedente chiuso. H lascia aperto il banco Demon Core senza avanzare. S ripete Fuchs e Rosenberg da zero, poi completa Seborer.                                                                |
| Vittoria Spie       | Tutti vedono “Hanno vinto le Spie”, Personale 0/4, Spie 3/3, tempo 2 min 12 s. Anche il banco aperto dell’host viene chiuso. Nessun risultato della gara precedente riutilizzato.                                                                                                                     |
| Diario preservato   | P e S escono, poi H. Riprendi restituisce diario 1/8, capitolo 1943, primo episodio completato, secondo a 1/2. Aperto il secondo episodio: stessa domanda “A chi consegni una copia degli appunti?”, passaggio 2 di 2. Chiusura e ricaricamento, poi nuova ripresa: valori e domanda ancora identici. |
| Console             | Nessun avviso o errore registrato nelle tre schede durante il collaudo.                                                                                                                                                                                                                               |

## Evidenze

- Riferimento: `screenshots/final-reference-journal.jpg`, `final-reference-partial.jpg`, `final-reference-resumed.jpg`.
- Vittoria Personale: `screenshots/final-personnel-win.jpg` e `final-personnel-win-mobile.jpg`.
- Vittoria Spie: `screenshots/final-spies-win-mobile.jpg`.
- Diario dopo ricaricamento: `screenshots/final-diary-restored.jpg` e `final-partial-restored.jpg`.

## Osservazioni e limiti

Durante l’apertura del primo episodio singolo è comparsa una risposta errata recuperabile, corretta normalmente. Nella prima prova Fuchs la sentinella ha interrotto la copia: il progresso conservato è stato ripreso e completato usando i normali comandi. Alcune attese dell’automazione sono scadute prima dell’arrivo o del cambio della pattuglia; una nuova lettura della UI ha mostrato il normale avanzamento. Nessun blocco funzionale, divergenza o reset.

La prova usa tre schede dello stesso computer, non tre dispositivi fisici o reti separate. La larghezza mobile è una simulazione di viewport; VoiceOver e hardware audio non sono certificati. Gli 80 test automatici, controllo sintassi e build erano già superati sulla release `fe451b9`; dopo questo collaudo sono stati modificati soltanto documenti e screenshot. Nessuna nuova funzione o meccanica aggiunta. La scheda host resta aperta sul diario legittimamente creato, le due schede ospiti sono state chiuse.
