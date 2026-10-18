# Spike 0b na telefonie (bez DevTools)

Na telefonie nie ma konsoli, więc używamy panelu na ekranie: `mobile/spike-panel.js` (czytelny kod) i `mobile/spike-panel.bookmarklet.txt` (jedna linia `javascript:…`, do wklejenia w pasek adresu). Panel robi to samo co snippety z `.claude/skills/roll20-live-spike/snippets/` i dotyka tylko postaci o nazwie zaczynającej się od `Path20 spike`.

Przebudowanie bookmarkletu po zmianie kodu: `node scripts/build-bookmarklet.mjs`.

## Zanim zaczniesz: czy edytor Roll20 w ogóle działa na telefonie?
To pierwsza rzecz do sprawdzenia i sama w sobie jest cenną informacją.
1. Otwórz grę w **przeglądarce** (Chrome lub Firefox na Androidzie, nie w aplikacji Roll20) i włącz **„Wersja na komputer" / „Desktop site"**.
2. Wejdź do gry testowej. Adres powinien zawierać `/editor/`. Poczekaj, aż gra się w pełni załaduje.
3. Zapisz: czy edytor się ładuje, czy da się otworzyć Journal i arkusz postaci.

Jeśli edytor się nie ładuje, napisz mi, co widzisz (zrzut ekranu wystarczy). To też jest wynik spike'u.

## Uruchomienie panelu
1. Otwórz plik `mobile/spike-panel.bookmarklet.txt` w aplikacji Claude i skopiuj całą zawartość.
2. W Roll20 (w grze, w widoku desktop) dotknij paska adresu.
3. **Wpisz ręcznie** `javascript:` (Chrome usuwa ten prefiks przy wklejaniu), a zaraz za nim wklej resztę skopiowanego tekstu. Zatwierdź.
4. Na dole ekranu pojawi się panel z przyciskami.

## Kroki
| Przycisk | Co robi | Co mi wkleić |
|---|---|---|
| **1 Probe** | tylko odczyt, nic nie zmienia | całe pole tekstowe (**Copy** → wklej do czatu) |
| **2 Create** | tworzy postać `Path20 spike …` z kilkoma atrybutami, wierszami i 2 makrami | j.w. |
| **3 Readback** | **najpierw otwórz arkusz tej postaci** (Journal → dotknij → otwórz). Przez 30 s obserwuje, czy arkusz przelicza wartości | j.w. |
| **4 Macros** | drukuje 12 makr; wklej każde w czat Roll20 i opisz, co się pojawia (działa / błąd / nic) | wynik z czatu (zrzut ekranu wystarczy) |
| **5 Cleanup** | usuwa tylko postacie `Path20 spike*` | — |

Minimum, jeśli czasu mało: **1 Probe**. Jest tylko do odczytu i rozstrzyga, czy cały plan z rozszerzeniem ma sens.

## Ważne dla planu
- Firefox na Androidzie obsługuje rozszerzenia z AMO, więc docelowe rozszerzenie może działać także na telefonie (Chrome na Androidzie nie). Do sprawdzenia na etapie 7.
- Dopóki nie ma wyniku, `docs/spike-0b.md` pozostaje nieuzupełniony.
