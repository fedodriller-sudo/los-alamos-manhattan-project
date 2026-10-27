import test from "node:test";
import assert from "node:assert/strict";
import { encode, decode } from "../js/peer-signaling.js";
test("signaling round-trips Unicode names and multiline SDP in a shared link", () => {
  const data = {
    v: 1,
    type: "offer",
    id: "peer",
    sdp: "v=0\r\n",
    name: "Ada 🔬 日本語",
  };
  assert.deepEqual(
    decode("https://example.test/game/#join=" + encode(data), "offer"),
    data,
  );
});
test("signaling rejects malformed, oversized, mismatched and null packets", () => {
  for (const token of [
    "bad",
    encode(null),
    encode([]),
    "a".repeat(50001),
    encode({ v: 1, type: "answer", id: "p", sdp: "v=0" }),
    encode({ v: 1, type: "offer", id: {}, sdp: "v=0" }),
  ])
    assert.throws(() => decode(token, "offer"));
});
