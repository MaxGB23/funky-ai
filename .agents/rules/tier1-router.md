---
trigger: manual
---

# Tier 1 Delegation Router

> Relee este router antes de cada delegación o reintento del worker — la frescura instruccional evita derivas en sesiones largas.

SDD tier 1 no contiene artefactos, únicamente se hace una exploración con un sabueso Route A, y con dichos hallazgos se genera un tasks.md. Dicho tasks.md es ejecutado por un funky-worker.

> ℹ️ **Tests en T1:** para bugfixes no apliques TDD ceremonial — si el bug es testeable, escribe primero el test que lo reproduce (regresión); si no lo es (config, copia, versión), fix directo. Las features nuevas sí siguen Strict TDD.

## 1. Tasks adaptado a Tier 1

Leer el template openspec/changes/{feature_name}/tasks.md y hacer replace file content

Añade una sección final de mergeo y cierre (inyectar al final del tasks.md generado). Esta sólo es ejecutada por el orquestador, el worker no debe hacerlo:

---
> 🔴 **STOP — WORKER PARA AQUÍ. Las siguientes secciones son exclusivas del Orquestador. No las ejecutes.**
---
## Tests de validación
- [ ] Ejecuta todos los comandos de la entrada **Validación del proyecto** en `.agents/rules/metodologias.md`

## Mergeo y cierre
- [ ] Revisar versión actual en package.json: `cat package.json`
- [ ] Bumpar versión en package.json
- [ ] Actualizar ORCHESTRATOR-STATE.md
- [ ] `git status` — confirmar limpio
- [ ] `git add -A && git commit -m "{mensaje}"`
- [ ] `git checkout main && git merge --no-ff {branch}`
- [ ] `git tag -a {version-patch} -m "{mensaje}"`
- [ ] `git push origin main --tags`
- [ ] `git branch -d {branch}`

## 2. Apply
**Checkpoint — PRE-APPLY OBLIGATORIO:** Muestra resumen del plan y pregunta al humano: ¿Nativa (CLI con subagente) o Handoff (IDE)?
- if Nativa → delega vía contrato §2.1, con la ruta al `tasks.md`. Indícale ejecutar TODAS las tareas excepto las secciones de Tests de validación y Mergeo y cierre.
- if Handoff → §2.2.

## 2.1. Prompt de Delegación (modo Nativa)
**Cómo delegar:** `define_subagent` (Lectura + Escritura).
> 🔴 **PROHIBIDO usar `self` para esta fase.**

**Prompt estricto a inyectar al subagente:**

> ## Tarea
> Asume el rol del workflow en `docs/funky-ai/prompts/sdd/funky-worker.md` y ejecuta el batch indicado ([BATCH]) o `openspec/changes/[CHANGE]/tasks.md`.
> ## Contexto Previo
> [Inyecta aquí el digest del funkygram y las metodologías activas del proyecto — en Apply son CRÍTICAS: el worker debe cumplirlas mientras implementa.]
> ## Formato de retorno
> Genera tu `report.md` según la estructura del workflow.

## 2.2. Modo Handoff
NO delegues — prepara el bloque copy-paste: `/funky-worker` + la ruta al `tasks.md`. Nada más (Ley de Invarianza): el IDE ya trae el workflow como slash command; el prompt de "leer path y tomar rol" es mecánica EXCLUSIVA del CLI para `define_subagent`.

## 3. Preparación de mergeo
Ejecutas tú la fase de Tests de validación con los comandos cacheados en `metodologías_activas` (entrada **Validación del proyecto**). Si algo falla: explica al humano qué falló y resuélvanlo juntos — considera lanzar un Sabueso Regular (Route A) si la causa no es obvia.

Con todo en verde, pide confirmación para ejecutar la fase de Mergeo y cierre.

## Fallback — Subagente no disponible
- Si `define_subagent` no está disponible → frena, explica al humano que no puedes delegar.
- Cuota agotada → sugiere reintentar con otro `Model`.
- Última opción → sugiere Handoff (copiar prompt al IDE).