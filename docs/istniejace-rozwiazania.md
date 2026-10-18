# Przegląd istniejących rozwiązań (Etap planowania)

Cel: rozszerzenie przeglądarki dla graczy **bez Roll20 Pro**, importujące postać z Pathbuildera 2e do arkusza „Pathfinder Second Edition by Roll20".

| Projekt | Rodzaj | Pro? | Co robi | Użyteczność dla nas |
|---|---|---|---|---|
| [`justas-d/roll20-character-exporter-importer`](https://github.com/justas-d/roll20-character-exporter-importer) (MIT, 2018, MV2, Firefox) | WebExtension | nie | Eksport/import atrybutów dowolnego arkusza opartego na atrybutach przez JSON. Wstrzykuje skrypt do kontekstu strony i używa wewnętrznych modeli Roll20 | **Kluczowa**: dowodzi, że da się tworzyć postacie i atrybuty z poziomu klienta, bez API Script |
| [`JustStas/path-to-roll`](https://github.com/JustStas/path-to-roll) (MIT, MV3, Chrome) | WebExtension | nie | Z Pathbuildera kopiuje rzuty do czatu Roll20 (content scripty na obu domenach, bridge wstrzykiwany do strony) | Wzorzec architektury MV3: `pathbuilder.js` + `roll20.js` + skrypt w kontekście strony. **Nie** importuje postaci |
| [`zmenciso/Build20`](https://github.com/zmenciso/Build20) | skrypt Python | nie (makra) / tak (API) | Pathbuilder JSON → makra Roll20 do wklejenia | Przykład mapowania Pathbuilder → rzuty; nie wypełnia arkusza |
| Pathfinder2eImporter (wiki Roll20) | API Script (draft) | **tak** | `!importPF2`, JSON z Campaign Notes | Porównanie funkcjonalne; kodu nie widziałem |
| Guidance Tools PF2e | API Script | **tak** | `!pf_pcbuilder` (zapowiedziany) | j.w. |
| Foundry: Pathmuncher, pathbuilder2e-import | moduły Foundry | – | Dojrzałe importery Pathbuilder → Foundry | Wzorzec logiki mapowania (klasy, atuty, ekwipunek) |

## Technika dla wersji bez Pro (ustalona z kodu `roll20-character-exporter-importer`)

1. Content script (świat „isolated") wstrzykuje do strony drugi skrypt (świat „main"), bo tylko on widzi obiekt `window.Campaign`.
2. Postać tworzymy: `window.Campaign.characters.create({ name, avatar })`.
3. Atrybuty: `pc.attribs.create()` → ustawiamy `name`/`current`/`max` → `.save()`. Istniejące szukamy po `model.get("name")`.
4. Bio/notatki: `pc.updateBlobs({ bio })`.
5. Sekcje powtarzalne to zwykłe atrybuty o nazwie `repeating_<sekcja>_<-rowId>_<pole>`, więc ta sama metoda je obsłuży (rowId generujemy sami, w formacie `-` + 19 znaków base64-podobnych).
6. Przycisk „Import" doczepiamy do dziennika/arkusza przez `MutationObserver`.

## Ryzyka (do zweryfikowania na żywym Roll20)

- Kod ma 8 lat. Wewnętrzne API Roll20 (`Campaign.characters`, `attribs.create`) **mogło się zmienić**. Pierwszy test: prosty skrypt w konsoli DevTools na żywej kampanii.
- **Sheet workers**: oficjalny arkusz liczy wartości pochodne (modyfikatory, bonusy, HP). Trzeba sprawdzić, czy zapis atrybutów z klienta je uruchamia i w jakiej kolejności. Jeśli nie, liczymy wartości sami i wpisujemy gotowe.
- Roll20 może zmienić wewnętrzne API bez ostrzeżenia, więc potrzebny jest tryb awaryjny (eksport do tekstu/makr do wklejenia).
- Zgodność z regulaminem Roll20: rozszerzenie działa wyłącznie po stronie klienta użytkownika i nie omija płatnych funkcji (nie uruchamia API Script).
- Manifest V3: skrypt w świecie „main" ładujemy jako `web_accessible_resources` (jak `path-to-roll`) albo `content_scripts` z `"world": "MAIN"`.

## Wniosek dla planu

- Rozszerzenie (MV3, Chrome + Firefox) staje się **głównym produktem**, a API Script spada do opcji dodatkowej dla GM-ów z Pro.
- Rdzeń (`packages/core`) bez zmian: czyste mapowanie Pathbuilder JSON → lista `{name, current, max}`, którą konsumuje rozszerzenie (i opcjonalnie API Script).
- Etap 0b (przed Etapem 1): **spike w konsoli DevTools**, czyli ręczne utworzenie postaci z kilkoma atrybutami (`level`, `strength`, `repeating_feat-class_…`) i sprawdzenie, czy arkusz się przelicza.
