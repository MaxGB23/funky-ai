# Corte 3 — Capa Interactiva

> **Entrada para el agente:** Este archivo es tu único contexto de trabajo. Lee esto y los docs que te indicamos abajo, nada más. No hagas grep en `drafts/`, `closed/`, ni `archive/` — esa info está obsoleta o superada.
>
> **¿Quién genera este archivo?** El humano y el Orquestador coordinador, antes de delegar. El agente ejecutor llega a implementar, no a planear ni generar nuevos archivos de corte.

---

## Objetivos

- [x] **1. Presentación por Fase:** Implementar los templates de presentación que usa el Orquestador para mostrar los resultados de cada fase al humano (Modo Interactivo).
- [x] **2. Review Workload Guard:** Implementar la pregunta en Modo Interactivo para subdividir batches si el forecast excede las 400 líneas en `tasks.md`.
- [x] **3. Veredictos de Verify:** Implementar el manejo interactivo de los veredictos (PASS, FAIL, WARNINGS) y las acciones recomendadas al humano.
- [x] **4. Checkpoint Pre-Apply:** Implementar la pausa y decisión explícita antes de lanzar el Worker.

---

## Fuentes de Verdad (leer el índice, no los archivos directamente)

> **NOTA:** Las reglas del orquestador ahora están divididas en el directorio `openspec/rfcs/refactor-tasks/implementacion/orchestrator-rules/index.md`.

> **Regla anti-malviaje:** NO hagas `grep_search` en `drafts/`, `closed/`, `archive/` ni en archivos que no estén listados aquí. Esa información es obsoleta. La verdad aprobada vive en estos dos índices:
> - `openspec/rfcs/refactor-tasks/index.md`
> - `openspec/rfcs/.importantes/MANIFEST.md`

**Archivos de trabajo directos para este corte:**

| Archivo | Qué contiene | Líneas relevantes |
|---------|-------------|-------------------|
| `openspec/rfcs/.importantes/funky-interactive/07-tasks.md` | Guard de workload | Todo el archivo |
| `openspec/rfcs/.importantes/funky-interactive/08-apply.md` | Checkpoint pre-apply | Todo el archivo |
| `openspec/rfcs/.importantes/funky-interactive/09-verify.md` | Veredictos | Todo el archivo |
| `openspec/rfcs/refactor-tasks/spec-cli-ide-boundaries.md` | Modos de ejecución y pausas | Sección 4 y 5 |

> **Regla:** Usa `grep_search` antes de abrir cualquier archivo del índice. Sólo abre el archivo si el grep no fue suficiente.

---

## Contexto de la sesión actual

- **Rama:** `feature/refactor-tasks-sdd`
- **Estado:** ⏳ Pendiente.
