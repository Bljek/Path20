---
name: roll20-sheet-inspector
description: Learn the ground truth of the official "Pathfinder Second Edition by Roll20" character sheet (attribute names, repeating sections, roll buttons, <select> values, sheet-worker formulas) and keep packages/schema-roll20 in sync. Use before adding or changing any Roll20 attribute/macro in the mapper, when a contract test fails, when the sheet was updated upstream, or when you need to know what the sheet calculates itself.
---

# roll20-sheet-inspector

The mapper in `packages/core` writes attribute names into Roll20. Those names must exist in the sheet, or the import silently does nothing. This skill keeps that knowledge **generated from the sheet source**, not remembered.

## Sources of truth
- Sheet repo: `Roll20/roll20-character-sheets`, folder `Pathfinder Second Edition by Roll20/`
  - `pathfinder2.html` — every `name="attr_*"`, `roll_*` button, `<select>` option, `<fieldset class="repeating_*">`
  - `src/js/module.js` — **sheet workers**: what is recalculated (HP, proficiency, strike bonuses, spell DC…) and which inputs feed it
  - `data/*.json` — templates for feat/item/spell rows
- Generated: `packages/schema-roll20/schema.json` (committed). Contract test: `packages/core/test/sheet-contract.test.ts`.

## Workflow
1. **Sync** (needs `git` + network access to github.com; the repo is public, use shallow + sparse clone):
   ```sh
   scripts/sync-sheet.sh            # clones next to the repo, regenerates schema.json, prints a diff stat
   ```
   Or manually: `node scripts/extract-sheet-schema.mjs "<path>/Pathfinder Second Edition by Roll20"`.
2. **Review the diff** of `schema.json`. Removed/renamed attributes mean mapper breakage; added ones are new opportunities. Mention the sheet commit (`generatedFrom.commit`) in the commit message.
3. **Run** `npm test`. Fix the mapper until the contract test is green. Never "fix" the test by loosening it, except by adding to `KNOWN_WORKER_ONLY` (attributes the sheet only creates in JS) with a comment saying why.
4. **Look up a name** instead of guessing:
   ```sh
   node -e 'const s=require("./packages/schema-roll20/schema.json");
     console.log(s.sections["melee-strikes"].attributes);      // fields of a repeating section
     console.log(s.sections["melee-strikes"].buttons);         // roll buttons usable in macros
     console.log(s.selects.weapon_ability_select);              // legal <select> values
     console.log(s.attributes.filter(a=>a.includes("spell")))'
   ```
5. **Read the worker** when you need to know whether to write a derived value ourselves: `grep -n "<attribute>" "<sheet>/src/js/module.js"`. Pattern: if a worker computes X from inputs Y, the mapper must write Y; writing X too is a fallback in case workers do not fire for client-side writes (this is what `docs/spike-0b.md` decides).

## Facts already established (verify with the schema, they can change)
- Ranks are numeric `0/2/4/6/8`; `*_proficiency` = rank + level when rank > 0.
- `hit_points_max` = `hit_points_ancestry + (hit_points_class + con_mod) * level + hit_points_other + hit_points_item`.
- The same repeating section can appear several times in the HTML (PC view, NPC view, settings): the extractor **unions** them. NPC-only fields (`*_npc`) are in the schema too; do not use them for PCs.
- Strike rows have buttons `ATTACK`, `DAMAGE`, `CRITICAL_DAMAGE`, `ATTACK-DAMAGE`; spell rows have `spellroll`; lore rows `LORE`; top-level buttons are the 16 skills, saves, abilities, `PERCEPTION`, `INITIATIVE`, …
- Repeating attribute name: `repeating_<section>_<rowId>_<field>`; rowId = `-` + 19 chars `[-0-9A-Za-z_]`.

## Limits of the extractor
- Regex/tag-scan of the HTML, not a browser: attributes created only by `setAttrs` in JS and never present in HTML are invisible (list them in `KNOWN_WORKER_ONLY`).
- It does not know *semantics* (units, defaults). Read `module.js` for those.
- Does not cover translations (`_translations/`) or roll templates.

## Do not
- Copy sheet source or Paizo text into the repo beyond the generated name lists.
- Hand-edit `schema.json`; regenerate it.
