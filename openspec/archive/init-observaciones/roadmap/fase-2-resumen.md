# Resumen: Fase 2 — Assess (Discusión Arquitectónica Humano + IA)

> Estado: **Completada**
> Inicio: 2026-07-28
> Compleción: 2026-07-28

---

## Objetivo

Assess como facilitador de discusión, no como calculadora de reglas estáticas. Team + IA discuten decisiones arquitectónicas juntos.

## Filosofía

Las mejores soluciones salen de discutir entre varias cabezas. La IA actúa como peer informado que detecta riesgos, propone alternativas y ayuda a llegar a mejores decisiones.

## Qué se hizo

1. **Eliminación del YAML assessment como input del CLI** — `architecture-assessment.md` ya no se lee ni valida. El comando `funky assess` se basa puramente en PROJECT-CANVAS e INFRA-CANVAS.

2. **Canvas discovery** — Búsqueda de canvases en raíz del proyecto primero, fallback a `docs/`. Si faltan, warning pero continúa.

3. **Validación de placeholders** — Detecta `[Responde aquí]` en canvases y advierte si hay secciones sin completar.

4. **Discussion guide** — Reemplazo completo del template `architecture-review-template.md`: pasó de ser un prompt adversarial "Devil's Advocate" a una guía de 6 fases (Contexto → Preocupaciones → Preguntas Guía → Riesgos → Alternativas → Acuerdos). El template incluye 3 preguntas estáticas C1 (budget+infra, RPS+DB, SLA+redundancia) y espacio para preguntas dinámicas C2.

5. **Preguntas C2 dinámicas** — `generateGuideQuestions()` escanea el contenido de los canvases en busca de patrones (K8s, SQLite, Single Node, Junior+K8s). Si encuentra match, genera preguntas adicionales en la guía. Si no, solo van las 3 preguntas C1 estáticas.

6. **Decisions template** — Nuevo `architecture-decisions-template.md` con estructura: decisión, rationale, alternativas consideradas, riesgos aceptados, fecha. `funky assess` lo copia a `docs/architecture-decisions.md` solo si no existe.

7. **Siempre exit 0** — assess nunca falla. Siempre genera la guía, siempre termina con código 0.

## Archivos modificados/creados

| Archivo | Cambio |
|---------|--------|
| `funky-cli/src/commands/assess.js` | Reescribir: canvas discovery, guide gen, decisions template, exit 0 |
| `funky-cli/src/utils/assessRules.js` | Refactor: evaluateAssessment() → generateGuideQuestions(canvasData) |
| `funky-cli/src/templates/sdd/architecture-review-template.md` | Reemplazar: adversarial prompt → guía de 6 fases |
| `funky-cli/src/templates/sdd/architecture-decisions-template.md` | **Nuevo:** template de decisiones estructuradas |
| `funky-cli/tests/assess.test.js` | +10 tests de integración (mantiene 2 legacy de parseFrontmatter) |
| `funky-cli/tests/assessRules.test.js` | Refactor: 15 tests para generateGuideQuestions() |

## Descubrimientos

- **Patrón Junior C2 es frágil** — al eliminar el YAML assessment, no hay campo estructurado "team_seniority". El patrón escanea el texto libre de los canvases buscando la palabra "junior". Si el equipo no la menciona explícitamente, la pregunta no se genera. La IA puede preguntar igual durante la discusión.
- **Windows path quirk** — `new URL(import.meta.url).pathname` devuelve `/M:/...` (leading slash). Se usa `fileURLToPath()` consistentemente.
- El template C1 estático es más simple y mantenible que generarlo desde JS. El usuario puede editarlo directamente si quiere cambiar las preguntas.

## Problemas encontrados y resueltos

- **Vitest fs mock inconsistente** — `vi.mock('fs')` auto-mock no capturaba `writeFileSync` de Commander.js. Se cambió a manual mock con exports named.
- **Warning de verify: Docker en patrón Junior** — la implementación original incluía Docker como trigger, pero el design solo especificaba K8s/Kubernetes. Se alineó con el design y se actualizó el test.
- **Warning de verify: falta {{DATE}} en decisions template** — se agregó la línea al header del template.

## Lo que quedó pendiente

- **context.json pipeline** — el formato estructurado reutilizable entre comandos se diseña en Fase 4 (Integración). Por ahora assess produce archivos markdown independientes.
- **Integración con estimate** — assess y estimate siguen siendo comandos independientes. La integración pipeline es Fase 4.
- Unificar NFRs en canvases (actualmente están en el YAML de `architecture-assessment.md` que ya no se lee desde el CLI).
