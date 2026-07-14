# Funky-ai Interactive — Verify

> **Quality gate.** Corre build + tests, valida contra specs/design, y devuelve
> un veredicto con acción sugerida para el orquestador.

---

## Cuándo se usa

- **Tier 2**: **obligatorio** después de apply, antes de archive. Es un verify
  **ligero**: solo build + tests + clasificación de issues. No tiene template
  propio — el sub-agente recibe un prompt directo y devuelve el verify report.
  Corre rápido y protege los root specs de deltas rotos.

- **Tier 3**: obligatorio. Verify **completo**: build + tests + compliance matrix
  + design coherence + NFR tracing. funky-verify

- **Tier 1**: no hay verify.

## Lo que devuelve el sub-agente (`funky-verify`)

**Envelope** (Section D):

```markdown
**Status**: success | partial | blocked
**Summary**: Verificación completada. N/M escenarios compliant. Verdict: {PASS/FAIL}.
**Artifacts**: `docs/openspec/changes/{change}/verify-report.md`
**Next**: sdd-archive | sdd-apply | fix inline
**Risks**: issues CRITICAL/WARNING/SUGGESTION
```

**Return específico** (incluye campo `Acción` como guía para el orquestador):

```markdown
## Verification Report

**Change**: {change-name}
**Verdict**: PASS | PASS WITH FUNCTIONAL WARNINGS | PASS WITH COSMETIC WARNINGS | FAIL

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

### Issues
#### CRITICAL
- {issue} — {evidence, si aplica}

#### FUNCTIONAL WARNING
- {issue} — {afecta comportamiento}

#### COSMETIC WARNING
- {issue} — {solo estilo, naming, comentarios}

#### SUGGESTION
- {issue} — {mejora no crítica}

### Verdict
{veredicto}

### Acción para el Orquestador
PASS                 → /funky-archive
CRITICAL | FUNC WARN → /funky-apply (issues como tareas) → re-verify
COSMETIC WARN        → fix inline si <5 líneas / 1 archivo · sino /funky-apply
SUGGESTION           → anotar en archive, sin acción
```

### Tier 3 extra — Compliance + Design

En Tier 3, el return incluye **además**:

```markdown
### Spec Compliance Matrix
| Requirement | Scenario | Result |
|-------------|----------|--------|
| OAUTH-01 | Happy: login with Google | ✅ COMPLIANT |
| OAUTH-02 | Error: invalid code | ✅ COMPLIANT |
| OAUTH-03 | Edge: popup closed early | ⚠️ UNTESTED |

### Design Coherence
| Decision | Status | Notes |
|----------|--------|-------|
| OAuthService separado | ✅ | Followed |
| Modelo OAuthAccount | ✅ | Followed |
```

**Artefacto persistido**: `docs/openspec/changes/{change}/verify-report.md`

## Lo que presenta el orquestador

```markdown
✅ Verify complete — "login-con-google"

🧪 **Tests**: 24 passed / 0 failed / 2 skipped
📊 **Coverage**: 87% (threshold 80%) ✅
✅ **Build**: Passed

🎯 **Verdict**: PASS WITH COSMETIC WARNINGS

🔧 **Cosmetic**: 2 warnings — los arreglo inline ahora (son <5 líneas)
```

```markdown
❌ Verify complete — "login-con-google"

🧪 **Tests**: 22 passed / 2 failed
⚠️ **Build**: Passed

🎯 **Verdict**: FAIL

🐛 **Functional warnings**:
- OAUTH-03 no cubierto — falta test para popup cerrado temprano

→ Hay que re-aplicar para cubrir los escenarios faltantes.
```

## Acción del orquestador según veredicto

| Veredicto | Acción del orquestador |
|-----------|----------------------|
| **PASS** | Archive directo |
| **CRITICAL** | NO archivar. Delega /funky-apply con los issues como tareas → re-verify |
| **FUNCTIONAL WARNING** | Delega /funky-apply con los issues como tareas → re-verify |
| **COSMETIC WARNING** | Fix inline si <5 líneas / 1 archivo. Si no, /funky-apply |
| **SUGGESTION** | Anota en archive, no requiere acción |
| **FAIL** | No pregunta. Explica que hay que re-aplicar |

## Comportamiento por modo

| Modo | Comportamiento |
|------|---------------|
| **Interactivo** | Muestra resultado. Según veredicto: pasa a archive, pregunta "¿arreglo inline?", o explica que hay que re-aplicar |
| **Auto** | PASS → archive directo. CRITICAL/FUNC WARN → aplica la acción sin preguntar. COSMETIC → fix inline si aplica. FAIL → frena |
| **Handoff** | Prepara bloque copy-paste idéntico al prompt nativo |

## NFR Tracing (Tier 3)

Si las tasks incluyeron tags NFR (ej. `nfr:latency`, `nfr:security`), verify
debe confirmar que los umbrales se cumplieron (ver `spec-routing-tiers.md` §3):

| Tag | Qué verifica |
|-----|-------------|
| `nfr:latency` | Endpoint responde dentro del umbral |
| `nfr:security` | No se introdujeron vulnerabilidades |
| `nfr:migration` | Migración down funciona |

## Tier 2 vs Tier 3

| Aspecto | Tier 2 (ligero) | Tier 3 (completo) |
|---------|----------------|-------------------|
| ¿Obligatorio? | Sí — siempre después de apply | Sí |
| Template | No — prompt directo | No — prompt directo |
| Compliance matrix | No | Sí |
| Design coherence | No aplica | Sí |
| NFR tracing | No | Sí, si aplica |
| Profundidad | Build + tests + issues | Build + tests + compliance + design + NFRs |
| Acción para orquestador | Igual | Igual |

## Diferencias con Gentle AI

| Gentle AI | Funky-ai |
|-----------|----------|
| Skill Resolution en envelope | No se usa |
| Veredictos: PASS / PASS WITH WARNINGS / FAIL | PASS / PASS WITH FUNC WARN / PASS WITH COSMETIC WARN / FAIL |
| No tiene campo Acción | Acción guía al orquestador (archive, re-apply, fix inline, anotar) |
| Un solo verify para todos | T2 ligero (obligatorio, sin template, solo build+test) + T3 completo |
| Cosmetic = Warning | Cosmetic → fix inline por orquestador sin re-delegar |
| "OpenSpec:" + "Engram:" en artifacts | Solo `docs/openspec/changes/{change}/verify-report.md` |
