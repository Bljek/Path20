// Path20 spike 04 — prints macro candidates for the newest "Path20 spike*" character.
// Paste each printed line into the Roll20 CHAT box (sheet open) and report what appears.
(() => {
  const pc = window.Campaign.characters.models.filter((m) => /^Path20 spike/.test(m.get("name"))).pop();
  if (!pc) return console.error("PATH20-SPIKE-04 FAIL: no 'Path20 spike' character");
  const name = pc.get("name");
  const strikeAttr = pc.attribs.models.map((m) => m.get("name")).find((n) => /^repeating_melee-strikes_.*_weapon$/.test(n));
  const row = strikeAttr && strikeAttr.replace(/^repeating_melee-strikes_/, "").replace(/_weapon$/, "");
  const lines = [
    ["A1 skill button", `%{${name}|ATHLETICS}`],
    ["A2 perception", `%{${name}|PERCEPTION}`],
    ["A3 initiative", `%{${name}|INITIATIVE}`],
    ["A4 strike attack (by row id)", `%{${name}|repeating_melee-strikes_${row}_ATTACK}`],
    ["A5 strike damage", `%{${name}|repeating_melee-strikes_${row}_DAMAGE}`],
    ["A6 strike crit damage", `%{${name}|repeating_melee-strikes_${row}_CRITICAL_DAMAGE}`],
    ["A7 strike attack+damage", `%{${name}|repeating_melee-strikes_${row}_ATTACK-DAMAGE}`],
    ["A8 strike attack (first row, $0)", `%{${name}|repeating_melee-strikes_$0_ATTACK}`],
    ["A9 lore", `%{${name}|repeating_lore_$0_LORE}`],
    ["B1 raw attribute", `/w gm @{${name}|strength_modifier} @{${name}|hit_points_max}`],
    ["B2 inline roll w/ attr", `/r 1d20+@{${name}|athletics}`],
    ["B3 stored roll string", `@{${name}|repeating_melee-strikes_${row}_weapon_roll}`],
  ];
  console.log("PATH20-SPIKE-04 — paste each into chat and report result (works / error / nothing):");
  for (const [label, text] of lines) console.log(label.padEnd(36), text);
  const token = pc.abilities.models.map((a) => `${a.get("name")} → ${a.get("action")} (token action: ${a.get("istokenaction")})`);
  console.log("Stored abilities:", token);
})();
