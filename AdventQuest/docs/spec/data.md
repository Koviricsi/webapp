# 1. Adatséma és JSON alapú kliens–API kommunikáció

Közös specifikáció
Ez a dokumentum határozza meg az adatbázis logikai modelljét és az API által küldött/fogadott JSON-adatok szerkezetét.


## 1.1. Adatmodell – entitások

Google-felhasználó
- A Google-fiók egyedi azonosítója alapján azonosított felhasználó.
- Egy felhasználó több játékban is részt vehet.

Játék
- Önálló kvíz, például történelmi vagy matematikai kvíz.
- Saját konfigurációval, kérdésekkel, résztvevőkkel és eredményekkel rendelkezik.
- A többi játéktól független.

Regisztráció / részvétel
- Egy Google-felhasználó és egy játék kapcsolata.
- Egy Google-felhasználó egy adott játékban pontosan egyszer regisztrálhat.
- A jogosultság (szerepkör) ehhez az entitáshoz tartozik.
- Egy játékban több adminisztrátor is lehet.

Kérdés / kártya
- Egy játékhoz tartozik.
- Egy dátumhoz legfeljebb egy kártya tartozhat.
- A kártyák száma előre nem meghatározott.
- A kártyák létrehozása és törlése nem része a UI funkcionalitásának. Előzetesen, például szkripttel vagy manuálisan kerülnek az adatbázisba.

Válasz
- Egy részvételhez és egy kérdéshez tartozik.
- Tárolja a játékos válaszát és a beküldés időpontját.
- Tárolja az értékelés eredményét.
- A végleges válasz mindig az utolsó sikeresen rögzített beküldés.


## 1.2. Kérdéstípusok

Két kérdéstípus támogatása szükséges:
- Feleletválasztós: négy válaszlehetőség, amelyek közül pontosan egy jelölhető meg.
- Szöveges: rövid, esetleg egyszavas szöveges válasz.
A szöveges válasz értékelése lehet:
- automatikus, kis- és nagybetűkre nem érzékeny szöveg-összehasonlítással;
- manuális adminisztrátori értékeléssel.
A végleges értékelési mechanizmus még nincs eldöntve.


## 1.3. Játék konfigurációja

Minden játék saját konfigurációval rendelkezik.

Az eddig azonosított konfigurációs paraméterek:
Paraméter					Jelentés
Válaszadási határidő		Napi határidő, például 20:00, 22:00 vagy 24:00
Válasz közzététele			Engedélyezett-e a helyes válasz játékosok számára történő közzététele
Közzététel késleltetése		A napi határidő után eltelt idő, például 8 óra
Regisztráció módja			Automatikus vagy manuális regisztráció

A regisztráció pontos működése még nyitott kérdés. Felmerült az első belépéskori, az első válaszbeküldéskori automatikus és a manuális regisztráció.


## 1.4. Eredmények és értékelés

- Helyes válaszonként 1 pont jár.
- A gyorsasági sorrend kérdésenként értendő.
- A gyorsaság alapja az utolsó sikeresen rögzített válasz beküldési időpontja.
- A helytelen válasz 0 pontot ér.
- A válasz nélküli kérdés nem ad pontot.
- A manuális értékelés eredménye tárolandó.


## 1.5. JSON API-szerződés

A kommunikáció JSON-alapú.

A szerződésnek később pontosan meg kell határoznia:
- a kérések és válaszok mezőit;
- az adattípusokat;
- a kötelező és opcionális mezőket;
- az azonosítókat;
- a dátum- és időformátumokat;
- a hibaválaszok szerkezetét;
- az autentikáció módját.