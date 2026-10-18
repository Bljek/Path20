// Path20 spike panel — runs the spike steps from an on-screen panel (no DevTools needed; for phones).
// Mirrors .claude/skills/roll20-live-spike/snippets/*. Only ever touches characters named "Path20 spike*".
(() => {
  if (document.getElementById("p20-panel")) return;
  const C = () => window.Campaign;
  const PREFIX = "Path20 spike";
  const spikeChars = () => (C() && C().characters ? C().characters.models.filter((m) => String(m.get("name")).startsWith(PREFIX)) : []);
  const newest = () => spikeChars().pop();
  const typeOf = (v) => (v === undefined ? "undefined" : v === null ? "null" : typeof v);
  const attrOf = (pc, n) => { const a = pc.attribs.models.find((m) => m.get("name") === n); return a ? a.get("current") : undefined; };
  const CHARS = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
  const rowId = () => "-" + Array.from({ length: 19 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");

  const box = document.createElement("div");
  box.id = "p20-panel";
  box.style.cssText = "position:fixed;left:0;right:0;bottom:0;z-index:2147483647;background:#111;color:#eee;font:13px/1.3 sans-serif;padding:8px;box-shadow:0 -2px 12px #000;max-height:60vh;display:flex;flex-direction:column;gap:6px";
  const bar = document.createElement("div");
  bar.style.cssText = "display:flex;flex-wrap:wrap;gap:6px";
  const ta = document.createElement("textarea");
  ta.style.cssText = "width:100%;height:30vh;background:#000;color:#9f9;font:11px monospace;box-sizing:border-box";
  ta.readOnly = false;
  box.append(bar, ta);
  document.body.appendChild(box);

  const log = (...a) => { ta.value += a.map((x) => (typeof x === "string" ? x : JSON.stringify(x, null, 1))).join(" ") + "\n"; ta.scrollTop = ta.scrollHeight; };
  const btn = (label, fn) => {
    const b = document.createElement("button");
    b.textContent = label;
    b.style.cssText = "padding:10px 12px;font-size:14px;border:1px solid #888;border-radius:6px;background:#333;color:#fff";
    b.onclick = async () => { log(`\n=== ${label} @ ${new Date().toISOString().slice(11, 19)} ===`); try { await fn(); } catch (e) { log("EXCEPTION:", String(e && e.stack || e)); } };
    bar.appendChild(b);
  };

  const probe = () => {
    const c = C(), chars = c && c.characters, s = chars && chars.models && chars.models[0];
    log({
      url: location.href, ua: navigator.userAgent, touch: "ontouchstart" in window, viewport: [innerWidth, innerHeight],
      hasCampaign: typeOf(c), hasCharacters: typeOf(chars), characterCount: chars && chars.length,
      isGM: String(window.is_gm), player: window.currentPlayer && window.currentPlayer.id,
      charactersCreate: typeOf(chars && chars.create),
      sample: s && { name: s.get("name"), attribs: typeOf(s.attribs), abilities: typeOf(s.abilities),
        attribsCreate: typeOf(s.attribs && s.attribs.create), abilitiesCreate: typeOf(s.abilities && s.abilities.create),
        updateBlobs: typeOf(s.updateBlobs), attribCount: s.attribs && s.attribs.length,
        sampleAttrib: s.attribs && s.attribs.models[0] && s.attribs.models[0].attributes },
      sheetHints: c && c.attributes && Object.fromEntries(Object.entries(c.attributes).filter(([k]) => /sheet|template/i.test(k))),
    });
    if (!c || !chars) log("FAIL: Campaign.characters missing — is this the game editor (/editor/) in desktop mode and fully loaded?");
  };

  const create = () => {
    if (!C() || !C().characters) return log("FAIL: no Campaign.characters");
    const name = PREFIX + " " + new Date().toISOString().slice(11, 19);
    const pc = C().characters.create({ name });
    const errors = [];
    const setAttr = (n, v) => {
      try { const a = pc.attribs.create(); a.attributes.name = n; a.attributes.current = String(v); a.save(); }
      catch (e) { try { pc.attribs.create({ name: n, current: String(v) }); errors.push(`fallback used for ${n}: ${e.message}`); } catch (e2) { errors.push(`${n}: ${e2.message}`); } }
    };
    const rows = { strike: rowId(), lore: rowId(), feat: rowId() };
    for (const [n, v] of [["level", 9], ["strength", 18], ["strength_modifier", 4], ["constitution_modifier", 3],
      ["hit_points_ancestry", 10], ["hit_points_class", 8], ["athletics_rank", 4], ["class", "Spike Test"]]) setAttr(n, v);
    const sp = `repeating_melee-strikes_${rows.strike}_`;
    for (const [f, v] of [["weapon", "Spike Hammer"], ["weapon_rank", 4], ["weapon_item", 1], ["weapon_ability_select", "@{strength_modifier}"],
      ["damage_dice", 2], ["damage_dice_size", "D8"], ["damage_ability_select", "@{strength_modifier}"], ["damage_b", 1]]) setAttr(sp + f, v);
    setAttr(`repeating_lore_${rows.lore}_lore_name`, "Spike Lore"); setAttr(`repeating_lore_${rows.lore}_lore_rank`, 2);
    setAttr(`repeating_feat-class_${rows.feat}_feat_class`, "Spike Feat"); setAttr(`repeating_feat-class_${rows.feat}_feat_class_level`, 1);
    try {
      pc.abilities.create({ name: "P20-Athletics", action: `%{${name}|ATHLETICS}`, istokenaction: true });
      pc.abilities.create({ name: "P20-Perception", action: `%{${name}|PERCEPTION}`, istokenaction: true });
    } catch (e) { errors.push("abilities.create: " + e.message); }
    try { pc.save(); } catch (e) { errors.push("save: " + e.message); }
    log({ created: name, id: pc.id, attribs: pc.attribs.length, abilities: pc.abilities.length, errors });
    log("NEXT: open this character's sheet (Journal → tap it → open), then press 3 Readback.");
  };

  const readback = () => {
    const pc = newest();
    if (!pc) return log("FAIL: no 'Path20 spike' character — run 2 Create first");
    const rowAttr = pc.attribs.models.map((m) => m.get("name")).find((n) => /^repeating_melee-strikes_.*_weapon$/.test(n)) || "";
    const id = rowAttr.replace(/_weapon$/, "");
    const watch = ["strength_modifier", "hit_points_max", "hit_points", "athletics", "athletics_proficiency", "armor_class", "class_dc",
      ...(id ? [id + "_weapon_proficiency", id + "_weapon_strike", id + "_weapon_display", id + "_damage_display"] : [])];
    const short = (n) => n.replace(/^repeating_melee-strikes_-[-\w]{19}_/, "strike_");
    const t0 = Date.now(), seen = new Set();
    const sample = () => {
      const row = { t: ((Date.now() - t0) / 1000).toFixed(0) + "s" };
      for (const n of watch) row[short(n)] = attrOf(pc, n);
      const key = JSON.stringify({ ...row, t: 0 });
      if (!seen.has(key)) { seen.add(key); log("change", JSON.stringify(row)); }
    };
    sample();
    log("Watching 30 s. Expected if sheet workers run: hit_points_max=109, athletics_proficiency=13, strike_weapon_strike=18.");
    const iv = setInterval(sample, 1000);
    setTimeout(() => { clearInterval(iv); log("done; total attribs", pc.attribs.length); }, 30000);
  };

  const macros = () => {
    const pc = newest();
    if (!pc) return log("FAIL: no 'Path20 spike' character");
    const name = pc.get("name");
    const a = pc.attribs.models.map((m) => m.get("name")).find((n) => /^repeating_melee-strikes_.*_weapon$/.test(n));
    const row = a && a.replace(/^repeating_melee-strikes_/, "").replace(/_weapon$/, "");
    log("Paste each line into the Roll20 CHAT and tell me what appears (works / error / nothing):");
    for (const [l, t] of [["A1", `%{${name}|ATHLETICS}`], ["A2", `%{${name}|PERCEPTION}`], ["A3", `%{${name}|INITIATIVE}`],
      ["A4", `%{${name}|repeating_melee-strikes_${row}_ATTACK}`], ["A5", `%{${name}|repeating_melee-strikes_${row}_DAMAGE}`],
      ["A6", `%{${name}|repeating_melee-strikes_${row}_CRITICAL_DAMAGE}`], ["A7", `%{${name}|repeating_melee-strikes_${row}_ATTACK-DAMAGE}`],
      ["A8", `%{${name}|repeating_melee-strikes_$0_ATTACK}`], ["A9", `%{${name}|repeating_lore_$0_LORE}`],
      ["B1", `/w gm @{${name}|strength_modifier} @{${name}|hit_points_max}`], ["B2", `/r 1d20+@{${name}|athletics}`],
      ["B3", `@{${name}|repeating_melee-strikes_${row}_weapon_roll}`]]) log(l, t);
    log("Stored abilities:", pc.abilities.models.map((x) => `${x.get("name")} → ${x.get("action")} (token: ${x.get("istokenaction")})`));
  };

  const cleanup = () => {
    const v = spikeChars();
    log("deleting:", v.map((x) => x.get("name")));
    for (const x of v) x.destroy();
    log("done");
  };

  btn("1 Probe", probe); btn("2 Create", create); btn("3 Readback", readback); btn("4 Macros", macros); btn("5 Cleanup", cleanup);
  btn("Copy", async () => {
    ta.select();
    try { await navigator.clipboard.writeText(ta.value); log("(copied)"); } catch (_) { document.execCommand && document.execCommand("copy"); log("(copy attempted)"); }
  });
  btn("Clear", () => { ta.value = ""; });
  btn("Close", () => box.remove());
  log("Path20 spike panel ready. Press 1 Probe first.");
})();
