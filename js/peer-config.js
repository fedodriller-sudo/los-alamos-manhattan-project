// The sole signaling configuration: replace host/path here for a future PeerServer.
// No player names or game state are passed to the broker.
export const PEER_OPTIONS = Object.freeze({
  host: "0.peerjs.com",
  port: 443,
  path: "/",
  secure: true,
  config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
});
const ROOM_ID =
  /^la-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export function roomIdFrom(input) {
  let value = String(input || "").trim();
  if (!ROOM_ID.test(value)) {
    try {
      const url = new URL(value);
      value = new URLSearchParams(url.hash.slice(1)).get("room");
    } catch {
      /* Report one actionable validation error below. */
    }
  }
  if (!ROOM_ID.test(value))
    throw Error(
      "Invito non valido. Incolla il link della stanza ricevuto dall’host.",
    );
  return value;
}
export function roomLink(base, id) {
  const url = new URL(base);
  url.search = "";
  url.hash = "room=" + roomIdFrom(id);
  return url.href;
}
