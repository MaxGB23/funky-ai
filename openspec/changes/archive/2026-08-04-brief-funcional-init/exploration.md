# Exploración: brief funcional obligatorio en `funky init`

## Estado actual
- `funky-cli/src/commands/init.js` copia 3 templates estáticos (PROJECT-CANVAS.md, INFRA-CANVAS.md, canvas-planning-guide.md opcional) vía `executeIntentions`. Sin prompts, sin brief. Guard anti-sobrescritura: si existe PROJECT o INFRA canvas → exit(1).
- `PROJECT-CANVAS.md` arranca en "1. Framework Base" (stack) → anti-patrón §13 ("primero qué, luego cómo").
- `brief-questions-template.md` existe en `templates/estimate/` (R7, flag opcional `--brief [path]` de estimate; checklist de 6 temas: Producto, Usuarios, MVP, Complejidad, Integraciones, Timeline). NO cubre los 12 ítems de §13 (faltan: nombre del producto, objetivo, caso de uso principal, funcionalidades principales/secundarias, roles y permisos, seguridad, entregables por fase, KPI).
- §13 de recomendaciones-agente.md: secuencia obligatoria Brief funcional → Product Canvas → Project Canvas → Infra Canvas → Pricing → templates.

## Hallazgos clave
1. `funky-init-flow.md` (doc oficial) declara: "No existen modos interactivos ni prompts. El CLI genera los archivos y termina. El equipo discute en chat con IA, no en la terminal." → decisión de diseño documentada EN CONTRA de prompts interactivos.
2. `init.js` es el ÚNICO comando sin función pura `runXxx` (scaffold→runScaffold, feature→runFeature, skills→runSkills, assess→runAssess, estimate→runEstimate). Su lógica vive inline en el action → no testeable.
3. `init.test.js` NO testea initCommand: testea `runScaffold` (nombre de archivo engañoso). initCommand tiene CERO cobertura.
4. `estimate --brief <path>` (R7) ya acepta CUALQUIER archivo: `generateBriefSection` lee el archivo contra targetBase, con fallback al checklist. Consumir el brief generado por init no requiere cambio de código.
5. `findCanvases`/`countUnfilledSections` (context.js) cuentan `[Responde aquí]` solo en PROJECT/INFRA canvas → si el brief fuera sección del canvas, inflaría los warnings de assess/estimate.
6. Precedente multi-archivo: scaffold (37 copy + 7 mkdir), feature (mkdir + N copies por matriz de inyección), skills (manifest). Todos patrón función pura + executeIntentions.
7. Convenciones: templates en `src/templates/<comando>/`; kebab-case salvo canvases UPPER-SNAKE (PROJECT-CANVAS.md). `brief-funcional.md` encaja en kebab.
8. Contrato de salida documentado en `docs/funky-forge/init.md` (3 in, 3 out + stdout) y enriquecido en `--help` vía `enrichCommandHelp` (help.js) → actualizar docs en el mismo cambio.
9. `funky-init-flow.md` referencia `src/utils/canvas.js` (generateCanvasMarkdown) que NO existe → doc parcialmente stale (lo arreglará sdd-docs-sync).
10. Patrón de test de comandos: `vi.mock('fs')` + sharedFsMock + `applyMocks(mockFiles)` (map path→contenido en existsSync/readFileSync); integración en tmp dir bajo cwd.

## Opciones comparadas
| Opción | Pros | Contras | Esfuerzo |
|---|---|---|---|
| a. Nuevo template brief-funcional.md copiado por init | Respeta modelo estático documentado; sigue secuencia §13; trivial de testear con executeIntentions; cero interactividad | 4º archivo de salida (cambio de contrato docs); puede driftear de los canvases | Bajo |
| b. Sección al inicio de PROJECT-CANVAS.md | Un solo archivo; sin cambio de árbol de salida | Mezcla "qué" y "cómo" (anti-patrón §13); infla countUnfilledSections → warnings de assess/estimate; cambia forma del template referenciada en tests/docs; estimate no la consume como archivo brief | Bajo |
| c. Comando interactivo @clack/prompts | Guía paso a paso; precedente en feature.js (p.select/p.confirm) y skills.js (p.multiselect); clack 1.7.0 ya es dependencia | CONTRADICE funky-init-flow.md (decisión documentada); rompe uso no-interactivo/CI; testing complejo (skills.interactive.test.js muestra harness vi.mock('@clack/prompts') borrado); prompts = transient, docs = persistente | Medio-Alto |
| d. Reusar/extraer brief-questions-template.md a lugar compartido | DRY; evita drift de dos formatos | `readOptionalTemplate` resuelve contra `templates/estimate`; moverlo rompe R7 y tests de estimate (mapean el path en TPL_DIR); checklist es subconjunto de §13 → habría que expandirlo igual; no existe dir de templates compartidos | Medio |

## Recomendación
**Opción (a) + refinamiento de (d)**: crear `src/templates/init/brief-funcional.md` con los 12 ítems de §13 y que `init` lo copie como PRIMER output a `docs/funky-ai/canvas/brief-funcional.md`. Dejar `brief-questions-template.md` intacto en estimate (es subconjunto orientado a pricing; alinear redacción es cambio aparte). Refactorizar init a función pura `runInit({ templatesDir, targetBase })` siguiendo runScaffold, con el guard de existencia en el action. estimate lo consume sin cambios vía `--brief docs/funky-ai/canvas/brief-funcional.md` (R7 ya soporta paths).
- Por qué no (c): contradice la decisión documentada "no interactive prompts".
- Por qué no (b): contamina el conteo de secciones sin completar de assess/estimate y mezcla producto con stack.
- Placeholder del brief debe ser distinto de `[Responde aquí]` (p.ej. `[Completar]`) por claridad.

## Preguntas abiertas
- ¿estimate debe auto-detectar docs/funky-ai/canvas/brief-funcional.md cuando `--brief` va sin valor? (Enhancement aparte; R7 hoy: sin valor → checklist.)
- ¿Nombre del archivo: brief-funcional.md vs brief.md vs product-brief.md? (kebab español del repo → brief-funcional.md).
- ¿init debe advertir si el brief queda con placeholders? (Solo warning suave; init es scaffolding, no validación.)

## Riesgos
- Drift entre el brief nuevo y el checklist de estimate (dos fuentes de brief) → mitigar: brief como superset; alinear luego.
- Contrato docs: init.md + funky-init-flow.md + --help deben actualizarse en el mismo cambio (docs = CLI real).
- init.test.js con nombre engañoso (testea scaffold) puede confundir; renombrar es opcional.
- Cambio de árbol de salida de init es aditivo, no rompe consumidores existentes (findCanvases solo lee los 2 canvas).
