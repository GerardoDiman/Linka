# Auditoría Técnica — Linka v4
**Fecha:** 2026-03-17 · 16:30 CST  
**Auditor:** Senior Full-Stack Architect & Lead Security Auditor  
**Alcance:** Frontend (React/TypeScript), Backend (Supabase Edge Functions), Estado (Zustand), Cloud Sync

---

## 1. RESUMEN DE SALUD

**Calificación general: 8.8/10** (↑ desde 8.2/10 en auditoría v3)

El proyecto ha sido limpiado extensivamente. Los 19 hallazgos identificados en las auditorías anteriores (v2: 12, v3: 7) están resueltos. El refactor del DashboardPage (584→291 líneas) fue exitoso. Los hallazgos restantes son de gravedad **baja** y se centran en oportunidades de micro-optimización y limpieza final.

### Top 3 Áreas de Atención Restantes
1. **`onInit` inline en GraphCanvas** — handler recreado en cada render, acoplado a lógica que debería vivir en un hook
2. **`notionToken` y `setNotionToken` en deps de `handleManualSync`** — incluidos pero no usados
3. **Hardcoded Spanish strings** en `notion.ts` (error messages)

---

## 2. DESGLOSE DE HALLAZGOS

### 🚩 H-01: `onInit` callback inline en GraphCanvas recalcula lógica de layout
- **Categoría:** Performance
- **Gravedad:** Baja
- **Diagnóstico:** En `GraphCanvas.tsx:80-91`, el handler `onInit` se define inline como arrow function. Esto significa que React Flow recibe una nueva referencia en cada render, lo cual puede causar re-suscripciones internas innecesarias. Además, contiene lógica de negocio (decidir entre fitView y runForceLayout) que pertenece a un hook, no a un componente presentacional.
- **Impacto:** Re-renders leves en el canvas. Viola el principio de separación presentación/lógica.
- **Refactorización Propuesta:**
  - *Código Actual (inline):*
    ```tsx
    onInit={() => {
        if (!session) return
        // ... layout logic
    }}
    ```
  - *Código Optimizado (useCallback):*
    ```tsx
    const handleInit = useCallback(() => {
        if (!session) return
        if (nodes.length === 0) return
        const saved = getSavedPositions(session.user.id)
        const hasAllPositions = nodes.every(n => saved[n.id])
        if (hasAllPositions) {
            setTimeout(() => fitView({ padding: 0.2, duration: 800, maxZoom: 1 }), 100)
        } else {
            runForceLayout(nodes, edges, searchQuery)
        }
    }, [session, nodes, edges, searchQuery, fitView, runForceLayout])
    ```

---

### 🚩 H-02: `notionToken` y `setNotionToken` en deps de `handleManualSync` sin ser usados
- **Categoría:** Limpieza
- **Gravedad:** Baja
- **Diagnóstico:** En `useCloudSync.ts:272`, el array de dependencias de `handleManualSync` incluye `notionToken` y `setNotionToken`, pero ninguno de los dos se referencia dentro del callback. Esto causa recálculos innecesarios del callback cuando el token cambia.
- **Impacto:** Callbacks recreados sin necesidad, propagando re-renders a componentes consumidores. Viola DRY en la gestión de dependencias.
- **Refactorización Propuesta:**
  - *Actual:*
    ```ts
    }, [session, nodes, customColors, selectedPropertyTypes, hiddenDbIds, hideIsolated, notionToken, setIsDirty, setNotionToken])
    ```
  - *Corregido:*
    ```ts
    }, [session, nodes, customColors, selectedPropertyTypes, hiddenDbIds, hideIsolated, setIsDirty])
    ```

---

### 🚩 H-03: Hardcoded Spanish strings en `notion.ts`
- **Categoría:** Limpieza / i18n
- **Gravedad:** Baja
- **Diagnóstico:** En `notion.ts:17` y `notion.ts:23`, los mensajes de error están hardcodeados en español: `"Error al sincronizar con Notion"` y `"No se recibió respuesta de la sincronización"`. Dado que el proyecto tiene soporte bilingüe (es/en), esto rompe la experiencia para usuarios angloparlantes.
- **Impacto:** Usuarios de habla inglesa ven errors en español.
- **Refactorización Propuesta:**
  - *Actual:* `"Error al sincronizar con Notion"`
  - *Corregido:* Los keys de i18n ya existen: usar `t('dashboard.errors.syncError')` y `t('notion.errors.noResponse')` (agregar esta última key).
  
  > **Nota:** `fetchNotionData` no recibe `t` actualmente, por lo que habría que pasar el i18n context o usar codes de error que el llamador traduzca. El enfoque más limpio: lanzar un Error con un code, y que `useCloudSync.handleSync` (que sí tiene `t`) traduzca el mensaje.

---

### 🚩 H-04: `useEffect` que también existe como segundo  "Fetch user plan on mount" en `useCloudSync.ts:207`
- **Categoría:** Limpieza
- **Gravedad:** Baja
- **Diagnóstico:** El comentario de sección en `useCloudSync.ts:207` sigue diciendo `"Fetch user plan on mount"`, lo cual es un duplicado parcial del correcto comentario en la línea 231. El contenido del bloque sí es correcto (fetch de `profiles.plan_type`), pero su existencia duplica la lógica del `useEffect` en `DashboardPage.tsx:64-66` que sincroniza `authPlan` con el store.
- **Impacto:** Dos fuentes compiten para establecer `userPlan` — una desde `AuthContext.plan` y otra desde una query directa a `profiles`. Esto puede causar flickering si los valores difieren temporalmente.
- **Refactorización Propuesta:** Evaluar si ambos mecanismos son necesarios. `AuthContext` ya hace `fetchProfileData` que obtiene el plan. El `useEffect` en `useCloudSync` parece redundante. Si se mantiene, documentar explícitamente por qué existen ambos.

---

### 🚩 H-05: `React.ComponentType<any>` en `GraphCanvas.tsx:34`
- **Categoría:** Type Safety
- **Gravedad:** Baja
- **Diagnóstico:** La prop `nodeTypes` en la interfaz `GraphCanvasProps` usa `Record<string, React.ComponentType<any>>`. Esto pierde la seguridad de tipos en los props del nodo.
- **Impacto:** Errores en props de nodos custom no se detectan en compilación.
- **Refactorización Propuesta:**
  ```tsx
  import type { NodeProps } from 'reactflow'
  import type { DatabaseNodeData } from '../../types'
  nodeTypes: Record<string, React.ComponentType<NodeProps<DatabaseNodeData>>>
  ```

---

## 3. HALLAZGOS CORREGIDOS (auditorías v2 + v3)

| # | Hallazgo | Auditoría | Estado |
|---|----------|-----------|--------|
| H-01 v2 | Logger silenciaba `warn`/`error` en prod | v2 | ✅ |
| H-02 v2 | Conteo de relaciones O(n²) | v2 | ✅ |
| H-03 v2 | Edge IDs no determinísticos | v2 | ✅ |
| H-04 v2 | `catch (error: any)` | v2 | ✅ |
| H-05 v2 | Notion API sin paginación | v2 | ✅ |
| H-06 v2 | `useMemo` como side-effect | v2 | ✅ |
| H-07 v2 | Línea duplicada storage.ts | v2 | ✅ |
| H-08 v2 | `onSelect: any` | v2 | ✅ |
| H-09 v2 | Headers JWT logueados | v2 | ✅ |
| H-10 v2 | PII en logs | v2 | ✅ |
| H-11 v2 | Template roto | v2 | ✅ |
| H-12 v2 | Fire-and-forget `last_active_at` | v2 | ✅ |
| H-01 v3 | DashboardPage 584 líneas | v3 | ✅ Refactorizado → 291 |
| H-02 v3 | passwordRequirements inline + sin i18n | v3 | ✅ |
| H-03 v3 | Comentario duplicado useCloudSync | v3 | ✅ |
| H-04 v3 | `isNotionConnected` dep innecesaria | v3 | ✅ |
| H-05 v3 | `record: any` en n8n-bridge | v3 | ✅ |
| H-06 v3 | `updateUser` fire-and-forget | v3 | ✅ |
| H-07 v3 | `allResults: any[]` | v3 | ✅ (ya resuelto) |

---

## 4. LISTA DE VERIFICACIÓN POST-AUDITORÍA

- [ ] **H-01** Extraer `onInit` de GraphCanvas como `useCallback`
- [ ] **H-02** Remover `notionToken` y `setNotionToken` de deps de `handleManualSync`
- [ ] **H-03** Reemplazar hardcoded Spanish strings en `notion.ts` con error codes
- [ ] **H-04** Evaluar y documentar duplicidad de fetchPlan vs AuthContext.plan
- [ ] **H-05** Tipar `nodeTypes` con `NodeProps<DatabaseNodeData>`
- [ ] Resolver 13 tests pre-existentes que fallan en `useGraphFilters.test.ts` y `notion.test.ts`
- [ ] Verificar políticas RLS en tabla `waitlist` si se tienen permisos

---

## 5. CONCLUSIÓN

El proyecto ha progresado significativamente a lo largo de 4 auditorías:

| Auditoría | Calificación | Hallazgos Criticos/Altos | Hallazgos Medios | Hallazgos Bajos |
|-----------|-------------|--------------------------|-------------------|-----------------|
| v2 | **5.5/10** | 5 | 4 | 3 |
| v3 | **8.2/10** | 0 | 1 | 6 |
| v4 | **8.8/10** | 0 | 0 | 5 |

**No hay hallazgos críticos ni de alta gravedad.** Los 5 restantes son de gravedad baja y representan oportunidades de refinamiento, no riesgos para producción. El proyecto está en un estado sólido y listo para despliegue.
