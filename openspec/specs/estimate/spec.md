# Spec — Estimate Domain
> Domain: estimate | Status: Living | Source of Truth: `openspec/specs/estimate/spec.md`

Living spec canónico para el dominio `estimate`. Refleja el estado actual tras `fase-3-estimate`.

---

## Propósito

`funky estimate` facilita una sesión de pricing colaborativa humano+IA. No calcula precios con fórmulas hardcodeadas. Inyecta una guía de discusión basada en decisiones arquitectónicas (del assess) y canvases del proyecto, más un template para documentar acuerdos. La discusión real ocurre en el chat.

---

## Requirements

### R1: Validación de prerrequisito

El sistema DEBE verificar que `docs/funky-ai/assess/architecture-decisions.md` exista. Si no existe, DEBE advertir y generar guía con contenido parcial. Nunca debe fallar.

- GIVEN `docs/funky-ai/assess/architecture-decisions.md` existe
- WHEN `funky estimate` se ejecuta
- THEN se lee y se incorpora en la guía
- AND no hay warning de decisión faltante

- GIVEN `docs/funky-ai/assess/architecture-decisions.md` no existe
- WHEN `funky estimate` se ejecuta
- THEN se imprime un warning
- AND la guía se genera con "Sin decisiones documentadas"
- AND exit(0)

### R2: Canvas Discovery + Placeholders

El sistema DEBE localizar PROJECT-CANVAS.md e INFRA-CANVAS.md (root → `docs/`). DEBE detectar `[Responde aquí]` en el contenido. Siempre CONTINUAR con contenido parcial. El comportamiento es idéntico al R1/R2 del spec de assess.

- GIVEN ambos canvases en root
- WHEN `funky estimate` se ejecuta
- THEN se leen sin fallback
- AND no hay warning

- GIVEN un canvas contiene `[Responde aquí]`
- WHEN `funky estimate` se ejecuta
- THEN se imprime warning listando secciones incompletas
- AND la guía se genera con el contenido disponible

### R3: Generación de guía de pricing

El sistema DEBE generar `docs/funky-ai/estimate/pricing-guide.md` con: decisiones arquitectónicas (o "Sin decisiones documentadas"), contenido de ambos canvases, y estructura de discusión (contexto de pricing, factores de costo, referencia de infra, acuerdos). DEBE sobrescribir si existe.

- GIVEN canvases completos y decisions existen
- WHEN `funky estimate` se ejecuta
- THEN `docs/funky-ai/estimate/pricing-guide.md` se crea
- AND contiene decisions, canvases y estructura de pricing

- GIVEN `docs/funky-ai/estimate/pricing-guide.md` ya existe
- WHEN `funky estimate` se ejecuta
- THEN se sobrescribe sin respaldo

### R4: Template de decisiones de pricing

El sistema DEBE crear `docs/funky-ai/estimate/pricing-decisions.md` con secciones: decisión, justificación, impacto en presupuesto, alternativas, fecha. DEBE sobrescribir si existe.

- GIVEN `funky estimate` se ejecuta
- WHEN se genera el template
- THEN `docs/funky-ai/estimate/pricing-decisions.md` se crea/sobrescribe con la estructura estándar

### R5: Prompt IA en español neutro

El sistema DEBE generar un prompt en español neutro para que la IA inicie la sesión de pricing. Incluye: contexto del proyecto (canvases), decisiones arquitectónicas, e invitación a discutir pricing. Se imprime en consola como parte del summary.

- GIVEN datos completos
- WHEN se genera el prompt
- THEN se produce texto en español neutro listo para copiar al chat
- AND invita a discutir pricing basado en decisiones y canvases

- GIVEN no existe `docs/funky-ai/assess/architecture-decisions.md`
- WHEN se genera el prompt
- THEN indica que no hay decisiones previas
- AND invita a discutir desde cero con la info de canvases disponible

### R6: Códigos de salida y output

El sistema DEBE salir con exit(0) en todos los escenarios. DEBE imprimir resumen con rutas de archivos generados, el prompt IA, e instrucciones para iniciar la sesión.

- GIVEN el comando se completa por cualquier camino
- WHEN termina la ejecución
- THEN exit(0)
- AND resumen con rutas generadas
- AND prompt IA impreso
- AND instrucciones para iniciar sesión de pricing

### R-E1: `--context` flag for context file integration

The system MUST accept an optional `--context <path>` / `-c` flag on `funky estimate`. When the flag is provided, the system MUST read the decisions path from `context.json` at the given path instead of defaulting to `docs/funky-ai/assess/architecture-decisions.md`. The decisions content is still read from the filesystem at that path. After generating the pricing guide, the system MUST write `estimate.runAt` (ISO 8601 timestamp) to `context.json`. When the flag is NOT provided, the system MUST behave exactly as specified in the main estimate spec (backward compatible).

#### Scenario: --context provides decisions path

- GIVEN `funky estimate --context ./context.json` is invoked
- AND `context.json` contains `{ "assess": { "decisionsFile": "docs/funky-ai/assess/architecture-decisions.md" } }`
- WHEN the command executes
- THEN decisions are read from `docs/funky-ai/assess/architecture-decisions.md` (resolved relative to targetBase)

#### Scenario: --context writes estimate timestamp

- GIVEN `funky estimate --context ./context.json` completes
- WHEN the pricing guide is generated
- THEN `context.json` is updated with `estimate.runAt` set to the current ISO timestamp

#### Scenario: No --context — full backward compatibility

- GIVEN `funky estimate` is invoked without `--context`
- WHEN the command executes
- THEN all main-spec requirements R1-R6 apply unchanged
- AND decisions are read from `docs/funky-ai/assess/architecture-decisions.md` (hardcoded default)
- AND no `context.json` is read or written

#### Scenario: --context file does not exist

- GIVEN `funky estimate --context ./missing.json` is invoked
- AND `missing.json` does not exist
- WHEN the command executes
- THEN an error message is printed indicating the context file is missing
- AND the process exits with code 1

### R-E2: `loadDecisions()` and `findCanvases()` relocated to `context.js`

The system MUST export `loadDecisions(targetBase)` and `findCanvases(targetBase)` from `src/utils/context.js`. These functions MUST be removed from `src/utils/estimateDomain.js`. All existing consumers (estimate.js, tests) MUST import these functions from `context.js` instead of `estimateDomain.js`. The function signatures and return values MUST remain identical to their current form.

#### Scenario: Imports resolve from context.js

- GIVEN `estimate.js` imports `{ loadDecisions, findCanvases }` from `context.js`
- WHEN the estimate command runs
- THEN both functions execute identically to their previous implementation in `estimateDomain.js`

#### Scenario: estimateDomain.js no longer exports moved functions

- GIVEN a test imports `{ loadDecisions }` from `estimateDomain.js`
- WHEN the module is loaded
- THEN the import is `undefined`
- AND the test fails predictably (guiding the developer to update the import path)

### R-E3: Extracted `runEstimate(targetBase, opts)` function

The system MUST export `async function runEstimate(targetBase, opts)` containing all action logic currently in the Commander `.action()` callback. The Commander `.action()` callback MUST call `await runEstimate(...)` then `process.exit(0)`. The `process.exit(0)` call MUST NOT appear anywhere inside `runEstimate()`. The `opts` object MUST accept `{ contextPath?: string }` for the `--context` flag value.

#### Scenario: Programmatic call returns normally

- GIVEN `runEstimate(targetBase, {})` is called from Node.js code
- WHEN execution completes
- THEN the function returns without calling `process.exit`
- AND all output files (pricing guide, decisions template) are generated

#### Scenario: Commander callback orchestrates exit

- GIVEN the Commander `.action()` fires for estimate
- WHEN `await runEstimate(targetBase, opts)` completes
- THEN `process.exit(0)` is called by the callback, not by `runEstimate`

---

## Non-Functional Requirements

| Área | Especificación |
|------|---------------|
| Performance | Lectura+generación DEBE completar en <500ms en inicio frío |
| Error handling | Errores de lectura/permisos DEBEN imprimir warning y seguir con exit(0) |
| Sin modo interactivo | NO DEBE usar `@inquirer/prompts` ni preguntar nada al usuario. Todo headless |
| Dependency | `loadDecisions()` and `findCanvases()` MUST be importable from `context.js` with zero behavioral change |
| Boundary | `process.exit(0)` MUST appear ONLY in the `.action()` callback, exactly once |
| Determinismo | Mismos inputs → idéntico `docs/funky-ai/estimate/pricing-guide.md` |
