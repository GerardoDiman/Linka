# Auditoría Técnica — Linka v3
**Fecha:** 2026-03-12 · 23:08 CST  
**Auditor:** Senior Full-Stack Architect & Lead Security Auditor  
**Alcance:** Frontend (React/TypeScript), Backend (Supabase Edge Functions), Estado (Zustand), Cloud Sync

---

## 1. RESUMEN DE SALUD

**Calificación general: 8.2/10** (↑ desde 5.5/10 en la auditoría anterior)

Las 12 vulnerabilidades y defectos identificados en la auditoría v2 han sido resueltos satisfactoriamente. El proyecto ahora opera con un nivel de calidad sólido. Los hallazgos restantes son de gravedad **media a baja** y se centran en **deuda técnica** y **oportunidades de optimización**, no en riesgos críticos.

### Top 3 Áreas de Atención Restantes
1. **DashboardPage.tsx monolítico** — 584 líneas con ~30 hooks; difícil de mantener y testear
2. **`passwordRequirements` recreado en cada render** — Array de objetos inline en RegisterPage
3. **Dependencia excesiva de `isNotionConnected` en visibleDbIds** — incluida pero no usada en el cálculo

---

## 2. DESGLOSE DE HALLAZGOS

### 🚩 H-01: DashboardPage.tsx excesivamente grande
- **Categoría:** Limpieza / Mantenibilidad
- **Gravedad:** Media
- **Diagnóstico:** El componente `DashboardContent` tiene **584 líneas** con ~30 hooks, ~15 callbacks, y ~10 effects. Viola el principio de Single Responsibility (SOLID). Esto dificulta el testing unitario, incrementa el riesgo de regresiones, y hace el código difícil de navegar.
- **Impacto:** Cada nueva feature requiere tocar un archivo masivo. El riesgo de romper algo aumenta con cada cambio.
- **Refactorización Propuesta:**
  - Extraer el bloque `ReactFlow` + controles en un `<GraphCanvas />` component
  - Extraer la lógica de inicialización/demo en un hook `useDemoData()`
  - Extraer los callbacks de interacción (batch color, hide, etc.) en un hook `useNodeInteractions()`
  - **Meta:** DashboardPage.tsx < 200 líneas

---

### 🚩 H-02: `passwordRequirements` recreado en cada render
- **Categoría:** Performance
- **Gravedad:** Baja
- **Diagnóstico:** En `RegisterPage.tsx:30-34`, el array `passwordRequirements` se declara inline dentro del componente. Esto crea un nuevo array con nuevos objetos RegExp en cada render, lo que además causa que el `useEffect` de la línea 37 tenga una referencia inestable (linter suprime la advertencia).
- **Impacto:** Minimal en rendimiento real, pero es un code smell que viola DRY y puede causar re-renders innecesarios.
- **Refactorización Propuesta:**
  - *Código Actual:*
    ```tsx
    // Dentro del componente (línea 30)
    const passwordRequirements = [
        { regex: /.{8,}/, label: 'Al menos 8 caracteres' },
        ...
    ]
    ```
  - *Código Optimizado:*
    ```tsx
    // Fuera del componente
    const PASSWORD_REQUIREMENTS = [
        { regex: /.{8,}/, labelKey: 'auth.register.password8chars' },
        { regex: /[A-Z]/, labelKey: 'auth.register.passwordUppercase' },
        { regex: /[0-9]/, labelKey: 'auth.register.passwordNumber' },
    ] as const
    ```
  > Nota: los labels están hardcoded en español en vez de usar i18n — también debe corregirse.

---

### 🚩 H-03: Comentario duplicado en `useCloudSync.ts`
- **Categoría:** Limpieza
- **Gravedad:** Baja
- **Diagnóstico:** La línea 231 dice `// ─── Fetch user plan on mount ───` pero introduce `handleManualSync`, no un fetch de plan. Es un copy-paste del comentario de la línea 207.
- **Impacto:** Confunde a desarrolladores que navegan el código por comentarios de sección.
- **Refactorización Propuesta:**
  - *Actual (línea 231):* `// ─── Fetch user plan on mount ───`
  - *Corregido:* `// ─── Manual sync handler ───`

---

### 🚩 H-04: `visibleDbIds` depende de `isNotionConnected` sin usarlo
- **Categoría:** Lógica
- **Gravedad:** Baja
- **Diagnóstico:** En `useGraphFilters.ts:90`, el `useMemo` para `visibleDbIds` incluye `isNotionConnected` en su array de dependencias, pero ninguna línea dentro del memo referencia esa variable. Esto causa recálculos innecesarios cada vez que el estado de conexión cambia.
- **Impacto:** Re-renderizados innecesarios del canvas cuando `isNotionConnected` cambia.
- **Refactorización Propuesta:** Eliminar `isNotionConnected` del array de dependencias.

---

### 🚩 H-05: `record: any` en `DatabaseWebhookPayload` (n8n-bridge)
- **Categoría:** Limpieza / Type Safety
- **Gravedad:** Baja
- **Diagnóstico:** En `n8n-bridge/index.ts:56`, la interfaz `DatabaseWebhookPayload` usa `record?: any`. Esto rompe la cadena de type-safety en todo el handler.
- **Impacto:** Errores de tipado en campos como `body.record?.email` no serán detectados por el compilador.
- **Refactorización Propuesta:**
  ```typescript
  interface DatabaseWebhookPayload {
      type?: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT';
      table?: string;
      record?: { email?: string; full_name?: string; [key: string]: unknown };
      schema?: string;
  }
  ```

---

### 🚩 H-06: `supabase.auth.updateUser()` sin error handling en OnboardingTour close
- **Categoría:** Lógica
- **Gravedad:** Baja
- **Diagnóstico:** En `DashboardPage.tsx:543-545`, `supabase.auth.updateUser()` se ejecuta fire-and-forget sin `.then()` ni `.catch()`. Si falla, el usuario verá el onboarding otra vez en la próxima sesión sin ninguna indicación de por qué.
- **Impacto:** UX inconsistente — el onboarding podría re-aparecer inesperadamente.
- **Refactorización Propuesta:**
  ```tsx
  supabase.auth.updateUser({
      data: { has_seen_onboarding: true }
  }).then(({ error }) => {
      if (error) console.warn('Failed to persist onboarding state:', error.message)
  })
  ```

---

### 🚩 H-07: `allResults: any[]` en paginación de notion-sync
- **Categoría:** Type Safety
- **Gravedad:** Baja
- **Diagnóstico:** En `notion-sync/index.ts:152`, el array de resultados paginados usa `any[]`. Dado que las interfaces `NotionDatabase`, `NotionProperty`, etc. ya están definidas más abajo, se debería usar `NotionDatabase[]`.
- **Impacto:** Sin errores de compilación, pero pierde la protección de tipos en operaciones intermedias como `allResults.push(...)`.
- **Refactorización Propuesta:** Mover las interfaces antes del loop y tipar como `const allResults: NotionDatabase[] = []`.

---

## 3. HALLAZGOS CORREGIDOS (de la auditoría v2)

| # | Hallazgo | Estado |
|---|----------|--------|
| H-01 v2 | Logger silenciaba `warn`/`error` en producción | ✅ Corregido |
| H-02 v2 | Conteo de relaciones O(n²) | ✅ Optimizado a O(n) |
| H-03 v2 | Edge IDs no determinísticos (`Math.random()`) | ✅ Determinísticos |
| H-04 v2 | `catch (error: any)` en 3 archivos | ✅ `catch (error: unknown)` |
| H-05 v2 | Notion API sin paginación (cap 100 DBs) | ✅ Paginación completa |
| H-06 v2 | `useMemo` como side-effect | ✅ Migrado a `useEffect` |
| H-07 v2 | Línea duplicada en storage.ts | ✅ Eliminada |
| H-08 v2 | `onSelect: any` en graph.ts | ✅ Tipado con `DatabaseNodeData` |
| H-09 v2 | Headers JWT logueados en n8n-bridge | ✅ Redactados |
| H-10 v2 | Body con PII logueado en n8n-bridge | ✅ Redactado |
| H-11 v2 | Template `special_invitation` roto | ✅ Interpolación corregida |
| H-12 v2 | Fire-and-forget `last_active_at` | ✅ Error handling añadido |

---

## 4. LISTA DE VERIFICACIÓN POST-AUDITORÍA

Ordenada por impacto/esfuerzo:

- [ ] **H-01** Refactorizar DashboardPage.tsx en sub-componentes (< 200 líneas)
- [ ] **H-02** Mover `passwordRequirements` fuera del componente + i18n
- [ ] **H-03** Corregir comentario duplicado en useCloudSync.ts:231
- [ ] **H-04** Eliminar `isNotionConnected` de dependencias de `visibleDbIds`
- [ ] **H-05** Tipar `record` en DatabaseWebhookPayload
- [ ] **H-06** Añadir error handling a `updateUser()` en onboarding close
- [ ] **H-07** Tipar `allResults` como `NotionDatabase[]` en notion-sync
- [ ] Verificar políticas RLS en tabla `waitlist` (pendiente de auditorías anteriores)
- [ ] Resolver los 13 tests pre-existentes que fallan en `useGraphFilters.test.ts` y `notion.test.ts`

---

## 5. CONCLUSIÓN

El proyecto ha mejorado significativamente desde la auditoría anterior (**5.5 → 8.2/10**). Todos los hallazgos críticos y de alta gravedad han sido resueltos. Los 7 hallazgos restantes son de gravedad **media a baja** y se centran en mantenibilidad y limpieza de código, no en riesgos para la producción. La prioridad #1 debería ser el refactor del `DashboardPage.tsx` para mejorar la mantenibilidad a largo plazo.
