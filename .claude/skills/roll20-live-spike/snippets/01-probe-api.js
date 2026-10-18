// Path20 spike 01 — read-only probe of Roll20's client API. Changes nothing.
// Paste in the browser console (F12) while a game is open in the editor (URL contains /editor/).
(() => {
  const out = {};
  const t = (v) => (v === undefined ? "undefined" : v === null ? "null" : typeof v);
  out.url = location.href;
  out.userAgent = navigator.userAgent;
  out.hasCampaign = t(window.Campaign);
  const C = window.Campaign;
  out.hasCharacters = t(C && C.characters);
  const chars = C && C.characters;
  out.characterCount = chars && chars.length;
  out.charactersMethods = chars && ["create", "get", "models", "add", "remove"].map((m) => `${m}:${t(chars[m])}`);
  const sample = chars && chars.models && chars.models[0];
  if (sample) {
    out.sample = {
      id: sample.id,
      name: sample.get && sample.get("name"),
      hasAttribs: t(sample.attribs),
      hasAbilities: t(sample.abilities),
      attribsCreate: t(sample.attribs && sample.attribs.create),
      abilitiesCreate: t(sample.abilities && sample.abilities.create),
      updateBlobs: t(sample.updateBlobs),
      save: t(sample.save),
      attribCount: sample.attribs && sample.attribs.length,
      abilityCount: sample.abilities && sample.abilities.length,
      sampleAttrib:
        sample.attribs && sample.attribs.models[0] && sample.attribs.models[0].attributes,
    };
  }
  out.isGM = t(window.is_gm) + ":" + String(window.is_gm);
  out.playerId = window.currentPlayer && window.currentPlayer.id;
  out.d20 = t(window.d20);
  out.campaignId = C && C.id;
  // Which sheet does the campaign use? (attribute names differ per sheet)
  out.sheetHints = C && C.attributes && Object.fromEntries(
    Object.entries(C.attributes).filter(([k]) => /sheet|charsheet|template/i.test(k)));
  console.log("PATH20-SPIKE-01", JSON.stringify(out, null, 2));
  return out;
})();
