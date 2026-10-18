# Uwaga: arkusz „Pathfinder 2e Demiplane" (zmiana założeń)

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
