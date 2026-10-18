# Path20

Import a **Pathbuilder 2e** character into the official **Pathfinder Second Edition by Roll20** sheet.

Goal: a browser extension for players *without* Roll20 Pro (no API scripts needed), built on a shared, well-tested core.

## Status

Early development.

- [x] `packages/core` — validates a Pathbuilder JSON export and maps it to Roll20 attributes (identity, abilities, HP, ranks, lores, feats, equipment, weapons, money).
- [ ] Spellcasting, shields/armor details, ranged-weapon accuracy
- [ ] `packages/extension` — MV3 extension (Chrome/Firefox) that writes the attributes into Roll20
- [ ] Optional Roll20 API script for GMs with Pro

See [`docs/PLAN.md`](docs/PLAN.md) (full project plan), [`docs/`](docs): [`mapowanie.md`](docs/mapowanie.md) (field mapping), [`istniejace-rozwiazania.md`](docs/istniejace-rozwiazania.md) (prior art).

## Development

```sh
npm install
npm test
npm run typecheck
```

Fixtures (real Pathbuilder exports) live in `fixtures/`.
