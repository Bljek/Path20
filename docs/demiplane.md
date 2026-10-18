# Szablon „Pathfinder 2e (Demiplane Optional)" — ustalenia

Użytkownik podał, że jego karty to **Pathfinder 2e Demiplane (Optional)**. Cały dotychczasowy plan (schemat atrybutów, mapper, makra `%{Postać|PRZYCISK}`) zakładał **oficjalny, otwartoźródłowy arkusz „Pathfinder Second Edition by Roll20"** z repozytorium `Roll20/roll20-character-sheets`. Arkusz Demiplane **nie występuje w tym repozytorium** (sprawdzone: katalogi `Pathfinder*` zawierają tylko starsze arkusze).

## Co wiemy (z wyszukiwania, bez potwierdzenia u źródła)
- Roll20 przejął Demiplane; trwa integracja: postacie z Demiplane/Nexus można podłączać do kampanii Roll20 (beta dla PF2e).
- Starszy arkusz „Pathfinder 2e Remastered by Roll20" ma być **archiwizowany** po starcie publicznej bbety integracji.
- Źródła: Roll20 blog (integracja Demiplane), forum Demiplane (roadmapa bety), pages.roll20.net/roll20-x-demiplane. Strony niedostępne z sandboxa, więc brak szczegółów.

## Niewiadome, które blokują projekt
1. Czy postać w Roll20 jest zwykłym arkuszem z atrybutami (`attribs`), czy **widokiem danych trzymanych w Demiplane** (wtedy zapis z klienta Roll20 może nie mieć sensu)?
2. Czy „Optional" oznacza tryb zgodności/wybór arkusza w ustawieniach kampanii, i które nazwy atrybutów i przyciski obowiązują?
3. Czy Demiplane ma własny import (np. z Pathbuildera) lub własne API, które lepiej wykorzystać niż pisać zapis do Roll20?
4. Czy w tym trybie działają makra `%{}` i dostęp do `window.Campaign` z konsoli?

## Konsekwencje
- `packages/schema-roll20`, test kontraktowy i `docs/mapowanie.md` dotyczą **starego** arkusza; mogą być nieadekwatne.
- Spike 0b (panel `mobile/spike-panel.js`) i tak jest użyteczny: krok „1 Probe" pokaże, jaki arkusz/atrybuty ma kampania.
- Plan docelowy może się zmienić na: import do Demiplane, albo narzędzie generujące makra/atrybuty dla arkusza zgodnego, zależnie od odpowiedzi powyżej.


## Aktualizacja po zrzucie ekranu ustawień kampanii (od użytkownika)
- Szablon kampanii to **„Pathfinder 2e (Demiplane Optional)"**, autorzy: „Demiplane and User Collaboration Team". Gra ma włączone karty Demiplane; **szablonu nie da się zmienić** w istniejącej grze (trzeba nową grę).
- Opis szablonu: to tryb **multi-sheet**. „Existing Roll20 character sheets and Demiplane NEXUS sheets can now be used together". Gracze wybierają jedną z dwóch opcji; gracze Demiplane muszą połączyć konto Roll20 z Demiplane.
- „Drag-and-drop from the Roll20 Compendium will work only with native Roll20 sheets."
- „The most up-to-date PF2e sheet is on the Demiplane NEXUS" (tam budowana, potem używana w VTT).

### Wniosek (koryguje poprzednią wersję tej notatki)
- Nasz cel to **natywny arkusz Roll20** (atrybutowy) w tym szablonie. Dotychczasowy schemat (`packages/schema-roll20`) pozostaje użyteczny, **o ile** natywna część szablonu ma te same nazwy atrybutów co arkusz z repozytorium. Do potwierdzenia przyciskiem **6 Dump** na istniejącej, natywnej karcie.
- Karty **Demiplane** (Nexus) są poza zakresem: dane żyją na Demiplane, nie w atrybutach Roll20.
- Ryzyko: natywny arkusz „Demiplane Optional" może być nowszą wersją niż ta w repozytorium (autorzy w sheet.json repozytorium: tylko „User Collaboration Team"). Po Dumpie porównać z schematem (`hit_points_ancestry`, `athletics_rank`, sekcje `repeating_*`).
- Pytanie do użytkownika: czy w tej grze postać można utworzyć jako natywną (nie-Demiplane)? Jeśli nie, projekt wymaga zmiany celu.
