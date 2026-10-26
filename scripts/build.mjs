import { mkdir, rm, cp, writeFile } from "node:fs/promises";
await rm("dist", { recursive: true, force: true });
await mkdir("dist");
const assets = [
  "index.html",
  "manifest.webmanifest",
  "sw.js",
  "icons/icon.svg",
  "css/nightshift.css",
  "js/nightshift.js",
  "js/history-data.js",
  "js/progress.js",
  "js/peer-room.js",
  "js/peer-session.js",
  "js/peer-signaling.js",
  "img/campus-night.png",
  "img/scientist-chibi.png",
  "img/researcher-chibi.png",
];
for (const path of assets) {
  await mkdir("dist/" + path.split("/").slice(0, -1).join("/"), {
    recursive: true,
  });
  await cp(path, "dist/" + path);
}
await writeFile("dist/.nojekyll", "");
