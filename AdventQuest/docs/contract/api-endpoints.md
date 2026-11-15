# **API végpontok specifikációja**

<!-- MARK: POST Login -->
## **1.Végpont:** `POST /login/{game_id:int}`

**Funkció:** A Google JWT ellenőrzése után az API saját JWT tokent állít ki a felhasználó számára.
**Hozzáférési jogosultság:** Anonim.
**Bemeneti paraméterek:**
- `int` `game_id` (URL): a játék adatbázisbeli azonosítója.
- `string` Google JWT (BODY): Google Identity Token.
**Visszatérési érték:**
- `string` API JWT: API access token.
**Lépések:**
1. A UI elküldi a Google JWT-t az API-nak a játék azonosítóját tartalmazó URL-en.
2. Az API ellenőrzi a Google JWT érvényességét:
   - digitális aláírás;
   - lejárati idő;
   - kibocsátó (`iss`);
   - címzett (`aud`), amelynek a Google Client ID-val kell megegyeznie.
3. Az API ellenőrzi, hogy a megadott `game_id` alapján létezik-e a játék.
4. Az API kiolvassa a Google JWT-ből a felhasználó `google_id` azonosítóját és email címét. Hiányzó azonosító vagy e-mail-cím esetén a bejelentkezés `{ status: 401, message: "Hiányzó azonosító" }` hibával megszakad. Az API megköveteli az `email_verified = true` értéket.
5. Az API megkeresi a felhasználó regisztrációját az aktuális játékban a `(game_id, google_id)` összetett kulcs alapján.
6. Ha nincs regisztráció:
   - `on_login` mód esetén létrehozza a `player` szerepkörű regisztrációt a Google JWT-ből kiolvasott adatokkal.
   - `manual` mód esetén elutasítja a bejelentkezést `{ status: 401, message: "Nem regisztrált felhasználó" }` hibával.
7. Az API a regisztráció adatai alapján előállítja az API JWT-t. A token tartalmazza:
   - `game_id` – játékazonosító;
   - `registration_id` – játékbeli regisztráció azonosítója;
   - `role` – játékbeli szerepkör;
   - `exp` – lejárati idő.
8. A token érvényességi ideje konfigurálható, alapértelmezett értéke 1 óra.
9. Az API visszaküldi a tokent a UI-nak.

**Hibakezelés:**
- Érvénytelen vagy lejárt Google JWT: `{ status: 401, message: "Google azonosítás sikertelen" }`.
- Hiányzó `google_id` a Google JWT-ben: `{ status: 401, message: "Hiányzó Google azonosító" }`.
- Hiányzó e-mail-cím a Google JWT-ben: `{ status: 401, message: "Hiányzó email cím" }`.
- Nem létező játék: `{ status: 404, message: "Nem létező játék" }`.
- Hiányzó regisztráció `manual` mód esetén: `{ status: 401, message: "Nem regisztrált felhasználó" }`.
- Egyéb szerveroldali hiba: `{ status: 500, message: <üzenet> }`.


<!-- MARK: Game -->
## **2.Végpont:** `GET /game`

**Funkció:** Visszaadja az aktuális játék konfigurációját.
**Hozzáférési jogosultság:** Player, Admin.
**Bemeneti paraméterek:** Nincs.
**Visszatérési érték:** `Game`

<!-- MARK: GET Cards -->
## **3.Végpont:** `GET /cards`

**Funkció:** Visszaadja az aktuális játékhoz tartozó kártyák listáját dátum szerinti növekvő sorrendben.
**Hozzáférési jogosultság:** Player, Admin.
**Bemeneti paraméterek:** Nincs.
**Visszatérési érték:** `Card[]`
**Tartalmi korlátozások:**
- Admin minden kártyaadatot megkap, beleértve a helyes válaszokat is.
- Player esetén a `correct_answer` mező csak akkor tartalmazhat értéket, ha a játék konfigurációja engedélyezi a helyes válaszok közzétételét, és a `publish_delay_hours` szerinti késleltetés is letelt.
- Egyéb esetben a `correct_answer` értéke üres (`""`).
- `locked` állapotú kártyánál a kérdés és a válaszlehetőségek értéke üres.

<!-- MARK: PATCH Cards -->
## **4.Végpont:** `PATCH /cards`

**Funkció:** A meglévő kártyák módosításait egyetlen kérésben menti, majd visszaadja a teljes friss kártyalistát.
**Hozzáférési jogosultság:** Admin.
**Bemeneti paraméterek:** `Card[]`
**Visszatérési érték:** `Card[]`
**Feltételek:**
- Csak meglévő kártyák módosíthatók.
- A kártya dátuma nem módosítható.
- Kártyaszerkesztés csak inaktív játék esetén engedélyezett.

<!-- MARK: POST Answer -->
## **5.Végpont:** `POST /answer`

**Funkció:** Rögzíti vagy felülírja a játékos adott kártyához tartozó válaszát.
**Hozzáférési jogosultság:** Player, Admin.
**Bemeneti paraméterek:** `PlayerAnswer`
**Visszatérési érték:** `Card`
**Feltételek:**
- Válasz csak a kártya saját dátumán vagy azt követően küldhető be.
- Válasz csak a napi határidőig küldhető be.
- A határidőig többszöri beküldés engedélyezett; mindig az utolsó sikeresen rögzített válasz érvényes.
- A sikeres beküldés frissíti a `submitted_at` időbélyeget.
- A játékos a határidő előtt nem kap helyességi visszajelzést.

<!-- MARK: GET Results -->
## **6.Végpont:** `GET /results`

**Funkció:** Visszaadja az aktuális játék teljes, API által kiszámított és rendezett eredménytábláját.
**Hozzáférési jogosultság:** Admin.
**Bemeneti paraméterek:** Nincs.
**Visszatérési érték:** `PlayerResult[]`

<!-- MARK: PATCH Results -->
## **7.Végpont:** `PATCH /results`

**Funkció:** Elmenti az admin által módosított válaszértékeléseket, újraszámolja az eredményeket, majd visszaadja a friss eredménytáblát.
**Hozzáférési jogosultság:** Admin.
**Bemeneti paraméterek:** `AnswerEvaluations`
**Visszatérési érték:** `PlayerResult[]`
**Feltételek:**
- Egy kérés több játékos több válaszának értékelését is tartalmazhatja.
- Csak a ténylegesen módosított értékeléseket kell elküldeni.
- A `true` helyes, a `false` helytelen értékelést jelent.
- A `null` visszaállítja az adminértékelést, így ismét az automatikus értékelés érvényesül.
- Mentés után az API újraszámolja a pontszámokat és az eredménysorrendet.
- A válasz minden esetben a teljes, friss `PlayerResult[]` lista.
