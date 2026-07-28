# Tasks: Fase 3 — Estimate (Sesión de Pricing Colaborativa)

## Review Workload Forecast

| Campo | Valor |
|-------|-------|
| Líneas estimadas cambiadas | ~445-495 |
| Riesgo presupuesto 400 líneas | Medio |
| PR encadenados recomendados | No |
| División sugerida | PR único |
| Estrategia de entrega | single-pr |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

### Unidades de trabajo sugeridas

| # | Objetivo | PR | Comando de test | Harness runtime | Límite de rollback |
|---|----------|----|-----------------|-----------------|-------------------|
| 1 | Templates + estimateDomain.js + refactor estimate.js + tests | PR 1 | `npx vitest run tests/estimate.test.js` | `node src/commands/estimate.js` en proyecto con canvases | Revertir estimate.js, eliminar estimateDomain.js, templates nuevos, test |

## Fase 1: Fundamentos

- [x] 1.1 Crear `src/templates/sdd/pricing-guide-template.md` con placeholders {{DECISIONS_CONTENT}}, {{PROJECT_CANVAS_CONTENT}}, {{INFRA_CANVAS_CONTENT}} y estructura de discusión de pricing
- [x] 1.2 Crear `src/templates/sdd/pricing-decisions-template.md` con campo {{DATE}} y secciones: decisión, justificación, impacto en presupuesto, alternativas, fecha
- [x] 1.3 Crear `src/utils/estimateDomain.js` con 5 funciones exportadas: loadDecisions, findCanvases, generatePricingGuide, generateDecisionsTemplate, generateIAPrompt. Incluir helpers privados findCanvas() y countUnfilledSections() (mismo patrón de assess.js)

## Fase 2: Command wrapper

- [x] 2.1 Refactorizar `src/commands/estimate.js`: eliminar import de @inquirer/prompts, eliminar lógica interactiva y de cálculo hardcodeada; importar y llamar funciones de estimateDomain.js
- [x] 2.2 Validar docs/architecture-decisions.md (loadDecisions) con warning si no existe; continuar con contenido parcial
- [x] 2.3 Descubrir canvases root→docs/ (findCanvases) con detección de placeholders [Responde aquí] y warning
- [x] 2.4 Generar .agents/prompts/pricing-guide.md y .agents/prompts/pricing-decisions-template.md (sobrescritura siempre)
- [x] 2.5 Generar e imprimir prompt IA en español neutro + summary con rutas generadas + exit(0) siempre

## Fase 3: Tests

- [x] 3.1 Escribir tests unitarios para loadDecisions: archivo existe vs. no existe. Mock global de fs (mismo patrón que assess.test.js)
- [x] 3.2 Escribir tests unitarios para findCanvases: 2 canvases × 3 ubicaciones (root/docs/null) + detección de [Responde aquí]
- [x] 3.3 Escribir tests unitarios para generatePricingGuide: decisions null vs. string, canvases null vs. string
- [x] 3.4 Escribir tests unitarios para generateDecisionsTemplate: fecha interpolada en formato ISO
- [x] 3.5 Escribir tests unitarios para generateIAPrompt: decisions ausente → invitar desde cero; decisions presente → incluir contexto; verificar español neutro
- [x] 3.6 Escribir tests de integración con vi.spyOn(process, 'exit'): flujo completo, warnings, escritura de archivos, exit(0) en todos los caminos

## Fase 4: Limpieza

- [x] 4.1 Eliminar @inquirer/prompts de package.json si queda como dependencia huérfana — **No aplica**: @inquirer/prompts aún se usa en engram.js
- [x] 4.2 Verificar que no haya console.error ni process.exit(1) en estimate.js — **Verificado**: estimate.js refactorizado sin console.error ni process.exit(1)
