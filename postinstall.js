#!/usr/bin/env node
/**
 * postinstall.js — downloads fonts and SFX from the remotion-animation-kit
 * GitHub repo into the consuming project's public/ directory.
 *
 * Runs automatically after `npm install remotion-animation-kit`.
 * Skips files that already exist so re-installs are fast.
 * Skips silently when run inside the kit's own development directory.
 */

const https = require("https");
const fs    = require("fs");
const path  = require("path");

// When npm runs postinstall for a dependency, process.cwd() is the *package*
// directory (node_modules/remotion-animation-kit/), NOT the project root.
// We derive the project root by walking two levels up from __dirname:
//   __dirname = <project>/node_modules/remotion-animation-kit
//   projectRoot = <project>
// Guard: skip when developing the kit itself (not inside node_modules).
const isInstalledAsDep = __dirname.includes("node_modules");
if (!isInstalledAsDep) {
  console.log("[remotion-animation-kit] postinstall: skipping (running in kit dev mode).");
  process.exit(0);
}

const projectRoot  = path.resolve(__dirname, "../..");
const manifestPath = path.join(__dirname, "assets-manifest.json");
const manifest     = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    const file = fs.createWriteStream(destPath + ".tmp");

    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(destPath + ".tmp");
        return download(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath + ".tmp");
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      res.pipe(file);
      file.on("finish", () => {
        file.close();
        fs.renameSync(destPath + ".tmp", destPath);
        resolve();
      });
    }).on("error", (err) => {
      file.close();
      if (fs.existsSync(destPath + ".tmp")) fs.unlinkSync(destPath + ".tmp");
      reject(err);
    });
  });
}

async function main() {
  console.log("[remotion-animation-kit] Installing assets into public/ ...");

  let downloaded = 0;
  let skipped    = 0;

  for (const { src, dest } of manifest.assets) {
    const destPath = path.join(projectRoot, dest);

    if (fs.existsSync(destPath)) {
      skipped++;
      continue;
    }

    const url = `${manifest.baseUrl}/${src}`;
    process.stdout.write(`  ↓ ${dest} ... `);
    try {
      await download(url, destPath);
      process.stdout.write("done\n");
      downloaded++;
    } catch (err) {
      process.stdout.write(`FAILED (${err.message})\n`);
    }
  }

  console.log(`[remotion-animation-kit] Assets ready: ${downloaded} downloaded, ${skipped} already present.`);
}

main();
