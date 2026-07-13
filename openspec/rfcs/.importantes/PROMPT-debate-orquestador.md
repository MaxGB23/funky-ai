# Prompt para debate: Contratos de retorno y presentación interactiva

> Copiar y pegar en un chat nuevo con un orquestador en blanco.
> Después de debatir, volver con las decisiones para actualizar `sdd-phase-returns.md`.

---

## Contexto

Estamos diseñando un framework de orquestación de agentes SDD (Spec-Driven Development). Tenemos:

1. **Documentos aprobados** en `refactor-tasks/` — decisiones firmes sobre arquitectura, roles, modos de operación, phase batching.
2. **Inspiración de Gentle AI** en `.importantes/sdd-interactive/` — templates de cómo ese orquestador presenta datos al humano entre fases. NO son decisiones, son referencias.
3. **Un RFC viejo** (`sdd-phase-returns.md`) que documenta los contratos de retorno de cada fase SDD, pero está desactualizado y hecho sobre la referencia de Gentle AI.

## Objetivo del debate

Vamos a trabajar directamente sobre dos directorios:

- **`sdd-interactive/`** — definiremos qué y cómo el orquestador le presenta al humano entre fases (capa de presentación interactiva).
- **`sdd-approved/`** — guardaremos el contrato de retorno decidido para cada fase (built-in para workflows completos e inline para SDD ligeros).

Definir, para **nuestro framework**:

### 1. Modo interactivo vs automático

- ¿El modo lo decide el humano al inicio (preflight con A1/A2) o lo determina el Tier automáticamente?
- `spec-cli-ide-boundaries.md` §5 sugiere que el Tier ya debería definir el modo. Pero el preflight de Gentle AI pregunta explícitamente.
- En modo interactivo: ¿cada fase se detiene a esperar confirmación humana?
- En modo auto: ¿checkpoint solo antes de apply, o fluido total?

### 2. Contrato de retorno (subagente → orquestador)

Aprobado en `spec-roles-subagents.md` §3.1:
- **Workflows completos (Tier 3+):** El return envelope ya vive dentro del prompt del workflow. El orquestador no lo exige.
- **SDD ligeros / tareas custom:** El orquestador debe especificar el formato de retorno en el prompt de delegación.

Preguntas:
- ¿Qué fases tienen versión "ligera" (explore, propose, spec)? Respuesta: Sí
- El **Explore Ligero** (Sabueso) es desechable, no persiste artefacto — ¿cómo se refleja eso en el contrato?
- ¿Cuál es el formato mínimo de retorno para un subagente ligero? ¿Es siempre el mismo o varía por fase?

### 3. Presentación al humano (capa interactiva)

Gentle AI separa esto en `sdd-interactive/01-10.md`. Cada fase tiene un template de lo que el orquestador muestra:

```
✅ Init complete — "proyecto"
🔍 Explore complete — "feature"
📄 Proposal ready — "feature"
📋 Specs ready — "feature"
🏗️ Design ready — "feature"
📋 Tasks ready — "feature"  (+ Review Workload Guard)
⚡ Apply batch complete — "feature"
✅ Verify complete — "feature"
📦 Archive complete — "feature"
```

Preguntas:
- ¿Queremos templates propios o que el orquestador decida el formato libremente?
- ¿Los templates deben ser estáticos (como Gentle AI) o variables según el Tier?
- La pregunta de cierre de fase: ¿siempre "¿Querés ajustar algo o continuamos?" o varía?
- Archive no pregunta "ajustar", pregunta qué sigue — ¿correcto?

### 4. Review Workload Guard

Aprobado en `spec-orchestrator-rules.md` §7:
- Si `funky-tasks` forecast > 400 líneas, se activa el guard.
- En interactivo: pregunta al humano si quiere stacked PRs, feature branch chain, o size exception.
- En auto: checkpoint lite antes de apply.

Observación del humano: Funky-AI no contiene stacked PRs, fefeature branch chain, o size exception, el risk de >400 lineas es usado para otra cosa.

---

## Cómo usar este prompt

Archivos de referencia (pedile al orquestador que los lea antes de debatir):
- `docs/openspec/rfcs/.importantes/MANIFEST.md` — mapeo de todos los archivos
- `docs/openspec/rfcs/.importantes/sdd-phase-returns.md` — RFC viejo (referencia)
- `docs/openspec/rfcs/.importantes/sdd-interactive/01-preflight.md` a `10-archive.md` — inspiración Gentle AI
- `docs/openspec/rfcs/refactor-tasks/spec-roles-subagents.md` — §3.1, §4.3, Anexo
- `docs/openspec/rfcs/refactor-tasks/spec-cli-ide-boundaries.md` — §5
- `docs/openspec/rfcs/refactor-tasks/spec-orchestrator-rules.md` — §7
