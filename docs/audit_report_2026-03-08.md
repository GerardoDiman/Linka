# 🔬 Auditoría Técnica Profunda — Proyecto Linka

**Fecha:** 2026-03-08  
**Auditor:** Senior Full-Stack Architect & Lead Security Auditor  
**Alcance:** Frontend (Vite + React + TS), Backend (Supabase Edge Functions), Estado global (Zustand), Auth, Sync, Payments

---

## 1. RESUMEN DE SALUD

### Calificación General: **5.5 / 10**

El proyecto tiene una arquitectura funcional y limpia a nivel visual, con buenas prácticas como lazy loading, Zustand, y Edge Functions para proteger APIs externas. Sin embargo, tiene **fallos de seguridad críticos** que podrían exponer datos de usuarios, un Stripe webhook **sin verificación de firma** (potencialmente catastrófico), y un patrón repetitivo de "tragarse errores silenciosamente" que hará imposible diagnosticar problemas en producción.

### Top 3 Riesgos Detectados

| # | Riesgo | Gravedad |
|---|--------|----------|
| 1 | **Stripe Webhook sin verificación de firma** — cualquier persona puede enviar un POST y escalar usuarios a plan PRO | 🔴 Crítica |
| 2 | **Notion Token almacenado en texto plano en localStorage** y sincronizado a la DB sin cifrar | 🔴 Crítica |
| 3 | **CORS `Access-Control-Allow-Origin: *`** en todas las Edge Functions permite llamadas desde cualquier dominio | 🟠 Alta |

---

## 2. DESGLOSE DE HALLAZGOS

---

### 🚩 01. Stripe Webhook SIN Verificación de Firma
- **Categoría:** Seguridad
- **Gravedad:** 🔴 Crítica
- **Archivo:** `supabase/functions/stripe-webhook/index.ts`

**Diagnóstico:** El webhook de Stripe **parsea el body directamente como JSON sin verificar la firma criptográfica** del header `stripe-signature`. El propio código lo admite en un comentario (línea 17-19: *"For real production, use Stripe SDK to verify signature"*). Esto significa que **cualquier persona que conozca la URL** puede enviar un POST con un payload falso de `checkout.session.completed` y escalar cualquier usuario a plan PRO.

**Impacto:** Escalación de privilegios masiva. Un atacante puede dar acceso PRO a cualquier cuenta sin pagar. Es una vulnerabilidad **OWASP A07:2021 - Authentication Failures**.

**Código Actual:**
```typescript
// Line 20 — NO verification
const event = JSON.parse(body)
```

**Código Optimizado:**
```typescript
import Stripe from "https://esm.sh/stripe@14?target=deno"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-04-10",
  httpClient: Stripe.createFetchHttpClient(),
})

// Verify signature BEFORE processing
const event = await stripe.webhooks.constructEventAsync(
  body,
  signature!,
  STRIPE_WEBHOOK_SECRET!,
)
```

---

### 🚩 02. Notion Token Almacenado en Texto Plano
- **Categoría:** Seguridad
- **Gravedad:** 🔴 Crítica
- **Archivos:** `src/lib/storage.ts`, `src/hooks/useCloudSync.ts`, `src/lib/cloudSync.ts`

**Diagnóstico:** El token de integración de Notion del usuario se almacena:
1. En `localStorage` en texto plano (accesible via XSS)
2. En la tabla `user_graph_data` de Supabase en el campo `notion_token` sin cifrar

Este token da acceso **completo de lectura/escritura** al workspace de Notion del usuario. Si alguien exploita una XSS o consigue acceso a la base de datos, obtiene control total sobre los datos de Notion de todos los usuarios.

**Impacto:** Compromiso total de los workspaces de Notion de todos los usuarios. Violación de **OWASP A02:2021 - Cryptographic Failures**.

**Refactorización Propuesta:**
- **Corto plazo:** Cifrar el token con una clave derivada del user ID + un secret de servidor antes de almacenarlo en la DB. Nunca guardarlo en localStorage; obtenerlo siempre del servidor.
- **Largo plazo:** Usar OAuth 2.0 de Notion (public integration) en lugar de tokens de integración internos. El token se guardaría solo en el servidor y se refrescaría automáticamente.

---

### 🚩 03. CORS Wildcard en Todas las Edge Functions
- **Categoría:** Seguridad
- **Gravedad:** 🟠 Alta
- **Archivos:** Todas las Edge Functions

**Diagnóstico:** Todas las Edge Functions usan `'Access-Control-Allow-Origin': '*'`. Esto permite que **cualquier sitio web** haga peticiones a tus funciones en nombre de un usuario autenticado.

**Código Actual:**
```typescript
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    // ...
}
```

**Código Optimizado:**
```typescript
const ALLOWED_ORIGINS = [
  'https://linka-six.vercel.app',
  'http://localhost:5173', // solo en desarrollo
]

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || ''
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}
```

---

### 🚩 04. n8n Webhook URL y Project ID Hardcodeados
- **Categoría:** Seguridad
- **Gravedad:** 🟠 Alta
- **Archivo:** `supabase/functions/n8n-bridge/index.ts`

**Diagnóstico:** La URL del webhook de n8n y el `projectRef` de Supabase están expuestos como fallbacks hardcodeados en la línea 83 y 170:
```typescript
const projectRef = Deno.env.get('SUPABASE_PROJECT_ID') || "gnuedinkyheevdkfyujm";
const n8nUrl = Deno.env.get('N8N_WEBHOOK_URL') || "https://n8n-n8n.fxkgvm.easypanel.host/webhook/7ab667dd-...";
```

**Impacto:** Cualquiera con acceso al código fuente puede enviar webhooks falsos directamente a n8n, disparando emails de aprobación, invitaciones o recovery sin autorización.

**Refactorización Propuesta:** Eliminar completamente los fallbacks y fallar explícitamente si las variables de entorno no están configuradas:
```typescript
const n8nUrl = Deno.env.get('N8N_WEBHOOK_URL')
if (!n8nUrl) throw new Error("N8N_WEBHOOK_URL not configured")
```

---

### 🚩 05. n8n-bridge NO Verifica Autenticación de Llamadas Manuales
- **Categoría:** Seguridad
- **Gravedad:** 🟠 Alta
- **Archivo:** `supabase/functions/n8n-bridge/index.ts`

**Diagnóstico:** La función `n8n-bridge` acepta peticiones manuales sin verificar el JWT del usuario. Solo verifica auth cuando es un Auth Hook de Supabase (`isAuthHook`). Cualquier persona que conozca la URL de la función puede enviar webhooks manuales con acciones como `user_approval` o `special_invitation`, disparando emails de aprobación sin ser admin.

**Impacto:** Bypass completo del panel de administración. Un atacante puede auto-aprobarse en la waitlist.

**Refactorización Propuesta:** Agregar verificación JWT y validación de rol admin para llamadas manuales:
```typescript
if (!isAuthHook) {
  const { data: { user }, error } = await supabaseClient.auth.getUser()
  if (error || !user) return unauthorized()
  
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role !== 'admin') return forbidden()
}
```

---

### 🚩 06. Autorización de Admin Solo en Frontend
- **Categoría:** Seguridad
- **Gravedad:** 🟠 Alta
- **Archivos:** `src/App.tsx`, `src/pages/AdminPage.tsx`

**Diagnóstico:** La ruta `/admin` se protege exclusivamente en el frontend via `AdminRoute`. No hay Row Level Security (RLS) en la tabla `waitlist` que limite las operaciones de UPDATE solo a admins. Un usuario regular puede llamar directamente a la API de Supabase y aprobar/rechazar usuarios en la waitlist.

**Impacto:** Escalación de privilegios. Cualquier usuario autenticado puede gestionar la waitlist.

**Refactorización Propuesta:** Agregar RLS policies estrictas:
```sql
-- Solo admins pueden modificar la waitlist
CREATE POLICY "admins_manage_waitlist" ON waitlist
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Todos los usuarios autenticados pueden insertar (solicitar acceso)
CREATE POLICY "users_insert_waitlist" ON waitlist
  FOR INSERT WITH CHECK (true);
```

---

### 🚩 07. Logger Silencia Errores en Producción
- **Categoría:** Lógica / Observabilidad
- **Gravedad:** 🟡 Media
- **Archivo:** `src/lib/logger.ts`

**Diagnóstico:** El logger supprime **todos los logs** en producción, incluyendo `logger.error()`. Esto significa que errores críticos en producción (fallos de sync, errores de Stripe, problemas de auth) son completamente invisibles.

**Código Actual:**
```typescript
error: (...args: unknown[]) => {
    if (isDev) console.error(...args) // ← Silenciado en producción
},
```

**Código Optimizado:**
```typescript
error: (...args: unknown[]) => {
    console.error(...args) // SIEMPRE loguear errores
},
warn: (...args: unknown[]) => {
    console.warn(...args) // Warnings también deberían verse
},
```

---

### 🚩 08. Complejidad O(n²) en Conteo de Relaciones del Grafo
- **Categoría:** Performance
- **Gravedad:** 🟡 Media
- **Archivo:** `src/lib/graph.ts`

**Diagnóstico:** Dentro de `transformToGraphData`, para **cada** database se filtran **todas** las relaciones dos veces (outgoing + incoming). Con 100 databases y 500 relaciones, esto genera ~100,000 iteraciones en lugar de ~600 con un enfoque basado en mapas.

**Código Actual:**
```typescript
databases.map((db) => {
    const outgoingCount = relations.filter(r => r.source === db.id).length
    const incomingCount = relations.filter(r => r.target === db.id).length
})
```

**Código Optimizado:**
```typescript
const outgoing = new Map<string, number>()
const incoming = new Map<string, number>()
for (const r of relations) {
    outgoing.set(r.source, (outgoing.get(r.source) || 0) + 1)
    incoming.set(r.target, (incoming.get(r.target) || 0) + 1)
}
const outgoingCount = outgoing.get(db.id) || 0
const incomingCount = incoming.get(db.id) || 0
```

---

### 🚩 09. Edge IDs No Determinísticos
- **Categoría:** Performance / Lógica
- **Gravedad:** 🟡 Media
- **Archivo:** `src/lib/graph.ts`

**Diagnóstico:** Los IDs de edges se generan con `Math.random()`, lo que significa que **cada vez** que se recalcula el grafo, React Flow trata todos los edges como nuevos, forzando un re-render completo del canvas.

**Código Actual:**
```typescript
id: `e-${index}-${Math.random().toString(36).substr(2, 9)}`
```

**Código Optimizado:**
```typescript
id: `e-${rel.source}-${rel.target}-${rel.label || index}`
```

---

### 🚩 10. DashboardPage: God Component de 584 Líneas
- **Categoría:** Limpieza / Mantenibilidad
- **Gravedad:** 🟡 Media
- **Archivo:** `src/pages/DashboardPage.tsx`

**Diagnóstico:** `DashboardContent` es un componente monolítico de 570 líneas que viola el **Single Responsibility Principle (SRP)**. Maneja: estado de ReactFlow, filtros del grafo, cloud sync, tour de onboarding, selección de nodos, pricing modal, keyboard shortcuts, demo data y layout del grafo.

**Impacto:** Difícil de testear, difícil de mantener, alto acoplamiento entre features independientes.

**Refactorización Propuesta:** Extraer en sub-componentes y hooks dedicados:
- `<Canvas />` — ReactFlow wrapper con sus callbacks
- `<DashboardToolbar />` — Controles de zoom/layout/export
- `useDemoData()` — Hook dedicado para inicialización de demo data

---

### 🚩 11. Setter Props Incoherentes en useCloudSync
- **Categoría:** Lógica (BUG)
- **Gravedad:** 🟡 Media
- **Archivo:** `src/pages/DashboardPage.tsx` (líneas 147-149)

**Diagnóstico:** `setSelectedPropertyTypes` y `setHideIsolated` se pasan como `clearPropertyFilters`, lo cual es **funcionalmente incorrecto**. Cuando `useCloudSync` llama a `setSelectedPropertyTypes(newFilters)`, en realidad está llamando a `clearPropertyFilters()`, que ignora el argumento y limpia todo.

**Código Actual:**
```typescript
setSelectedPropertyTypes: clearPropertyFilters, // ← WRONG
setHideIsolated: clearPropertyFilters,           // ← WRONG
```

> **⚠️ CAUTION:** Este bug significa que **la restauración de filtros desde la nube no funciona correctamente**. Los filtros guardados del usuario se ignoran al cargar datos desde el cloud.

---

### 🚩 12. Uso de `any` Type en Catch Blocks
- **Categoría:** Limpieza / TypeScript
- **Gravedad:** 🔵 Baja
- **Archivos:** `src/pages/LoginPage.tsx`, `src/pages/RegisterPage.tsx`, `supabase/functions/create-checkout-session/index.ts`

**Diagnóstico:** Múltiples `catch (error: any)` que violan TypeScript strict mode.

**Código Optimizado:**
```typescript
catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    toast.error(message)
}
```

---

### 🚩 13. Notion API Limitada a 100 Databases
- **Categoría:** Lógica
- **Gravedad:** 🔵 Baja
- **Archivo:** `supabase/functions/notion-sync/index.ts`

**Diagnóstico:** La búsqueda de Notion usa `page_size: 100` sin manejar paginación (`has_more` / `next_cursor`). Usuarios con más de 100 databases verán datos incompletos sin ninguna indicación de error.

---

### 🚩 14. Deprecated `serve()` API en Edge Functions
- **Categoría:** Limpieza
- **Gravedad:** 🔵 Baja
- **Archivos:** `supabase/functions/stripe-webhook/index.ts`, `supabase/functions/create-checkout-session/index.ts`

**Diagnóstico:** Usan `import { serve } from "https://deno.land/std@0.168.0/http/server.ts"` (version antigua), mientras que `notion-sync` y `n8n-bridge` usan el moderno `Deno.serve()`.

**Refactorización:** Migrar a `Deno.serve()` en ambas funciones.

---

## 3. LISTA DE VERIFICACIÓN POST-AUDITORÍA

### 🔴 Prioridad Crítica (Inmediato)

- [ ] **Verificar firma de Stripe webhook** con `stripe.webhooks.constructEventAsync()`
- [ ] **Cifrar el Notion token** en la DB y eliminar su almacenamiento en localStorage
- [ ] **Agregar verificación JWT a n8n-bridge** para llamadas manuales + validar rol admin
- [ ] **Eliminar URLs y secrets hardcodeados** del código fuente de las Edge Functions

### 🟠 Prioridad Alta (Esta semana)

- [ ] **Restringir CORS** a dominios autorizados en todas las Edge Functions
- [ ] **Agregar RLS policies** en la tabla `waitlist` para que solo admins puedan UPDATE
- [ ] **Verificar RLS** en `profiles` y `user_graph_data`
- [ ] **Corregir bug de setters** en `DashboardPage.tsx` líneas 147-149

### 🟡 Prioridad Media (Sprint actual)

- [ ] **Hacer que `logger.error()` funcione en producción**
- [ ] **Pre-computar conteos de relaciones** con Maps en `graph.ts`
- [ ] **Hacer edge IDs determinísticos**
- [ ] **Implementar paginación** en la Notion Search API
- [ ] **Migrar `serve()` deprecated** a `Deno.serve()`

### 🔵 Prioridad Baja (Deuda técnica)

- [ ] **Eliminar todos los `catch (error: any)`**
- [ ] **Refactorizar DashboardPage** — extraer sub-componentes
- [ ] **Internacionalizar strings hardcodeados** en AdminPage y Edge Functions
- [ ] **Considerar integración con Sentry** para monitoreo de errores
- [ ] **Agregar rate limiting** a las Edge Functions
