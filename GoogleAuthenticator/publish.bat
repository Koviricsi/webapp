set TARGET=D:\www\GoogleAuthenticator

iisreset /stop
dotnet publish .\api\GoogleAuthenticator.sln -c Release -f net8.0 -o "%TARGET%"
xcopy ".\ui" "%TARGET%" /E /I /Y
xcopy "%TARGET%\ui\appsettings.teszt.json" "%TARGET%\ui\appsettings.json" /Y
iisreset /start