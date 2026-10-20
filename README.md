# Manhattan Project — Los Alamos

Gioco stile **Among Us** sulla **Technical Area 1** (Manhattan Project / Project Y).

## Avvio — gioco singolo

```bash
cd project-y-game
python3 serve.py
```

Apri **http://127.0.0.1:8765**

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
4. L’**host** avvia quando ci sono almeno **2** giocatori.

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
