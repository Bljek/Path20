import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { mapPathbuilder } from "../src/index.js";

interface Schema {
  attributes: string[];
  sections: Record<string, { attributes: string[] }>;
  selects: Record<string, string[]>;
}
const read = (rel: string) => readFileSync(new URL(rel, import.meta.url), "utf8");
const schema: Schema = JSON.parse(read("../../schema-roll20/schema.json"));
const top = new Set(schema.attributes);

// Attributes the sheet defines in its sheet workers / hidden state rather than as visible fields.
const KNOWN_WORKER_ONLY = new Set(["sheet_type"]);

function check(name: string): string | null {
  const m = /^repeating_([a-z-]+)_-[-\w]{19}_(.+)$/.exec(name);
  if (!m) return top.has(name) || KNOWN_WORKER_ONLY.has(name) ? null : `unknown attribute "${name}"`;
  const [, section, field] = m as unknown as [string, string, string];
  const s = schema.sections[section];
  if (!s) return `unknown repeating section "${section}" (${name})`;
  return s.attributes.includes(field) ? null : `unknown field "${field}" in section "${section}"`;
}

describe("contract checker", () => {
  it("flags unknown attributes, sections and fields", () => {
    expect(check("level")).toBeNull();
    expect(check("bogus_attr")).toMatch(/unknown attribute/);
    expect(check("repeating_nope_-AAAAAAAAAAAAAAAAAAA_x")).toMatch(/unknown repeating section/);
    expect(check("repeating_lore_-AAAAAAAAAAAAAAAAAAA_lore_rank")).toBeNull();
    expect(check("repeating_lore_-AAAAAAAAAAAAAAAAAAA_nope")).toMatch(/unknown field/);
  });
});

describe("mapper output ↔ Roll20 sheet schema", () => {
  const fixtures = ["thorvag-runesmith-479743.json"];
  it.each(fixtures)("%s emits only attributes that exist in the sheet", (file) => {
    const result = mapPathbuilder(read(`../../../fixtures/${file}`), { seed: 7 });
    const problems = [...new Set(result.attributes.map((a) => check(a.name)).filter(Boolean))];
    expect(problems).toEqual([]);
  });

  it("emits <select> values the sheet actually offers", () => {
    const result = mapPathbuilder(read("../../../fixtures/thorvag-runesmith-479743.json"), { seed: 7 });
    const bad: string[] = [];
    for (const a of result.attributes) {
      const field = a.name.replace(/^repeating_[a-z-]+_-[-\w]{19}_/, "");
      const options = schema.selects[field];
      if (options?.length && !options.includes(a.current)) bad.push(`${field}=${a.current}`);
    }
    expect([...new Set(bad)]).toEqual([]);
  });
});
