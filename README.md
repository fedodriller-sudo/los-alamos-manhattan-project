# Los Alamos — Il turno di notte

Un piccolo gioco browser in italiano: esplora una Los Alamos cartoon notturna e attraversa otto episodi ispirati alla vita del laboratorio tra il 1943 e il 1945. Facile, senza timer o penalità. Da soli oppure in cooperativa locale da **2 a 8 persone**.

## Gioca dal browser

La versione attuale è statica: singolo e cooperativa WebRTC funzionano su GitHub Pages, senza Node sul computer dei giocatori. Il workflow **Publish browser game** esegue test, crea il pacchetto pubblico e pubblica con GitHub Actions dai rami `codex/los-alamos-nightshift` e `main`. Il proprietario ha attivato Pages con sorgente GitHub Actions.

### Cooperativa LAN (2–8)

1. Tutti aprono il sito HTTPS sulla stessa rete. L’host sceglie **Gioca con gli amici → Crea una stanza**.
2. L’host genera un invito distinto per ciascun collega e lo condivide privatamente.
3. Il collega apre il link oppure lo incolla nel campo invito, inserisce il nome e preme **Entra**. Copia la risposta mostrata e la restituisce all’host.
4. L’host incolla la risposta e preme **Collega il collega**, poi avvia il turno quando sono presenti almeno due persone.

Gli inviti non collegati possono essere annullati senza espellere i presenti. Non servono account, server di gioco, signaling, STUN o TURN. La connessione avviene direttamente fra browser tramite DataChannel WebRTC. L’host verifica risposte e progressi. Una persona può entrare anche dopo l’avvio.

**L’host deve tenere aperta la scheda**: se la chiude la partita termina, senza trasferimento automatico. I progressi cooperativi restano in memoria; il diario singolo salvato non viene sovrascritto. Reti ospiti con isolamento dei dispositivi, firewall o browser che impediscono WebRTC possono bloccare il collegamento. Il test eseguito usa due schede reali sullo stesso computer; non certifica ogni router LAN o browser mobile. Gli inviti contengono dati di collegamento: condividili solo con i partecipanti.

### Anteprima e build

```sh
npm run build
python3 -m http.server 8877 --bind 127.0.0.1 --directory dist
```

Apri http://localhost:8877. Node 20+ è necessario solo per build e test; Python è un’opzione per servire l’anteprima statica. Il pacchetto `dist` contiene esclusivamente gli asset pubblici. I percorsi relativi supportano la sottocartella del repository su Pages.

Il vecchio server Node è conservato per consultazione e test di regressione, ma la nuova interfaccia non usa WebSocket e il server non viene pubblicato.

## Come si gioca

- **WASD/frecce** per muoverti, **E** per interagire.
- Tocca un episodio o un luogo per raggiungerlo automaticamente; durante il tragitto puoi usare il pulsante di interazione per arrivare subito.
- Scegli una risposta, consulta un indizio se vuoi e riprova senza penalità.
- Completa un capitolo per sbloccare il successivo: 1943, 1944, 1945.
- Nel **Diario** trovi fatti documentati, fonti e limiti della ricostruzione.
- Nelle **Impostazioni** regoli suoni, volume e movimento ridotto. Il sistema rispetta anche `prefers-reduced-motion`.

Il turno singolo si salva sul browser dopo ogni risposta corretta. **Riprendi il diario salvato** recupera i progressi. Su HTTPS/localhost il service worker conserva gli asset per l’esplorazione offline dopo il primo caricamento. Il collegamento cooperativo richiede che il browser host resti raggiungibile.

Il campus comprende colleghi in movimento, particelle notturne, animazioni di respiro e camminata, transizioni e movimento libero con un tocco. Le animazioni decorative si disattivano con movimento ridotto. Gli NPC sono comparse artistiche, senza attribuzioni a persone storiche.

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

