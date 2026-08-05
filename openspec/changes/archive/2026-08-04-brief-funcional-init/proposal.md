# Proposal: Brief funcional obligatorio en `funky init`

## Intent
`funky init` arranca hoy en el stack: PROJECT-CANVAS parte en "1. Framework Base" — anti-patrón §13 (primero "qué", luego "cómo"). El primer paso del proyecto debe definir problema y producto, no stack. Decisión de negocio del usuario: brief primero.

## Scope

### In Scope
- Nuevo template `funky-cli/src/templates/init/brief-funcional.md` con los 12 ítems de §13 (nombre, objetivo, tipo de usuario, caso de uso principal, funcionalidades principales, secundarias/futuras, roles y permisos, seguridad, integraciones, entregables por fase, MVP vs fase 2, KPI); placeholder `[Completar]`.
- `init` copia el brief como PRIMER output a `docs/funky-ai/canvas/brief-funcional.md` (secuencia §13: brief → canvas).
- Refactor de `init.js` a función pura `runInit({ templatesDir, targetBase })` (patrón runScaffold); guard de existencia actual sin cambios, en el action.
- Tests reales de runInit (intentions, guard). Hoy init.test.js solo cubre runScaffold.
- Docs en el mismo cambio (docs = CLI real): `docs/funky-forge/init.md` (3→4 outputs); --help se actualiza vía enrichCommandHelp (lee el doc).

### Out of Scope
- Prompts interactivos (funky-init-flow.md: "no modos interactivos ni prompts").
- Auto-detección del brief por estimate; mover/alinear brief-questions-template.md (R7 intacta).
- Warning de placeholders al generar (init es scaffolding, no validación).

## Capabilities

### New Capabilities
- `init-brief-funcional`: brief de 12 ítems copiado como primer output de init.

### Modified Capabilities
- `init-command`: árbol de salida 3→4 archivos; refactor a runInit pura; guard y mensajes intactos.

## Approach
Template estático kebab-case en `src/templates/init/`; runInit arma intentions (mkdir canvas; copy brief primero; PROJECT/INFRA; guide opcional) como runScaffold; el action ejecuta executeIntentions con el guard actual. El diagrama de init.md ya nombra runInit (hoy inexistente) — el refactor alinea doc y código. estimate consume el brief sin cambios: `--brief docs/funky-ai/canvas/brief-funcional.md` (R7 acepta paths).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `funky-cli/src/templates/init/brief-funcional.md` | New | Template 12 ítems, placeholder `[Completar]` |
| `funky-cli/src/commands/init.js` | Modified | runInit pura + brief como primer output |
| `funky-cli/tests/init.test.js` | Modified | Tests runInit (intentions + guard) |
| `docs/funky-forge/init.md` | Modified | Contrato: 3→4 outputs |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Drift brief vs checklist estimate | Med | Brief como superset; alinear en cambio aparte |
| Docs/--help desalineados | Low | Docs en el mismo cambio |
| Guard actual sorprende (brief sin regenerar) | Low | Comportamiento documentado; cambio aditivo |

## Rollback Plan
Revert del/los commits del cambio; árbol de salida vuelve a 3 outputs. Aditivo: findCanvases/countUnfilledSections leen solo los 2 canvases; sin consumidores rotos.

## Dependencies
- Ninguna externa. Patrón existente: runScaffold + executeIntentions.

## Success Criteria
- [ ] `funky init` en carpeta limpia genera brief-funcional.md con los 12 ítems, como primer output
- [ ] Segunda ejecución falla con exit(1) por el guard actual
- [ ] Tests de runInit (intentions y guard) pasan
- [ ] Suite completa `pnpm test` verde
- [ ] docs/funky-forge/init.md refleja 4 outputs; --help consistente

## Supuestos (preguntas abiertas resueltas)
- Nombre: `brief-funcional.md` (kebab español del repo).
- Sin warning de placeholders en v1; auto-detección de estimate diferida (enhancement aparte).
- Revisables por el usuario antes de specs; no bloquean.
