export const encode = (x) =>
  btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(x))));
export function decode(text, type) {
  const raw = text.includes("#join=") ? text.split("#join=")[1] : text.trim();
  if (raw.length > 50000) throw Error("Invito troppo lungo.");
  let v;
  try {
    v = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(atob(raw), (c) => c.charCodeAt(0)),
      ),
    );
  } catch {
    throw Error("Invito o risposta non valido.");
  }
  if (
    !v ||
    v.v !== 1 ||
    v.type !== type ||
    typeof v.id !== "string" ||
    v.id.length > 64 ||
    typeof v.sdp !== "string" ||
    v.sdp.length > 30000
  )
    throw Error("Formato di collegamento non valido.");
  return v;
}
