import { build } from "esbuild";
import { copyFile, readFile, writeFile } from "node:fs/promises";
const packages = new Set();
for (const [name, contents] of Object.entries({
  peerjs: 'export { Peer } from "peerjs";',
  qrcode:
    'import QRCode from "qrcode/lib/browser.js"; export const toDataURL = QRCode.toDataURL;',
})) {
  const result = await build({
    metafile: true,
    stdin: { contents, resolveDir: process.cwd() },
    bundle: true,
    minify: true,
    format: "esm",
    platform: "browser",
    target: ["es2020"],
    outfile: `js/vendor/${name}.js`,
    legalComments: "eof",
  });
  for (const input of Object.keys(result.metafile.inputs)) {
    const match = input.match(/^(node_modules\/(?:@[^/]+\/)?[^/]+)\//);
    if (match) packages.add(match[1]);
  }
  await copyFile(`node_modules/${name}/LICENSE`, `js/vendor/${name}.LICENSE`);
}

const notices = [];
for (const path of [...packages].sort()) {
  const pkg = JSON.parse(await readFile(path + "/package.json", "utf8"));
  let license;
  for (const file of [
    "LICENSE",
    "LICENSE.md",
    "LICENSE.txt",
    "license",
    "LICENSE-MIT",
  ]) {
    try {
      license = await readFile(path + "/" + file, "utf8");
      break;
    } catch {}
  }
  if (!license) throw Error("Missing bundled license: " + path);
  notices.push(`${pkg.name} ${pkg.version}\n${license}`);
}
await writeFile(
  "js/vendor/THIRD-PARTY-LICENSES.txt",
  notices.join("\n\n---\n\n"),
);
