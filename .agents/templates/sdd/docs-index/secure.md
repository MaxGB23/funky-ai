# Índice de Secciones: `docs/funky-ai/secure.md`

- **1. ¿Qué problema resuelve?:** Hardening de dependencias pnpm por-repo (lifecycle scripts, cuarentena, secretos); capa "Proyecto blindado" del estándar.
- **2. ¿Cuándo usarlo?:** Repo pnpm nuevo (`init`), diagnóstico (`doctor`) o gate de CI/merge (`check`).
- **3. Comandos:** `doctor`, `init` y `check` (cada subcomando de negocio con su sección).
  - **`doctor`:** Diagnóstico de solo lectura (exit 0), sondas conductuales, cuarentena activa/inactiva y señales del repo.
  - **`init`:** Seed idempotente de pnpm-workspace.yaml (7 claves), AGENTS.md, baseline de hooks, .gitignore y pin de packageManager; postura obligatoria.
  - **`check`:** Valida conformidad CI-ready: exit 0 conforme, exit 1 violaciones/fail-closed, WARN exit 0 en repos npm/yarn.
- **4. Violaciones que detecta `check`:** Tabla de códigos `missing-lockfile`, `package-lock`, `floating-ranges`, `config-mismatch`, `quarantine-inactive`, `pending-approval`, `env-tracked`, `env-unignored`, `hook-drift`, `pnpm-probe`/`git-probe`.
- **5. Posturas de hardening:** `fail-silent` vs `fail-fast` (semilla y comportamiento, incluido el hueco de raíz de fail-fast).
- **6. Estado local (`.funky/`):** `.funky/secure-state.json` gitignored con baseline de hooks + postura; rebaseline explícito (`--rebaseline`).
- **7. Referencias:** RFC `feature-secure.md` con las decisiones del estándar.
