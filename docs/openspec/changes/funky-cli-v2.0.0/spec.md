# Spec: Arquitectura de Agentes v2.0.0

## 1. Mapeo Estructural de Capas

### Capa 1: Global Prompt (`docs/prompts/GEMINI-funky-global.md`)
- **Se Mantiene:** `<user_global>`, Rules, Personalidad, Language, Tone, Philosophy, Expertise.
- **Se Elimina:** Cualquier rastro de "Funky AI Protocol — Manual SDD Orchestrator Rule", "Dual Persona", "Orchestrator vs Worker", etc. Todo esto se va de la memoria constante.

### Capa 2: Workspace Rules (`.agents/rules/`)
- `sdd-orchestrator.md` masivo se divide o transforma:
  - Dejará de ser un documento monolítico de 160 líneas.
  - Se purga la lógica `<ROLE_WORKER>` (pasa a Capa 3).
  - Queda como regla estática solo lo indispensable (ej: Semántica de RFCs vs Proposal), pero los pasos de ejecución (`/sdd-explore`, `/sdd-ff`) se delegan a Workflows.

### Capa 3: Workflows On-Demand (`~/.gemini/antigravity/global_workflows/`)
Estos archivos se documentarán para ser creados en el directorio global del IDE.
1. `/sdd-explore.md`: Instrucciones exactas para leer el RFC y generar `explore.md`.
2. `/sdd-propose.md`: Instrucciones para la propuesta y el `spec.md`.
3. `/sdd-ff.md`: El checklist crítico, Handoff Gates (G1/G2/G3), y creación de `tasks.md`.
4. `/worker-execute.md`: El bloque `<ROLE_WORKER>` purgado del prompt global, enfocado láser en ejecutar handoffs.

## 2. Refactor de Templates de Delegación
Para que el nuevo modelo `/worker-execute` funcione, hay que actualizar el texto de "handoff" en los templates base.

**Archivos afectados:**
- `.agents/templates/sdd/worker-handoff.md` (Golden)
- `funky-cli/src/templates/sdd/worker-handoff.md` (CLI estático)
- `.agents/templates/bootstrap/agents-rules-sdd-orchestrator.md` (Backup local)

**Sustitución:**
- De: `Cerrá este chat, abrí uno nuevo y decime: @.../worker-handoff.md Ejecutá la Fase N`
- A: `Cerrá este chat, abrí uno nuevo y decime: /worker-execute @.../worker-handoff.md Fase N`

## 3. Plan de Mitigación para "Funky Setup"
Se dejará asentado explícitamente que la instalación de estos archivos markdown dentro de la carpeta oculta de Antigravity (`~/.gemini/...`) es, por ahora, manual. Se automatizará en la Task 011.
