import { BrowserRoom } from "./peer-room.js";
import { encode, decode } from "./peer-signaling.js";
async function complete(pc) {
  if (pc.iceGatheringState === "complete") return;
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(Error("La rete non ha prodotto un invito. Riprova."));
    }, 12000);
    const check = () => {
      if (pc.iceGatheringState === "complete") {
        cleanup();
        resolve();
      }
    };
    const cleanup = () => {
      clearTimeout(timer);
      pc.removeEventListener("icegatheringstatechange", check);
    };
    pc.addEventListener("icegatheringstatechange", check);
    check();
  });
}
export class PeerSession {
  constructor(name, receive, onclose) {
    this.name = name;
    this.receive = receive;
    this.onclose = onclose;
    this.peers = new Map();
    this.closed = false;
    this.id = crypto.randomUUID();
  }
  get readyState() {
    return !this.closed && (this.room || this.channel?.readyState === "open")
      ? 1
      : 0;
  }
  host() {
    this.room = new BrowserRoom(this.id, this.name, (id, m) => {
      if (id === this.id)
        queueMicrotask(() => {
          if (!this.closed) this.receive(m);
        });
      else this.write(this.peers.get(id)?.channel, m);
    });
  }
  write(ch, m) {
    if (ch?.readyState === "open" && ch.bufferedAmount < 65536)
      ch.send(JSON.stringify(m));
  }
  send(raw) {
    const m = JSON.parse(raw);
    if (this.room) this.room.handle(this.id, m);
    else this.write(this.channel, m);
  }
  wire(pc, ch, id, name) {
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed") {
        ch.close();
        pc.close();
      }
    };
    ch.onmessage = (ev) => {
      if (typeof ev.data !== "string" || ev.data.length > 16384) return;
      try {
        const m = JSON.parse(ev.data);
        if (this.room) this.room.handle(id, m);
        else this.receive(m);
      } catch {}
    };
    ch.onopen = () => {
      if (this.room && !this.room.add(id, name())) {
        ch.close();
        pc.close();
      }
    };
    ch.onclose = () => {
      if (this.closed) return;
      if (this.room) {
        this.room.remove(id);
        this.peers.delete(id);
      } else this.onclose();
    };
  }
  cancelInvites() {
    for (const [id, p] of this.peers)
      if (p.channel?.readyState !== "open") {
        p.pc.close();
        this.peers.delete(id);
      }
  }
  async invite() {
    if (!this.room) throw Error("Crea prima la stanza.");
    if (this.peers.size >= 7)
      throw Error(
        "Massimo 8 persone. Annulla un invito inutilizzato prima di continuare.",
      );
    const id = crypto.randomUUID(),
      pc = new RTCPeerConnection({ iceServers: [] }),
      ch = pc.createDataChannel("laboratorio");
    const p = { pc, channel: ch, name: "Ricercatore" };
    this.peers.set(id, p);
    this.wire(pc, ch, id, () => p.name);
    try {
      await pc.setLocalDescription(await pc.createOffer());
      await complete(pc);
      if (this.closed) throw Error("Stanza chiusa.");
      return encode({ v: 1, id, type: "offer", sdp: pc.localDescription.sdp });
    } catch (e) {
      pc.close();
      this.peers.delete(id);
      throw e;
    }
  }
  async join(text) {
    const v = decode(text, "offer"),
      pc = new RTCPeerConnection({ iceServers: [] });
    this.peers.set(v.id, { pc });
    pc.ondatachannel = (e) => {
      this.channel = e.channel;
      this.wire(pc, e.channel, v.id, () => this.name);
    };
    await pc.setRemoteDescription({ type: "offer", sdp: v.sdp });
    await pc.setLocalDescription(await pc.createAnswer());
    await complete(pc);
    if (this.closed) throw Error("Collegamento annullato.");
    return encode({
      v: 1,
      id: v.id,
      type: "answer",
      sdp: pc.localDescription.sdp,
      name: this.name,
    });
  }
  async accept(text) {
    const v = decode(text, "answer"),
      p = this.peers.get(v.id);
    if (!p || p.accepted)
      throw Error("Risposta già usata o destinata a un altro invito.");
    await p.pc.setRemoteDescription({ type: "answer", sdp: v.sdp });
    p.name = typeof v.name === "string" ? v.name.slice(0, 24) : "Ricercatore";
    p.accepted = true;
  }
  close() {
    this.closed = true;
    for (const p of this.peers.values()) p.pc.close();
    this.peers.clear();
  }
}
