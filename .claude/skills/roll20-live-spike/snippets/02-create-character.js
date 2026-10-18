// Path20 spike 02 — creates ONE character named "Path20 spike <time>" with:
//  - plain attributes, a repeating strike row, a lore row, a feat row
//  - two token actions (macros)
// Touches nothing else. Paste in console. Copy the whole output back.
(async () => {
  const C = window.Campaign;
  if (!C || !C.characters) return console.error("PATH20-SPIKE-02 FAIL: no Campaign.characters");
  const log = { steps: [], errors: [] };
  const step = (name, fn) => {
    try { const r = fn(); log.steps.push({ name, ok: true }); return r; }
    catch (e) { log.steps.push({ name, ok: false }); log.errors.push(`${name}: ${e && e.message}`); }
  };
  const name = "Path20 spike " + new Date().toISOString().slice(11, 19);
  const pc = step("characters.create", () => C.characters.create({ name }));
  if (!pc) return console.log("PATH20-SPIKE-02", JSON.stringify(log, null, 2));
  log.id = pc.id;

  const CH = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
  const rowId = () => "-" + Array.from({ length: 19 }, () => CH[Math.floor(Math.random() * CH.length)]).join("");
  const setAttr = (n, v) => {
    // Try the documented-by-prior-art way first, fall back to create(attrs).
    let a;
    try { a = pc.attribs.create(); a.attributes.name = n; a.attributes.current = String(v); a.save(); }
    catch (e) { a = pc.attribs.create({ name: n, current: String(v) }); }
    return a;
  };

  step("plain attributes", () => {
    for (const [n, v] of [["level", 9], ["strength", 18], ["strength_modifier", 4],
      ["constitution_modifier", 3], ["hit_points_ancestry", 10], ["hit_points_class", 8],
      ["athletics_rank", 4], ["class", "Spike Test"]]) setAttr(n, v);
  });
  const strike = rowId(), lore = rowId(), feat = rowId();
  log.rowIds = { strike, lore, feat };
  step("repeating strike", () => {
    const p = `repeating_melee-strikes_${strike}_`;
    for (const [f, v] of [["weapon", "Spike Hammer"], ["weapon_rank", 4], ["weapon_item", 1],
      ["weapon_ability_select", "@{strength_modifier}"], ["damage_dice", 2], ["damage_dice_size", "D8"],
      ["damage_ability_select", "@{strength_modifier}"], ["damage_b", 1]]) setAttr(p + f, v);
  });
  step("repeating lore", () => {
    setAttr(`repeating_lore_${lore}_lore_name`, "Spike Lore");
    setAttr(`repeating_lore_${lore}_lore_rank`, 2);
  });
  step("repeating feat-class", () => {
    setAttr(`repeating_feat-class_${feat}_feat_class`, "Spike Feat");
    setAttr(`repeating_feat-class_${feat}_feat_class_level`, 1);
  });
  step("abilities.create (macros)", () => {
    pc.abilities.create({ name: "P20-Athletics", action: `%{${name}|ATHLETICS}`, istokenaction: true });
    pc.abilities.create({ name: "P20-Perception", action: `%{${name}|PERCEPTION}`, istokenaction: true });
  });
  step("save", () => pc.save());
  log.attribCount = pc.attribs && pc.attribs.length;
  log.abilityCount = pc.abilities && pc.abilities.length;
  log.name = name;
  console.log("PATH20-SPIKE-02", JSON.stringify(log, null, 2));
  console.log("Now open this character's sheet (Journal → click it → open), then run snippet 03.");
})();
