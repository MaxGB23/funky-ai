# Spec — Estimate Domain
> Domain: estimate | Status: Living | Source of Truth: `openspec/specs/estimate/spec.md`

Living spec canónico para el dominio `estimate`. Refleja el estado actual tras `fase-3-estimate`, `estimate-redesign` y `testing-modernization`.

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

El sistema DEBE localizar PROJECT-CANVAS.md e INFRA-CANVAS.md en el directorio canónico `docs/funky-ai/canvas/`. DEBE detectar `[Responde aquí]` en el contenido. Siempre CONTINUAR con contenido parcial. El comportamiento es idéntico al R1/R2 del spec de assess.

- GIVEN ambos canvases en `docs/funky-ai/canvas/`
- WHEN `funky estimate` se ejecuta
- THEN se leen sin fallback
- AND no hay warning

- GIVEN un canvas contiene `[Responde aquí]`
- WHEN `funky estimate` se ejecuta
- THEN se imprime warning listando secciones incompletas
- AND la guía se genera con el contenido disponible

### R3: Pricing guide generation

The system MUST generate `docs/funky-ai/estimate/pricing-guide.md` with architectural decisions (or "Sin decisiones documentadas"), both canvases, and the discussion structure (pricing context, cost factors, infra reference, agreements). It is a DERIVED artifact: MUST be regenerated each run. The guide MAY include optional sections (brief, topic fragments, team-cost reference, scope ficha) at `{{OPTIONAL_SECTIONS}}` when their flags are set.

- GIVEN complete canvases and decisions exist
- WHEN `funky estimate` runs
- THEN `pricing-guide.md` contains decisions, canvases, and structure

- GIVEN `pricing-guide.md` already exists
- WHEN `funky estimate` runs
- THEN it is overwritten with regenerated content
- AND no warning for the existing file

### R4: Template de decisiones de pricing

El sistema DEBE crear `docs/funky-ai/estimate/pricing-decisions.md` con secciones: decisión, justificación, impacto en presupuesto, alternativas, fecha. Es un doc VIVO del equipo: DEBE crearse solo si no existe (create-if-not-exists) y NUNCA debe sobrescribir un archivo existente.

- GIVEN `docs/funky-ai/estimate/pricing-decisions.md` no existe
- WHEN `funky estimate` se ejecuta
- THEN el template se crea con la estructura estándar

- GIVEN `docs/funky-ai/estimate/pricing-decisions.md` ya existe (con acuerdos previos)
- WHEN `funky estimate` se ejecuta
- THEN el archivo NO se modifica
- AND se imprime un aviso indicando que ya existe

### R5: Prompt IA en español neutro

El sistema DEBE generar un prompt en español neutro para que la IA inicie la sesión de pricing. El prompt DEBE referenciar (no incrustar) el material de análisis: `docs/funky-ai/estimate/pricing-guide.md` (contexto del proyecto, decisiones arquitectónicas y estructura de sesión) y `docs/funky-ai/estimate/pricing-decisions.md` (para documentar acuerdos). Se imprime en consola como parte del summary.

- GIVEN datos completos
- WHEN se genera el prompt
- THEN se produce texto en español neutro listo para copiar a la sesión de IA
- AND referencia `docs/funky-ai/estimate/pricing-guide.md` y `docs/funky-ai/estimate/pricing-decisions.md`
- AND invita a discutir pricing

- GIVEN no existe `docs/funky-ai/assess/architecture-decisions.md`
- WHEN se genera el prompt
- THEN el prompt no cambia (la guía `pricing-guide.md` ya contiene el placeholder "Sin decisiones documentadas")
- AND invita a discutir desde cero con la info de canvases disponible

### R6: Códigos de salida y output

El sistema DEBE salir con exit(0) en todos los escenarios. DEBE imprimir resumen con rutas de archivos generados, el prompt IA, e instrucciones para iniciar la sesión.

- GIVEN el comando se completa por cualquier camino
- WHEN termina la ejecución
- THEN exit(0)
- AND resumen con rutas generadas
- AND prompt IA impreso
- AND instrucciones para iniciar sesión de pricing

### R7: Optional brief

`--brief [path]` is optional: no value embeds the brief-questions checklist; a value embeds that file; missing file MUST warn, fall back to the checklist, exit(0).

- GIVEN `--brief` without a value
- WHEN the guide is generated
- THEN the checklist is embedded

- GIVEN `--brief missing.md` does not exist
- WHEN the command runs
- THEN warning, checklist fallback, exit(0)

### R8: Optional topic flags

The system MUST accept `--roles`, `--multi-tenant`, `--transactions`, `--security`, `--concurrency`, `--integrations`; each embeds its fragment at `{{OPTIONAL_SECTIONS}}`. No flags → no topic sections.

- GIVEN `funky estimate --security --roles`
- WHEN the guide is generated
- THEN both fragments are embedded

- GIVEN no topic flags
- WHEN the guide is generated
- THEN no topic sections appear

### R9: Always-on scope ficha

The system MUST always include a ficha of 6 topics: estado ∈ {`Aplica`, `No aplica según lo documentado`, `Indeterminado (revisar)`}; unfilled canvas sections (`[Responde aquí]`) MUST map to `Indeterminado (revisar)`.

- GIVEN the canvas documents the topic not applicable
- WHEN the guide is generated
- THEN the ficha row reads `No aplica según lo documentado`

- GIVEN a canvas section holds `[Responde aquí]`
- WHEN the guide is generated
- THEN the ficha row reads `Indeterminado (revisar)`

### R10: `--pricing-team` reference

`--pricing-team` MUST embed a reference section (rol×seniority×dedicación×duración formula, 1-dev and team models, phases table); reference only, not a calculator.

- GIVEN `--pricing-team` is invoked
- WHEN the guide is generated
- THEN the team-cost reference is embedded

- GIVEN no `--pricing-team`
- WHEN the guide is generated
- THEN no team-cost section appears

### R11: Console suggestions only

Topic signals MUST print console suggestions ("Se detectó X. Considerá --flag") and MUST NOT auto-include topics.

- GIVEN a multi-tenant signal, no flag
- WHEN the command runs
- THEN suggestion printed, no section added

### R12: Backward compatibility — REMOVED

(Reason: `generatePricingGuide` was one of the 6 deleted dead legacy exports with zero production consumers; see R16.)
(Migration: legacy three-arg tests deleted; guide behavior preserved via `buildPricingGuide` — R3 remains the behavior contract.)

### R13: Deterministic input

Flags MUST be deterministic input: same inputs plus flags yield an identical guide; no clock or random content.

- GIVEN identical inputs and flags twice
- WHEN the guide is generated
- THEN both outputs are byte-identical

- GIVEN same inputs, different flags
- WHEN the guide is generated
- THEN outputs MAY differ deterministically

### R14: Living templates

Optional sections MUST be driven by editable repo templates: `brief-questions-template.md`, `topics/*.md`, `team-cost-reference-template.md`. Edits MUST change guide content; no per-project copies.

- GIVEN a fragment template is edited
- WHEN the matching flag is used
- THEN the guide reflects the edit

### R15: Marker module extraction

The marker mechanism (`validatePricingGuideTemplate`, `buildPricingGuide`, `embedTopicSections`, `detectEmbeddedTopics`, `refreshPricingGuideBase` + internals `parseTopicZone`, `TOPIC_BLOCK_RE`, `EMBED_ORDER`, `readTopicFragment`) MUST live in `src/utils/estimateMarkers.js`, importing `TOPICS`/`TEAM_COST_KEY` from `estimateDomain.js` — one direction, no circular imports. `estimate.js` imports MUST point at the new module.

- GIVEN `estimateMarkers.js` exists
- WHEN `estimate.js` imports marker functions
- THEN they resolve with identical behavior

- GIVEN `estimateMarkers.js` imports from `estimateDomain.js`
- WHEN modules load
- THEN no circular-import error
- AND `estimateDomain.js` never imports `estimateMarkers.js`

### R16: Dead export deletion

The 6 dead legacy exports (`generatePricingGuide`, `generateBriefSection`, `generateTopicFragments`, `generateIAPrompt`, `generateIAPromptBanner`, `generateIAPromptFooter`) MUST NOT exist with their legacy-route tests; zero production references remain.

- GIVEN a test imports a deleted export
- WHEN the module loads
- THEN the import is `undefined` (predictable failure)

### R17: Test split

`estimateDomain.test.js` MUST stay ≤ ~250 lines; marker coverage MUST live in `estimateMarkers.test.js`.

- GIVEN marker tests move out
- WHEN the change completes
- THEN `estimateDomain.test.js` ≤ ~250 lines
- AND markers stay covered in `estimateMarkers.test.js`

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

### R-E2: `findCanvases`/`countUnfilledSections` relocated to `canvasDiscovery.js`; `loadDecisions` stays in `context.js`

The system MUST export `findCanvases(targetBase)` and `countUnfilledSections(markdown)` from `src/utils/canvasDiscovery.js` (with private helpers `readCanvas`/`canvasDir`), and MUST keep `loadDecisions(targetBase, decisionsPath)` exported from `src/utils/context.js`. The discovery pair MUST be removed from `src/utils/context.js`. All consumers (`src/commands/estimate.js`, `src/commands/assess.js`, tests) MUST import `findCanvases` from `canvasDiscovery.js` and `loadDecisions` from `context.js`. Signatures and return values MUST remain identical.
(Previously: R-E2 required both `loadDecisions` and `findCanvases` exported from `context.js`, removed from `estimateDomain.js`.)

#### Scenario: Imports resolve from the new modules

- GIVEN `estimate.js` imports `findCanvases` from `canvasDiscovery.js` and `loadDecisions` from `context.js`
- WHEN the estimate command runs
- THEN both functions execute identically to their prior `context.js` implementation

#### Scenario: context.js no longer exports discovery functions

- GIVEN a test imports `{ findCanvases }` from `context.js`
- WHEN the module loads
- THEN the import is `undefined`
- AND the test fails predictably, guiding the import-path update

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
| Dependency | `findCanvases()`/`countUnfilledSections()` MUST be importable from `canvasDiscovery.js`; `loadDecisions()` from `context.js`; zero behavioral change |
| Boundary | `process.exit(0)` MUST appear ONLY in the `.action()` callback, exactly once |
| Determinismo | Mismos inputs → idéntico `docs/funky-ai/estimate/pricing-guide.md` |
