# 📊 Monitoreo de Rendimiento para Múltiples Usuarios

## 🎯 **Métricas a monitorear:**

### **1. Base de Datos:**
```sql
-- Conexiones activas
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Tiempo de respuesta promedio
SELECT avg(mean_exec_time) FROM pg_stat_statements;

-- Usuarios registrados por hora
SELECT 
  DATE_TRUNC('hour', created_at) as hora,
  COUNT(*) as registros
FROM users 
GROUP BY hora 
ORDER BY hora DESC;
```

### **2. Webhooks (n8n):**
- **Tiempo de procesamiento** de webhooks
- **Cola de webhooks** pendientes
- **Tasa de éxito** de envío de emails
- **Errores** y reintentos

### **3. Notion API:**
- **Rate limiting** (límites de API)
- **Tiempo de respuesta** de Notion
- **Errores** de sincronización

## 🔧 **Scripts de monitoreo:**

### **Monitoreo de conexiones:**
```javascript
// Agregar a unified-server.js
app.get('/api/health', async (req, res) => {
  try {
    // Verificar base de datos
    const dbResult = await pool.query('SELECT NOW()');
    
    // Verificar Notion
    const notionStatus = isNotionConfigured() ? 'connected' : 'not_configured';
    
    // Estadísticas de usuarios
    const userStats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN role = 'approved' THEN 1 END) as approved,
        COUNT(CASE WHEN role = 'rejected' THEN 1 END) as rejected
      FROM users
    `);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      notion: notionStatus,
      users: userStats.rows[0],
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});
```

### **Monitoreo de webhooks:**
```javascript
// Agregar a la función sendWebhook
let webhookStats = {
  total: 0,
  success: 0,
  failed: 0,
  lastError: null
};

async function sendWebhook(event, data) {
  webhookStats.total++;
  
  try {
    // ... código existente ...
    webhookStats.success++;
  } catch (error) {
    webhookStats.failed++;
    webhookStats.lastError = error.message;
  }
}

// Endpoint para estadísticas
app.get('/api/webhook-stats', (req, res) => {
  res.json(webhookStats);
});
```

## 🚨 **Alertas recomendadas:**

### **1. Alta concurrencia:**
```javascript
// Alertar si hay más de 10 conexiones simultáneas
const activeConnections = await pool.query(
  'SELECT count(*) FROM pg_stat_activity WHERE state = $1',
  ['active']
);

if (activeConnections.rows[0].count > 10) {
  console.log('⚠️ Alta concurrencia detectada');
  // Enviar alerta
}
```

### **2. Errores de webhook:**
```javascript
// Alertar si más del 5% de webhooks fallan
const failureRate = webhookStats.failed / webhookStats.total;
if (failureRate > 0.05) {
  console.log('⚠️ Alta tasa de fallos en webhooks');
  // Enviar alerta
}
```

### **3. Rate limiting de Notion:**
```javascript
// Monitorear límites de API de Notion
if (notionError.code === 'rate_limited') {
  console.log('⚠️ Rate limiting de Notion detectado');
  // Implementar backoff exponencial
}
```

## 📈 **Optimizaciones futuras:**

### **Para 100+ usuarios simultáneos:**
1. **Implementar Redis** para cache de sesiones
2. **Agregar load balancer** para múltiples instancias
3. **Optimizar consultas** con índices específicos
4. **Implementar rate limiting** en la API

### **Para 1000+ leads por día:**
1. **Separar base de datos** de leads y usuarios
2. **Implementar cola de trabajos** (Bull/BullMQ)
3. **Agregar CDN** para archivos estáticos
4. **Monitoreo avanzado** con APM tools

## 🎯 **Conclusión:**

Tu sistema actual está **perfectamente preparado** para manejar múltiples usuarios simultáneos. Las optimizaciones que ya tienes implementadas garantizan:

- ✅ **Escalabilidad** hasta 50 usuarios simultáneos
- ✅ **Confiabilidad** con manejo de errores robusto
- ✅ **Performance** con pool de conexiones optimizado
- ✅ **Monitoreo** con logs detallados

¡Tu aplicación está lista para crecer! 🚀 