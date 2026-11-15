## **Hitelesítési folyamat**

### **1. Nincs API token**

1. A UI elindul, és megpróbálja lekérni a `Game` adatokat.
2. Az `apiCall` érzékeli, hogy nincs API token, ezért megjeleníti a Google Login nézetet.
3. A felhasználó bejelentkezik a Google-fiókjával, a UI megkapja a Google JWT-t.
4. A UI elküldi a Google JWT-t a `POST /login` végpontra.
5. Az API ellenőrzi a Google JWT-t, majd megkeresi a felhasználó regisztrációját az aktuális játékban.
   - Ha már regisztrált, betölti a regisztrációs adatait és jogosultságát.
   - Ha még nem regisztrált:
     - `on_login` mód esetén automatikusan létrehozza a `player` szerepkörű regisztrációt.
     - `manual` mód esetén elutasítja a belépést.
6. Sikeres hitelesítés esetén az API kiállítja és visszaküldi a saját JWT tokenjét, amely tartalmazza a játék- és felhasználó-azonosítót, valamint a jogosultságot.
7. A UI elmenti az API JWT-t, előállítja a `CurrentUser` objektumot, majd végrehajtja az eredeti `Game` lekérést.

### **2. Van API token, de lejárt**

1. A UI elindul, és megpróbálja lekérni a `Game` adatokat.
2. Az `apiCall` elküldi a kérést az elmentett API JWT-vel.
3. Az API érzékeli, hogy a token lejárt, és `401 Unauthorized` választ küld `TOKEN_EXPIRED` hibakóddal.
4. A UI törli a lejárt tokent, és elindítja a Google-hitelesítést.
5. A további folyamat megegyezik az 1. eset 3–7. lépésével.

### **3. Van érvényes API token**

1. A UI elindul, és megpróbálja lekérni a `Game` adatokat.
2. Az `apiCall` elküldi a kérést az elmentett API JWT-vel.
3. Az API ellenőrzi a tokent, és megállapítja, hogy érvényes.
4. Az API végrehajtja a kérést, és visszaküldi a `Game` adatokat.
5. A UI előállítja a `CurrentUser` objektumot, ha az még nem áll rendelkezésre.
