# Resumen: Fase 3 — Estimate (Sesión de Pricing Colaborativa)

> Estado: **Completada**
> Inicio: 2026-07-28
> Compleción: 2026-07-28

---

## Objetivo

Transformar `funky estimate` de calculadora hardcodeada a **facilitador de sesión de pricing colaborativa** humano+IA, siguiendo el mismo patrón de Fase 2 (assess): el CLI inyecta materiales, la discusión real pasa en el chat.

## Filosofía

El CLI nunca resuelve nada solo — solo inyecta la guía de discusión, el template de decisiones y el prompt IA. El equipo humano + IA discuten valor real, costo y trade-offs de pricing. El número final sale de esa conversación, no de una fórmula hardcodeada.

## Qué se hizo

### Fase SDD completa (explore → archive)

| Fase | Resultado |
|------|-----------|
| **Explore** | Investigación del comando estimate actual (188 líneas), assess.js como patrón de referencia, 10 hallazgos clave |
| **Propose** | 7 entregables definidos: refactor estimate.js, canvas discovery, guía de pricing, template de decisiones, prompt IA, tests |
| **Spec** | 6 requirements (R1-R6) con 10 escenarios GIVEN/WHEN/THEN en español neutro |
| **Design** | Módulo `estimateDomain.js` con 5 funciones puras, command wrapper delgado, 2 templates nuevos |
| **Apply** | 16 tareas implementadas en 4 fases |
| **Verify** | PASS — 10/10 escenarios compliant, 3 issues encontrados y resueltos |
| **Archive** | Spec copiado a `openspec/specs/estimate/spec.md`, cambio archivado |

### Implementación

1. **estimateDomain.js** — 5 funciones puras exportadas:
   - `loadDecisions()` — lee `docs/architecture-decisions.md`, retorna contenido o null
   - `findCanvases()` — descubre PROJECT-CANVAS.md e INFRA-CANVAS.md (root → docs/ fallback), detecta `[Responde aquí]`
   - `generatePricingGuide()` — interpola template con decisiones + canvases
   - `generateDecisionsTemplate()` — interpola template con {{DATE}}
   - `generateIAPrompt()` — genera prompt IA en español neutro (separado del banner)
   - `generateIAPromptBanner()` + `generateIAPromptFooter()` — decorado del prompt

2. **estimate.js** — Refactor completo: eliminado `@inquirer/prompts`, lógica interactiva y fórmula hardcodeada. Command wrapper delgado que llama a funciones de estimateDomain.js. `exit(0)` siempre.

3. **Templates nuevos:**
   - `pricing-guide-template.md` — guía de discusión de pricing con 4 fases (Contexto → Factores de Costo → Infra → Acuerdos)
   - `pricing-decisions-template.md` — template para documentar acuerdos (decisión, justificación, impacto, alternativas, fecha)

4. **Prompt IA** — Generado en español neutro, se imprime en consola. Invita a la IA a guiar la sesión de pricing con contexto del proyecto + decisiones arquitectónicas.

5. **Tests** — 22 tests (20 unit/integration + 2 nuevos para banner/footer) con mock global de fs, mismo patrón que assess.test.js.

### Issues resueltos durante verify

- **Commander stderr noise** — `vi.spyOn(process.stderr, 'write')` en tests de integración
- **Sin cobertura configurada** — `vitest.config.mjs` creado con thresholds (lines 60%, functions 60%, branches 50%)
- **Banner/prompt separados** — `generateIAPrompt()` ahora retorna solo el cuerpo; banner y footer son funciones independientes

## Archivos modificados/creados

| Archivo | Cambio |
|---------|--------|
| `funky-cli/src/commands/estimate.js` | Modificar: -169 / +73 líneas. Refactor completo headless |
| `funky-cli/src/utils/estimateDomain.js` | **Nuevo:** ~120 líneas. 7 funciones exportadas |
| `funky-cli/src/templates/sdd/pricing-guide-template.md` | **Nuevo:** ~50 líneas. Guía de discusión de pricing |
| `funky-cli/src/templates/sdd/pricing-decisions-template.md` | **Nuevo:** ~25 líneas. Template de decisiones de pricing |
| `funky-cli/tests/estimate.test.js` | **Nuevo:** ~440 líneas. 22 tests |
| `funky-cli/vitest.config.mjs` | **Nuevo:** configuración de cobertura |
| `openspec/specs/estimate/spec.md` | **Nuevo:** spec canónico del dominio estimate |
| `openspec/changes/archive/2026-07-28-fase-3-estimate/` | Archivo del cambio completo |

## Descubrimientos

- **El patrón assess.js es sólido y reusable** — funciones puras + command wrapper + exit(0) funcionó perfectamente como referencia arquitectónica para estimate.
- **Commander v14 es strict con argumentos** — Al pasar `['node', 'estimate']` a `.parse()`, Commander imprime "too many arguments" en stderr. Silenciar con `vi.spyOn(process.stderr, 'write')` en tests es más práctico que pelear con la API.
- **Español neutro en templates** — La interpolación simple (`{{PLACEHOLDER}}`) funciona bien sin template engine. Los templates en español neutro son consistentes con el público objetivo (clientes de habla hispana).
- **Separación banner/prompt** — `generateIAPrompt()` ahora produce solo el cuerpo del prompt. El banner decorativo está en funciones separadas, lo que permite reutilizar el prompt puro en otros contextos (Fase 4).
- **vitest.config.mjs sin ESM issues** — Vitest 4.x acepta `.mjs` sin problemas de configuración de módulos.

## Problemas encontrados y resueltos

- **Commander "too many arguments" en tests** — Al pasar `['node', 'estimate']` a `.parse()`, Commander v14 imprime error en stderr. Acción: Se agregó `vi.spyOn(process.stderr, 'write')` en los tests de integración para suprimir el ruido. El `.action()` igual se ejecuta y los tests pasan.
- **Falta de cobertura configurada** — El proyecto no tenía `vitest.config.*`. Acción: se creó `vitest.config.mjs` con provider v8 y thresholds básicos.
- **Banner decorativo mezclado con prompt** — `generateIAPrompt()` original devolvía el prompt con bordes `=====`. Acción: se separó en `generateIAPromptBanner()`, `generateIAPrompt()` y `generateIAPromptFooter()`. estimate.js los concatena al imprimir.
- **Commit de Fase 3 en branch incorrecta** — El commit `2f06102` se hizo sobre `feat/fase-2-assess` en vez de `feat/fase-3-estimate`. Se resolvió creando la branch `feat/fase-3-estimate` desde el estado actual.

## Lo que quedó pendiente

- **Pipeline context.json** — El formato estructurado reutilizable entre comandos se diseña en Fase 4 (Integración). Por ahora estimate produce archivos markdown independientes.
- **Integración con init → assess → estimate** — Los comandos siguen siendo independientes. La integración pipeline es Fase 4.
- **`@inquirer/prompts` sigue como dependencia** — Se usa en `engram.js`, no se puede eliminar. No es código muerto.

## Stats finales

| Métrica | Valor |
|---------|-------|
| Commits | 1 (`2f06102`) + fixes sin commitear |
| Archivos cambiados (fase completa) | 10 |
| Tests | 116 pasan (22 nuevos, 15 archivos) |
| Spec compliance | 10/10 escenarios |
| SDD phases | explore → propose → spec → design → tasks → apply → verify → archive |
| Size exception | Aprobado (~445-495 líneas sobre budget de 400) |
