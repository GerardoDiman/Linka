# 🔧 Solución de Problemas - Servidor Unificado

## 🚨 **Problemas Comunes y Soluciones**

### **1. Errores de TypeScript**

#### **Problema:**
```
TS6133: 'variable' is declared but its value is never read
TS2339: Property 'property' does not exist on type 'Type'
```

#### **Solución:**
```bash
# Usar build simple sin TypeScript
npm run build:simple

# O usar el script de desarrollo simple
npm run dev:simple
```

### **2. Puerto ya en uso**

#### **Problema:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

#### **Solución:**
```bash
# Cambiar puerto
PORT=3001 node unified-server.js

# O matar procesos en el puerto
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:3000 | xargs kill -9
```

### **3. Build falla**

#### **Problema:**
```
Error: Build failed with errors
```

#### **Solución:**
```bash
# Limpiar y reconstruir
rm -rf dist/
npm run build:simple

# O usar el script automático
start-unified.bat
```

### **4. Módulos no encontrados**

#### **Problema:**
```
Cannot find module 'express'
```

#### **Solución:**
```bash
# Reinstalar dependencias
npm install

# Verificar que todas las dependencias estén instaladas
npm list --depth=0
```

## 🛠️ **Comandos de Desarrollo**

### **Desarrollo Rápido (Sin TypeScript)**
```bash
npm run dev:simple
```

### **Desarrollo con TypeScript**
```bash
npm run build
node unified-server.js
```

### **Script Automático (Windows)**
```bash
start-unified.bat
```

## 📊 **Verificación del Sistema**

### **1. Verificar que el servidor esté funcionando**
```bash
curl http://localhost:3000/test-connection
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Conexión exitosa al servidor unificado",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### **2. Verificar que el frontend se sirva**
```bash
curl http://localhost:3000
```

**Respuesta esperada:** HTML de la aplicación React

### **3. Verificar APIs de autenticación**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"test"}'
```

## 🔍 **Debugging**

### **Logs del Servidor**
El servidor muestra logs detallados:
```
🚀 Servidor unificado ejecutándose en http://localhost:3000
✅ Usuario registrado: user@example.com (role: pending)
✅ Usuario logueado: demo@example.com (role: approved)
```

### **Errores Comunes**

#### **Error: "Cannot find module"**
- **Causa**: Dependencias no instaladas
- **Solución**: `npm install`

#### **Error: "Port already in use"**
- **Causa**: Otro proceso usando el puerto
- **Solución**: Cambiar puerto o matar proceso

#### **Error: "Build failed"**
- **Causa**: Errores de TypeScript
- **Solución**: Usar `npm run build:simple`

## 🚀 **Optimizaciones**

### **1. Para Desarrollo Rápido**
```bash
# Usar build simple
npm run build:simple && node unified-server.js
```

### **2. Para Producción**
```bash
# Usar build completo con TypeScript
npm run build && node unified-server.js
```

### **3. Para Debugging**
```bash
# Con logs detallados
DEBUG=* node unified-server.js
```

## 📋 **Checklist de Verificación**

### **Antes de Iniciar:**
- [ ] Node.js instalado (`node --version`)
- [ ] Dependencias instaladas (`npm install`)
- [ ] Puerto 3000 libre
- [ ] Archivo `dist/` existe (después del build)

### **Después de Iniciar:**
- [ ] Servidor responde en `http://localhost:3000`
- [ ] API funciona en `http://localhost:3000/api`
- [ ] Frontend se carga correctamente
- [ ] No hay errores en la consola

### **Para Testing:**
- [ ] Login funciona con usuarios de prueba
- [ ] Panel de administración accesible
- [ ] APIs de Notion funcionan (si configuradas)

## 🆘 **Soporte**

### **Si nada funciona:**
1. **Reiniciar todo:**
   ```bash
   # Parar todos los procesos
   # Windows: Ctrl+C en todas las terminales
   # Linux/Mac: pkill node
   
   # Limpiar y reinstalar
   rm -rf node_modules/
   npm install
   npm run build:simple
   node unified-server.js
   ```

2. **Verificar configuración:**
   - Node.js versión 16+
   - npm versión 8+
   - Puerto 3000 libre

3. **Usar modo de emergencia:**
   ```bash
   # Solo servidor sin frontend
   node unified-server.js
   # Luego abrir http://localhost:3000 en el navegador
   ``` 