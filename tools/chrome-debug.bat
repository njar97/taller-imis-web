@echo off
REM Abre TU Chrome (con tu sesion de Google) dejando el puerto 9222 abierto,
REM que es por donde pedir_indexacion.py le da las ordenes.
REM OJO: cerra Chrome del todo antes de correr esto.
echo Cerrando Chrome...
taskkill /F /IM chrome.exe >nul 2>&1
timeout /t 2 >nul
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --remote-debugging-port=9222 ^
  --remote-allow-origins=http://localhost:9222 ^
  --user-data-dir="%LOCALAPPDATA%\Google\Chrome\User Data"
echo.
echo Chrome abierto con el puerto 9222. Ahora podes correr:
echo     python tools\pedir_indexacion.py https://imeltex.com.sv/banderas.html
echo.
pause
