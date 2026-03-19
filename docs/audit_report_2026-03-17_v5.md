# Auditoría Técnica — Linka v5
**Fecha:** 2026-03-17 · 16:45 CST  
**Auditor:** Senior Full-Stack Architect & Lead Security Auditor  
**Alcance:** Frontend (React/TypeScript), Backend (Supabase Edge Functions), Estado (Zustand), Cloud Sync

---

## 1. RESUMEN DE SALUD

**Calificación general: 9.1/10**  (↑ desde 8.8/10 en auditoría v4)

El proyecto está en excelente estado. Los 24 hallazgos de las auditorías v2-v4 fueron resueltos exitosamente. El código es limpio, bien tipado, y tiene una arquitectura modular sólida. Los hallazgos restantes son de gravedad **muy baja** — oportunidades de pulido fino, no riesgos reales.

### Top 3 Áreas de Atención Restantes
1. **Hardcoded Spanish strings en `cloudSync.ts`** — 2 mensajes en español que no pasan por i18n
2. **`activeColor` prop demasiado compleja en JSX** — expresión inline difícil de leer en línea 263 de DashboardPage
3. **`useGraphStore.getState()` directo en `handleDisconnect`** — rompe encapsulación del hook

---

## 2. DESGLOSE DE HALLAZGOS

### 🚩 H-01: Hardcoded Spanish strings en `cloudSync.ts`
- **Categoría:** Limpieza / i18n
- **Gravedad:** Baja
- **Diagnóstico:** En `cloudSync.ts:70` hay `"Tu sesión ha expirado. Por favor cierra sesión y vuelve a entrar."` y en `cloudSync.ts:106` hay `"Falló tanto el cliente como el fallback:"`. Estos mensajes no pasan por el sistema i18n y se mostrarán en español a usuarios angloparlantes.
- **Impacto:** Experiencia degradada para usuarios en inglés. Inconsistencia con el resto del proyecto que ya usa i18n correctamente.
- **Refactorización Propuesta:**
  - *Actual:*
    ```ts
    throw new Error("Tu sesión ha expirado. Por favor cierra sesión y vuelve a entrar.")
    ```
  - *Corregido:* Dado que `cloudSync.ts` es una utilidad sin acceso a `t()`, lanzar error codes y dejar que el llamador traduzca:
    ```ts
    throw new Error("SESSION_EXPIRED")
    ```
    Y en `useCloudSync.ts:159` donde se captura el error, traducir:
    ```ts
    const msg = error.message === 'SESSION_EXPIRED' 
        ? t('dashboard.errors.sessionExpired') 
        : error.message
    toast.error(msg)
    ```

---

### 🚩 H-02: Expresión `activeColor` excesivamente compleja inline en JSX
- **Categoría:** Limpieza
- **Gravedad:** Muy Baja
- **Diagnóstico:** En `DashboardPage.tsx:263`, la prop `activeColor` de `SelectionActionBar` contiene una expresión ternaria anidada con `Array.from()` llamado dos veces:
  ```tsx
  activeColor={interactions.selectedNodeIds.size === 1 
      ? customColors[Array.from(interactions.selectedNodeIds)[0]] 
        || nodes.find(n => n.id === Array.from(interactions.selectedNodeIds)[0])?.data?.color 
      : undefined}
  ```
  Esto duplica `Array.from(interactions.selectedNodeIds)[0]` y dificulta la lectura.
- **Impacto:** Legibilidad reducida. Duplicación de operación `Array.from()`.
- **Refactorización Propuesta:**
  ```tsx
  const activeNodeId = interactions.selectedNodeIds.size === 1 
      ? Array.from(interactions.selectedNodeIds)[0] 
      : null
  const activeColor = activeNodeId 
      ? customColors[activeNodeId] || nodes.find(n => n.id === activeNodeId)?.data?.color 
      : undefined
  ```

---

### 🚩 H-03: `useGraphStore.getState()` fuera del flujo de React en `handleDisconnect`
- **Categoría:** Lógica
- **Gravedad:** Muy Baja
- **Diagnóstico:** En `useNodeInteractions.ts:117`, se llama `useGraphStore.getState().setIsNotionConnected(false)` directamente en lugar de usar el setter vía props o selector del hook. Esto funciona correctamente con Zustand, pero rompe el patrón de encapsulación establecido en el resto del hook, donde todas las acciones de store se acceden como selectores al inicio.
- **Impacto:** Inconsistencia de estilo. No es un bug funcional — Zustand soporta `getState()` por diseño. Pero dificulta el rastreo de dependencias y testing.
- **Refactorización Propuesta:**
  - Agregar `setIsNotionConnected` como selector al inicio del hook:
    ```ts
    const setIsNotionConnected = useGraphStore(state => state.setIsNotionConnected)
    ```
  - Reemplazar la línea 117:
    ```ts
    setIsNotionConnected(false)
    ```

---

## 3. HALLAZGOS RESUELTOS (todas las auditorías)

| Auditoría | Hallazgos | Estado |
|-----------|-----------|--------|
| v2 | 12 (5 críticos/altos, 4 medios, 3 bajos) | ✅ Todos resueltos |
| v3 | 7 (1 medio, 6 bajos) | ✅ Todos resueltos |
| v4 | 5 (5 bajos) | ✅ Todos resueltos |
| **Total** | **24** | **✅ 24/24** |

---

## 4. RESUMEN DE ARQUITECTURA POST-REFACTOR

```
DashboardPage.tsx (291 líneas — orquestador)
├── useGraphFilters.ts (149 líneas — filtros y estado derivado)
├── useCloudSync.ts (289 líneas — sync cloud + Notion)
├── useNodeInteractions.ts (134 líneas — handlers de interacción)
├── useDemoData.ts (84 líneas — datos demo localizados)
├── useDashboardShortcuts.ts (atajos de teclado)
├── GraphCanvas.tsx (191 líneas — canvas ReactFlow)
└── useGraphStore.ts (72 líneas — store Zustand centralizado)
```

**Módulos bien separados**, cada uno con una responsabilidad clara. La extracción de H-01 v3 redujo `DashboardPage` de 584→291 líneas, mejorando testabilidad y mantenimiento.

---

## 5. LISTA DE VERIFICACIÓN POST-AUDITORÍA

- [ ] **H-01** Reemplazar Spanish strings en `cloudSync.ts` con error codes
- [ ] **H-02** Extraer `activeColor` como variable derivada antes del JSX
- [ ] **H-03** Usar selector de Zustand en lugar de `getState()` en `handleDisconnect`

---

## 6. PROGRESIÓN DE CALIDAD

| Auditoría | Calificación | Críticos/Altos | Medios | Bajos | Muy Bajos |
|-----------|-------------|----------------|--------|-------|-----------|
| v2 | **5.5/10** | 5 | 4 | 3 | 0 |
| v3 | **8.2/10** | 0 | 1 | 6 | 0 |
| v4 | **8.8/10** | 0 | 0 | 5 | 0 |
| **v5** | **9.1/10** | **0** | **0** | **1** | **2** |

**Conclusión:** El proyecto ha pasado de un estado con vulnerabilidades de seguridad y problemas de performance críticos (5.5/10) a un estado de producción sólido (9.1/10). Los 3 hallazgos restantes son puramente cosméticos — el proyecto está listo para despliegue sin reservas.
