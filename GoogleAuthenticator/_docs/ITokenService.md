## **ITokenService – specifikáció**

**1. Funkció**

Az `ITokenService` interfész meghatározza a token alapú azonosítás közös műveletét.

**2. Metódusok**

| Metódus             | Bemeneti paraméter | Visszatérési érték      | Leírás                                                                                |
| ------------------- | ------------------ | ----------------------- | ------------------------------------------------------------------------------------- |
| `AuthenticateAsync` | `string token`     | `Task<ClaimsPrincipal>` | A token ellenőrzése és a benne található claim-ekből a `ClaimsPrincipal` előállítása. |

**3. Hibakezelés**

A sikertelen azonosítást kivételekkel jelzi.
