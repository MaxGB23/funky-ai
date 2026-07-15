# Corte 5 — Modo Handoff

> **Entrada para el agente:** Este archivo es tu único contexto de trabajo. Lee esto y los docs que te indicamos abajo, nada más. No hagas grep en `drafts/`, `closed/`, ni `archive/` — esa info está obsoleta o superada.
>
> **¿Quién genera este archivo?** El humano y el Orquestador coordinador, antes de delegar. El agente ejecutor llega a implementar, no a planear ni generar nuevos archivos de corte.

---

## Objetivos

- [ ] **1. Detección de Entorno:** Implementar la lógica para detectar si la ejecución está en el CLI o en el IDE (Kill Switch del IDE).
- [ ] **2. Bloques Copy-Paste:** Generar los bloques de texto listos para copy-paste en el chat del IDE cuando el CLI está en Modo Handoff.
- [ ] **3. Ley de Invarianza:** Asegurar que los mensajes delegados desde el CLI al IDE contengan todo el contexto necesario sin depender del historial de chat previo.

---

## Fuentes de Verdad (leer el índice, no los archivos directamente)

> **NOTA:** Las reglas del orquestador ahora están divididas en el directorio `openspec/rfcs/refactor-tasks/implementacion/orchestrator-rules/index.md`.

> **Regla anti-malviaje:** NO hagas `grep_search` en `drafts/`, `closed/`, `archive/` ni en archivos que no estén listados aquí. Esa información es obsoleta. La verdad aprobada vive en estos dos índices:
> - `openspec/rfcs/refactor-tasks/index.md`
> - `openspec/rfcs/.importantes/MANIFEST.md`

**Archivos de trabajo directos para este corte:**

| Archivo | Qué contiene | Líneas relevantes |
|---------|-------------|-------------------|
| `openspec/rfcs/refactor-tasks/spec-cli-ide-boundaries.md` | Detección de entorno y Handoff | Secciones 3 y 6 |
| `openspec/rfcs/refactor-tasks/spec-orchestrator-rules.md` | Message Passing (IDE) | Sección 6 |

> **Regla:** Usa `grep_search` antes de abrir cualquier archivo del índice. Sólo abre el archivo si el grep no fue suficiente.

---

## Contexto de la sesión actual

- **Rama:** `feature/refactor-tasks-sdd`
- **Estado:** ⏳ Pendiente.
