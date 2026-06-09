# Tasks: 023-deprecate-worker-handoff

### Suggested Work Units
| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Templates Purge | PR 1 | Eliminación de archivos estáticos sin lógica. |
| 2 | CLI Refactor & Tests | PR 2 | Lógica core del CLI y actualización de tests. |
| 3 | Orchestrator Rules | PR 3 | Refactor de reglas del Orquestador (G1, G2, G3). |

## Phase 0: Branch Setup
**🚫 Restricciones:** No modificar ningún archivo de código. Esta fase es SOLO setup de git.
- [x] Verificar que git está disponible: `git --version` (si falla → documentar en Return Envelope y PARAR)
- [x] Verificar que el branch NO existe: `git branch --list feat/vX.Y-{name}`
- [x] 0.1 Ejecutar `git checkout -b feature/023-deprecate-worker-handoff`
- [x] Confirmar branch activo: `git status`
- [x] Documentar en Return Envelope: branch confirmado ✅

## Phase 1: Foundation / Templates Purge
- [x] 1.1 Delete `.agents/templates/bootstrap/plantilla-worker-handoff.md`
- [x] 1.2 Delete `funky-cli/src/templates/sdd/worker-handoff.md`
- [x] 1.3 Delete `funky-cli/src/templates/bootstrap/plantilla-worker-handoff.md`

## Phase 2: Core Implementation (CLI & Orchestrator)
- [x] 2.1 Modify `funky-cli/src/commands/init.js`: Remove code that copies `plantilla-worker-handoff.md` or `worker-handoff.md` to `.agents` or `docs`.
- [x] 2.2 Modify `funky-cli/src/commands/feature.js`: Remove code that copies `worker-handoff.md` into the new feature's directory (`docs/openspec/changes/...`).
- [x] 2.3 Modify `.agents/rules/sdd-orchestrator.md`: Purge Gates G1, G2, and G3 that require physical existence/validation of `worker-handoff.md`. Update to use direct Message Passing logic.
- [x] 2.4 Modify `funky-cli/src/templates/bootstrap/agents-rules-sdd-orchestrator.md`: Mirror the G1/G2/G3 rules purge applied in 2.3.

## Phase 3: Testing & Verification
- [x] 3.1 Modify `funky-cli/tests/init.test.js`: Update assertions to ensure NO `worker-handoff.md` or `plantilla-worker-handoff.md` are expected or checked.
- [x] 3.2 Modify `funky-cli/tests/init.integration.test.js`: Update assertions to ensure files are not generated during integration tests.
- [x] 3.3 Run `pnpm test` in `funky-cli` to verify all tests pass.
- [x] 3.4 Smoke Test: Run `node bin/funky.js feature test-purge` to verify `worker-handoff.md` is NOT generated in the new feature directory.
- [x] 3.5 Run CLI Smoke Test: `node bin/funky.js init test-init-purge` to verify `.agents/templates/sdd/worker-handoff.md` is NOT generated.