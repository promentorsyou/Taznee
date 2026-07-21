#!/usr/bin/env node
/**
 * Internal-link checker for the static export. Crawls every .html file in
 * the build output, extracts internal <a href> links, and fails if any
 * points at a page that wasn't generated. Catches broken nav/footer links
 * (e.g. the Order History 404) before they ship.
 *
 * Usage: node scripts/check-links.mjs [outDir]   (default: out)
 * Auto-detects the GitHub Pages basePath (e.g. /Taznee) from asset URLs.
 */
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const outDir = process.argv[2] || "out";

if (!existsSync(outDir)) {
  console.error(`Link check: output dir "${outDir}" not found. Build first.`);
  process.exit(1);
}

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) files.push(...walk(full));
    else if (entry.endsWith(".html")) files.push(full);
  }
  return files;
}

// Detect basePath from the first "/<seg>/_next/" asset reference.
const indexHtml = existsSync(join(outDir, "index.html"))
  ? readFileSync(join(outDir, "index.html"), "utf8")
  : "";
const bpMatch = indexHtml.match(/["'](\/[^/"']+)\/_next\//);
const basePath = bpMatch ? bpMatch[1] : "";

function resolvesToFile(pathname) {
  // strip query/hash
  let p = pathname.split(/[?#]/)[0];
  if (basePath && p.startsWith(basePath)) p = p.slice(basePath.length) || "/";
  if (p === "/" || p === "") return existsSync(join(outDir, "index.html"));
  p = p.replace(/\/$/, ""); // drop trailing slash
  const candidates = [
    join(outDir, p, "index.html"),
    join(outDir, `${p}.html`),
    join(outDir, p), // direct asset (has extension)
  ];
  return candidates.some((c) => existsSync(c));
}

const htmlFiles = walk(outDir);
const broken = [];
let checked = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  for (const href of hrefs) {
    // only internal page links
    if (!href.startsWith("/")) continue; // external, mailto:, tel:, #, relative-asset
    if (href.startsWith("//")) continue; // protocol-relative external
    if (href.startsWith("/_next/")) continue; // build assets (checked implicitly)
    if (basePath && href.startsWith(`${basePath}/_next/`)) continue;
    checked++;
    if (!resolvesToFile(href)) {
      broken.push({ page: relative(outDir, file), href });
    }
  }
}

if (broken.length) {
  console.error(`\n❌ Link check FAILED — ${broken.length} broken internal link(s):`);
  for (const b of broken) console.error(`   ${b.href}  (in ${b.page})`);
  process.exit(1);
}
console.log(`✅ Link check passed — ${checked} internal links across ${htmlFiles.length} pages all resolve (basePath: "${basePath || "none"}").`);
