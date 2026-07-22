# Corte 2 — End-to-End Tier 2 en Automático

> **Entrada para el agente:** Este archivo es tu único contexto de trabajo. Lee esto y los docs que te indicamos abajo, nada más. No hagas grep en `drafts/`, `closed/`, ni `archive/` — esa info está obsoleta o superada.
>
> **¿Quién genera este archivo?** El humano y el Orquestador coordinador, antes de delegar. El agente ejecutor llega a implementar, no a planear ni generar nuevos archivos de corte.

---

## Objetivos

- [x] **1. Sabueso de Lava (Route B):** Implementar la lógica del Sabueso de Lava para Tier 2 (research ligero que persiste `explore.md` con Context Preservation).
- [x] **2. Propose y Spec ligeros:** Implementar la mini-delegación para las fases de propose y spec en Tier 2 (templates de `funky feature` + replace content).
- [x] **3. Inyección de Explore Ligero:** Asegurar que si el Sabueso corrió, sus hallazgos se inyecten inline en el prompt del propose.
- [x] **4. Verify Ligero:** Implementar la verificación para Tier 2 (Build + tests + clasificación de issues, sin compliance matrix).

---

## Fuentes de Verdad (leer el índice, no los archivos directamente)

> **Regla anti-malviaje:** NO hagas `grep_search` en `drafts/`, `closed/`, `archive/` ni en archivos que no estén listados aquí. Esa información es obsoleta. La verdad aprobada vive en estos dos índices:
> - `openspec/rfcs/refactor-tasks/index.md`
> - `openspec/rfcs/.importantes/MANIFEST.md`

**Archivos de trabajo directos para este corte:**

> **NOTA IMPORTANTE:** Todas las modificaciones a reglas en este corte se harán **EXCLUSIVAMENTE** en `openspec/rfcs/refactor-tasks/implementacion/orchestrator-rules/index.md`. No tocar el archivo en `.agents/rules/` hasta que se consolide.

| Archivo | Qué contiene | Líneas relevantes |
|---------|-------------|-------------------|
| `orchestrator-rules/index.md` | Playground separado por responsabilidades | Todo el archivo |
| `openspec/rfcs/refactor-tasks/spec-roles-subagents.md` | Route B (Sabueso de Lava) y mini-delegación T2 | Sección 4.1 y Anexo Route B |
| `openspec/rfcs/.importantes/funky-interactive/03-explore.md` | Contrato de explore | Todo el archivo |
| `openspec/rfcs/.importantes/funky-interactive/04-propose.md` | Contrato de propose ligero | Todo el archivo |
| `openspec/rfcs/.importantes/funky-interactive/05-spec.md` | Contrato de spec ligero | Todo el archivo |
| `openspec/rfcs/.importantes/funky-interactive/09-verify.md` | Contrato de verify ligero | Todo el archivo |

> **Regla:** Usa `grep_search` antes de abrir cualquier archivo del índice. Sólo abre el archivo si el grep no fue suficiente.

---

## Contexto de la sesión actual

- **Rama:** `feature/refactor-tasks-sdd`
- **Estado:** ⏳ Pendiente.
