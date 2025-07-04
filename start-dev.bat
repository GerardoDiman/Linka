@echo off
echo =================================
echo   LINKA v2.0 - Servidor de Desarrollo
echo =================================
echo.
echo Iniciando servidor proxy en puerto 3003...
start "Proxy Server" cmd /k "node simple-server.js"

echo Esperando 3 segundos...
timeout /t 3 /nobreak >nul

echo Iniciando servidor frontend en puerto 3000...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo =================================
echo  Servidores iniciados!
echo =================================
echo.
echo 🚀 Frontend: http://localhost:3000
echo 🔧 Proxy API: http://localhost:3003
echo.
echo Para probar la conexión con Notion:
echo 1. Ve a http://localhost:3000
echo 2. Selecciona la pestaña "Conectar"
echo 3. Pega tu token de integración de Notion
echo.
echo Presiona cualquier tecla para salir...
pause >nul 