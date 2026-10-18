---
name: roll20-live-spike
description: Run and record experiments against a LIVE Roll20 game, which Claude cannot reach from its sandbox. Provides copy-paste DevTools snippets and a results template so the user can test whether client-side writes (characters, attributes, repeating rows, macros) work and whether the PF2e sheet recalculates. Use for the "Etap 0b" spike, whenever an assumption about Roll20 internals (Campaign API, sheet workers, macro syntax, rate limits) must be verified before coding, and after Roll20 changes break the importer.
---

# roll20-live-spike

Claude's environment cannot open Roll20, and Roll20's client internals (`window.Campaign`, Backbone models) are undocumented and change. Every assumption about them is a **hypothesis until a human runs a snippet on a live game and pastes the output back**. This skill makes that loop fast and safe.

## Safety rules (apply to every snippet)
- Only ever create/modify/delete characters whose name starts with `Path20 spike`. Never touch other characters, tokens, pages or players.
- Run on a **throwaway test game** (free account is fine). The user must be GM or have permission to create characters.
- Snippets log to the console only; they send nothing anywhere.
- These snippets are untested against live Roll20 until `docs/spike-0b.md` says otherwise. Treat a failure as data, not as a bug in the user's setup.

## Protocol
1. Tell the user which step to run (below) and why, in one or two sentences. Keep each ask small.
2. User opens the game, presses F12 → Console, pastes the snippet file contents, and **copies the full console output** (right-click → "Save as…" or select-all/copy) back into the chat.
3. Claude interprets the output, records it in `docs/spike-0b.md` (use the template there), and decides the next step or a design change.
4. Commit the results. Update `docs/PLAN.md` §4–§5 if an assumption was wrong.

## Steps (files in `snippets/`)
| Step | File | Question it answers |
|---|---|---|
| 1 | `01-probe-api.js` | Does `window.Campaign.characters` exist? Is `create` available? What are the model methods (`attribs.create`, `abilities.create`, `updateBlobs`, `save`)? Is the user GM? Which sheet is active? Roll20 version hints. |
| 2 | `02-create-character.js` | Can we create a character with plain attributes, a repeating row (strike, feat, lore) and a token action (macro)? |
| 3 | `03-readback.js` | **Open the new character sheet first** (Journal → "Path20 spike" → open, then edit mode). Do sheet workers recompute (`strength_modifier`, `hit_points_max`, `weapon_strike`, `weapon_display`)? How long does it take? |
| 4 | `04-macros.js` | Does the macro syntax work? Prints candidate macros to paste in chat and run by hand (`%{Name|ATHLETICS}`, repeating strike buttons) and the user reports what the chat shows. |
| 5 | `05-cleanup.js` | Deletes only `Path20 spike*` characters. |

Optional later steps (add files as needed): rate/volume test (create 600 attributes, measure time and failures), update-in-place test, permission test as a non-GM player.

## No DevTools (phone-only users)
Use the on-screen panel instead of the console: `mobile/spike-panel.js` (bookmarklet in `mobile/spike-panel.bookmarklet.txt`, rebuild with `node scripts/build-bookmarklet.mjs`). It mirrors the snippets, so keep both in sync when you change one. Instructions for the user: `docs/mobile-spike.md`. First question to answer on mobile is whether the Roll20 editor (`/editor/`, desktop mode) loads at all.

## Automating instead of asking
If the user has the `chrome-browser` skill / Claude in Chrome enabled on their computer, the same snippets can be driven directly in their Roll20 tab. Ask first; never act in a game without the user's go-ahead. Otherwise stay with copy-paste.

## What to record (template in `docs/spike-0b.md`)
Date, browser + version, Roll20 account type (free/Plus/Pro), GM or player, sheet selected, per-step: output, pass/fail, surprises. Quote console errors verbatim.

## Interpreting results
- Step 1 fails (no `Campaign`) → page was not the game editor (`/editor/`), or Roll20 hid it. Check the URL and that the game finished loading; if still absent, the whole extension approach needs a different hook → stop and report.
- Step 2 works but 3 shows no recomputation → mapper must write derived values itself (already does) and verification must not depend on workers.
- Step 3 recomputes only while the sheet is open → the extension should open/focus the sheet (or warn) before the read-back verification.
- Step 4 macros fail → fall back to self-contained macros (PLAN §4 option B).
