@echo off
echo 🚀 Iniciando servidor unificado...
echo.

echo 📦 Construyendo frontend...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Error construyendo el frontend
    pause
    exit /b 1
)

echo ✅ Frontend construido exitosamente
echo.

echo 🖥️ Iniciando servidor unificado...
node unified-server.js

pause 