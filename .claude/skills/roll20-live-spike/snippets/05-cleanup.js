// Path20 spike 05 — deletes ONLY characters whose name starts with "Path20 spike". Lists them first.
(() => {
  const victims = window.Campaign.characters.models.filter((m) => /^Path20 spike/.test(m.get("name")));
  console.log("PATH20-SPIKE-05 will delete:", victims.map((v) => v.get("name")));
  for (const v of victims) v.destroy();
  console.log("PATH20-SPIKE-05 done.");
})();
