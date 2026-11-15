3. UI követelmények


## 3.1. Általános követelmények

- Egyoldalas webalkalmazás (SPA).
- Két képernyőből áll:
  1. Adventi naptár.
  2. Eredmények.
- Reszponzív megjelenítés.
- Elsődleges célplatform: mobil.
- Másodlagos célplatform: desktop.
- A desktop elrendezése jelentősen eltérhet a mobilétól.


## 3.2. Indulás és belépés

- Az alkalmazás induláskor ellenőrzi a lokális access tokent.
- Hiányzó vagy érvénytelen token esetén Google-belépést indít.
- Érvényes token esetén automatikusan folytatja az alkalmazás betöltését.
- A megfelelő játék és regisztráció állapotának lekérdezése szükséges.


## 3.3. Navigáció

- Az adminisztrátor számára a fejlécen két navigációs gomb jelenik meg:
  - Naptár.
  - Eredmények.
- A két gomb a megfelelő képernyőre navigál.
- A játékos számára csak a naptár képernyő érhető el.
- Az eredmények képernyő nem érhető el játékos jogosultsággal.


## 3.4. Adventi naptár képernyő

A képernyő három fő részből áll:
- állandó fejléc;
- középső, kártyákat tartalmazó terület;
- állandó lábléc.
A kártyák:
- egymás mellett, több sorban jelennek meg;
- alapállapotban a hátlapjuk látszik;
- csak a nem jövőbeli dátumhoz tartozó kártyák fordíthatók meg;
- a jövőbeli kártyákon lakat vagy más tiltó jelzés látható.


## 3.5. Kártya megjelenítése és megfordítása

Megfordítás után a kártya tartalmazza:
- a feliratot;
- a képet;
- a kérdést;
- a válaszmezőt.
Feleletválasztós kérdésnél:
- négy válaszopció jelenik meg;
- radio button használatával pontosan egy válasz jelölhető meg.
Szöveges kérdésnél:

- szöveges inputmező jelenik meg.

A játékos:
- beküldheti a válaszát;
- a határidő előtt újraküldheti;
- nem kap visszajelzést a válasz helyességéről.
A beküldött válasz állapotának újratöltés után is meg kell maradnia. A kártya a válaszadási időszak lezárulta után nem szerkeszthető.

A közzétételi konfigurációtól függően a korábbi kártyákon megjelenhet a helyes válasz.


## 3.6. Adminisztrátori kártyaszerkesztés

- Az admin ugyanazt a kártyafelületet látja, de szerkeszthető változatban.
- A felirat, kép, kérdés és válaszopciók módosíthatók.
- A változtatások nem kerülnek automatikusan mentésre.
- Külön Mentés gomb szükséges.
- A Mentés gomb az összes módosított kártyát elküldi az API-nak.


## 3.7. Eredmények képernyő

- Csak adminisztrátorok érhetik el.
- Nem szerkeszthető a játékosok számára.
- A sorok a játékosokat képviselik.
- Az oszlopok a kérdéseket képviselik.
- A cellákban a válasz és a beküldés időpontja jelenik meg.
- Válasz hiányában visszafogott jelölés szerepel, például –.
A cellák színkódjai:
- Zöld
   Helyes válasz.
- Piros
   Helytelen válasz.
- Kék
   Még nem értékelt válasz.


## 3.8. Adminisztrátori eredményértékelés

- Az admin a szöveges válaszokat manuálisan értékelheti.
- Az értékelések módosítása helyben történik.
- A táblázat szerkesztés közben nem rendeződik át.
- A Mentés gomb minden módosítást elküld.
- Sikeres mentés után az API által visszaadott, újrarendezett táblázat jelenik meg.