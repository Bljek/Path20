import { newRowId, seededRandom } from "./ids.js";
import { parsePathbuilder, type PathbuilderBuild } from "./schema.js";
import type { Roll20Attribute, Roll20Character } from "./types.js";

const ABILITIES = [
  ["str", "strength"], ["dex", "dexterity"], ["con", "constitution"],
  ["int", "intelligence"], ["wis", "wisdom"], ["cha", "charisma"],
] as const;

const SKILLS = [
  "acrobatics", "arcana", "athletics", "crafting", "deception", "diplomacy",
  "intimidation", "medicine", "nature", "occultism", "performance", "religion",
  "society", "stealth", "survival", "thievery",
] as const;

const SAVES = [
  ["fortitude", "saving_throws_fortitude"],
  ["reflex", "saving_throws_reflex"],
  ["will", "saving_throws_will"],
] as const;

const ARMOR_RANKS = [
  ["unarmored", "armor_class_unarmored_rank"],
  ["light", "armor_class_light_rank"],
  ["medium", "armor_class_medium_rank"],
  ["heavy", "armor_class_heavy_rank"],
] as const;

const STRIKING_DICE: Record<string, number> = {
  "": 1, striking: 2, greaterStriking: 3, majorStriking: 4,
};

const RANGED = /\b(bow|crossbow|sling|dart|blowgun|shuriken|javelin|gun|pistol|musket|rifle|arquebus|blunderbuss|firearm|boomerang|net)\b/i;

const clean = (s: string | undefined | null): string =>
  !s || s === "Not set" ? "" : s;

function ancestryHeritage(ancestry = "", heritage = ""): string {
  if (!heritage) return ancestry;
  if (!ancestry || heritage.includes(ancestry)) return heritage;
  return `${ancestry} (${heritage})`;
}

export const abilityModifier = (score: number): number => Math.floor((score - 10) / 2);

export interface MapOptions {
  /** Seed for repeating-row ids; same seed → same ids (stable re-imports/tests). */
  seed?: number;
}

export function mapPathbuilder(input: unknown, options: MapOptions = {}): Roll20Character {
  const build = parsePathbuilder(input);
  const rand = options.seed === undefined ? Math.random : seededRandom(options.seed);
  const attrs: Roll20Attribute[] = [];
  const warnings: string[] = [];
  const bio: string[] = [];

  const set = (name: string, value: string | number | undefined, max?: string | number) => {
    if (value === undefined || value === "") return;
    const attr: Roll20Attribute = { name, current: String(value) };
    if (max !== undefined) attr.max = String(max);
    attrs.push(attr);
  };
  const row = (section: string, fields: Record<string, string | number | undefined>) => {
    const id = newRowId(rand);
    for (const [field, value] of Object.entries(fields)) set(`repeating_${section}_${id}_${field}`, value);
  };

  mapBasics(build, set);
  const mods = mapAbilities(build, set);
  mapHitPoints(build, mods.con, set);
  mapProficiencies(build, set);
  mapLores(build, row);
  mapFeats(build, row, warnings);
  mapEquipment(build, set, row);
  mapWeapons(build, mods.str, row);
  mapArmor(build, set, warnings);

  if (build.specials?.length) bio.push(`Class & ancestry features: ${build.specials.join(", ")}`);
  for (const f of build.familiars ?? []) {
    const abilities = Array.isArray(f.abilities) ? ` (${(f.abilities as string[]).join(", ")})` : "";
    bio.push(`Familiar: ${f.name ?? "unnamed"}${abilities}`);
  }
  for (const p of build.pets ?? []) bio.push(`Pet: ${p.name ?? "unnamed"}`);
  if ((build as { spellCasters?: unknown[] }).spellCasters?.length)
    warnings.push("Spellcasting is not imported yet.");

  return { name: build.name, bio: bio.join("\n"), attributes: attrs, warnings };
}

type Setter = (name: string, value: string | number | undefined, max?: string | number) => void;
type RowAdder = (section: string, fields: Record<string, string | number | undefined>) => void;

function mapBasics(b: PathbuilderBuild, set: Setter): void {
  set("sheet_type", "character");
  set("level", b.level);
  set("xp", b.xp);
  set("class", b.class);
  set("ancestry_heritage", ancestryHeritage(b.ancestry, b.heritage));
  set("background", b.background);
  set("alignment", clean(b.alignment));
  set("deity", clean(b.deity));
  set("age", clean(b.age));
  set("gender_pronouns", clean(b.gender));
  set("size", b.sizeName);
  set("languages", b.languages?.join(", "));
  set("speed", b.attributes.speed + (b.attributes.speedBonus ?? 0));
}

function mapAbilities(b: PathbuilderBuild, set: Setter): Record<string, number> {
  const mods: Record<string, number> = {};
  for (const [short, long] of ABILITIES) {
    const score = b.abilities[short];
    mods[short] = abilityModifier(score);
    set(long, score);
    set(`${long}_modifier`, mods[short]);
  }
  if (b.keyability && b.keyability in mods) {
    const long = ABILITIES.find(([s]) => s === b.keyability)![1];
    set("class_dc_key_ability_select", `@{${long}_modifier}`);
  }
  return mods;
}

function mapHitPoints(b: PathbuilderBuild, conMod: number | undefined, set: Setter): void {
  const { ancestryhp, classhp, bonushp = 0, bonushpPerLevel = 0 } = b.attributes;
  set("hit_points_ancestry", ancestryhp);
  set("hit_points_class", classhp + bonushpPerLevel);
  set("hit_points_other", bonushp);
  const max = ancestryhp + b.level * (classhp + bonushpPerLevel + (conMod ?? 0)) + bonushp;
  set("hit_points_max", max);
  set("hit_points", max);
}

function mapProficiencies(b: PathbuilderBuild, set: Setter): void {
  const p = b.proficiencies;
  set("perception_rank", p.perception ?? 0);
  for (const [pb, sheet] of SAVES) set(`${sheet}_rank`, p[pb] ?? 0);
  set("class_dc_rank", p.classDC ?? 0);
  for (const [pb, sheet] of ARMOR_RANKS) set(sheet, p[pb] ?? 0);
  for (const skill of SKILLS) {
    set(`${skill}_rank`, p[skill] ?? 0);
    const item = b.mods?.[skill[0]!.toUpperCase() + skill.slice(1)]?.["Item Bonus"];
    if (item) set(`${skill}_item`, item);
  }
}

function mapLores(b: PathbuilderBuild, row: RowAdder): void {
  for (const [name, rank] of b.lores ?? []) row("lore", { lore_name: name, lore_rank: rank });
}

const FEAT_SECTIONS: Record<string, { section: string; field: string; typed: boolean }> = {
  "Ancestry Feat": { section: "feat-ancestry", field: "feat_ancestry", typed: true },
  "Heritage": { section: "feat-ancestry", field: "feat_ancestry", typed: true },
  "Class Feat": { section: "feat-class", field: "feat_class", typed: true },
  "Skill Feat": { section: "feat-skill", field: "feat_skill", typed: false },
  "General Feat": { section: "feat-general", field: "feat_general", typed: false },
};

function mapFeats(b: PathbuilderBuild, row: RowAdder, warnings: string[]): void {
  for (const f of b.feats ?? []) {
    const [name, , type, level] = f as [string, unknown, string, number | undefined];
    const target = FEAT_SECTIONS[type] ?? { section: "feat-bonus", field: "feat_bonus", typed: false };
    if (!FEAT_SECTIONS[type] && type !== "Awarded Feat") warnings.push(`Feat "${name}" has unknown type "${type}"; placed under bonus feats.`);
    const fields: Record<string, string | number | undefined> = { [target.field]: name };
    if (target.section !== "feat-bonus") fields[`${target.field}_level`] = level;
    if (type === "Heritage") fields[`${target.field}_notes`] = "Heritage";
    row(target.section, fields);
  }
}

function mapEquipment(b: PathbuilderBuild, set: Setter, row: RowAdder): void {
  for (const item of b.equipment ?? []) {
    const [name, qty, state] = item as [string, number, string | undefined];
    if (state === "Invested") row("items-worn", { worn_item: name });
    else row("items-other", { other_item: name, other_quantity: qty });
  }
  if (b.money) {
    set("cp", b.money.cp); set("sp", b.money.sp); set("gp", b.money.gp); set("pp", b.money.pp);
  }
}

function mapWeapons(b: PathbuilderBuild, strMod: number | undefined, row: RowAdder): void {
  for (const w of b.weapons ?? []) {
    const ranged = RANGED.test(w.name);
    const dice = STRIKING_DICE[w.str ?? ""] ?? 1;
    const dmgType = w.damageType ?? "";
    const specialization = ranged ? 0 : Math.max(0, (w.damageBonus ?? 0) - (strMod ?? 0));
    const extra = [...(w.extraDamage ?? [])];
    if (w.mat) extra.push(w.mat);
    row(ranged ? "ranged-strikes" : "melee-strikes", {
      weapon: w.name,
      weapon_rank: rankFor(b, w.prof),
      weapon_item: w.pot ?? 0,
      weapon_ability_select: ranged ? "@{dexterity_modifier}" : "@{strength_modifier}",
      damage_dice: dice,
      damage_dice_size: w.die?.toUpperCase(),
      damage_ability_select: ranged ? "0" : "@{strength_modifier}",
      damage_b: dmgType.includes("B") ? 1 : 0,
      damage_p: dmgType.includes("P") ? 1 : 0,
      damage_s: dmgType.includes("S") ? 1 : 0,
      damage_weapon_specialization: specialization,
      damage_additional: extra.join(", ") || undefined,
    });
  }
}

function rankFor(b: PathbuilderBuild, prof: string | undefined): number {
  return (prof && b.proficiencies[prof]) || 0;
}

function mapArmor(b: PathbuilderBuild, set: Setter, warnings: string[]): void {
  const worn = (b.armor ?? []).filter((a) => a.worn);
  const shield = worn.find((a) => a.prof === "shield");
  const body = worn.find((a) => a.prof !== "shield");
  if (body) set("armor_class_item", body.pot ?? 0);
  if (shield) warnings.push(`Shield "${shield.name}" must be entered manually (hardness/HP not in export).`);
  const ac = (b as { acTotal?: { acTotal?: number } }).acTotal?.acTotal;
  if (ac !== undefined) warnings.push(`Pathbuilder AC is ${ac}; compare with the sheet after import.`);
}
