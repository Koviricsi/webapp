
## **1. `POST /login` Bejelentkezés**

1. A UI elküldi a Google JWT-t az API-nak.
2. Az API ellenőrzi a Google JWT érvényességét.
3. Az API megkeresi a felhasználó regisztrációját az aktuális játékban.
4. Ha nincs regisztráció:
   - `on_login` mód esetén létrehozza a `player` szerepkörű regisztrációt.
   - `manual` mód esetén elutasítja a bejelentkezést.
5. Az API a regisztráció adatai alapján előállítja az API JWT-t.
6. Az API visszaküldi a tokent a UI-nak.

**Sikertelen esetek:**
- Érvénytelen Google JWT: `401 Unauthorized`.
- Hiányzó regisztráció `manual` mód esetén: a regisztráció hiányát jelző hiba.
- Egyéb szerveroldali hiba: megfelelő hibaválasz.

## **2.`GET /game` Játékadatok lekérése**

1. A UI elküldi a kérést az API-nak az API JWT-vel.
2. Az API ellenőrzi a JWT érvényességét és a játékhoz tartozó jogosultságot.
3. Érvényes hitelesítés esetén az API lekéri az aktuális játék konfigurációját.
4. Az API visszaküldi a `Game` objektumot a UI-nak.

**Sikertelen esetek:**

- Hiányzó, lejárt vagy érvénytelen API JWT: `401 Unauthorized`.
- Nem megfelelő jogosultság: `403 Forbidden`.
- Nem található aktuális játék: megfelelő hibaválasz.

**Dokumentációs szempont:** a `POST /login` a Google-azonosítást és a játékbeli regisztráció ellenőrzését végzi. A `GET /game` már az API JWT-vel hitelesített kérések közé tartozik, és a játék konfigurációját szolgáltatja.