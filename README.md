# Manhattan Project — Los Alamos

Gioco stile **Among Us** sulla **Technical Area 1** (Manhattan Project / Project Y).

## Avvio — gioco singolo

```bash
cd project-y-game
python3 serve.py
```

Apri **http://127.0.0.1:8765**

### Installa come app (Product Design incluso)

Non c’è un’app separata «Product Design» da scaricare: l’interfaccia dossier (obiettivi + minigiochi) è già in `mission-ui.js` e `css/product-design.css`.

1. Avvia il server come sopra.
2. Nel menu principale usa **Installa app** (Chrome/Edge su desktop o Android), oppure dal menu del browser **Installa / Aggiungi a schermo Home**.
3. Su **iPhone**: Condividi → Aggiungi a Home (il service worker non si registra in locale su `127.0.0.1`; per offline piena installa da un URL HTTPS in rete).

Il multigiocatore richiede comunque il server Node (`server/`) raggiungibile da tutti i giocatori.

## Avvio — multigiocatore online

Serve **Node.js** sul computer che fa da host (stessa porta del sito + WebSocket):

```bash
cd project-y-game/server
npm install
npm start
```

1. Tutti aprono lo **stesso URL** (es. `http://192.168.1.10:8765` se l’host è sulla LAN).
2. Dal menu: **Multigiocatore online** → un giocatore **Crea stanza** e condivide il **codice a 6 caratteri**.
3. Gli altri inseriscono codice + nome e **Entra**.
4. L’**host** avvia quando ci sono almeno **3** giocatori.

### Come funziona (MVP)

- Obiettivi del **personale condivisi** nella stanza (una missione completata vale per tutti).
- Vedi gli **altri giocatori** muoversi sulla mappa.
- **~30% spie** e **~70% personale** (minimo **3** giocatori per avviare).
- **Riunione d’emergenza**: voto per espellere un sospetto; se espelli tutte le spie vince il personale.
- Mappa ampia **3600×2700** senza etichette: i luoghi si vedono come pin; nome e descrizione nel pannello vicino / missioni.
- La spia sincronizza furto intel e dispatch con il server.
- **Non** c’è ancora: anti-cheat, reconnect in partita, sabotaggi.
- Il salvataggio **localStorage** è disattivato in modalità online.

## Stato (v0.4)

- Ruoli: **Personale del Progetto** vs **Spia sovietica**
- **3 missioni ★** critiche alla Direzione Project Y
- Spia: copia documenti + **Dispatch a Mosca**
- Vittoria staff: **12** obiettivi (su **100+** missioni) + **3** critici ★
- **Importante:** apri via HTTP (non doppio-click su `index.html`)

## Prossimi passi

- Riunioni d’emergenza sincronizzate / votazione
- Sabotaggi (ruolo dedicato)
- S-Site, V-Site, Gun Site come seconda mappa

Obiettivi definiti in `js/tasks-data.js`.

## Pubblicare su GitHub

Il progetto è già un repository Git in questa cartella (`main` con commit iniziale).

### 1. Crea il repository su GitHub

1. Vai su [github.com/new](https://github.com/new).
2. Nome suggerito: `manhattan-project-los-alamos` (o come preferisci).
3. **Non** aggiungere README, `.gitignore` o licenza (li hai già in locale).
4. Crea il repository vuoto.

### 2. Collega e carica dal terminale

Sostituisci `TUO-USER` e `NOME-REPO`:

```bash
cd /Users/fedya/enderlight-end/project-y-game
git remote add origin https://github.com/TUO-USER/NOME-REPO.git
git push -u origin main
```

Con **GitHub CLI** (se installi `gh` e fai `gh auth login`):

```bash
cd /Users/fedya/enderlight-end/project-y-game
gh repo create NOME-REPO --public --source=. --remote=origin --push
```

### Giocare online da GitHub

- **GitHub Pages** può servire solo i file statici: il **multigiocatore** (WebSocket) richiede un server Node sempre acceso (Railway, Render, Fly.io, VPS, o il tuo PC con `npm start`).
- In locale o su un VPS: `cd server && npm install && npm start` e apri la porta **8765**.
