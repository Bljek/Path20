// Path20 spike 03 — read back values of the newest "Path20 spike*" character and watch whether
// the sheet's workers recompute derived values. OPEN THE CHARACTER SHEET FIRST (edit mode), then paste.
// Polls for 30 s and prints a table. Read-only.
(async () => {
  const chars = window.Campaign.characters.models.filter((m) => /^Path20 spike/.test(m.get("name")));
  const pc = chars[chars.length - 1];
  if (!pc) return console.error("PATH20-SPIKE-03 FAIL: no 'Path20 spike' character");
  const get = (n) => { const a = pc.attribs.models.find((m) => m.get("name") === n); return a ? a.get("current") : undefined; };
  const id = (pc.attribs.models.map((m) => m.get("name")).find((n) => /^repeating_melee-strikes_.*_weapon$/.test(n)) || "")
    .replace(/_weapon$/, "");
  const watch = ["strength_modifier", "hit_points_max", "hit_points", "athletics", "athletics_proficiency",
    "armor_class", "class_dc", id && id + "_weapon_proficiency", id && id + "_weapon_strike",
    id && id + "_weapon_display", id && id + "_damage_display"].filter(Boolean);
  const t0 = Date.now(), seen = {};
  const sample = () => {
    const row = { t: ((Date.now() - t0) / 1000).toFixed(1) + "s" };
    for (const n of watch) row[n.replace(/^repeating_melee-strikes_-[-\w]{19}_/, "strike_")] = get(n);
    const key = JSON.stringify({ ...row, t: 0 });
    if (!seen[key]) { seen[key] = 1; console.log("PATH20-SPIKE-03 change", JSON.stringify(row)); }
  };
  sample();
  const iv = setInterval(sample, 1000);
  setTimeout(() => {
    clearInterval(iv);
    console.log("PATH20-SPIKE-03 done. Total attribs:", pc.attribs.length, "— expected derived values:",
      "hit_points_max=109 (10 + 9*(8+3)), athletics_proficiency=13 (4+9), strike_weapon_strike=18 (4+13+1)");
    console.table(Object.fromEntries(watch.map((n) => [n, get(n)])));
  }, 30000);
})();
