# 2. API követelmények


## 2.1. Hitelesítés

- A játékos Google-fiókkal azonosítja magát.
- Az API saját access tokent ad ki.
- Az access token hiánya vagy érvénytelensége Google-belépést indít a kliensoldalon.
- Érvényes token esetén nincs szükség ismételt Google-belépésre.
- Az API a Google-fiók egyedi azonosítóját használja a felhasználó azonosítására.


## 2.2. Jogosultságkezelés

- A jogosultság a játékhoz tartozó regisztrációhoz kapcsolódik.
- A szerepkörök: játékos és adminisztrátor.
- Egy játékban több adminisztrátor is lehet.
- Az egyik játék adminisztrátori jogosultsága nem jelent automatikus jogosultságot más játékokban.
- Az API minden kérésnél ellenőrzi a szükséges jogosultságot.


## 2.3. Játék és regisztráció kezelése

- A játékok egymástól függetlenek.
- Egy Google-fiók több játékban is részt vehet.
- Egy játékban ugyanaz a Google-fiók csak egyszer regisztrálhat.
- A regisztráció módja konfigurálható.
- A kártyák előzetesen kerülnek az adatbázisba.
- A UI nem biztosít kártyalétrehozási vagy -törlési funkciót.


## 2.4. Kártyák lekérdezése

Az API biztosítja:
- az adott játék kártyáinak lekérdezését;
- a kártyák tartalmának továbbítását;
- a játékos számára elérhető kártyák állapotának megadását;
- az admin számára a kártyák szerkeszthető adatainak továbbítását.


## 2.5. Kártyák szerkesztése

- Adminisztrátor módosíthatja a kártyák feliratát, képét, kérdését és válaszlehetőségeit.
- A módosítások külön mentési művelettel kerülnek elküldésre.
- Az API elmenti a módosításokat az adatbázisba.


## 2.6. Válaszok kezelése

- A játékos a határidő lejártáig beküldheti a válaszát.
- Többszöri beküldés engedélyezett.
- Mindig az utolsó sikeresen rögzített válasz számít.
- A rendszer nem jelez vissza a válasz helyességéről a határidő előtt.
- A határidő után új válasz nem fogadható el.
- Hálózati hiba esetén az újraküldés a megoldás.
- Az API-nak szerveroldalon kell ellenőriznie a határidőt.


## 2.7. Helyes válasz közzététele

- A helyes válasz közzététele játékonként konfigurálható.
- Ha engedélyezett, akkor a napi határidő lejárta után meghatározott várakozási idővel válik láthatóvá.
- A várakozási idő órában konfigurálható.
- Ha a közzététel tiltott, a játékosok a korábbi kártyákon sem láthatják a helyes választ.


## 2.8. Eredmények kezelése

- Az API tárolja a játékosok válaszait és azok értékelését.
- Az API számolja a pontszámokat.
- Az API állítja elő a dinamikusan rendezett eredménytáblázatot.
- Az eredmények módosítása után újraszámolja és újrarendezi a táblázatot.


## 2.9. Adminisztrátori értékelés

- Az adminisztrátorok módosíthatják a szöveges válaszok értékelését.
- A módosítások egyelőre csak a kliensoldalon érvényesülnek.
- A Mentés gomb az összes módosítást egyetlen API-kérésben küldi el.
- Sikeres mentés után az API visszaadja a frissített eredménytáblázatot.