# 🚀 Despliegue en Vercel - Solución de Problemas

## ❌ Error 405 - Method Not Allowed

### Problema
```
Failed to load resource: the server responded with a status of 405 ()
```

### Causas Comunes

1. **Funciones Serverless no configuradas correctamente**
2. **Manejo de CORS incorrecto**
3. **Métodos HTTP no permitidos**
4. **Configuración de Vercel incorrecta**

## ✅ Soluciones Implementadas

### 1. Configuración de Vercel (`vercel.json`)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

### 2. Funciones Serverless Corregidas

Todas las funciones en `/api/` ahora:
- Usan **ES modules** (`export default`) consistentemente
- Manejan **CORS** correctamente
- Responden a **OPTIONS** requests (preflight)
- Validan métodos HTTP

### 3. Endpoints Disponibles

#### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

#### Notion API
- `GET /api/databases` - Obtener todas las bases de datos
- `GET /api/database?id=...` - Obtener base de datos específica
- `GET /api/test-connection` - Probar conexión con Notion

#### Utilidades
- `GET /api/hello` - Endpoint de prueba

## 🔧 Pasos para Desplegar

### 1. Preparar el Código
```bash
# Asegurarse de que todos los cambios estén commitados
git add .
git commit -m "Fix Vercel deployment - 405 error"
```

### 2. Desplegar en Vercel
```bash
# Si usas Vercel CLI
vercel --prod

# O desde el dashboard de Vercel
# 1. Conectar repositorio
# 2. Configurar build settings
# 3. Deploy
```

### 3. Verificar Despliegue
```bash
# Probar endpoints
curl https://tu-app.vercel.app/api/hello
curl -X POST https://tu-app.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123"}'
```

## 🐛 Debugging

### Logs de Vercel
1. Ve al dashboard de Vercel
2. Selecciona tu proyecto
3. Ve a "Functions" para ver logs de serverless functions
4. Ve a "Deployments" para ver logs de build

### Errores Comunes

#### Error: "Cannot find module"
- **Causa**: Dependencias no instaladas
- **Solución**: Asegúrate de que `@notionhq/client` esté en `dependencies`

#### Error: "Function timeout"
- **Causa**: Función tarda más de 30 segundos
- **Solución**: Optimizar código o aumentar `maxDuration`

#### Error: "CORS policy"
- **Causa**: Headers CORS incorrectos
- **Solución**: Verificar configuración en `vercel.json` y funciones

## 📝 Notas Importantes

1. **ES Modules**: Todas las funciones usan `import/export`
2. **CORS**: Configurado tanto en `vercel.json` como en funciones
3. **OPTIONS**: Todas las funciones manejan preflight requests
4. **Error Handling**: Manejo consistente de errores HTTP

## 🔍 Testing Local

Para probar localmente antes de desplegar:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Probar localmente
vercel dev

# Probar endpoints
curl http://localhost:3000/api/hello
```

## 📞 Soporte

Si el error persiste:
1. Revisar logs en Vercel dashboard
2. Verificar que todas las funciones estén en `/api/`
3. Confirmar que `vercel.json` esté en la raíz
4. Verificar que `package.json` tenga `"type": "module"` 