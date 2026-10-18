#!/usr/bin/env node
// Extracts the attribute/section/button schema of a Roll20 character sheet from its HTML.
// Usage: node scripts/extract-sheet-schema.mjs <sheet-dir> [out.json]
//   <sheet-dir> = "Pathfinder Second Edition by Roll20" folder of Roll20/roll20-character-sheets
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";

const dir = resolve(process.argv[2] ?? "");
const out = resolve(process.argv[3] ?? "packages/schema-roll20/schema.json");
if (!process.argv[2]) {
  console.error("usage: extract-sheet-schema.mjs <sheet-dir> [out.json]");
  process.exit(2);
}

const sheetJson = JSON.parse(readFileSync(join(dir, "sheet.json"), "utf8"));
const html = readFileSync(join(dir, sheetJson.html), "utf8");

// Tokenise only the tags we care about, in document order, so we can track fieldset nesting.
const TAG = /<(\/?)(fieldset|input|select|textarea|span|button|label|div|option)\b([^>]*)>/gi;
const attr = (s, name) => {
  const m = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i").exec(s);
  return m ? (m[1] ?? m[2]) : undefined;
};

const top = new Set();
const sections = new Map(); // section -> { attrs:Set, buttons:Set, actions:Set }
const buttons = new Set();
const actions = new Set();
const selects = new Map(); // attr -> Set(values)
const stack = [];
let currentSelect;

const sec = (name) => {
  if (!sections.has(name)) sections.set(name, { attrs: new Set(), buttons: new Set(), actions: new Set() });
  return sections.get(name);
};

for (const m of html.matchAll(TAG)) {
  const [, closing, tag, rest] = m;
  const t = tag.toLowerCase();
  if (t === "fieldset") {
    if (closing) stack.pop();
    else {
      const cls = (attr(rest, "class") ?? "").split(/\s+/).find((c) => c.startsWith("repeating_"));
      stack.push(cls ? cls.slice("repeating_".length) : null);
    }
    continue;
  }
  if (closing) {
    if (t === "select") currentSelect = undefined;
    continue;
  }
  const where = stack.findLast((s) => s) ?? null;
  const name = attr(rest, "name");
  if (name?.startsWith("attr_")) {
    const a = name.slice(5);
    (where ? sec(where).attrs : top).add(a);
    if (t === "select") {
      currentSelect = a;
      selects.set(a, selects.get(a) ?? new Set());
    }
  }
  if (t === "option" && currentSelect) {
    const v = attr(rest, "value");
    if (v !== undefined) selects.get(currentSelect).add(v);
  }
  if (name?.startsWith("roll_")) (where ? sec(where).buttons : buttons).add(name.slice(5));
  if (name?.startsWith("act_")) (where ? sec(where).actions : actions).add(name.slice(4));
}

let commit = "unknown";
try {
  commit = execFileSync("git", ["-C", dir, "log", "-1", "--format=%H %cs", "--", "."], { encoding: "utf8" }).trim();
} catch {}

const sorted = (s) => [...s].sort();
const schema = {
  generatedFrom: { sheet: basename(dir), commit, htmlBytes: html.length },
  attributes: sorted(top),
  buttons: sorted(buttons),
  actions: sorted(actions),
  sections: Object.fromEntries(
    [...sections].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [
      k,
      { attributes: sorted(v.attrs), buttons: sorted(v.buttons), actions: sorted(v.actions) },
    ]),
  ),
  selects: Object.fromEntries([...selects].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, sorted(v)])),
};

writeFileSync(out, JSON.stringify(schema, null, 2) + "\n");
console.log(
  `${out}: ${schema.attributes.length} attributes, ${schema.buttons.length} buttons, ` +
    `${Object.keys(schema.sections).length} repeating sections`,
);
