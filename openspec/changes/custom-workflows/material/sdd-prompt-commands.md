# SDD Prompts — Commands

> Meta-comandos manejados por el orchestrator para orquestar el pipeline SDD.
> NO son phase prompts de sub-agentes — el orchestrator los interpreta y delega.

---

## `/sdd-init`

**Archivo**: `commands/sdd-init.md`
**Propósito**: Inicializar SDD en el proyecto. Detectar stack, testing capabilities, backend de persistencia.

**Gates**:
- SDD Session Preflight completo
- Usar artifact store resuelto del preflight

**Task**: Lanzar `sdd-init` sub-agent para detectar stack, convenciones, patrones de arquitectura, test runner, strict TDD.

**Return**: structured orchestration result (status, executive_summary, artifacts, next_recommended, risks, skill_resolution).

---

## `/sdd-new <change>`

**Archivo**: `commands/sdd-new.md`
**Propósito**: Arrancar un cambio nuevo SDD — exploration + proposal.

**HARD GATE**: SDD Session Preflight debe estar completo. Si falta, preguntar preflight y STOP.

**Workflow**:
1. Lanzar `sdd-explore` sub-agent para investigar codebase
2. Presentar exploration summary al usuario
3. Lanzar `sdd-propose` sub-agent para crear proposal
4. Preguntar si continuar con specs y design

**Context**:
- Working directory: `!pwd`
- Current project: `!basename "$(pwd)"`
- Change name: $ARGUMENTS
- Execution mode, artifact store, delivery strategy, review budget: ask/cache per orchestrator

---

## `/sdd-ff <change>`

**Archivo**: `commands/sdd-ff.md`
**Propósito**: Fast-forward todas las fases de planning (proposal → tasks).

**HARD GATE**: SDD Session Preflight debe estar completo.

**Planning phases** (en orden):
1. `sdd-propose` — crear proposal
2. `sdd-spec` — escribir specifications
3. `sdd-design` — crear technical design
4. `sdd-tasks` — task breakdown

**Interactive mode**: una fase por vez, presentar resultado, preguntar si ajustar o continuar, STOP. No lanzar siguiente fase hasta confirmación.

**Auto mode**: todas back-to-back, summary combinado al final.

---

## `/sdd-continue [change]`

**Archivo**: `commands/sdd-continue.md`
**Propósito**: Continuar la siguiente fase SDD según el grafo de dependencias.

**HARD GATE**: SDD Session Preflight debe estar completo.

**Dependency graph**: `proposal → [specs ∥ design] → tasks → apply → verify → archive`

**Workflow**:
1. Revisar qué artifacts existen para el cambio activo
2. Determinar la siguiente fase necesaria
3. Lanzar sub-agent apropiado
4. Presentar resultado y preguntar al usuario

**Engram**: `mem_search(query: "sdd/$ARGUMENTS/", project: "{project}")` para listar artifacts.

---

## `/sdd-explore <topic>`

**Archivo**: `commands/sdd-explore.md`
**Propósito**: Explorar/investigar una idea sin comprometerse a un cambio.

**Gates**:
- SDD Session Preflight completo
- `sdd-init` debe existir
- Usar artifact store resuelto

**Task**: Lanzar `sdd-explore` sub-agent para investigar $ARGUMENTS. Solo exploración — no file edits ni implementación.

---

## `/sdd-apply [change]`

**Archivo**: `commands/sdd-apply.md`
**Propósito**: Implementar tareas — escribir código según specs y design.

**Gates**:
1. SDD Session Preflight completo
2. `sdd-init` debe existir
3. El cambio debe tener spec, design, y tasks artifacts
4. Review workload guard debe haber pasado

**Dependency check**: si faltan spec/design/tasks, NO implementar. Sugerir `/sdd-new <change>` o `/sdd-ff <change>`.

**Task**: Lanzar `sdd-apply` sub-agent con:
- Artifact store resuelto
- Referencias a spec, design, tasks, apply-progress
- Delivery/chained PR strategy y review budget
- Strict TDD instructions si aplica

---

## `/sdd-verify [change]`

**Archivo**: `commands/sdd-verify.md`
**Propósito**: Validar implementación contra specs, design y tasks.

**Gates**:
1. SDD Session Preflight completo
2. `sdd-init` debe existir
3. El cambio debe tener spec, design, tasks, apply-progress

**Dependency check**: si faltan artifacts, NO verify. Sugerir `/sdd-continue <change>` o `/sdd-apply <change>`.

**Task**: Lanzar `sdd-verify` sub-agent con referencias a artifacts, review budget, strict TDD instructions si aplica.

---

## `/sdd-archive [change]`

**Archivo**: `commands/sdd-archive.md`
**Propósito**: Archivar un cambio completado — sync specs y cerrar ciclo SDD.

**Gates**:
1. SDD Session Preflight completo
2. `sdd-init` debe existir
3. Debe tener proposal, spec, design, tasks, apply-progress, verify-report
4. Si verify-report no dice que está ready, no archivar

**Dependency check**: si verify-report falta o no dice ready, sugerir `/sdd-verify <change>`.

**Task**: Lanzar `sdd-archive` sub-agent con referencias a todos los artifacts.

---

## `/sdd-onboard`

**Archivo**: `commands/sdd-onboard.md`
**Propósito**: Walkthrough guiado del ciclo SDD completo sobre el codebase real.

**Gates**:
1. SDD Session Preflight completo
2. Usar artifact store resuelto

**Task**: Lanzar `sdd-onboard` sub-agent para guiar al usuario. Mantener pausas en interactive mode y enforce review budget antes de apply.
