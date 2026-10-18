# Path20 — plan projektu

Wersja 1, stan na Etap 1 (rdzeń mappera gotowy). Dokument roboczy po polsku; kod, UI i README po angielsku.

## 1. Cel i zakres

**Cel:** gracz bez Roll20 Pro wkleja eksport z Pathbuildera 2e (lub podaje jego ID) i jednym kliknięciem dostaje w Roll20:
1. kompletnie wypełnioną postać w arkuszu *Pathfinder Second Edition by Roll20*,
2. gotowe **makra** (token actions) do rzutów,
3. raport „co przeniesiono, co nie i dlaczego".

**Poza zakresem (na razie):** NPC/potwory, synchronizacja Roll20 → Pathbuilder, inne arkusze, importy z innych kreatorów, Roll20 API Script (opcjonalnie później).

**Zasady:** wszystko działa lokalnie w przeglądarce (zero serwera, zero telemetrii); import jest idempotentny i nieniszczący; nie kopiujemy treści Paizo (opisy atutów/czarów), tylko nazwy i liczby, o ile użytkownik nie ma ich w kompendium.

## 2. Co zawiera karta Pathbuildera (inwentarz) i dokąd to trafia

Priorytety: **P0** = bez tego postać jest bezużyteczna, **P1** = oczekiwane, **P2** = wygoda, **P3** = nice-to-have.
Kolumna „Źródło wiedzy": ✅ = widziane w prawdziwym eksporcie (Thorvag), 📖 = znane ze struktury JSON Pathbuildera, wymaga fixture'a do potwierdzenia.

| # | Dane Pathbuildera (`build.*`) | Źródło | Cel w Roll20 | Pri | Stan |
|---|---|---|---|---|---|
| 1 | `name`, `class`, `level`, `xp`, `ancestry`, `heritage`, `background`, `alignment`, `gender`, `age`, `deity`, `sizeName`, `languages` | ✅ | `character.name`, `class`, `level`, `ancestry_heritage`, … | P0 | ✅ gotowe |
| 2 | `dualClass` | 📖 | drugie `class` w `class` / bio | P2 | ❌ |
| 3 | `abilities` (wartości + `breakdown` boostów) | ✅ | `strength`…, `*_modifier` | P0 | ✅ |
| 4 | `attributes` (`ancestryhp`, `classhp`, `bonushp`, `bonushpPerLevel`, `speed`, `speedBonus`) | ✅ | `hit_points_*`, `speed` | P0 | ✅ |
| 5 | `proficiencies` (percepcja, save'y, Class DC, 16 skilli, pancerze, bronie) | ✅ | `*_rank` | P0 | ✅ (bronie przez broń) |
| 6 | `proficiencies.casting*` | ✅ | `magic_tradition_*_proficiency`, `spell_attack_rank`, `spell_dc_rank` | P0 | ❌ |
| 7 | `mods` (premie per skill/typ) | ✅ | `*_item` (item), `*_temporary` (circumstance/status) | P1 | częściowo (tylko Item) |
| 8 | `lores` | ✅ | `repeating_lore` | P0 | ✅ (do weryfikacji pola rangi) |
| 9 | `feats` (nazwa, wybór/`extra`, typ, poziom, źródło) | ✅ | `repeating_feat-*` | P0 | ✅ (bez `extra`) |
| 10 | `specials` (zdolności klasowe/rodowe) | ✅ | `repeating_actions-activities` / bio | P1 | bio |
| 11 | `equipment` + `equipmentContainers` (plecaki, bag of holding, stan Invested) | ✅ | `repeating_items-worn/readied/other` + Bulk | P0 | ✅ (bez kontenerów, Bulk) |
| 12 | `weapons` (runy, materiał, `attack`, `damageBonus`, `extraDamage`) | ✅ | `repeating_melee/ranged-strikes` | P0 | ✅ (zasięg/cechy do zrobienia) |
| 13 | `armor` (pancerz, tarcza, runy, `worn`) | ✅ | `armor_class_*`, `armor_class_shield_*` | P0 | częściowo |
| 14 | `acTotal` | ✅ | **tylko do weryfikacji** po imporcie | P1 | ostrzeżenie |
| 15 | `money` | ✅ | `cp/sp/gp/pp` | P1 | ✅ |
| 16 | `spellCasters[]` (tradycja, typ: prepared/spontaneous, cecha, ranga, sloty/`perDay`, czary wg poziomu, `prepared`, innate, blended) | 📖 | `repeating_cantrip`, `normalspells`, `spellinnate`, `*_per_day(_max)`, `spellcaster_*` | P0 dla casterów | ❌ |
| 17 | `focusPoints`, `focus` (czary skupienia per tradycja/cecha) | ✅ puste / 📖 | `focus_points(_max)`, `repeating_spellfocus` | P1 | ❌ |
| 18 | `formula` (receptury Crafting) | ✅ puste | `repeating_items-other`/bio | P3 | ❌ |
| 19 | `rituals` | ✅ puste | bio / `repeating_actions-activities` | P3 | ❌ |
| 20 | `resistances` | ✅ puste | `repeating_resistances-immunities` (sekcja istnieje w sheet workerach) | P2 | ❌ |
| 21 | `specificProficiencies` (trained/expert/… konkretnych broni) | ✅ puste | `weapon_proficiencies_other(_rank)` | P2 | ❌ |
| 22 | `inventorMods` (Inventor: ulepszenia broni/pancerza) | ✅ puste | modyfikatory broni/pancerza | P3 | ❌ |
| 23 | `pets`, `familiars` | ✅ | bio + opcjonalnie osobna postać-towarzysz | P2 | bio |
| 24 | `keyability` | ✅ | `class_dc_key_ability_select` | P0 | ✅ |
| 25 | Atuty-wybory (`feats[i][1]`, np. dodatkowy skill, Additional Lore) | 📖 | pola `*_notes` | P1 | ❌ |
| 26 | Pochodne wartości (HP max, Class DC, AC, rzuty) | ✅ | liczone przez sheet workery; **my też je wpisujemy** i weryfikujemy | P0 | HP ✅ |
| 27 | Style gry / mody Pathbuildera (Free Archetype, ABP, Variant Rules) | 📖 | wpływ na atuty/potencje; tylko ostrzeżenia | P3 | ❌ |

> Do potwierdzenia fixture'ami: dokładny kształt `spellCasters[].spells`, `perDay`, `prepared`, `focus`, `feats[i][1]`, kontenerów w `equipment`, `mods` poza Item Bonus, Free Archetype/dual class.

## 3. Cel: arkusz Roll20 (inwentarz techniczny)

Z `pathfinder2.html`, `module.js`:
- ~445 atrybutów; **kolejne sekcje powtarzalne:** `lore`, `feat-{ancestry,class,general,skill,bonus}`, `items-{worn,readied,other}`, `melee-strikes`, `ranged-strikes`, `actions`, `actions-activities`, `free-actions-reactions`, `interaction-abilities`, `cantrip`, `normalspells`, `spellfocus`, `spellinnate`, `resistances-immunities`, `senses`, `conditions`.
- **Przyciski rzutów (`roll_*`), 37 sztuk:** 16 skilli + `LORE`, `PERCEPTION`, `INITIATIVE`, `FORT/REF/WILL`, `STR…CHA`, `ACTION`, `spellroll`, itd.
- Sheet workery liczą: modyfikatory, `hit_points_max`, `*_proficiency` (= ranga + poziom, gdy ranga > 0), `weapon_strike`, `weapon_roll` itd.
- Spelle mają pola: `name`, `cast_actions`, `spelllevel`, `magic_tradition`, `save_type`, `damage_dice`, `heightened`, `range`, `area`, `target`, `duration`, `uses`, `uses_max`…

## 4. Makra (token actions)

Dwie strategie, które możemy mieszać:

| | A. Makra-referencje | B. Makra samodzielne |
|---|---|---|
| Treść | `%{Thorvag\|ATHLETICS}` — wywołuje przycisk arkusza | pełny szablon `&{template:rolls} {{…}}` z `@{Thorvag\|…}` |
| Zalety | krótkie, zawsze zgodne z arkuszem, zero logiki rzutów po naszej stronie | działają nawet gdy arkusz zmieni przyciski; mogą mieć MAP, zapytania |
| Wady | zależne od nazw przycisków arkusza; przyciski w sekcjach powtarzalnych wymagają rowId | więcej do utrzymania |

**Rekomendacja:** domyślnie **A**; **B** tylko tam, gdzie arkusz nie ma gotowego przycisku (np. Strike z MAP −5/−10, Recall Knowledge, Seek, Cast z podniesionym poziomem).

Zestaw makr (każde z `istokenaction: true`, prefiks konfigurowalny, np. `⚔`/`🎲`):
1. **Podstawy:** Perception, Initiative, Fort/Ref/Will, 16 skilli, każdy Lore z listy, Class DC, 6 testów cech.
2. **Ataki:** per broń `Strike 1/2/3` (MAP wg cechy *agile*), `Damage`, `Crit` (rowId z importu).
3. **Czary:** per czar `Cast` (kontekst: poziom, save/attack), cantripy, focus; makro `Spell Attack`/`Spell DC`.
4. **Akcje/atuty:** per atut z akcją (jeśli rozpoznamy typ akcji) wywołanie `repeating_actions_…_action`.
5. **Narzędzia:** `Recall Knowledge` (wybór skilla), `Seek`, `Treat Wounds`, `Rest`, `HP ±` (zapytanie), warunki.
6. **Pasek tokenu:** powiązanie `bar1 = hit_points`, `bar2 = focus_points`, AC w `bar3` (jako propozycja, nie wymuszona).

Tworzenie: `pc.abilities.create({name, action, istokenaction})` w kontekście strony (do potwierdzenia w spike'u). Aktualizacja idempotentna po nazwie, makra użytkownika (bez naszego prefiksu) nigdy nie są ruszane.

**Spike makr (przed implementacją):** sprawdzić składnię wywołania przycisków sekcji powtarzalnych (`%{Char\|repeating_melee-strikes_-ID_<przycisk>}`), nazwy przycisków strike/spell w PC (w NPC są `ATTACK-NPC`, `DAMAGE-NPC`), oraz limit długości `action`.

## 5. Architektura

```
packages/
  core/        # czysty TS: schema, normalizacja, mapper, macros, diff, verify  (JUŻ JEST: parse+mapper)
  schema-roll20/   # wygenerowana lista atrybutów/przycisków arkusza (z HTML arkusza) – używana w testach i walidacji
  extension/   # MV3: Chrome + Firefox (jeden kod, dwa manifesty)
  api-script/  # opcjonalnie: skrypt dla GM z Pro (ta sama logika core)
  testkit/     # fixtures, mock Roll20 (fake Campaign/Backbone) i harness E2E
fixtures/      # prawdziwe eksporty Pathbuildera + oczekiwane wyniki (golden files)
docs/
```

### Rozszerzenie (MV3)
- **Content script (isolated)** na `https://app.roll20.net/editor/*`: wstrzykuje UI („Import from Pathbuilder"), przekazuje dane.
- **Skrypt w świecie MAIN** (`web_accessible_resources` lub `content_scripts.world: "MAIN"`): jedyny, który widzi `window.Campaign`; tworzy/aktualizuje postać, atrybuty, makra. Komunikacja `postMessage` z walidacją źródła i kształtu.
- **Background / service worker:** `fetch` do `https://pathbuilder2e.com/json.php?id=…` (host permission omija CORS); w Firefox MV3 — event page/background script zamiast service workera.
- **Popup / panel w Roll20:** wklej JSON lub ID → podgląd (co powstanie, ostrzeżenia, diff przy aktualizacji) → przycisk Import → raport.
- **Uprawnienia minimalne:** hosty `app.roll20.net`, `pathbuilder2e.com`; `storage` na ustawienia. Brak `tabs`, brak zdalnego kodu.
- **Cross-browser:** `webextension-polyfill`/`browser.*`, build dwóch manifestów, `web-ext lint`, Firefox ≥ 128 dla `world: MAIN` (do potwierdzenia) lub wstrzykiwanie `<script>`.

### Przepływ danych
`input (JSON / ID)` → **parse+validate** (zod) → **normalize** (czyszczenie „Not set", rozpoznanie wariantów) → **map** (`Roll20Attribute[]`) + **macros** → **verify-plan** → **write** (MAIN world) → **read-back & verify** → **report**.

### Zapis: strategia i bezpieczeństwo
- Nowa postać **albo** aktualizacja istniejącej — dopasowanie po ukrytym atrybucie `path20_source` (np. `pb:479743`), nie po nazwie.
- **Nigdy nie kasujemy** atrybutów/sekcji użytkownika; przy aktualizacji nadpisujemy tylko te, które sami wcześniej ustawiliśmy (znacznik `path20_managed`), pozostałe zgłaszamy w diffie.
- Nie ruszamy `hit_points` (aktualne HP) ani stanów gry przy ponownym imporcie.
- **Dry-run + podgląd diffu** zawsze przed zapisem; snapshot do cofnięcia (Undo) przechowywany lokalnie.
- Zapis **partiami z opóźnieniem** (Roll20 limituje liczbę zapisów; kilkaset atrybutów + wiersze).
- Po zapisie czekamy na przeliczenie sheet workerów i robimy **read-back**.

### Weryfikacja po imporcie (wyróżnik projektu)
Pathbuilder zwraca policzone wartości (`acTotal`, `attack`, `damageBonus`). Po zapisie porównujemy je z tym, co policzył arkusz (AC, trafienie, obrażenia, save'y, Class DC, HP, skille) i pokazujemy **tabelę rozbieżności** z podpowiedzią (np. „brak premii statusowej"). To znajduje błędy mapowania bez ręcznego klikania.

## 6. Fazy i kryteria ukończenia

| Faza | Zakres | Kryterium „done" |
|---|---|---|
| **0b Spike** | Test w DevTools: tworzenie postaci/atrybutów/wierszy/abilities; czy sheet workery się odpalają; nazwy przycisków | Zapisany raport w `docs/spike-0b.md` z wynikami na żywym Roll20 |
| **1 Core MVP** ✅ | parse, mapper: podstawy, rangi, HP, lore, atuty, ekwipunek, bronie, pieniądze | 16 testów na Thorvagu |
| **2 Schemat arkusza** | skrypt generujący `schema-roll20` z HTML arkusza; test: każdy atrybut z mappera istnieje w arkuszu | CI czerwone, jeśli mapper emituje nieistniejący atrybut |
| **3 Core pełny** | czary (prepared/spontaneous/innate/focus), sloty, pancerz+tarcza, kontenery/Bulk, `mods` (circumstance/status), `extra` atutów, dual class, resistances, specific proficiencies | Golden files dla ≥ 8 klas (zob. §7) |
| **4 Makra** | generator makr (A+B), idempotentne nazwy, testy golden | Makra zgodne z zebranym spike'em |
| **5 Rozszerzenie alfa** | MV3 Chrome: UI wklejania, zapis w MAIN world, raport | Import Thorvaga na żywym Roll20 bez błędów |
| **6 Weryfikacja + aktualizacja** | read-back, diff, re-import, undo | Re-import nie gubi ręcznych zmian |
| **7 Firefox + E2E** | manifest FF, Playwright E2E z mockiem Roll20 | Obie przeglądarki zielone w CI |
| **8 Polish & release** | i18n szkielet (EN domyślnie, PL), ikony, polityka prywatności, listing, wersjonowanie | Publikacja w Chrome Web Store i AMO |
| **9 (opc.)** | API Script dla GM z Pro, import po ID z linku Pathbuildera, towarzysze jako osobne postacie | — |

## 7. Plan testów i fixture'ów

- **Fixture'y (prośba do Ciebie):** po jednym eksporcie z każdej grupy — martial (Fighter/Barbarian), prepared caster (Wizard), spontaneous (Sorcerer/Bard), divine (Cleric z domeną i focus), hybrid (Magus/Summoner/Investigator), ranged (Ranger z łukiem), Alchemist (receptury), Inventor, postać z familiarem/zwierzakiem, **dual class**, **Free Archetype**, postać z wysokim poziomem (15+), postać z kontenerami. Każdy w `fixtures/<klasa>-<id>.json`.
- **Unit/golden:** dla każdego fixture'a oczekiwany wynik mappera (snapshot) + asercje na kluczowe pola.
- **Kontrakt z arkuszem:** wszystkie wyemitowane nazwy atrybutów/przycisków muszą istnieć w `schema-roll20`.
- **Reguły PF2e jako testy własności:** `ranga + poziom`, MAP, DC = 10 + …; pozwalają złapać błędy w pochodnych.
- **Mock Roll20** (`testkit`): udaje `Campaign.characters`, `attribs.create`, `abilities.create`, `save`; E2E w Playwright (Chromium jest już w środowisku) ładuje rozszerzenie na statycznej stronie-atrapie.
- **Test na żywo** (ręczny, przed każdym wydaniem): lista kontrolna w `docs/release-checklist.md`.

## 8. Ryzyka

| Ryzyko | Skutek | Mitygacja |
|---|---|---|
| Zmiana wewnętrznego API Roll20 | import przestaje działać | izolacja w jednym adapterze `roll20-adapter`, wykrywanie wersji/funkcji, komunikat + tryb awaryjny (eksport tekstu i makr do wklejenia) |
| Sheet workery się nie odpalają po zapisie z klienta | brak przeliczeń | zapisujemy też wartości pochodne; weryfikacja pokaże problem |
| Format Pathbuildera się zmienia | błędy parsowania | zod lenient, wersjonowane fixture'y, testy kontraktowe |
| Treści Paizo | ryzyko prawne | tylko nazwy/liczby; zgodność z Paizo Community Use Policy; brak kopiowania opisów |
| Regulamin Roll20 / sklepów | odrzucenie | działanie wyłącznie po stronie klienta, bez omijania płatnych funkcji, minimalne uprawnienia |
| Limity zapisu Roll20 | utrata atrybutów | zapis partiami, ponowienia, read-back |
| Kompendium nie zna klas z dodatków (np. Runesmith) | brak linków/opisów | pole tekstowe z nazwą; bez zależności od kompendium |

## 9. Dystrybucja i legal

Licencja kodu MIT. Polityka prywatności: „nic nie opuszcza przeglądarki; jedyne zapytanie sieciowe to pobranie JSON-a z pathbuilder2e.com na prośbę użytkownika". Nazwa i ikony bez znaków Paizo/Roll20/Pathbuilder w sposób sugerujący afiliację („unofficial"). Sklepy: Chrome Web Store, Firefox AMO (wymaga kodu źródłowego build'u — mamy), opcjonalnie userscript.

## 10. Proponowane skille projektu (`.claude/skills/`)

Braki w repo, które warto uzupełnić, żeby kolejne sesje pracowały szybciej i bezpieczniej:

| Skill | Po co | Zawartość |
|---|---|---|
| `roll20-sheet-inspector` | Wyciąganie prawdy o arkuszu z `Roll20/roll20-character-sheets` | klon sparse jednego katalogu, skrypt generujący `schema-roll20` (atrybuty, sekcje, przyciski `roll_*`, opcje `<select>`), diff między wersjami arkusza |
| `pathbuilder-fixtures` | Zbieranie i utrzymanie fixture'ów | walidacja wobec zod, anonimizacja, macierz pokrycia klas/funkcji, wykrywanie driftu formatu, golden-file update |
| `roll20-live-spike` | Nie mam dostępu do Roll20, więc potrzebny jest protokół | gotowe snippety do konsoli DevTools, szablon raportu wyników, instrukcja dla użytkownika (kopiuj-wklej), opcjonalnie sterowanie przez `chrome-browser` (Claude in Chrome), jeśli użytkownik je włączy |
| `roll20-macro-builder` | Spójność makr | konwencje nazw/prefiksów, składnia `%{}`/`@{}`/`&{template}`, MAP, idempotencja, testy golden |
| `webext-cross-browser` | MV3 w Chrome i Firefoksie | manifesty, różnice (service worker vs background scripts, `world: MAIN`), `web-ext lint/run`, build, pułapki CSP i izolowanych światów |
| `webext-e2e` | Test rozszerzenia bez żywego Roll20 | Playwright + `launchPersistentContext` z rozszerzeniem, mock `Campaign`, scenariusze (import, re-import, błędy) |
| `pf2e-rules-check` | Weryfikacja liczb | wzory: proficiency, AC, DC, MAP, HP, tarcza, bulk; tylko mechanika, bez treści Paizo |
| `release-checklist` | Wydania | wersjonowanie, changelog, lista ręcznych testów na żywo, paczki dla CWS/AMO, polityka prywatności |

Poza skillami proponuję: `CLAUDE.md` (komendy, konwencje, zasady „nigdy nie kasuj danych użytkownika"), hook `SessionStart` instalujący zależności (skill `session-start-hook`), GitHub Actions (typecheck, test, web-ext lint, build obu manifestów). Istniejące skille, które się przydadzą: `init`, `session-start-hook`, `code-review`, `security-review`, `simplify`, `chrome-browser` (żywe testy, o ile włączysz Claude in Chrome).

## 11. Najbliższe kroki

1. **Ty:** wynik skryptu 0b z DevTools (patrz wiadomość w sesji) + kolejne eksporty (min. caster i ranged).
2. **Ja:** `roll20-sheet-inspector` + generator `schema-roll20` i test kontraktowy (nie wymaga Roll20).
3. **Ja:** czary i pancerz/tarcza w core po otrzymaniu fixture'ów.
4. **Wspólnie:** decyzja, które z proponowanych skilli zakładamy teraz.
