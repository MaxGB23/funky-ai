# Proposal: Engram Index-Free Navigation (RFC-025)

> **Budget:** Propuesta mínima O(1) basada en la exploración, afectando solo 4 archivos de reglas.

## 1. Contexto
El Memory Polling Stage 1 quema demasiados tokens leyendo todo el `index.md` del engrama. La exploración aprobó cambiar esto por un `list_dir docs/engram/` para que el descubrimiento de tags se haga mediante los slugs/nombres de archivo, reduciendo el costo de O(N) a O(1) en tokens. El `index.md` permanecerá vivo solo para lectura humana.

## 2. Capabilities (CONTRATO CON SPECS)

**Modified Capabilities:**
- **Two-Stage Memory Polling:** El Orquestador y las reglas de escritura usarán `list_dir docs/engram/` como Stage 1. -> Mapea directo a update de rules.

## 3. Decisiones Técnicas

| Área | Decisión | Justificación Corta |
|------|----------|---------------------|
| Agentes / CLI | **Opción A:** Reemplazo de directiva `view_file` por `list_dir` | Implementación más ligera sin romper la usabilidad de humanos que consultan el índice. |

## 4. Stack / Scope
**Stack Tecnológico:**
- Agent Rules (`.agents/rules/`)
- CLI Templates (`funky-cli/src/templates/bootstrap/`)

**Fuera de Scope (Non-Goals):**
- No se modificará la estructura de carpetas de `docs/engram/`.
- No se borrará `index.md`.
- No se implementarán prefijos semánticos en los archivos de engrama (esto queda para el futuro).

## 5. Riesgos y Rollback
**Riesgos:**
| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| El agente no infiere contexto del slug | Baja | El nombre del archivo es explícito. Si falla, el Stage 2 con grep cubre las deficiencias. |

**Rollback Plan (OBLIGATORIO):**
- Revertir las modificaciones en los 4 archivos de reglas detectados por el Explore.

## 6. Success Criteria
- [ ] `.agents/rules/sdd-orchestrator.md` requiere `list_dir` como Stage 1.
- [ ] `.agents/rules/engram-protocol.md` tiene actualizada la directiva.
- [ ] `funky-cli/src/templates/bootstrap/agents-rules-sdd-orchestrator.md` está sincronizado.
- [ ] `funky-cli/src/templates/bootstrap/agents-rules-engram-protocol.md` está sincronizado.
