# MB Kreicas svetainė

Vieno puslapio (SPA stiliaus) svetainių rinkinys, sukurtas pristatyti naudotus ir naujus automobilius lietuviškai kalbančiam vartotojui.

## Struktūra
- `index.html` – pagrindinis puslapis su išskirtiniais pasiūlymais.
- `cars.html` – visas automobilių katalogas su paieška ir filtrais.
- `car.html?slug=...` – individualaus automobilio puslapis.
- `about.html`, `contact.html` – informaciniai puslapiai.
- `admin.html` – paprasta valdymo sąsaja (localStorage pagrindu).
- `assets/data/cars.json` – numatytas 11 automobilių sąrašas.
- `assets/css` ir `assets/js` – stiliai bei interaktyvumas.

## Naudojimas
1. Paleiskite bet kokį statinį serverį (pvz., `npx serve`) šio katalogo šaknyje arba atidarykite `index.html` naršyklėje.
2. Į „Admin“ skiltį pateksite per `admin.html`. Čia galite:
   - Pridėti naują automobilį be kodo redagavimo.
   - Redaguoti esamus automobilius ir saugoti pakeitimus naršyklės atmintyje.
   - Eksportuoti / importuoti JSON failą visam automobilių sąrašui.
   - Atstatyti numatytą sąrašą, įkeliant `assets/data/cars.json` duomenis.

> Pastaba: localStorage veikia kiekviename įrenginyje atskirai. Norėdami pasidalinti pakeitimais, eksportuokite JSON failą ir importuokite jį kitame įrenginyje.

## Pritaikymas mobiliesiems
Svetainė kurta „mobile-first“ principu, naudojant šiuolaikinius CSS (flex/grid) sprendimus ir animuotas sąsajas.

## Licencija
Projektas pateikiamas demonstraciniais tikslais.
