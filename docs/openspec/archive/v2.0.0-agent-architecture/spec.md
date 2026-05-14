# Spec: Arquitectura de Agentes v2.0.0

## 1. Mapeo Estructural de Capas

### Capa 1: Global Prompt (`docs/prompts/GEMINI-funky-global.md`)
- **Se Mantiene:** `<user_global>`, Rules, Personalidad, Language, Tone, Philosophy, Expertise.
- **Regla Estricta:** El refactor se hace SOBRE ESTE ARCHIVO sin tocar nunca el backup.
- **Se Elimina:** Cualquier rastro de "Funky AI Protocol — Manual SDD Orchestrator Rule", "Dual Persona", "Orchestrator vs Worker", etc. Todo esto se va de la memoria constante.

### Capa 2: Workspace Rules (`.agents/rules/`)
- `sdd-orchestrator.md` masivo se divide o transforma:
  - Dejará de ser un documento monolítico de 160 líneas.
  - **REGLA CRÍTICA DE ANTI-ALUCINACIÓN:** NO se debe eliminar información útil. Los workers de IA tienden a "sobreoptimizar" borrando contexto vital. El objetivo es SEPARAR/FRAGMENTAR correctamente las reglas, y si algo es necesario, se referencia para que se cargue únicamente bajo demanda.
  - Se extrae la lógica operativa a Workflows de Capa 3.

### Capa 3: Workflows On-Demand (`~/.gemini/antigravity/global_workflows/`)
Estos archivos se documentarán para ser creados en el directorio global del IDE.
1. `/funky-orchestrator`: Consolida las instrucciones para las fases de planificación (explore, propose, ff) o se crean subcomandos si es necesario.
2. `/funky-worker`: El bloque `<ROLE_WORKER>` extraído, enfocado láser en ejecutar handoffs.

## 2. Refactor de Templates de Delegación
Para que el nuevo modelo `/funky-worker` funcione, hay que actualizar el texto de "handoff" en los templates base.

**Archivos afectados:**
- `.agents/templates/sdd/worker-handoff.md` (Golden)
- `funky-cli/src/templates/sdd/worker-handoff.md` (CLI estático)
- `.agents/templates/bootstrap/agents-rules-sdd-orchestrator.md` (Backup local)

**Sustitución:**
- De: `Cerrá este chat, abrí uno nuevo y decime: @.../worker-handoff.md Ejecutá la Fase N`
- A: `Cerrá este chat, abrí uno nuevo y decime: /funky-worker @.../worker-handoff.md Ejecuta la fase N`

## 3. Plan de Mitigación para "Funky Setup"
Se dejará asentado explícitamente que la instalación de estos archivos markdown dentro de la carpeta oculta de Antigravity (`~/.gemini/...`) es, por ahora, manual. Se automatizará en la Task 011.
