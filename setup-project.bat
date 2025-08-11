@echo off
echo ========================================
echo    CONFIGURACIÓN DE LINKA v2.0
echo ========================================
echo.

echo 🔍 Verificando configuración actual...
node check-all-config.cjs

echo.
echo ========================================
echo    PASOS PARA CONFIGURAR EL PROYECTO
echo ========================================
echo.

echo 1. 📝 CONFIGURAR VARIABLES DE ENTORNO:
echo    - Copia el archivo env-complete.example a .env
echo    - Edita .env con tus valores reales:
echo      * NOTION_TOKEN (desde https://www.notion.so/my-integrations)
echo      * NOTION_LEADS_DATABASE_ID (ID de tu base de datos)
echo      * N8N_WEBHOOK_URL (URL de tu n8n en Hostinger)
echo      * N8N_WEBHOOK_SECRET (secret para webhooks)
echo.

echo 2. 🐳 INICIAR CONTENEDORES:
echo    docker-compose up -d
echo.

echo 3. 📦 INSTALAR DEPENDENCIAS:
echo    npm install
echo.

echo 4. 🚀 INICIAR DESARROLLO:
echo    npm run dev
echo.

echo 5. 🌐 ACCESOS:
echo    - Aplicación: http://localhost:3000
echo    - pgAdmin: http://localhost:8080 (admin@linka.com/admin123)
echo    - n8n: Tu URL de Hostinger
echo.

echo ========================================
echo    COMANDOS RÁPIDOS
echo ========================================
echo.
echo Para verificar configuración: node check-all-config.js
echo Para iniciar contenedores: docker-compose up -d
echo Para detener contenedores: docker-compose down
echo Para ver logs: docker-compose logs -f
echo Para reiniciar: docker-compose restart
echo.

pause 