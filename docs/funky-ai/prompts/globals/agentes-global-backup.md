# AGENTS.md — funky-ai
Convenciones de proyecto, separadas por audiencia: reglas compartidas primero; política exclusiva del orquestador al final.

## Convenciones para todos los agentes

### Idioma (conversación)
Cuando respondas en español, usa siempre español neutro. Evita el voseo y los regionalismos.

### Commits
- Conventional commits siempre en inglés.
- Un commit = una work unit (una behavior, fix, o docs unit). Nunca commitear por tipo de archivo.

### Directorio temporal (`.tmp/`)
- Sub-agentes NO escriben en rutas externas al workspace (en Windows cada acceso pide confirmación de permisos). Scratch/sandbox/fixtures/reproducciones → `M:\funky-ai\.tmp\` (gitignored).
- Excepciones: Review (bytes vía árboles Git del provider), Worktrees (`M:\worktrees\funky-ai\`, acceso permitido vía `external_directory` en la config global), artefactos nativos (verify-report, receipts).

### Búsqueda en `.agents/`
`.agents/` está trackeada en Git pero muchos buscadores la tratan como directorio oculto (punto inicial) y la omiten — glob puede devolver "no existe" para archivos reales. Antes de afirmar que un archivo de `.agents/` no existe, verifica con Grep (ruta explícita), `git ls-files` o `rg --hidden`.

### Strict TDD (resolución canónica)
Strict TDD es el default y prevalece sobre cualquier flag de engram/syncs.
Resolución: 1) `openspec/config.yaml` → `testing.strict_tdd`; 2) si no, engram (`sdd-init/{project}`); 3) si no hay flag pero existe runner (Vitest / `pnpm test`), `strict_tdd: true` (fallback del skill `sdd-init`).

### Tests en `funky-cli/`
Al tocar tests de funky-cli, carga la skill `vitest` antes de editar (naming, imports, límites). `tests/organization.test.js` las aplica. Revisar la sección "Repo conventions (funky-ai)" en `.agents/skills/vitest/SKILL.md`

---

## Solo orquestador — los subagentes pueden ignorar esta sección

### Strict TDD (forwarding)
Si la resolución anterior da `true`, `sdd-apply` y `sdd-verify` DEBEN recibir `STRICT TDD MODE IS ACTIVE` con runner `pnpm test`.

### Flujo post-SDD y post-merge (docs y release)
Tras `sdd-archive`, o tras mergear una branch de trabajo directo, sugerir en orden, solo si aplica (el usuario decide):
1. `sdd-docs-sync` — si tocó comandos, flags, templates o estructura (docs = CLI real). Delegar al agente custom `sdd-docs-sync` (definido en el `opencode.json` del proyecto); él commitea sus work units, el push queda para el orquestador.
2. `sdd-release` — feature → MINOR, breaking → MAJOR, fix significativo → PATCH. Inline en el orquestador: es write-gated (gates de git/gh); commit + push + tags propio. NUNCA un push final único que absorba los commits de docs sync.
Skills: `.agents/skills/sdd-docs-sync-gentle-ai/` (ese archivo es también el prompt del agente custom vía `{file}`) y `.agents/skills/sdd-release-gentle-ai/`.

### Flujo directo (branches)
Solo trabajo no-SDD (SDD define su branch en `sdd-apply`). Si no es micro-fix trivial (≤1 archivo, reversible), preguntar si se crea branch ANTES de empezar a editar; el PR es opcional (decisión del usuario). Tras el merge, sugerir borrar la branch en el mismo turno (`gh pr merge --delete-branch` con PR, `git branch -d` sin PR).
PR en directo: issue-first (skills `issue-creation` + `branch-pr`); hotfix urgente documenta el issue tras el merge.
Si el trabajo directo cambia un contrato (flags, comportamiento, estructura): decidir conscientemente si se captura después con un change SDD o se acepta la divergencia de la root spec. Micro-fix → no pensar en specs.

### Delegación eficiente (directo y SDD)
- Unidades pequeñas: un escritor por delegación; 2+ unidades no triviales → delegaciones separadas, no un batch gigante.
- Handoff rico = referencias (rutas, líneas, decisiones), no contenido; el subagente arranca sin memoria y lee lo pesado desde engram/`.tmp`; el orquestador pasa solo el puntero y no se infla.
- Alcance por lote (caso canónico: `sdd-docs-sync`, corre tras merge/push a main): delega después de commitear y pasa el rango (`origin/main..HEAD`) en el handoff. El método de scoping/atribución vive en cada skill (ver "Entrada por lote" en sdd-docs-sync).
- Tests acotados durante la iteración (`pnpm test <archivo>`); suite completa solo al cierre.
- Budget/attempts los gobierna SDD (runtime ledger); en directo no hay ledger: aplicar esta misma disciplina sin crear artefactos SDD.



# EXTRAS
## Gates de calidad (lint / typecheck / build)
- Verificación: pnpm lint y pnpm build son evidencia obligatoria. Se corren en
  sdd-verify (SDD) o antes del commit final (trabajo directo). Un change no avanza
  si fallan.
- Iteración: durante apply/desarrollo usar comandos acotados (pnpm lint <archivo>,
  build solo al cierre); suite completa solo en verify.
- Release: el release puede compilar artefactos para publicar, pero NUNCA es su
  trabajo descubrir errores de calidad — si falla ahí, volver al ciclo.
## Trabajo directo (equivalencia con SDD)
Sin SDD no hay verify-report: la disciplina se aplica igual sin crear artefactos.
Antes de commit/push: lint + build + tests completos pasan; evidencia citada en el
mensaje de commit o PR (ej. "lint/build/tests OK").
Notas sobre por qué así:
- Separan "verificación" de "entrega" — la regla clave que discutimos antes. Evita que alguien meta gates de calidad en release "porque ahí hay CI".
- Distinguen iteración de cierre — mismo principio que ya tienes en "Delegación eficiente" (pnpm test <archivo> vs suite completa); lo extiendo a lint/build para que sea consistente.
- Cubren ambos flujos explícitamente — tu AGENTS.md ya divide SDD vs directo; los bloques respetan esa estructura en vez de crear una tercera categoría.
- "Evidencia citada" en directo — sustituye al verify-report: como no hay artefacto persistido, la evidencia vive en el commit/PR.