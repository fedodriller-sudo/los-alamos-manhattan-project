# Los Alamos — Il turno di notte

Un piccolo gioco browser in italiano: esplora una Los Alamos cartoon notturna e attraversa otto episodi ispirati alla vita del laboratorio tra il 1943 e il 1945. La campagna singola è facile, senza timer. In LAN si gioca **Personale contro Spie, da 2 a 8 persone**, con attività brevi e ripetibili.

## Gioca dal browser

La versione attuale è statica: singolo e gara a squadre WebRTC funzionano su GitHub Pages, senza Node sul computer dei giocatori. Il workflow **Publish browser game** esegue test, crea il pacchetto pubblico e pubblica con GitHub Actions dai rami `codex/los-alamos-nightshift` e `main`. Il proprietario ha attivato Pages con sorgente GitHub Actions.

### Personale contro Spie in LAN (2–8)

1. L’host apre il sito HTTPS e sceglie **Gioca con gli amici → Crea una stanza**.
2. Condivide **lo stesso link o QR** con tutti (fino a 7 ospiti). Gli amici aprono il link, inseriscono il nome e premono **Entra**: nessuna risposta da copiare.
3. Ciascuno sceglie **Personale** o **Spie**. Serve almeno una persona per squadra; l’host avvia il turno.
4. Vince chi completa per primo **tutte** le proprie missioni: 4 per il Personale, 3 per le Spie. La schermata finale appare a tutti; solo l’host può avviare la rivincita.

**Giocate sulla stessa rete Wi-Fi oppure collegatevi all’hotspot di un amico. Serve una connessione Internet per entrare nella stanza.** La rete condivisa è consigliata: anche reti diverse possono funzionare, ma NAT o firewall restrittivi possono impedirlo. Reti ospiti e hotspot con isolamento dei dispositivi possono bloccare il collegamento.

PeerJS Cloud offre il servizio di incontro fra browser; riceve identificativi casuali e dati tecnici di connessione. STUN aiuta il collegamento diretto; nessun TURN è configurato e non è garantito il funzionamento su qualsiasi rete. Nomi e partita viaggiano sul DataChannel WebRTC, senza metadata personali al broker. Il QR viene generato localmente. L’host verifica risposte e progressi; una persona può entrare anche dopo l’avvio. Se il broker si scollega, i canali già aperti restano attivi e viene tentata la riconnessione per gli inviti.

**L’host deve tenere aperta la scheda**: se la chiude la partita termina, senza trasferimento automatico. La gara resta in memoria; il diario singolo salvato non viene sovrascritto. Il link è una chiave di accesso alla stanza: condividilo solo con chi vuoi invitare. Le prove reali usano più schede sullo stesso computer; non certificano dispositivi o reti fisiche diverse.

PeerJS **1.5.5** e QRCode **1.5.4** sono inclusi in `js/vendor` con licenze MIT; nessun CDN runtime. `package-lock.json` fissa le dipendenze. Per rigenerare: `npm ci && npm run vendor`. La configurazione del broker è isolata in `js/peer-config.js` per un eventuale PeerServer futuro; non è necessario installarne uno per giocare.

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

Il turno singolo si salva sul browser dopo ogni risposta corretta. **Riprendi il diario salvato** recupera i progressi. Su HTTPS/localhost il service worker conserva gli asset per l’esplorazione offline dopo il primo caricamento. Il collegamento multiplayer richiede che il browser host resti raggiungibile.

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

I moduli della precedente versione sono conservati per consultazione, ma non vengono caricati dal nuovo punto d'ingresso. La gara a squadre usa missioni separate e un vincitore comune a tutti i client; non include votazioni o espulsioni. Il vecchio server WebSocket resta solo per regressione.

Le illustrazioni originali in `img/campus-night.png`, `img/scientist-chibi.png` e `img/researcher-chibi.png` sono generate per questa revisione. Non sono fotografie o documenti storici. Nessuna dipendenza grafica esterna viene caricata dal browser.

### Le sette missioni di squadra

Il Personale completa tre campioni stabili con deriva del segnale, un percorso con ostacoli e registro, una raccolta con deposito entro un limite simbolico, e otto controlli dei pass. Le Spie completano copia/nascondimento di un fascicolo, destinatario/timbro/consegna e sequenze di archivio. Gli errori consentono di riprovare.

I dettagli dei progressi vengono inviati soltanto ai compagni; gli avversari ricevono i conteggi delle missioni completate. L’host conserva lo stato autorevole e accetta solo le risposte della squadra del mittente, nel turno e passaggio correnti. Come ogni gioco statico ospitato da un partecipante, non offre protezione anticheat contro un host modificato o un client che ispeziona il codice pubblico.

La gara è una finzione storica: il dossier distingue i fatti dalle attività inventate, include fonti per Fuchs, Rosenberg e Seborer e precisa che l’incidente di Slotin risale al 1946. Le scale, i campioni e le sequenze sono simbolici.
