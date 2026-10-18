import { z } from "zod";

const num = z.number().catch(0);
const nullableStr = z.string().nullable().optional();

const weaponSchema = z.looseObject({
  name: z.string(),
  qty: num.optional(),
  prof: z.string().optional(),
  die: z.string().optional(),
  pot: num.optional(),
  str: z.string().optional(),
  mat: nullableStr,
  display: z.string().optional(),
  runes: z.array(z.string()).optional(),
  damageType: z.string().optional(),
  attack: num.optional(),
  damageBonus: num.optional(),
  extraDamage: z.array(z.string()).optional(),
});

const armorSchema = z.looseObject({
  name: z.string(),
  qty: num.optional(),
  prof: z.string().optional(),
  pot: num.optional(),
  res: z.string().optional(),
  mat: nullableStr,
  display: z.string().optional(),
  worn: z.boolean().optional(),
  runes: z.array(z.string()).optional(),
});

/** Pathbuilder 2e `build` object. Lenient: unknown keys are kept, most fields optional. */
export const buildSchema = z.looseObject({
  name: z.string(),
  class: z.string().optional(),
  level: z.number().int().min(1).max(30),
  xp: num.optional(),
  ancestry: z.string().optional(),
  heritage: z.string().optional(),
  background: z.string().optional(),
  alignment: z.string().optional(),
  gender: z.string().optional(),
  age: z.string().optional(),
  deity: z.string().optional(),
  sizeName: z.string().optional(),
  keyability: z.string().optional(),
  languages: z.array(z.string()).optional(),
  abilities: z.looseObject({
    str: z.number(), dex: z.number(), con: z.number(),
    int: z.number(), wis: z.number(), cha: z.number(),
  }),
  attributes: z.looseObject({
    ancestryhp: num, classhp: num, bonushp: num.optional(),
    bonushpPerLevel: num.optional(), speed: num, speedBonus: num.optional(),
  }),
  proficiencies: z.record(z.string(), z.number()),
  mods: z.record(z.string(), z.record(z.string(), z.number())).optional(),
  feats: z.array(z.array(z.unknown())).optional(),
  specials: z.array(z.string()).optional(),
  lores: z.array(z.tuple([z.string(), z.number()])).optional(),
  equipment: z.array(z.array(z.unknown())).optional(),
  weapons: z.array(weaponSchema).optional(),
  armor: z.array(armorSchema).optional(),
  money: z.looseObject({ cp: num, sp: num, gp: num, pp: num }).optional(),
  familiars: z.array(z.looseObject({ name: z.string().optional() })).optional(),
  pets: z.array(z.looseObject({ name: z.string().optional() })).optional(),
});

export type PathbuilderBuild = z.infer<typeof buildSchema>;

/**
 * Accepts either the raw `json.php` response (`{ success, build }`)
 * or a bare `build` object, as pasted by users.
 */
export function parsePathbuilder(input: unknown): PathbuilderBuild {
  const raw = typeof input === "string" ? JSON.parse(input) : input;
  const candidate =
    raw && typeof raw === "object" && "build" in raw ? (raw as { build: unknown }).build : raw;
  const result = buildSchema.safeParse(candidate);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("; ");
    throw new Error(`Not a valid Pathbuilder 2e export: ${issues}`);
  }
  return result.data;
}
