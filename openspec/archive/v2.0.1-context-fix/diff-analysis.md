# Diff Analysis Report — v2.0.1-context-fix

> **Generado por:** Worker Fase 4 (Auditoría Forense)
> **Fecha:** 2026-05-15
> **Corpus analizado:** 4 archivos (2 estado actual, 2 legacy)

---

## Categorías Analizadas

| Categoría | Estado | Archivo Destino | Observación |
|-----------|--------|-----------------|-------------|
| Bootstrap del Orquestador | ✅ Cubierta | `sdd-orchestrator.md` | Idéntico en intención |
| Bootstrap del Worker (3 pilares) | ✅ Cubierta | `funky-worker.md` | Idéntico en intención |
| Memory Polling Two-Stage | ✅ Cubierta | `sdd-orchestrator.md` | Concisamente equivalente |
| Escalation Matrix / Auto-Tiering | ⚠️ Parcial | `sdd-orchestrator.md` | Ver HALLAZGO-1 |
| Protocolo de Delegación bloqueante (G1/G2/G3) | ✅ Cubierta | `sdd-orchestrator.md` | Mejorado con gates explícitos |
| Protocolo del Engram (save triggers) | ⚠️ Parcial | `sdd-orchestrator.md` | Ver HALLAZGO-2 |
| Protocolo del Engram (worker extraction) | ✅ Cubierta | `sdd-orchestrator.md` | §Protocolo del Engram punto 2 |
| Session Close Protocol | ✅ Cubierta | `sdd-orchestrator.md` | §Session Close equivalente |
| Comandos SDD con prerequisitos | ✅ Cubierta | `sdd-orchestrator.md` | Naming actualizado (sin prefijo `sdd-`) |
| Handoff Protocol (template path) | ⚠️ Parcial | `sdd-orchestrator.md` | Ver HALLAZGO-3 |
| T1 Phase Batching | ✅ Cubierta | `sdd-orchestrator.md` | Condensado, intención preservada |
| Checkpoint entre Fases | ✅ Cubierta | `sdd-orchestrator.md` | §Checkpoint equivalente |
| Reglas de Ejecución del Worker | ✅ Cubierta | `funky-worker.md` | Tabla idéntica |
| Return Envelope del Worker | ✅ Cubierta | `funky-worker.md` | §Return Envelope equivalente |

**Resumen:** 11 ✅ Cubiertas / 3 ⚠️ Parciales / 0 ❌ Ausentes

---

## Instrucciones Huérfanas Encontradas

### [HALLAZGO-1] Escalation Matrix — Modo inline para "Tarea Chica"
**observacion humano** para pregunta chica, tal vez no es buena idea que un orquestador se ponga modo worker inline, el orquestador debe preguntar si lo ejecuta o no, la pregunta inline ya lo hace default el orquestador, no tengo idea si es bueno hacerle saber algo que ya sabe.

- **Origen:** `backup-analisis/agents-rules-sdd-orchestrator.md` líneas 81–88 + `gemini-funky-backup.md` líneas 64–69
- **Destino sugerido:** `sdd-orchestrator.md`
- **Texto original (backup monolito):**
  > ```
  > | Tamaño | Acción |
  > |--------|--------|
  > | Pregunta simple | Responder inline |
  > | Tarea chica | Ejecutar inline (modo Worker) |
  > | Feature sustancial | Correr SDD completo → delegar |
  > ```
- **Veredicto:** La actual Escalation Matrix (T1/T2/T3) es más operativa y específica. Sin embargo, perdió explícitamente la cláusula **"Tarea chica → ejecutar inline (modo Worker)"**, que autorizaba al Orquestador a salir del modo planificador en casos triviales sin crear un Worker separado. La nueva matriz T1 dice "pasar directo a tasks.md" y "Worker ejecuta", lo cual implica que siempre hay un Worker. El comportamiento de "hacer inline sin Worker" quedó sin representación formal.
- **Impacto:** Bajo. La nueva Escalation Matrix es más prescriptiva y probablemente intencionalmente elimina el modo dual. Pero si el equipo quiere preservarlo, debería ser explícito.

---

### [HALLAZGO-2] Engram — Self-Check Post-Interacción

- **Origen:** `gemini-funky-backup.md` líneas 83–87
- **Destino sugerido:** `sdd-orchestrator.md` §Protocolo del Engram
- **Texto original:**
  > *Self-Check:* Ask yourself after EVERY major interaction: "Did we just make a decision or discover something? If yes, write it to the Engram NOW."
- **Veredicto:** El actual `sdd-orchestrator.md` tiene §Protocolo del Engram con "Save Triggers" declarativos (cuándo escribir), pero no tiene el **mecanismo de auto-verificación post-interacción**. La instrucción explícita de preguntarse activamente "¿tomamos una decisión?" después de cada interacción es un guardrail cognitivo efectivo que no fue migrado. El texto actual confía en que el Orquestador recuerde los triggers, pero no le ordena verificarlos activamente.
- **Impacto:** Medio. Este guardrail previene el "Engram drift" (decisiones tomadas que no quedan persistidas). Su ausencia puede causar pérdida silenciosa de conocimiento.

---

### [HALLAZGO-3] Handoff Protocol — Path del Template Inconsistente

- **Origen:** `backup-analisis/agents-rules-sdd-orchestrator.md` línea 57 (Planning Checklist ítem #2, línea 39)
- **Destino sugerido:** `sdd-orchestrator.md` §Planning Checklist y §Protocolo Obligatorio — Generación de Worker Handoffs
- **Texto original (legacy):**
  > `ACTION: Execute view_file on funky-cli/src/templates/sdd/worker-handoff.md`
- **Texto actual:**
  > `view_file .agents/templates/sdd/worker-handoff.md`
- **Veredicto:** El path cambió de `funky-cli/src/templates/sdd/` a `.agents/templates/sdd/`. Esto es probablemente intencional (migración v2.0.0 que creó el backup inmutable en `.agents/templates`). Sin embargo, existe una inconsistencia: el Planning Checklist del legacy (ítem #2) mencionaba explícitamente `view_file worker-handoff.md` como verificación **antes de delegar**. El actual movió esto a §Protocolo Obligatorio pero eliminó la verificación del checklist. Esto puede causar que el Orquestador omita el paso si sigue el checklist mecánicamente.
- **Impacto:** Bajo-Medio. El §Protocolo Obligatorio compensa, pero la duplicación en el checklist era un guardrail redundante intencional (defensa en profundidad).
**observacion humano** El path .agents es el golden para proyectos nuevosm el path cli/templates es unicamente para el repo oficial de funky-cli, templates base. Como en una feature reciente hemos decidido implementar el comando funky feature, esto inyecta todos los templates golden(base en caso de no haber golden). Esto hace que todas las referencias de revisar templates que ya gestiona funky feature es algo que ya debe estar deprecado
---

### [HALLAZGO-4] Session Close — Referencia a `engram-protocol.md`

- **Origen:** `gemini-funky-backup.md` línea 94
- **Destino sugerido:** `sdd-orchestrator.md` §Session Close
- **Texto original:**
  > "Ensure all new knowledge is extracted to `docs/engram/` using the schema defined in `.agents/rules/engram-protocol.md`."
- **Veredicto:** El archivo `.agents/rules/engram-protocol.md` es referenciado en el legacy pero no aparece mencionado en ningún archivo del estado actual. Dos posibilidades: (a) el archivo existe pero fue deprecado silenciosamente, o (b) nunca existió o fue absorbido. El schema del engram debería ser referenciable. Esta referencia huérfana requiere verificación puntual — **no se realizó `view_file` sobre este archivo por estar fuera del scope del handoff**.
- **Impacto:** Bajo. Si el archivo no existe, la referencia en el legacy era aspiracional. Si existe, es un asset no referenciado.
**observacion humano** El archivo existe y es importante, debemos revisar si se complementa con el hallazgo 2.
---

## Diff de Paridad CLI

Comparando `sdd-orchestrator.md` (golden en producción) vs `backup-analisis/agents-rules-sdd-orchestrator.md` (pre-migración):

| Aspecto | Legacy (backup) | Actual (golden) | Tipo de cambio |
|---------|-----------------|-----------------|----------------|
| XML Role Tags `<ROLE_ORCHESTRATOR>` | ✅ Presentes (L6, L105) | ❌ Ausentes | **Intencional** — archivos ahora separados |
| Planning Checklist ítems | 4 ítems (sin ítem #0) | 4 ítems (con ítem #0 nuevo `funky feature`) | **Mejora** — añade guardrail de scaffolding CLI |
| Planning Checklist ítem #2 | Referencia a `funky-cli/src/templates/...` | Referencia a `.agents/templates/...` | **Path actualizado** — post v2.0.0 |
| Escalation Matrix | Tabla simple 3-filas (Pregunta/Tarea/Feature) | Tabla T1/T2/T3 con acciones operativas | **Mejora** — más prescriptiva. Ver HALLAZGO-1 |
| Protocolo de Delegación | Texto plano (L62-63) | Return Statement con Gates G1/G2/G3 bloqueantes | **Mejora significativa** |
| T1 Phase Batching | 3 condiciones explícitas + ejemplo texto | Condensado en 1 línea de condiciones | **Compresión** — intención preservada |
| Checkpoint entre Fases | `view_file on report-faseN.md` explícito (L76) | Condensado: `leer campo ...` | **Compresión** — intención preservada |
| Engram Save Triggers | `docs/engram/` (sección separada) | `docs/engram/` (sección §Protocolo del Engram) | **Equivalente** |
| Nombres de archivos de comandos | `sdd-explore.md`, `sdd-proposal.md`, `sdd-spec.md` | `explore.md`, `proposal.md`, `spec.md` | **Renaming intencional** (post v2.0.0) |

> ⚠️ **Nota importante sobre la Fase 3:** El Worker de la Fase 3 sobrescribió `funky-cli/src/templates/bootstrap/agents-rules-sdd-orchestrator.md`. Se confirma que el backup en `docs/openspec/changes/v2.0.1-context-fix/backup-analisis/` es la referencia legacy válida para este análisis.

---

## Veredicto Final

**El corpus actual representa MAYORMENTE el legacy — con 3 gaps parciales identificados.**

La migración v2.0.0 → v2.0.1 logró:
- Separar roles (Orquestador / Worker) en archivos distintos eliminando el monolito
- Mejorar la Escalation Matrix con criterios operativos (T1/T2/T3)
- Agregar Gates G1/G2/G3 bloqueantes (mejora de compliance)
- Agregar ítem #0 en Planning Checklist (guardrail `funky feature`)

Los 3 gaps parciales identificados son:
1. **HALLAZGO-1** (Bajo): La cláusula "Tarea chica → ejecutar inline sin Worker" quedó sin representación. Evaluar si es intencional.
2. **HALLAZGO-2** (Medio): El Self-Check post-interacción del Engram desapareció. Recomiendo reincorporarlo.
3. **HALLAZGO-3** (Bajo-Medio): El path del template cambió y se eliminó la redundancia de verificación en el checklist. Evaluar si agregar ítem de verificación de vuelta.

**HALLAZGO-4** requiere verificación puntual de existencia de `engram-protocol.md` (fuera del scope de esta fase).

**Conclusión:** NO es una pérdida crítica de comportamiento. Los gaps son matices de guardrails, no de flujos completos. La arquitectura está sana. Se recomienda que el Orquestador y el Humano revisen los HALLAZGOs 1 y 2 antes de cerrar el fix.


## CONCLUSIONES DEBATIDAS

### [HALLAZGO-1] Escalation Matrix — Modo inline para "Tarea Chica"
- **Observación humano:** El Orquestador no debería ponerse en "modo Worker inline" de forma autónoma — debe siempre preguntar antes de cambiar de rol. Para preguntas simples, responder inline sí es correcto, pero ya es el comportamiento default y documentarlo puede ser redundante.
- **Veredicto Orquestador:** ✅ **DESCARTAR.** Hay dos comportamientos en juego: (1) *Pregunta simple* → responder inline es el default del LLM, documentarlo es ruido puro. (2) *Tarea chica* → el legacy autorizaba "modo Worker inline autónomo" sin pedir permiso, lo cual rompe la separación de roles. La v2.0.0 ya corrigió esto: el T1 de la Escalation Matrix siempre delega a un Worker en chat nuevo, nunca le da autonomía de cambio de rol al Orquestador. El hallazgo **no es una pérdida sino una mejora intencional**.
- **Acción:** Ninguna. Hallazgo cerrado.

---

### [HALLAZGO-2] Engram — Self-Check Post-Interacción
- **Observación humano:** Pendiente de revisar `engram-protocol.md` para ver si ya cubre este punto.
- **Veredicto Orquestador:** ✅ **DESCARTAR.** El Self-Check existe en `.agents/rules/engram-protocol.md` línea 36: *"Self-Check post-tarea: ¿Tomé una decisión, arreglé un bug, o aprendí algo no-obvio? Si sí → escribir en Engram AHORA."* El protocolo vive donde debe vivir (archivo especializado con trigger `glob`). Duplicarlo en `sdd-orchestrator.md` sería ruido innecesario.
- **Acción:** Ninguna sobre el Orquestador. Hallazgo cerrado.

---

### [HALLAZGO-3] Handoff Protocol — Path del Template Inconsistente
- **Observación humano:** `.agents/templates/` es el golden (gestionado por `funky feature`). `funky-cli/src/templates/` es solo el base del repo oficial. Las referencias manuales a "revisar templates" están deprecadas desde que `funky feature` gestiona la inyección.
- **Veredicto Orquestador:** ✅ **DESCARTAR el rescate.** El cambio de path fue intencional (v2.0.0). La referencia stale de "revisar templates manualmente" ya está cubierta por el backlog existente **"Auditoría Stale-Template-Refs"**.
- **Acción:** Ninguna sobre `sdd-orchestrator.md`. El backlog absorbe este item.

---

### [HALLAZGO-4] Session Close — Referencia a `engram-protocol.md`
- **Observación humano:** El archivo existe y es importante. Podría complementar HALLAZGO-2.
- **Veredicto Orquestador:** ✅ **RESCATE MENOR APLICADO.** El archivo `.agents/rules/engram-protocol.md` existe, está activo (trigger `glob` sobre `docs/*`) y contiene el Self-Check (cierra HALLAZGO-2). El único gap real era que `sdd-orchestrator.md` no lo referenciaba. **Fix aplicado:** se agregó una línea en §Session Close apuntando al archivo: *"Schema de escritura y Self-Check → seguir `.agents/rules/engram-protocol.md`"*. Cambio replicado en el template del CLI.
- **Acción:** ✅ Ejecutada. Ambos hallazgos cerrados.