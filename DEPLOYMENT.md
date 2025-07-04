# 🚀 Guía de Despliegue en Vercel

## 📋 Pasos para Desplegar

### 1. Preparación del Repositorio
✅ **Completado**: Tu proyecto ya está en GitHub con:
- `.gitignore` configurado
- `vercel.json` configurado
- Funciones API en `/api/`
- Configuración de build en `package.json`

### 2. Conectar con Vercel

1. **Ve a [vercel.com](https://vercel.com)**
2. **Inicia sesión** con tu cuenta de GitHub
3. **Haz clic en "New Project"**
4. **Importa tu repositorio** `linkav2.0`

### 3. Configuración del Proyecto

Vercel detectará automáticamente que es una aplicación React/Vite. Los ajustes recomendados son:

- **Framework Preset**: Vite
- **Build Command**: `npm run build` (automático)
- **Output Directory**: `dist` (automático)
- **Install Command**: `npm install` (automático)

### 4. Variables de Entorno (Opcional)

Si quieres configurar variables de entorno por defecto:
- Ve a **Settings** → **Environment Variables**
- Agrega cualquier variable que necesites

**Nota**: Para este proyecto, las variables de entorno se manejan en el frontend, así que no son necesarias en Vercel.

### 5. Desplegar

1. **Haz clic en "Deploy"**
2. **Espera** a que termine el build (2-3 minutos)
3. **¡Listo!** Tu app estará en `https://tu-proyecto.vercel.app`

## 🔧 Configuración Automática

### Build Process
```bash
# Vercel ejecutará automáticamente:
npm install
npm run build
```

### Estructura de Archivos
```
/
├── dist/           # Build de producción (generado)
├── api/            # Funciones serverless
│   ├── databases.js
│   ├── test-connection.js
│   └── notion.js
├── src/            # Código fuente
├── vercel.json     # Configuración de Vercel
└── package.json    # Dependencias y scripts
```

## 🌐 URLs de la Aplicación

### Frontend
- **URL Principal**: `https://tu-proyecto.vercel.app`
- **Funciona como SPA**: Todas las rutas redirigen a `index.html`

### API Endpoints
- **Bases de datos**: `https://tu-proyecto.vercel.app/api/databases`
- **Test conexión**: `https://tu-proyecto.vercel.app/api/test-connection`
- **Base específica**: `https://tu-proyecto.vercel.app/api/databases/{id}`

## 🔄 Despliegues Automáticos

### Configuración Git
- **Cada push a `main`** = Despliegue automático
- **Pull Requests** = Preview deployments
- **Ramas** = Puedes configurar despliegues por rama

### Comandos Útiles
```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Desplegar manualmente
vercel

# Desplegar a producción
vercel --prod
```

## 🐛 Troubleshooting

### Error: Build Failed
**Síntomas**: Error en el proceso de build
**Solución**:
1. Revisa los logs en Vercel Dashboard
2. Verifica que `npm run build` funcione localmente
3. Asegúrate de que todas las dependencias estén en `package.json`

### Error: API Not Found
**Síntomas**: Error 404 en endpoints `/api/*`
**Solución**:
1. Verifica que los archivos en `/api/` existan
2. Confirma que `vercel.json` esté configurado correctamente
3. Revisa que las funciones exporten correctamente

### Error: CORS
**Síntomas**: Errores de CORS en el navegador
**Solución**:
1. Los headers CORS están configurados en `vercel.json`
2. Verifica que las funciones API incluyan headers CORS
3. Asegúrate de que el frontend use las URLs correctas

### Error: Environment Variables
**Síntomas**: Variables de entorno no disponibles
**Solución**:
1. Este proyecto no requiere variables de entorno en Vercel
2. Las configuraciones se manejan en el frontend
3. Si necesitas variables, agrégalas en Vercel Dashboard

## 📊 Monitoreo

### Vercel Analytics
- **Performance**: Métricas de rendimiento automáticas
- **Function Logs**: Logs de las funciones serverless
- **Deployments**: Historial de despliegues

### Logs de Función
```bash
# Ver logs en tiempo real
vercel logs

# Ver logs de una función específica
vercel logs api/databases.js
```

## 🔒 Seguridad

### Headers de Seguridad
- **CORS**: Configurado para permitir requests desde cualquier origen
- **Content-Type**: Configurado para JSON
- **Authorization**: Requerido para endpoints de Notion

### Tokens de Notion
- **Nunca se almacenan** en Vercel
- **Se envían** desde el frontend en cada request
- **Se validan** en cada función serverless

## 🚀 Optimizaciones

### Performance
- **Static Assets**: Servidos desde CDN global
- **Serverless Functions**: Escalado automático
- **Edge Network**: Distribución global

### Caching
- **Static Files**: Cache automático en CDN
- **API Responses**: No cache por defecto (datos dinámicos)
- **Headers**: Configurados para optimizar cache

## 📱 PWA (Progressive Web App)

Si quieres convertir tu app en PWA:
1. Agrega un `manifest.json`
2. Configura service workers
3. Vercel servirá automáticamente los assets PWA

## 🎯 Próximos Pasos

1. **Desplegar** siguiendo los pasos arriba
2. **Probar** la funcionalidad en producción
3. **Configurar** dominio personalizado (opcional)
4. **Monitorear** performance y logs
5. **Iterar** y mejorar basado en feedback

---

## 🆘 Soporte

Si tienes problemas:
1. **Revisa los logs** en Vercel Dashboard
2. **Verifica la configuración** en `vercel.json`
3. **Prueba localmente** con `npm run build`
4. **Consulta la documentación** de Vercel
5. **Abre un issue** en GitHub si persiste

¡Tu aplicación estará lista para producción en minutos! 🎉 