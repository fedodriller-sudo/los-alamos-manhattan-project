# Los Alamos — Il turno di notte

Un piccolo gioco browser in italiano: esplora una Los Alamos cartoon notturna e attraversa otto episodi ispirati alla vita del laboratorio tra il 1943 e il 1945. Facile, senza timer o penalità. Da soli oppure in cooperativa locale da **2 a 8 persone**.

## Avvio

Richiede **Node.js 20 o successivo**.

```sh
npm --prefix server install
npm start
```

Apri **http://localhost:8765**. Il server mostra anche gli indirizzi della rete locale. Una sola applicazione serve sito e WebSocket sulla stessa porta; non servono account o servizi esterni.

Per cambiare porta: `PORT=8877 npm start`. Per limitare l'accesso al computer host: `HOST=127.0.0.1 npm start`.

### Cooperativa sullo stesso computer

1. Apri il sito in due schede.
2. Scegli **Gioca con gli amici**, inserisci un nome e crea una stanza.
3. Nell'altra scheda, entra con il codice di sei caratteri (o il link d'invito).
4. L'host avvia quando sono presenti almeno due persone.

### Cooperativa tra dispositivi sulla stessa rete

Tutti aprono l'indirizzo LAN mostrato dal server, ad esempio `http://192.168.1.10:8765`. Non usare `localhost` sugli altri dispositivi: indica il dispositivo stesso. Condividi codice o link generato usando l'indirizzo LAN. Il firewall dell'host deve permettere le connessioni alla porta scelta.

I progressi sono condivisi e verificati dal server. Due risposte simultanee allo stesso passaggio non lo completano due volte. Le persone possono raggiungere una partita già iniziata. Se l'host esce, il ruolo passa a chi resta. Dopo una disconnessione, rientra con il codice: ritroverai i progressi finché almeno una persona è rimasta collegata. Non è un servizio online ospitato: il computer server deve restare acceso.

## Come si gioca

- **WASD/frecce** per muoverti, **E** per interagire.
- Tocca un episodio o un luogo per raggiungerlo automaticamente; durante il tragitto puoi usare il pulsante di interazione per arrivare subito.
- Scegli una risposta, consulta un indizio se vuoi e riprova senza penalità.
- Completa un capitolo per sbloccare il successivo: 1943, 1944, 1945.
- Nel **Diario** trovi fatti documentati, fonti e limiti della ricostruzione.
- Nelle **Impostazioni** regoli suoni, volume e movimento ridotto. Il sistema rispetta anche `prefers-reduced-motion`.

Il turno singolo si salva sul browser dopo ogni risposta corretta. **Riprendi il diario salvato** recupera i progressi. Il salvataggio locale singolo resta separato dalle stanze cooperative. Le stanze sono in memoria e scompaiono quando tutti escono o dopo sei ore. Riavviare il server azzera le stanze.

La modalità singola può anche usare `python3 serve.py` (senza multiplayer). Su HTTPS/localhost, il service worker conserva gli asset per l'esplorazione offline dopo il primo caricamento. Il multiplayer richiede sempre una connessione al computer host. La disponibilità offline dipende dal browser; l'installazione usa il suo menu di installazione app.

## Accuratezza storica

Gli avatar, le azioni, gli appunti selezionabili e i dialoghi sono inventati. **La mappa è artistica**, non una planimetria della Technical Area. Gli episodi collegano ogni fatto alle fonti; le datazioni non precise e le collocazioni narrative sono dichiarate.

Il gioco tratta l'accoglienza dei ricercatori, le lezioni di Robert Serber, la biblioteca di Charlotte Serber, la manutenzione delle calcolatrici, il lavoro con le schede perforate, un ricordo di Feynman sulla recinzione e la notizia di Trinity. Il finale include gli abitanti allontanati e le conseguenze del test sulle comunità vicine. Non simula la costruzione di armi o procedure sperimentali reali.

Fonti e note editoriali: [docs/HISTORY.md](docs/HISTORY.md).

## Verifica e sviluppo

```sh
npm test
npm run check
```

Ogni push o pull request esegue anche GitHub Actions su Node 20, 22 e 24.

I test usano il runner Node integrato. Quelli multiplayer aprono connessioni esclusivamente loopback: richiedono un ambiente che consenta socket locali.

- `js/history-data.js`: episodi, scelte e fonti.
- `js/progress.js`: avanzamento deterministico condiviso da client e server.
- `js/nightshift.js`: interfaccia, movimento, audio, salvataggio e rete.
- `css/nightshift.css`: layout responsive e stili.
- `server/game-server.js`: file pubblici, stanze e sincronizzazione autorevole.
- `tests/`: progressione e integrazione con client WebSocket reali.

I moduli della precedente versione sono conservati per consultazione, ma non vengono caricati dal nuovo punto d'ingresso. La nuova modalità cooperativa sostituisce spie, votazioni ed espulsioni con episodi condivisi.

Le illustrazioni originali in `img/campus-night.png`, `img/scientist-chibi.png` e `img/researcher-chibi.png` sono generate per questa revisione. Non sono fotografie o documenti storici. Nessuna dipendenza grafica esterna viene caricata dal browser.

Questo server è pensato per sessioni fidate in localhost/LAN, senza account; non include autenticazione o ripristino persistente delle stanze e non è configurato come servizio pubblico Internet. GitHub Pages può ospitare la parte singola, non il server multiplayer.
