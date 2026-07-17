# Archive: cli-feature-inquirers

## Resumen

Feature completa: `funky feature <name>` ahora ejecuta 3 inquirers interactivos yinyecta templates condicionalmente por tier.

## Artefactos SDD

| Fase | Estado | Engram Topic Key |
|------|--------|-----------------|
| Explore | ✅ | `sdd/cli-feature-inquirers/explore` |
| Proposal | ✅ | `sdd/cli-feature-inquirers/proposal` |
| Spec | ✅ | `sdd/cli-feature-inquirers/spec` |
| Design | ✅ | `sdd/cli-feature-inquirers/design` |
| Tasks | ✅ | `sdd/cli-feature-inquirers/tasks` |
| Apply | ✅ | `sdd/cli-feature-inquirers/apply-progress` |
| Verify | ✅ PASS | `sdd/cli-feature-inquirers/verify-report` |
| Archive | ✅ | `sdd/cli-feature-inquirers/archive-report` |

## Archivos Modificados/Creados

| Archivo | Acción |
|---------|--------|
| `funky-cli/src/commands/feature.js` | Modificado — inquirers + matrix de inyección |
| `funky-cli/src/templates/sdd/docs.md` | Creado — checklist de documentación |
| `funky-cli/src/templates/sdd/release.md` | Creado — checklist de release (no release notes) |
| `funky-cli/tests/feature.test.js` | Reescrito — 22 casos, 70/70 tests |
| `funky-cli/README.md` | Actualizado |

## Decisiones Clave

1. **T1**: No pregunta release (siempre omitido). Solo tasks.md + report.md + [docs.md]
2. **T2**: Pregunta los 3. tasks.md + report.md + explore/proposal/spec + [docs.md] + [release.md]
3. **T3**: Release siempre inyectado. Solo pregunta docs. tasks.md + [docs.md] + release.md
4. **Inquirer 3**: Confirm Sí/No (no select con tipos SemVer)
5. **Golden templates**: `.agents/templates/sdd/` tiene prioridad sobre `src/templates/sdd/`
6. **Legacy eliminado**: apply.md, verify.md, planning-handoff.md ya no se inyectan

## Lecciones Aprendidas

- El diagrama aprobado es la fuente de verdad — no asumir archivos extra
- T1 y T3 tienen reglas especiales que los inquirers genéricos no cubren
- El patrón golden/fallback funciona y debe preservarse

## Siguiente Steps

- Integración con el flujo del orquestador CLI
- Considerar testing de integración con @clack/prompts mock para el flujo p.group()
