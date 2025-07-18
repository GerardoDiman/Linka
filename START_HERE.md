# 🚀 Inicio Rápido - Linka v2.0

## ⚡ Configuración de Desarrollo Local

Para desarrollo local, tienes varias opciones para ejecutar la aplicación:

### 🔧 Opción 1: Script Automático (Windows)
```bash
npm run start
# O simplemente hacer doble clic en: start-dev.bat
```

### 🔧 Opción 2: Manual (Todos los OS)
```bash
# Terminal 1: Servidor Proxy
node simple-server.js

# Terminal 2: Frontend (nueva terminal)
npm run dev
```

### 🔧 Opción 3: Un Solo Comando
```bash
npm run dev:full
```

## 🎯 URLs de Acceso

- **Frontend**: http://localhost:5173
- **Proxy API**: http://localhost:3002

## 🧪 Probar la Aplicación

### Modo Demo (Sin configuración)
1. Ve a http://localhost:5173
2. Clic en "Usar Datos de Demostración"
3. ¡Explora todas las funcionalidades!

### Modo Notion Real
1. Ve a http://localhost:5173
2. Clic en pestaña "Conectar"
3. Pega tu token de integración de Notion
4. ¡Visualiza tus bases de datos reales!

## 🔑 Obtener Token de Notion

1. Ve a [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Crea nueva integración
3. Copia el token (empieza con `ntn_`)
4. Comparte bases de datos con tu integración

## ❗ Solución de Problemas

### Error: "Failed to fetch"
- **Causa**: El servidor proxy no está ejecutándose
- **Solución**: Ejecuta `node simple-server.js` en una terminal

### Error: "Token inválido"
- **Causa**: Token mal formateado o sin permisos
- **Solución**: Verifica que el token empiece con `ntn_` o `secret_`

### Error: "Sin bases de datos"
- **Causa**: No has compartido bases de datos con la integración
- **Solución**: En Notion, comparte las bases de datos con tu integración

### Error: "405 Method Not Allowed" (en Vercel)
- **Causa**: Problema con las funciones serverless
- **Solución**: Verifica los logs de Vercel y asegúrate de que las funciones estén correctamente configuradas

## 💡 ¿Por Qué Necesito Dos Servidores en Desarrollo?

- **Frontend (Puerto 5173)**: La aplicación React
- **Proxy API (Puerto 3002)**: Maneja la comunicación con Notion (evita problemas de CORS)

En producción solo necesitas uno porque usamos funciones serverless de Vercel.

## 🚀 Despliegue en Vercel

Para desplegar en Vercel:

1. **Conecta tu repositorio** a Vercel
2. **Configura las variables de entorno** si es necesario
3. **Deploy automático** - Vercel detectará la configuración
4. **¡Listo!** Tu app estará disponible en `https://tu-proyecto.vercel.app`

### Archivos de Configuración Importantes
- `vercel.json` - Configuración de funciones serverless
- `api/` - Funciones serverless para el backend
- `package.json` - Scripts y dependencias

---

**🎯 ¡Ahora sí funciona! Disfruta explorando tus datos de Notion de manera visual.** 