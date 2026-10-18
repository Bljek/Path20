import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { abilityModifier, mapPathbuilder, parsePathbuilder } from "../src/index.js";

const fixture = readFileSync(
  new URL("../../../fixtures/thorvag-runesmith-479743.json", import.meta.url),
  "utf8",
);
const result = mapPathbuilder(fixture, { seed: 1 });
const attr = (name: string) => result.attributes.find((a) => a.name === name)?.current;
const rows = (section: string) =>
  result.attributes.filter((a) => a.name.startsWith(`repeating_${section}_`));

describe("parsePathbuilder", () => {
  it("accepts the json.php envelope and a bare build", () => {
    const envelope = JSON.parse(fixture);
    expect(parsePathbuilder(envelope).name).toBe("Thorvag");
    expect(parsePathbuilder(envelope.build).name).toBe("Thorvag");
  });

  it("rejects garbage with a readable error", () => {
    expect(() => parsePathbuilder({ foo: 1 })).toThrow(/Not a valid Pathbuilder/);
    expect(() => parsePathbuilder("{")).toThrow();
  });
});

describe("abilityModifier", () => {
  it.each([[8, -1], [10, 0], [11, 0], [18, 4], [9, -1]])("%i → %i", (s, m) => {
    expect(abilityModifier(s)).toBe(m);
  });
});

describe("mapPathbuilder (Thorvag, Runesmith 9)", () => {
  it("maps identity", () => {
    expect(result.name).toBe("Thorvag");
    expect(attr("level")).toBe("9");
    expect(attr("class")).toBe("Runesmith");
    expect(attr("ancestry_heritage")).toBe("Anvil Dwarf");
    expect(attr("background")).toBe("Artisan");
    expect(attr("languages")).toBe("Common, Dwarven");
    expect(attr("speed")).toBe("20");
  });

  it('drops "Not set" values', () => {
    expect(attr("deity")).toBeUndefined();
    expect(attr("age")).toBeUndefined();
    expect(attr("gender_pronouns")).toBeUndefined();
  });

  it("maps scores and modifiers", () => {
    expect(attr("strength")).toBe("18");
    expect(attr("strength_modifier")).toBe("4");
    expect(attr("dexterity_modifier")).toBe("0");
    expect(attr("constitution_modifier")).toBe("3");
    expect(attr("class_dc_key_ability_select")).toBe("@{intelligence_modifier}");
  });

  it("computes hit points like the sheet does", () => {
    expect(attr("hit_points_ancestry")).toBe("10");
    expect(attr("hit_points_class")).toBe("8");
    expect(attr("hit_points_max")).toBe("109"); // 10 + 9 * (8 + 3)
  });

  it("maps ranks 1:1 and item bonuses", () => {
    expect(attr("crafting_rank")).toBe("6");
    expect(attr("athletics_rank")).toBe("4");
    expect(attr("thievery_rank")).toBe("0");
    expect(attr("saving_throws_reflex_rank")).toBe("4");
    expect(attr("armor_class_medium_rank")).toBe("2");
    expect(attr("crafting_item")).toBe("1");
    expect(attr("nature_item")).toBeUndefined();
  });

  it("creates feat, lore and item rows with unique ids", () => {
    expect(rows("lore").filter((a) => a.name.endsWith("_lore_name")).map((a) => a.current)).toEqual(["Smithing", "Guild"]);
    expect(rows("feat-class").filter((a) => a.name.endsWith("_feat_class")).map((a) => a.current)).toEqual([
      "Smithing Weapons", "Glyph Familiar", "Engraving Strike", "Runic Tattoo", "Swiping Trace",
    ]);
    expect(rows("feat-skill")).toHaveLength(4 * 2);
    expect(rows("items-worn").map((a) => a.current)).toContain("Wayfinder");
    expect(rows("items-other").map((a) => a.current)).toContain("Aeon Stone (Pearly White Spindle)");
    const ids = result.attributes
      .filter((a) => a.name.startsWith("repeating_"))
      .map((a) => /^repeating_[a-z-]+_(-[-\w]{19})_/.exec(a.name)?.[1]);
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBeGreaterThan(30);
  });

  it("maps weapons", () => {
    const hammer = rows("melee-strikes").filter((a) => a.name.endsWith("_weapon"));
    expect(hammer.map((a) => a.current)).toEqual(["Storm Hammer", "Warhammer", "Scimitar"]);
    const id = /^repeating_melee-strikes_(-[-\w]{19})_/.exec(hammer[0]!.name)?.[1];
    const get = (f: string) => result.attributes.find((a) => a.name === `repeating_melee-strikes_${id}_${f}`)?.current;
    expect(get("weapon_rank")).toBe("4");
    expect(get("weapon_item")).toBe("1");
    expect(get("damage_dice")).toBe("2"); // striking
    expect(get("damage_dice_size")).toBe("D8");
    expect(get("damage_b")).toBe("1");
    expect(get("damage_s")).toBe("0");
    expect(get("damage_additional")).toBe("+1 Electricity");
  });

  it("maps money and keeps unmapped data in bio/warnings", () => {
    expect(attr("gp")).toBe("385");
    expect(result.bio).toContain("Familiar: Glyph Familiar");
    expect(result.bio).toContain("Runic Magic");
    expect(result.warnings.some((w) => w.includes("Swordstealer Shield"))).toBe(true);
  });

  it("is deterministic for a given seed", () => {
    expect(mapPathbuilder(fixture, { seed: 1 })).toEqual(result);
    expect(mapPathbuilder(fixture, { seed: 2 })).not.toEqual(result);
  });
});
