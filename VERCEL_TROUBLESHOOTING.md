# 🔍 Troubleshooting Error 405 en Vercel

## 🚨 Problema Actual
```
Failed to load resource: the server responded with a status of 405 ()
```

## 🔧 Pasos de Diagnóstico

### 1. Verificar Funciones Serverless
```bash
# Después del deploy, verifica que las funciones estén activas
# Ve a: https://vercel.com/dashboard/[tu-proyecto]/functions
```

### 2. Probar Endpoints Manualmente
```bash
# Probar endpoint de debug
curl https://tu-app.vercel.app/api/debug

# Probar endpoint de hello
curl https://tu-app.vercel.app/api/hello

# Probar auth endpoint
curl -X POST https://tu-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123"}'
```

### 3. Verificar Logs de Vercel
1. Ve al dashboard de Vercel
2. Selecciona tu proyecto
3. Ve a "Functions" → "View Function Logs"
4. Busca errores específicos

## 🐛 Posibles Causas y Soluciones

### Causa 1: Funciones No Detectadas
**Síntoma**: Las funciones no aparecen en el dashboard de Vercel

**Solución**:
```json
// vercel.json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

### Causa 2: Método HTTP Incorrecto
**Síntoma**: Error 405 en endpoints específicos

**Verificar**:
- Frontend está enviando el método correcto
- Función serverless maneja el método correcto

### Causa 3: CORS Issues
**Síntoma**: Error 405 en preflight requests

**Solución**: Asegurar que todas las funciones manejen OPTIONS:
```javascript
if (req.method === 'OPTIONS') {
  res.status(200).end();
  return;
}
```

### Causa 4: Rutas Incorrectas
**Síntoma**: Error 405 en todas las rutas

**Verificar**:
- Archivos están en `/api/`
- Nombres de archivos coinciden con rutas
- `vercel.json` tiene rewrites correctos

## 📋 Checklist de Verificación

### ✅ Configuración de Archivos
- [ ] `vercel.json` en la raíz del proyecto
- [ ] Funciones en directorio `/api/`
- [ ] Todas las funciones usan `export default`
- [ ] `package.json` tiene `"type": "module"`

### ✅ Funciones Serverless
- [ ] `/api/hello.js` - Endpoint de prueba
- [ ] `/api/debug.js` - Endpoint de debug
- [ ] `/api/auth/login.js` - Login
- [ ] `/api/auth/register.js` - Registro
- [ ] `/api/auth/logout.js` - Logout
- [ ] `/api/databases.js` - Bases de datos
- [ ] `/api/database.js` - Base específica
- [ ] `/api/test-connection.js` - Test conexión

### ✅ Manejo de CORS
- [ ] Headers CORS en `vercel.json`
- [ ] Headers CORS en cada función
- [ ] Manejo de OPTIONS requests

### ✅ Métodos HTTP
- [ ] Cada función valida el método correcto
- [ ] Respuestas 405 para métodos incorrectos
- [ ] Manejo de preflight OPTIONS

## 🔍 Debugging Avanzado

### 1. Crear Función de Test Simple
```javascript
// api/test-simple.js
export default function handler(req, res) {
  res.json({ 
    message: 'Simple test working',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });
}
```

### 2. Verificar Variables de Entorno
```javascript
// api/env-test.js
export default function handler(req, res) {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    vercelRegion: process.env.VERCEL_REGION,
    vercelFunction: process.env.VERCEL_FUNCTION_NAME
  });
}
```

### 3. Logs Detallados
```javascript
// Agregar a cada función
console.log('🔍 Function called:', {
  method: req.method,
  url: req.url,
  headers: req.headers,
  timestamp: new Date().toISOString()
});
```

## 🚀 Pasos de Despliegue

### 1. Preparar Código
```bash
git add .
git commit -m "Fix Vercel 405 error - troubleshooting"
git push
```

### 2. Verificar Deploy
```bash
# Esperar a que termine el deploy
# Verificar en dashboard de Vercel
```

### 3. Probar Endpoints
```bash
# Probar debug endpoint
curl https://tu-app.vercel.app/api/debug

# Si funciona, probar auth
curl -X POST https://tu-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"test"}'
```

## 📞 Si el Problema Persiste

1. **Revisar logs completos** en Vercel dashboard
2. **Verificar que el deploy fue exitoso**
3. **Probar endpoints uno por uno**
4. **Verificar que las funciones aparecen en el dashboard**
5. **Contactar soporte de Vercel** si es necesario

## 🎯 Próximos Pasos

Una vez que identifiquemos la causa específica:
1. Aplicar la solución correspondiente
2. Hacer nuevo deploy
3. Verificar que funciona
4. Documentar la solución para futuras referencias 