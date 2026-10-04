# Feature: skills-rename-docs-sync-release

## Objective

Renombrar las skills `sdd-docs-sync` y `sdd-release` a `docs-sync` y `release`, sin sufijo, en
las dos poblaciones del repo, y actualizar todas las referencias para que ninguna|Apunte a un
nombre que ya no existe.

## Problem

El prefijo `sdd-` en estas dos skills es herencia del framework retirado. No son SDD: una
sincroniza docs contra el CLI real y la otra hace version bump + tag + publish. El nombre ya no
describe el producto y empuja a un agente a buscar un framework que no existe.

Peor que el nombre: las skills se citan entre sí por su nombre viejo. `docs-sync` L12 dice
"antes de `sdd-release`" y `release` L16 dice "After `sdd-archive` completes". Un rename que no
alce esas citas deja skills apuntando a skills inexistentes.

## Scope

### In Scope

1. `git mv` de las 4 carpetas (2 distributables, 2 adapted).
2. `manifest.js`: comentario de cabecera, `src` y `dest`.
3. Frontmatter `name:` y títulos `# SDD ...`.
4. Citas cruzadas a las 2 skills → nombre nuevo.
5. Eliminar las 8 menciones de `gentle-ai`.
6. Trigger de `sdd-archive` → "tras mergear una branch" (coincide con `AGENTS.md:31`).
7. Tests, `opencode.json`, docs, `AGENTS.md`, `ORCHESTRATOR-STATE.md`.

### Out of Scope

- **Rutas `.agents/templates/sdd/`** (9 líneas en los 4 `SKILL.md`). Son dependencia viva en
  runtime, no texto: `release-notes.md` se inyecta desde ahí y `docs-live-index.md` es el SSOT
  que las skills consumen. Mover `templates/sdd/` es work unit aparte con radio propio.
- **`.agents/rules/sdd-orchestrator.md`** — regla del framework retirado; este rename la deja
  limpia sola, no se toca aquí.
- Backups (`docs/funky-ai/prompts/globals/`), release notes históricas, `odd/`,
  `openspec/changes/archive/`, `docs/engram/`, `docs/funky-forge/`.
- Merge de las dos poblaciones.

## Design decision

**Mismo nombre para ambas poblaciones, sin sufijo.** La distributable general y la adapted a
este repo se llaman igual. La adapted es una evolución de la general (5526 vs 5496 bytes, más
reglas), no una variante: la diferencia es de madurez, no de propósito.

**Consecuencia aceptada:** la distributable instala a `.agents/skills/docs-sync/SKILL.md`, la
misma ruta que ocupa la adapted. `funky skills` lo detecta como conflicto por bytes y falla con
exit 1 (no es pérdida silenciosa). `funky skills --all` no quedará limpio en este repo hasta que
se decida qué versión manda. Decisión del usuario.

**Trigger coherente con `AGENTS.md`.** Las skills dicen "tras `sdd-archive`"; `AGENTS.md:31`
dice "Tras mergear una branch". Se alinean en lo segundo, porque lo primero describe un flujo
que ya no existe.

## Constraints

- Strict TDD activo. La prueba del rename son los 46 asserts existentes: se actualizan en la
  misma work unit y `pnpm test` debe quedar verde.
- Gate `tests/organization.test.js` aplica a los tests de `funky-cli/`.
- Skill `vitest` obligatoria antes de editar tests de `funky-cli/`.
- Los backups y el histórico no se tocan aunque grepeen.

## Tasks

- [ ] T1 — `git mv` de las 4 carpetas
- [ ] T2 — `manifest.js`: `src` y `dest` de ambas distributables
- [ ] T3 — frontmatter `name:` y títulos en los 4 `SKILL.md`
- [ ] T4 — citas cruzadas + `gentle-ai` + trigger `sdd-archive`
- [ ] T5 — tests (5 archivos, 46 asserts)
- [ ] T6 — `opencode.json`: clave del agente custom + `prompt:{file:}`
- [ ] T7 — docs: SSOT, README, repo-map, template-flows, docs-index, `AGENTS.md`, `ORCHESTRATOR-STATE.md`

## Acceptance criteria

- [ ] No queda ninguna mención a `sdd-docs-sync` ni `sdd-release` fuera de backups e histórico.
- [ ] Las skills se citan entre sí por su nombre nuevo.
- [ ] Ninguna mención de `gentle-ai` en las 4 skills.
- [ ] `funky skills -s docs-sync` y `-s release` resuelven e instalan en el path nuevo.
- [ ] `pnpm test` verde (base: 443).

## Route declaration

Delegado: un writer. 7 work units, ~20 archivos, 46 asserts — dispara el writer trigger
(2+ archivos no triviales). Inline excedería el budget de evidencia.

## Verification evidence

Runner `pnpm test` desde `funky-cli/` (Vitest 4.1.10). El writer midió la base ANTES de tocar
nada, así que el RED es atribuible al rename sin ambigüedad.

| Momento | Resultado observado |
|---|---|
| Base (pre-edición) | 36 files / **443 passed (443)** |
| RED: tras T1+T2, antes de T5 | 5 files failed · **6 failed / 404 passed (410)** |
| GREEN: tras T5 | 36 files / **443 passed (443)** |
| Spot check del padre (post `skills.js`) | 36 files / **443 passed (443)**, 1.91s |

El RED de 6 fallos es el rename sin asserts actualizados: es la prueba de que los 46 asserts
tapaban el nombre viejo y ahora cubren el nuevo.

Catálogo de skills distributables tras el rename: `docs-sync`, `layout-debug`,
`layout-debug-canon`, `release` — ninguna con prefijo `sdd-`.

Grep residual de `sdd-docs-sync|sdd-release`: solo queda en backups e histórico
(`docs/engram/**`, `docs/funky-ai/prompts/globals/**`, `docs/funky-ai/releases/**`,
`docs/funky-forge/**`, `odd/tasks/**`, `openspec/changes/archive/**`).

`.agents/templates/sdd/**` verificado intacto: 8 referencias preservadas, y las entradas
`templates/bootstrap/sdd/` de ambos manifests quedan sin tocar.

### Desviación del plan: superficie incompleta del padre

El plan listó `funky-cli/src/commands/skills.js` en el análisis pero **no** en las allowed edit
surfaces. El writer lo detectó y paró: el `--help` vivo de `funky skills` seguía mostrando
`sdd-release` en dos ejemplos, sin ningún test que lo cubra — por eso la suite quedaba verde con
él obsoleto. El padre lo corrigió después. La omisión era del padre, no del writer.

## Next step

Work units T1-T7 completados, más una WU8 de docs en prosa que el replace mecánico no alcanzaba.

**WU8 — prosa legacy sobre el prefijo.** `docs/funky-ai/skills.md` tenía una sección
*"Sobre el prefijo `sdd-`"* que afirmaba que *"el nombre se conserva"* y que *"está previsto
deprecarlo"* — exactamente lo contrario de lo que este rename hizo. Se borró la sección entera:
el catálogo ya no tiene ninguna skill con prefijo `sdd-`, así que no hay nada que explicar.
En `funky-cli/README.md` se quitó el paréntesis *"el prefijo `sdd-` es legacy"*.

Borrar la sección dejó **dos referencias colgantes** en el árbol de manifests del mismo
`skills.md` (L138, L142): los comentarios de `release/` y `docs-sync/` decían
*"(prefijo legacy, ver arriba)"* y "arriba" ya no existía. Detectado por grep de verificación,
no por lectura. Ambas limpiadas.

Commits pendientes de autorización explícita del usuario.

Commits pendientes de autorización explícita del usuario.
