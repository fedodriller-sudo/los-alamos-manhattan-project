import { assets } from "./assets.mjs";
import { createHash } from "node:crypto";
import { mkdir, rm, cp, writeFile, readFile } from "node:fs/promises";
await rm("dist", { recursive: true, force: true });
await mkdir("dist");

for (const path of assets) {
  await mkdir("dist/" + path.split("/").slice(0, -1).join("/"), {
    recursive: true,
  });
  await cp(path, "dist/" + path);
}
await writeFile("dist/.nojekyll", "");

const manifest = await Promise.all(
  assets.map(async (path) => ({
    path,
    hash: createHash("sha256")
      .update(await readFile("dist/" + path))
      .digest("hex"),
  })),
);
const template = await readFile("sw.js", "utf8");
const release = createHash("sha256")
  .update(JSON.stringify(manifest) + template)
  .digest("hex");
const worker = template
  .replace('"BUILD_RELEASE"', JSON.stringify(release))
  .replace("/* BUILD_ASSETS */ []", JSON.stringify(manifest, null, 2));
await writeFile("dist/sw.js", worker);
console.log(
  `Release ${release.slice(0, 12)}: ${assets.length} verified assets`,
);
