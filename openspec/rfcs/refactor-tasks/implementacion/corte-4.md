# Corte 4 — Tier 3

> **Entrada para el agente:** Este archivo es tu único contexto de trabajo. Lee esto y los docs que te indicamos abajo, nada más. No hagas grep en `drafts/`, `closed/`, ni `archive/` — esa info está obsoleta o superada.
>
> **¿Quién genera este archivo?** El humano y el Orquestador coordinador, antes de delegar. El agente ejecutor llega a implementar, no a planear ni generar nuevos archivos de corte.

---

## Objetivos

- [x] **1. Workflows Completos:** Implementar los workflows completos para `funky-propose` y `funky-spec` en Tier 3.
- [x] **2. Fase de Design:** Implementar la fase `design.md` exclusiva de Tier 3 (decisiones técnicas, arquitectura, estrategia de testing).
- [x] **3. Verify Completo:** Implementar el verify exhaustivo (Compliance matrix + design coherence + NFR tracing).
- [x] **4. Control de NFRs:** Implementar el rastreo y bloqueo de requerimientos no funcionales (Discovery → Verificación).

---

## Fuentes de Verdad (leer el índice, no los archivos directamente)

> **NOTA:** Las reglas del orquestador ahora están divididas en el directorio `openspec/rfcs/refactor-tasks/implementacion/orchestrator-rules/index.md`.

> **Regla anti-malviaje:** NO hagas `grep_search` en `drafts/`, `closed/`, `archive/` ni en archivos que no estén listados aquí. Esa información es obsoleta. La verdad aprobada vive en estos dos índices:
> - `openspec/rfcs/refactor-tasks/index.md`
> - `openspec/rfcs/.importantes/MANIFEST.md`

**Archivos de trabajo directos para este corte:**

| Archivo | Qué contiene | Líneas relevantes |
|---------|-------------|-------------------|
| `openspec/rfcs/.importantes/funky-interactive/04-propose.md` | Propose workflow | Todo el archivo |
| `openspec/rfcs/.importantes/funky-interactive/05-spec.md` | Spec workflow | Todo el archivo |
| `openspec/rfcs/.importantes/funky-interactive/06-design.md` | Contrato de Design | Todo el archivo |
| `openspec/rfcs/.importantes/funky-interactive/09-verify.md` | Verify completo | Todo el archivo |
| `openspec/rfcs/refactor-tasks/spec-routing-tiers.md` | NFRs | Sección 3 |

> **Regla:** Usa `grep_search` antes de abrir cualquier archivo del índice. Sólo abre el archivo si el grep no fue suficiente.

---

## Contexto de la sesión actual

- **Rama:** `feature/refactor-tasks-sdd`
- **Estado:** ⏳ Pendiente.
