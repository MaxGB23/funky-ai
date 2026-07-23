# Corte 1 — Core del Framework

> **Entrada para el agente:** Este archivo es tu único contexto de trabajo. Lee esto y los docs que te indicamos abajo, nada más. No hagas grep en `drafts/`, `closed/`, ni `archive/` — esa info está obsoleta o superada.
>
> **¿Quién genera este archivo?** El humano y el Orquestador coordinador, antes de delegar. El agente ejecutor llega a implementar, no a planear ni generar nuevos archivos de corte.

---

## Objetivos

- [x] **1. Envelope común:** Formato `status / summary / artifacts / risks` en el template `report.md` del Worker. (`next` excluido — el Orquestador es quien sabe qué sigue).
- [x] **2. Preflight:** Bloque de recomendación de Paso 0 en `.agents/rules/sdd-orchestrator.md` con Tier, Docs, Release (con aviso de `release.md`), y Modo.
- [x] **3. Cacheo de sesión:** Sección "Cacheo de Sesión (Post-Preflight)" en `.agents/rules/sdd-orchestrator.md`. Una vez confirmados los valores, son inmutables para la sesión.
- [x] **4. Routing de fases:** Tabla explícita de qué fases SDD corren según el `tier` cacheado.

---

## Fuentes de Verdad (leer el índice, no los archivos directamente)

> **Regla anti-malviaje:** NO hagas `grep_search` en `drafts/`, `closed/`, `archive/` ni en archivos que no estén listados aquí. Esa información es obsoleta. La verdad aprobada vive en estos dos índices:

| Índice | Qué cubre | Cuándo usarlo |
|--------|-----------|---------------|
| `openspec/rfcs/refactor-tasks/index.md` | Specs aprobados del Refactor de Tasks (CLI boundaries, contratos, roles, routing, rules) | Si necesitas entender cómo funciona una pieza del sistema |
| `openspec/rfcs/.importantes/index.md` | Specs aprobados del framework de Returns e Interactive Layer | Si necesitas entender el envelope, preflight, o fases interactivas |

**Archivos de trabajo directos para este corte:**

| Archivo | Qué contiene | Líneas relevantes |
|---------|-------------|-------------------|
| `orchestrator-rules/index.md` | Reglas separadas por responsabilidades (aquí se edita) | Todo el archivo |
| `.agents/templates/sdd/report.md` | Template del Worker (aquí se edita) | Todo el archivo |

> **Regla:** Usa `grep_search` antes de abrir cualquier archivo del índice. Sólo abre el archivo si el grep no fue suficiente.

---

## Contexto de la sesión actual

- **Rama:** `feature/refactor-tasks-sdd`
- **Estado:** 🟡 En progreso — Puntos 1-3 completados.
- **Paso actual:** Punto 4 — Routing de Fases.

### Decisiones tomadas en esta sesión

- **`next` excluido del `report.md` del Worker:** El Worker no sabe qué sigue; eso es responsabilidad exclusiva del Orquestador.
- **Escalation Matrix actualizada:** T0/T1/T2/T3. Tier 4 (Gentle) eliminado — absorbido por T3.
- **Preflight incluye `Release Template`:** Le dice al desarrollador si hay que inyectar `release.md` (Minor/Major) o no (Patch/None).
- **Guardrail de contradicción:** Si el humano elige valores contradictorios, el Orquestador advierte UNA sola vez y respeta la decisión.
