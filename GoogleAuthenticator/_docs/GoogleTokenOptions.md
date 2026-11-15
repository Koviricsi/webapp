# GoogleTokenOptions – specifikáció

## 1. Funkció

A `GoogleTokenOptions` osztály a `GoogleTokenService` működéséhez szükséges konfigurációs beállításokat tartalmazza.
A beállítások meghatározzák a Google ID token elfogadásához szükséges alkalmazásazonosítót, valamint az opcionális felhasználói ellenőrzéseket.

## 2. Tulajdonságok

| Tulajdonság     | Típus     | Kötelező | Leírás                                                                          |
| --------------- | --------- | -------- | ------------------------------------------------------------------------------- |
| `ClientId`      | `string`  | Igen     | Az alkalmazás Google Client ID-ja. A token `aud` mezőjének ezzel kell egyeznie. |
| `EmailVerified` | `bool?`   | Nem      | Ha értéke nem null, az `email_verified` mezőnek egyeznie kell vele.             |
| `HostedDomain`  | `string?` | Nem      | Ha értéke nem null, a token `hd` mezőjének ezzel kell egyeznie.                 |

A null érték azt jelenti, hogy az adott ellenőrzést nem kell végrehajtani.

