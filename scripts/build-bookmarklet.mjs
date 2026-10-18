#!/usr/bin/env node
// Builds mobile/spike-panel.bookmarklet.txt (a single `javascript:` line) from mobile/spike-panel.js.
import { readFileSync, writeFileSync } from "node:fs";
import { transformSync } from "esbuild";

const src = readFileSync(new URL("../mobile/spike-panel.js", import.meta.url), "utf8");
const { code } = transformSync(src, { minify: true, target: "es2019" });
const out = "javascript:" + encodeURIComponent(code.trim()).replace(/%20/g, " ").replace(/%3B/g, ";");
writeFileSync(new URL("../mobile/spike-panel.bookmarklet.txt", import.meta.url), out + "\n");
console.log(`bookmarklet: ${out.length} chars`);
