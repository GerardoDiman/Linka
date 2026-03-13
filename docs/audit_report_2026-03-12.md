# 🔬 Auditoría Técnica Profunda #2 — Proyecto Linka

**Fecha:** 2026-03-12  
**Auditor:** Senior Full-Stack Architect & Lead Security Auditor  
**Alcance:** Frontend (Vite + React + TS), Backend (Supabase Edge Functions), Estado global (Zustand), Auth, Sync, Payments  
**Referencia:** Auditoría anterior `audit_report_2026-03-08.md` (14 hallazgos)

---

## 1. RESUMEN DE SALUD

### Calificación General: **7 / 10** (anterior: 5.5/10 — mejora significativa)

Los hallazgos críticos de seguridad del primer reporte han sido corregidos de manera competente. La verificación de firma de Stripe, la autenticación JWT en n8n-bridge, el cifrado de tokens de Notion, y la restricción de CORS son correcciones sólidas y bien implementadas. Sin embargo, quedan **8 hallazgos del reporte anterior sin corregir** (performance y limpieza) y se han identificado **7 nuevos problemas** que merecen atención.

### Estado de Correcciones del Primer Reporte

| # | Hallazgo | Estado |
|---|----------|--------|
| 01 | Stripe Webhook sin firma | ✅ **Corregido** — `constructEventAsync()` implementado correctamente |
| 02 | Notion Token en texto plano | ✅ **Corregido** — AES-GCM en Edge Function, eliminado de localStorage |
| 03 | CORS Wildcard | ✅ **Corregido** — `_shared/cors.ts` con whitelist de dominios |
| 04 | n8n hardcoded secrets | ✅ **Corregido** — Fallbacks eliminados, excepciones explícitas |
| 05 | n8n-bridge sin auth | ✅ **Corregido** — JWT + validación de rol admin implementados |
| 06 | Admin solo en frontend (RLS) | ⚠️ **No verificable** — Requiere inspección de la DB |
| 07 | Logger silencia errores | ❌ **Sin corregir** |
| 08 | O(n²) en conteo de relaciones | ❌ **Sin corregir** |
| 09 | Edge IDs no determinísticos | ❌ **Sin corregir** |
| 10 | DashboardPage God Component | ⚠️ **Parcialmente mejorado** — De 584 a 584 líneas, pero hooks extraídos |
| 11 | Setter props incoherentes | ✅ **Corregido** — Setters reales pasados a `useCloudSync` |
| 12 | `catch (error: any)` | ❌ **Sin corregir** — Persiste en 4 archivos |
| 13 | Notion API sin paginación | ❌ **Sin corregir** |
| 14 | `serve()` deprecated | ✅ **Corregido** — Todas las funciones usan `Deno.serve()` |

### Top 3 Riesgos Actuales

| # | Riesgo | Gravedad |
|---|--------|----------|
| 1 | **Logger silencia `error()` y `warn()` en producción** — Errores críticos completamente invisibles | 🟠 Alta |
| 2 | **Complejidad O(n²) en `graph.ts`** — Rendimiento degradará con grafos grandes | 🟡 Media |
| 3 | **`useMemo` usado como side-effect** en `useGraphFilters.ts` — Viola las reglas de React y causa bugs intermitentes | 🟡 Media |

---

## 2. DESGLOSE DE HALLAZGOS

---

### 🚩 H-01. Logger SIGUE Silenciando Errores en Producción (SIN CORREGIR)
- **Categoría:** Lógica / Observabilidad
- **Gravedad:** 🟠 Alta
- **Archivo:** `src/lib/logger.ts`
- **Hallazgo original:** #07

**Diagnóstico:** El logger **no ha cambiado en absoluto** desde la primera auditoría. `logger.error()` y `logger.warn()` siguen condicionados a `isDev`, lo que significa que cualquier error en producción — fallo de sync, error de Stripe, problema de auth — es **completamente invisible**. Peor aún, `cloudSync.ts` y `notion.ts` usan `logger.error()` para reportar fallos de sincronización críticos que jamás serán vistos en producción.

**Impacto:** Imposible diagnosticar problemas de usuarios en producción. Cuando un usuario PRO reporte que su sync no funciona, no existirá ningún log para investigar. Esto es un **falso sentido de seguridad**.

**Código Actual (líneas 15-20):**
```typescript
warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args) // ← Invisible en prod
},
error: (...args: unknown[]) => {
    if (isDev) console.error(...args) // ← Invisible en prod
},
```

**Código Optimizado:**
```typescript
warn: (...args: unknown[]) => {
    console.warn(...args) // Warnings SIEMPRE visibles
},
error: (...args: unknown[]) => {
    console.error(...args) // Errores SIEMPRE visibles
    // Futuro: enviar a Sentry/LogRocket
},
```

---

### 🚩 H-02. Complejidad O(n²) en Conteo de Relaciones (SIN CORREGIR)
- **Categoría:** Performance
- **Gravedad:** 🟡 Media
- **Archivo:** `src/lib/graph.ts` (líneas 29-30)
- **Hallazgo original:** #08

**Diagnóstico:** Idéntico al reporte anterior. Para cada database se recorren **todas** las relaciones dos veces. Con 100 databases y 500 relaciones = ~100,000 iteraciones.

**Código Actual:**
```typescript
const outgoingCount = relations.filter(r => r.source === db.id).length
const incomingCount = relations.filter(r => r.target === db.id).length
```

**Código Optimizado:**
```typescript
// Pre-computar ANTES del map
const outgoingMap = new Map<string, number>()
const incomingMap = new Map<string, number>()
for (const r of relations) {
    outgoingMap.set(r.source, (outgoingMap.get(r.source) || 0) + 1)
    incomingMap.set(r.target, (incomingMap.get(r.target) || 0) + 1)
}

// Dentro del map: O(1) lookups
const outgoingCount = outgoingMap.get(db.id) || 0
const incomingCount = incomingMap.get(db.id) || 0
```

---

### 🚩 H-03. Edge IDs No Determinísticos (SIN CORREGIR)
- **Categoría:** Performance / Lógica
- **Gravedad:** 🟡 Media
- **Archivo:** `src/lib/graph.ts` (línea 59)
- **Hallazgo original:** #09

**Diagnóstico:** `Math.random()` en IDs de edges sigue forzando re-render completo de ReactFlow en cada recalculación del grafo.

**Código Actual:**
```typescript
id: `e-${index}-${Math.random().toString(36).substr(2, 9)}`
```

**Código Optimizado:**
```typescript
id: `e-${rel.source}-${rel.target}-${rel.label || index}`
```

---

### 🚩 H-04. `catch (error: any)` Persiste en 4 Archivos (SIN CORREGIR)
- **Categoría:** Limpieza / TypeScript
- **Gravedad:** 🔵 Baja
- **Archivos:** `LoginPage.tsx` (L37, L53), `RegisterPage.tsx` (L72, L88), `create-checkout-session/index.ts` (L113)
- **Hallazgo original:** #12

**Diagnóstico:** Sigue violando TypeScript strict mode. La corrección es trivial:

```typescript
// Antes (INSEGURO)
catch (error: any) {
    toast.error(error.message || t('auth.login.error'))
}

// Después (CORRECTO)
catch (error: unknown) {
    const message = error instanceof Error ? error.message : t('auth.login.error')
    toast.error(message)
}
```

---

### 🚩 H-05. Notion API SIN Paginación (SIN CORREGIR)
- **Categoría:** Lógica
- **Gravedad:** 🔵 Baja
- **Archivo:** `supabase/functions/notion-sync/index.ts` (líneas 159-162)
- **Hallazgo original:** #13

**Diagnóstico:** Sigue usando `page_size: 100` sin manejar `has_more` / `next_cursor`. Usuarios power-user con más de 100 databases ven datos silenciosamente incompletos.

---

## NUEVOS HALLAZGOS

---

### 🚩 H-06. `useMemo` Usado Como Side-Effect (BUG REACT)
- **Categoría:** Lógica (BUG)
- **Gravedad:** 🟡 Media
- **Archivo:** `src/hooks/useGraphFilters.ts` (líneas 44-51)

**Diagnóstico:** Se usa `useMemo` para llamar a `setCustomColors()`, lo que **viola las reglas de React**. `useMemo` es para cómputos puros derivados; usarlo para ejecutar side-effects (como actualizar estado de Zustand) provoca comportamiento impredecible. React puede re-ejecutar el memo en momentos inesperados, o no ejecutarlo cuando se espera. Esto viola el principio de **Separation of Concerns**.

**Código Actual:**
```typescript
useMemo(() => {
    if (userId && Object.keys(customColors).length === 0) {
        const saved = getSavedCustomColors(userId)
        if (Object.keys(saved).length > 0) {
            setCustomColors(saved) // ← SIDE EFFECT dentro de useMemo
        }
    }
}, [userId, customColors, setCustomColors])
```

**Código Optimizado:**
```typescript
// useEffect es la herramienta correcta para side-effects
useEffect(() => {
    if (userId && Object.keys(customColors).length === 0) {
        const saved = getSavedCustomColors(userId)
        if (Object.keys(saved).length > 0) {
            setCustomColors(saved)
        }
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [userId]) // Solo depende del userId, no de customColors
```

---

### 🚩 H-07. Línea Duplicada en `storage.ts`
- **Categoría:** Limpieza (BUG)
- **Gravedad:** 🔵 Baja
- **Archivo:** `src/lib/storage.ts` (líneas 78-79)

**Diagnóstico:** `saveAllToStorage` escribe `STORAGE_KEYS.ISOLATED` **dos veces consecutivas** con el mismo valor. Es una línea duplicada residual que no causa daño funcional pero rompe el principio **DRY**.

**Código Actual:**
```typescript
localStorage.setItem(getScopedKey(userId, STORAGE_KEYS.ISOLATED), String(data.hideIsolated))
localStorage.setItem(getScopedKey(userId, STORAGE_KEYS.ISOLATED), String(data.hideIsolated)) // ← DUPLICADO
```

**Corrección:** Eliminar la línea 79.

---

### 🚩 H-08. `onSelect` Callback Almacenado como `any` en Nodos del Grafo
- **Categoría:** Limpieza / TypeScript
- **Gravedad:** 🔵 Baja
- **Archivo:** `src/lib/graph.ts` (línea 25)

**Diagnóstico:** El parámetro `onSelect` en `transformToGraphData` está tipado como `any`, lo cual rompe type-safety en toda la cadena de datos del grafo.

**Código Actual:**
```typescript
onSelect?: (nodeData: any) => void
```

**Código Optimizado:**
```typescript
import type { DatabaseNodeData } from '../types'
onSelect?: (nodeData: DatabaseNodeData) => void
```

---

### 🚩 H-09. `n8n-bridge` Loguea Headers Completos (Información Sensible)
- **Categoría:** Seguridad
- **Gravedad:** 🟡 Media
- **Archivo:** `supabase/functions/n8n-bridge/index.ts` (líneas 20-21)

**Diagnóstico:** La función loguea **todos** los headers de la request incluyendo el `Authorization` header que contiene el JWT del usuario. En producción, estos logs persisten y un atacante con acceso a los logs podría extraer tokens de sesión válidos.

**Código Actual:**
```typescript
const headers = Object.fromEntries(req.headers.entries());
console.log("Headers:", JSON.stringify(headers, null, 2));
```

**Código Optimizado:**
```typescript
// Solo loguear headers seguros para debugging
const safeHeaders = {
    'content-type': req.headers.get('content-type'),
    'user-agent': req.headers.get('user-agent'),
    'origin': req.headers.get('origin'),
};
console.log("Headers (safe):", JSON.stringify(safeHeaders, null, 2));
```

---

### 🚩 H-10. `n8n-bridge` Loguea Body Completo (PII Exposure)
- **Categoría:** Seguridad
- **Gravedad:** 🟡 Media
- **Archivo:** `supabase/functions/n8n-bridge/index.ts` (líneas 59-60)

**Diagnóstico:** `console.log(JSON.stringify(body, null, 2))` expone en los logs toda la información del body, incluyendo emails de usuarios, nombres completos, tokens de autenticación, y otros datos PII. En producción, con múltiples usuarios estos logs acumulan una base de datos de información personal sin cifrar. Viola **GDPR Art. 5(1)(f)** y **OWASP A09:2021 - Security Logging Failures**.

**Código Actual:**
```typescript
console.log("--- REQUEST BODY RECEIVED ---");
console.log(JSON.stringify(body, null, 2));
```

**Código Optimizado:**
```typescript
console.log("--- REQUEST BODY RECEIVED ---");
console.log(JSON.stringify({
    action: body.action,
    source: body.type ? 'database_webhook' : (body.user ? 'auth_hook' : 'manual'),
    hasEmail: !!body.email,
    hasUser: !!body.user,
}, null, 2));
```

---

### 🚩 H-11. `special_invitation` Template Tiene Sintaxis Rota
- **Categoría:** Lógica (BUG)
- **Gravedad:** 🟡 Media
- **Archivo:** `supabase/functions/n8n-bridge/utils.ts` (líneas 94-95)

**Diagnóstico:** Los templates `user_registration`, `password_recovery` y `welcome_social` usan `${baseStyle}` y `${headerHtml}` correctamente (interpolación de template literal). Pero el template `special_invitation` usa `\\${baseStyle}` y `\\${headerHtml}` con backslash de escape, lo que significa que **renderiza literalmente la cadena `${baseStyle}`** en vez de interpolar el CSS y el header HTML. El email de invitación especial se envía **sin estilos y sin header**.

**Código Actual (líneas 94-95):**
```typescript
<head><style>\\${baseStyle} .header { ... }</style></head>
<body><div class="wrapper"><div class="container">\\${headerHtml}<div class="content">
```

**Código Optimizado:**
```typescript
<head><style>${baseStyle} .header { background-color: #4f46e5; } .btn { background-color: #4f46e5; }</style></head>
<body><div class="wrapper"><div class="container">${headerHtml}<div class="content">
```

---

### 🚩 H-12. `AuthContext` Hace Fire-and-Forget de `last_active_at` Update
- **Categoría:** Lógica / Observabilidad
- **Gravedad:** 🔵 Baja
- **Archivo:** `src/context/AuthContext.tsx` (línea 43)

**Diagnóstico:** La actualización de `last_active_at` usa `.then()` vacío sin manejo de error:
```typescript
supabase.from('profiles').update({ last_active_at: new Date().toISOString() }).eq('id', userId).then()
```

Si esta query falla (RLS, network, etc.), el error es completamente silencioso. Debería al menos loguear el fallo.

**Código Optimizado:**
```typescript
supabase.from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', userId)
    .then(({ error }) => {
        if (error) console.warn('Failed to update last_active_at:', error.message)
    })
```

---

## 3. LISTA DE VERIFICACIÓN POST-AUDITORÍA

### 🟠 Prioridad Alta (Inmediato)

- [ ] **Hacer que `logger.error()` y `logger.warn()` funcionen en producción** — `src/lib/logger.ts`
- [ ] **Eliminar log de headers sensibles** en `n8n-bridge/index.ts` L20-21
- [ ] **Eliminar log de body con PII** en `n8n-bridge/index.ts` L59-60
- [ ] **Verificar RLS en tabla `waitlist`** (punto 06 del primer reporte — no verificable sin acceso a DB)

### 🟡 Prioridad Media (Sprint actual)

- [ ] **Pre-computar conteos de relaciones con Maps** — `src/lib/graph.ts` L29-30
- [ ] **Hacer edge IDs determinísticos** — `src/lib/graph.ts` L59
- [ ] **Corregir `useMemo` como side-effect** → `useEffect` — `useGraphFilters.ts` L44-51
- [ ] **Corregir template `special_invitation` roto** — `n8n-bridge/utils.ts` L94-95
- [ ] **Implementar paginación de Notion Search API** — `notion-sync/index.ts`

### 🔵 Prioridad Baja (Deuda técnica)

- [ ] **Eliminar todos los `catch (error: any)`** — `LoginPage.tsx`, `RegisterPage.tsx`, `create-checkout-session/index.ts`
- [ ] **Eliminar línea duplicada** en `storage.ts` L79
- [ ] **Tipar `onSelect` correctamente** — `graph.ts` L25 (`any` → `DatabaseNodeData`)
- [ ] **Agregar error handling a `last_active_at` update** — `AuthContext.tsx` L43
- [ ] **Refactorizar DashboardPage** — Sigue con 584 líneas, extraer `<Canvas />` y toolbar
- [ ] **Considerar integración con Sentry** para monitoreo de errores en producción
- [ ] **Agregar rate limiting** a las Edge Functions

---

## 4. RESUMEN EJECUTIVO

La postura de seguridad del proyecto ha mejorado **drásticamente** respecto al primer reporte. Los 5 hallazgos críticos/altos de seguridad (Stripe webhook, Notion token, CORS, n8n secrets, n8n auth) fueron corregidos correctamente. La implementación de cifrado AES-GCM para el token de Notion es particularmente sólida.

Sin embargo, se introdujo un **nuevo riesgo** de seguridad: el logging excesivo de información sensible (headers con JWT, body con PII) en `n8n-bridge`. Y persiste el problema fundamental de observabilidad: el logger silencia errores en producción, haciendo el sistema **operativamente ciego**.

Los hallazgos de performance y limpieza (O(n²), edge IDs, `catch any`) siguen pendientes. No son blockers, pero degradarán la experiencia a medida que los grafos de los usuarios crezcan.

**Estimación de esfuerzo para resolver todo:** ~4-6 horas de desarrollo enfocado.
