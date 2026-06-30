# SDD Interactive — Verify

> Quality gate: ejecuta tests y valida contra specs, design, y tasks.

## Lo que devuelve el sub-agente

**Envelope** (Section D):

```markdown
**Status**: success | partial | blocked
**Summary**: Verificación completada. N/M escenarios compliant. Verdict: {PASS/FAIL}.
**Artifacts**:
  - Engram: `sdd/{change}/verify-report`
  - OpenSpec: `openspec/changes/{change}/verify-report.md`
**Next**: sdd-archive (si PASS/PASS WITH WARNINGS)
**Next**: sdd-apply (si FAIL — arreglar issues)
**Risks**: issues CRITICAL/WARNING/SUGGESTION
**Skill Resolution**: paths-injected
```

**Return específico** (Output Contract de la skill):

```markdown
## Verification Report

**Change**: {change-name}
**Mode**: Standard

### Completeness
| Metric | Value |
|--------|-------|
| Tasks total | 10 |
| Tasks complete | 10 |
| Tasks incomplete | 0 |

### Build & Tests
**Build**: ✅ Passed
**Tests**: ✅ 24 passed / 0 failed / 2 skipped
**Coverage**: 87% / threshold: 80% → ✅ Above

### Spec Compliance Matrix
| Requirement | Scenario | Result |
|-------------|----------|--------|
| OAUTH-01 | Happy: login with Google | ✅ COMPLIANT |
| OAUTH-02 | Error: invalid code | ✅ COMPLIANT |

**Compliance**: 8/10 scenarios compliant

### Issues
**CRITICAL**: None
**WARNING**: Refresh token rotation no testea expiración (pre-existing)
**SUGGESTION**: Agregar tests E2E para callback con token expirado

### Verdict
**PASS WITH WARNINGS**
```

## Lo que presenta el orchestrator

```markdown
✅ Verify complete — "login-con-google"

**🧪 Tests**: 24 passed / 0 failed / 2 skipped
**📊 Coverage**: 87% (threshold 80%) ✅
**✅ Build**: Passed

**📋 Compliance**: 8/10 escenarios compliant

**⚠️ Warnings**:
- Refresh token rotation no testea expiración (pre-existing)

**💡 Suggestions**:
- Agregar tests E2E para callback con token expirado

**🎯 Verdict**: PASS WITH WARNINGS

**¿Querés ajustar algo o continuamos?**
```

## Casos especiales

- **CRITICAL issues** → los muestro con énfasis y sugiero NO archivar.
- **FAIL** → no pregunto "ajustar o continuar", explico que hay que
  arreglar issues y propongo re-aplicar.
- **WARNINGS** → pregunto normal, pero marco que hay warnings.
