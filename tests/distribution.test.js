import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { posix } from "node:path";
import { assets } from "../scripts/assets.mjs";
const root = new URL("../", import.meta.url);
const hash = (data) => createHash("sha256").update(data).digest("hex");
test("static build pins every distributed file and excludes PNG sources", async () => {
  execFileSync(process.execPath, ["scripts/build.mjs"], { cwd: root });
  const worker = await readFile(new URL("dist/sw.js", root), "utf8");
  const release = JSON.parse(worker.match(/const RELEASE = (".*?");/)[1]);
  const manifest = JSON.parse(
    worker.match(/const ASSETS = ([\s\S]*?);\nconst CACHE_PREFIX/)[1],
  );
  assert.deepEqual(
    manifest.map((entry) => entry.path),
    assets,
  );
  for (const entry of manifest)
    assert.equal(
      entry.hash,
      hash(await readFile(new URL("dist/" + entry.path, root))),
      entry.path,
    );
  assert.equal(
    release,
    hash(
      JSON.stringify(manifest) +
        (await readFile(new URL("sw.js", root), "utf8")),
    ),
  );
  assert.deepEqual((await readdir(new URL("dist/img/", root))).sort(), [
    "campus-night.webp",
    "researcher-chibi.webp",
    "scientist-chibi.webp",
  ]);
  for (const path of ["index.html", "js/nightshift.js", "css/nightshift.css"]) {
    const content = await readFile(new URL("dist/" + path, root), "utf8");
    assert.doesNotMatch(
      content,
      /(?:campus-night|scientist-chibi|researcher-chibi)\.png/,
    );
    for (const match of content.matchAll(
      /(?:campus-night|scientist-chibi|researcher-chibi)\.webp/g,
    ))
      assert.ok(assets.includes("img/" + match[0]));
  }
  // Follow local document/style/module references, including lazy QR imports.
  for (const path of assets.filter(
    (path) => /\.(html|css|js)$/.test(path) && !path.includes("/vendor/"),
  )) {
    const content = await readFile(new URL("dist/" + path, root), "utf8");
    const pattern = path.endsWith(".html")
      ? /(?:src|href)=["']([^"']+)["']/g
      : path.endsWith(".css")
        ? /url\(["']?([^"')]+)["']?\)/g
        : /(?:from\s+|import\s*\()["'](\.[^"']+)["']/g;
    for (const [, ref] of content.matchAll(pattern)) {
      if (/^(?:#|https?:|data:)/.test(ref)) continue;
      const target = posix.normalize(
        posix.join(posix.dirname(path), ref.split(/[?#]/)[0]),
      );
      assert.ok(
        assets.includes(target),
        `${path} references missing ${target}`,
      );
    }
  }
  // Rebuilding identical sources must not trigger a new worker install.
  execFileSync(process.execPath, ["scripts/build.mjs"], { cwd: root });
  assert.equal(await readFile(new URL("dist/sw.js", root), "utf8"), worker);
});
