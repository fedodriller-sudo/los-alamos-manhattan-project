import { BrowserRoom } from "./peer-room.js";
import { PEER_OPTIONS, roomIdFrom } from "./peer-config.js";
const defaultFactory = async (id, options) => {
  const { Peer } = await import("./vendor/peerjs.js");
  return new Peer(id, options);
};
const connectionError = (error) =>
  Error(
    error?.type === "peer-unavailable"
      ? "L’host non è disponibile. Chiedigli di aprire la stanza e riprova."
      : "Collegamento non riuscito. Controlla Internet e riprova sulla stessa rete Wi‑Fi.",
  );
export class PeerSession {
  constructor(
    name,
    receive,
    onclose,
    {
      peerFactory = defaultFactory,
      timeoutMs = 25000,
      onstatus = () => {},
    } = {},
  ) {
    this.name =
      String(name || "")
        .trim()
        .slice(0, 24) || "Ricercatore";
    this.receive = receive;
    this.onclose = onclose;
    this.onstatus = onstatus;
    this.peerFactory = peerFactory;
    this.timeoutMs = timeoutMs;
    this.id = "la-" + crypto.randomUUID();
    this.peers = new Map();
    this.timers = new Set();
    this.closed = false;
    this.admitted = false;
    this.started = false;
  }
  get readyState() {
    return !this.closed && (this.room || (this.admitted && this.channel?.open))
      ? 1
      : 0;
  }
  later(fn, delay) {
    const timer = setTimeout(() => {
      this.timers.delete(timer);
      if (!this.closed) fn();
    }, delay);
    this.timers.add(timer);
    return timer;
  }
  untimer(timer) {
    clearTimeout(timer);
    this.timers.delete(timer);
  }
  async start(hostId, mode) {
    if (this.started || this.closed)
      throw Error("Collegamento già avviato o annullato.");
    this.started = true;
    this.hosting = !hostId;
    return new Promise((resolve, reject) => {
      this.rejectPending = reject;
      const timer = this.later(
        () =>
          this.fail(
            Error(
              "Tempo di collegamento scaduto. Controlla Internet, la stanza dell’host e la rete Wi‑Fi.",
            ),
          ),
        this.timeoutMs,
      );
      this.acceptPending = () => {
        this.untimer(timer);
        this.rejectPending = null;
        this.acceptPending = null;
        resolve();
      };
      Promise.resolve()
        .then(() => this.peerFactory(this.id, structuredClone(PEER_OPTIONS)))
        .then((peer) => {
          if (this.closed) {
            peer.destroy();
            return;
          }
          this.peer = peer;
          peer.on("open", () => {
            if (this.closed) return;
            if (this.admitted)
              this.onstatus("Collegamento agli inviti ripristinato.");
            if (this.hosting) {
              if (!this.room) {
                this.room = new BrowserRoom(
                  this.id,
                  this.name,
                  (id, m) => {
                    if (id === this.id)
                      queueMicrotask(() => {
                        if (!this.closed) this.receive(m);
                      });
                    else this.write(this.peers.get(id), m);
                  },
                  { mode },
                );
                this.acceptPending?.();
              } else this.onstatus("Collegamento agli inviti ripristinato.");
            } else if (!this.channel) {
              this.channel = peer.connect(hostId, {
                label: "los-alamos-v2",
                serialization: "json",
                reliable: true,
              });
              this.wireGuest(this.channel);
            }
          });
          peer.on("connection", (ch) =>
            this.hosting && this.room ? this.wireHost(ch) : ch.close(),
          );
          peer.on("disconnected", () => {
            if (this.closed) return;
            // PeerJS preserves established data channels when only signaling is lost.
            this.onstatus(
              "Internet interrotto: la partita collegata continua. Nuovi ingressi in attesa.",
            );
            this.reconnect();
          });
          peer.on("error", (e) => {
            if (this.closed) return;
            if (this.rejectPending) this.fail(connectionError(e));
            else if (
              [
                "network",
                "socket-error",
                "socket-closed",
                "server-error",
              ].includes(e.type)
            )
              this.reconnect();
          });
          peer.on("close", () => {
            if (!this.closed)
              this.fail(
                Error(
                  "Collegamento chiuso. Apri una nuova stanza per ricominciare.",
                ),
              );
          });
        })
        .catch((e) => this.fail(e));
    });
  }
  reconnect() {
    if (this.closed || this.reconnectTimer || this.peer?.destroyed) return;
    this.reconnectTimer = this.later(() => {
      this.reconnectTimer = null;
      if (this.peer?.disconnected && !this.peer.destroyed) {
        try {
          this.peer.reconnect();
        } catch {
          this.reconnect();
        }
      }
    }, 3000);
  }
  host(mode = "race") {
    return this.start(null, mode);
  }
  join(value) {
    return this.start(roomIdFrom(value), "race");
  }
  read(raw) {
    if (typeof raw !== "string" || raw.length > 16384) return null;
    try {
      const m = JSON.parse(raw);
      return m && typeof m === "object" && !Array.isArray(m) ? m : null;
    } catch {
      return null;
    }
  }
  write(ch, m) {
    if (
      ch?.open &&
      (!(m.type === "move" || m.type === "player_move") ||
        (ch.dataChannel?.bufferedAmount || 0) < 65536)
    )
      ch.send(JSON.stringify(m));
  }
  wireHost(ch) {
    if (this.closed || this.peers.has(ch.peer) || this.peers.size >= 15) {
      ch.close();
      return;
    }
    this.peers.set(ch.peer, ch);
    let admitted = false;
    // PeerJS emits close only for opened channels. Cleanup must also handle failed ICE.
    const cleanup = () => {
      this.untimer(timer);
      if (this.peers.get(ch.peer) !== ch) return;
      this.peers.delete(ch.peer);
      if (!this.closed && admitted) this.room.remove(ch.peer);
    };
    const release = () => {
      cleanup();
      ch.close();
    };
    const timer = this.later(release, 10000);
    ch.on("data", (raw) => {
      if (this.closed || this.peers.get(ch.peer) !== ch) return;
      const m = this.read(raw);
      if (!m) return;
      if (!admitted) {
        if (m.type !== "hello") return;
        this.untimer(timer);
        admitted = this.room.add(ch.peer, m.name);
        if (!admitted) {
          this.write(ch, {
            type: "error",
            message: "La stanza è piena: massimo 8 giocatori.",
          });
          this.later(release, 250);
        }
      } else this.room.handle(ch.peer, m);
    });
    ch.on("error", release);
    ch.on("close", cleanup);
  }
  wireGuest(ch) {
    ch.on("open", () => {
      if (!this.closed) this.write(ch, { type: "hello", name: this.name });
    });
    ch.on("data", (raw) => {
      if (this.closed) return;
      const m = this.read(raw);
      if (!m) return;
      if (!this.admitted) {
        if (m.type === "error") {
          this.fail(Error(m.message));
          return;
        }
        if (m.type !== "room_joined") return;
        this.admitted = true;
        this.acceptPending?.();
      }
      this.receive(m);
    });
    ch.on("error", (e) => this.fail(connectionError(e)));
    ch.on("close", () => {
      if (!this.closed)
        this.fail(
          Error(
            "L’host si è scollegato. Chiedi un nuovo invito per ricominciare.",
          ),
        );
    });
  }
  send(raw) {
    if (this.readyState !== 1) return;
    const m = this.read(raw);
    if (!m) return;
    if (this.room) this.room.handle(this.id, m);
    else this.write(this.channel, m);
  }
  fail(error) {
    if (this.closed) return;
    const waiting = !!this.rejectPending;
    this.close(error);
    if (!waiting) this.onclose(error.message);
  }
  close(error = Error("Collegamento annullato.")) {
    if (this.closed) return;
    this.closed = true;
    this.rejectPending?.(error);
    this.rejectPending = null;
    this.acceptPending = null;
    for (const timer of this.timers) clearTimeout(timer);
    this.timers.clear();
    this.channel?.close();
    for (const ch of this.peers.values()) ch.close();
    this.peers.clear();
    this.peer?.destroy();
  }
}
