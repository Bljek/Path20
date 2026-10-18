# Mapowanie: Pathbuilder 2e JSON → arkusz „Pathfinder Second Edition by Roll20"

Status: **szkic z Etapu 0** (wyciągnięte z `pathfinder2.html` oficjalnego arkusza oraz fixture'a `fixtures/thorvag-runesmith-479743.json`).
Wartości do weryfikacji na żywym arkuszu są oznaczone znakiem `?`.

## Konwencje arkusza
- Rangi (`*_rank`, `*_proficiency`) to liczby **0 / 2 / 4 / 6 / 8** (untrained → legendary). Pathbuilder używa **tych samych wartości** (`proficiencies.athletics: 4`), więc rangi przepisujemy 1:1.
- Cechy: arkusz ma `strength` itd. oraz `strength_modifier` (modyfikator). Pathbuilder daje wartość cechy (`abilities.str: 18`), modyfikator liczymy sami: `floor((score-10)/2)`.
- Poziom: `level`. Sekcje powtarzalne: `repeating_<sekcja>_<rowId>_<pole>`.

## Pola proste
| Pathbuilder (`build.*`) | Roll20 (`attr_*`) | Uwagi |
|---|---|---|
| `name` | nazwa postaci (`character.name`) | nie jest atrybutem |
| `level` | `level` | |
| `xp` | `xp` | |
| `class` | `class` | |
| `ancestry` + `heritage` | `ancestry_heritage` | np. „Dwarf / Anvil Dwarf" |
| `background` | `background` | |
| `alignment` | `alignment` | |
| `deity` | `deity` | „Not set" → puste |
| `age`, `gender` | `age`, `gender_pronouns` | „Not set" → puste |
| `sizeName` | `size` | |
| `languages[]` | `languages` | join `, ` |
| `abilities.{str..cha}` | `strength`.. `charisma` + `*_modifier` | |
| `attributes.speed` (+`speedBonus`) | `speed` | |
| `keyability` | `class_dc_key_ability` (+`_select`?) | wartość to `@{int_modifier}`-podobna; do sprawdzenia |

## Rangi
| Pathbuilder `proficiencies.*` | Roll20 |
|---|---|
| `perception` | `perception_rank` |
| `fortitude` / `reflex` / `will` | `saving_throws_{fortitude,reflex,will}_rank` |
| `classDC` | `class_dc_rank` |
| `acrobatics` … `thievery` (16 skilli) | `<skill>_rank` |
| `unarmored` / `light` / `medium` / `heavy` | `armor_class_{unarmored,light,medium,heavy}_rank` |
| `castingArcane/Divine/Occult/Primal` | `magic_tradition_*_proficiency` ? (+ `spell_attack_rank`, `spell_dc_rank`) |
| `mods.<Skill>["Item Bonus"]` | `<skill>_item` | np. Athletics +1 |

## Sekcje powtarzalne
| Pathbuilder | Sekcja Roll20 | Pola |
|---|---|---|
| `lores[] = [nazwa, ranga]` | `repeating_lore` | `lore_name`, `lore` (ranga ? – do sprawdzenia, czy to ranga, czy łączny bonus) |
| `feats[]` typ „Ancestry Feat"/„Heritage" | `repeating_feat-ancestry` | `feat_ancestry`, `feat_ancestry_level`, `feat_ancestry_type` |
| „Class Feat" | `repeating_feat-class` | `feat_class`, `feat_class_level`, `feat_class_type` |
| „Skill Feat" | `repeating_feat-skill` | `feat_skill`, `feat_skill_level` |
| „General Feat" | `repeating_feat-general` | `feat_general`, `feat_general_level` |
| „Awarded Feat" / inne | `repeating_feat-bonus` | `feat_bonus` |
| `specials[]` | `repeating_actions` ? / `feat-bonus` | do decyzji |
| `weapons[]` (melee) | `repeating_melee-strikes` | `weapon`, `weapon_strike`, `weapon_strike_damage`, `weapon_strike_damage_type`, `weapon_strike_damage_additional`, `weapon_traits` |
| `weapons[]` (dystansowe) | `repeating_ranged-strikes` | + `weapon_range` |
| `equipment[]` (Invested) | `repeating_items-worn` | `worn_item` |
| `equipment[]` (reszta) | `repeating_items-other` | `other_item`, `other_quantity` |
| `armor[]` (pancerz) | atrybuty AC + `repeating_items-worn` | `armor_class_item`, `armor_class_cap` ? |
| `armor[]` (tarcza) | `armor_class_shield_*` | `_ac_bonus`, `_hardness`, `_hp`, `_bt` |
| `money` | `cp`, `sp`, `gp`, `pp` | |

## HP
Roll20 ma `hit_points_ancestry`, `hit_points_class`, `hit_points_item`, `hit_points_other`, `hit_points_max`, `hit_points`.
Pathbuilder: `attributes.ancestryhp`, `classhp` (na poziom), `bonushp`, `bonushpPerLevel`.
Wzór: `ancestryhp + level * (classhp + con_mod + bonushpPerLevel) + bonushp`.
Dla Thorvaga: `10 + 9*(8+3) = 109`.

## Znane pułapki (z fixture'a)
- Pathbuilder zwraca `"Not set"` zamiast pustych pól.
- `weapons[].attack` i `damageBonus` są już policzone (np. +18, +6), ale arkusz Roll20 liczy sam z rang + cech. Trzeba zdecydować: wpisywać gotowe wartości jako override, czy ustawiać rangi i runy.
- `armor.display` bywa pusty (tarcza), trzeba użyć `name`.
- Brak `spellCasters` u postaci niemagicznych → pomijamy sekcje czarów.
- `familiars[]`/`pets[]` nie mają odpowiednika w arkuszu → do notatek.
- Postać jest z dodatku *Rage of Elements* (Runesmith); nazwy klas i atutów mogą nie istnieć w kompendium Roll20.
