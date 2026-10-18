# Spike 0b — wyniki testów na żywym Roll20

Status: **nie wykonano**. Protokół i snippety: `.claude/skills/roll20-live-spike/`.

## Środowisko (wypełnić)
- Data:
- Przeglądarka + wersja:
- Konto Roll20 (free/Plus/Pro):
- Rola w grze (GM / gracz):
- Arkusz w kampanii:

## Hipotezy do potwierdzenia

| # | Hipoteza | Krok | Wynik | Uwagi |
|---|---|---|---|---|
| H1 | `window.Campaign.characters` dostępne z konsoli | 01 | ? | |
| H2 | `characters.create({name})` tworzy postać | 02 | ? | |
| H3 | `attribs.create()` + `.save()` zapisuje atrybut (a `create({name,current})` jako fallback) | 02 | ? | |
| H4 | Atrybuty `repeating_<sekcja>_<rowId>_<pole>` tworzą wiersze w arkuszu | 02/03 | ? | |
| H5 | `abilities.create({name, action, istokenaction})` tworzy makro | 02/04 | ? | |
| H6 | Sheet workery przeliczają wartości pochodne po zapisie z klienta | 03 | ? | czas: ? s; tylko gdy arkusz otwarty? |
| H7 | `%{Postać\|PRZYCISK}` wywołuje przycisk arkusza | 04 | ? | |
| H8 | Przyciski w sekcjach powtarzalnych: `%{Postać\|repeating_<sek>_<rowId>_<PRZYCISK>}` | 04 | ? | |
| H9 | Wariant `$0` (pierwszy wiersz) działa | 04 | ? | |
| H10 | Limity: ~600 atrybutów zapisuje się bez błędów | (nowy) | ? | |
| H11 | Zapis jako zwykły gracz (nie GM) | (nowy) | ? | |

## Surowe wyniki
(wklej wyjście konsoli per krok, bez skracania)

## Wnioski i zmiany w planie
