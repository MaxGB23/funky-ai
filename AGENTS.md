# AGENTS.md — funky-ai
Convenciones de proyecto, separadas por audiencia: reglas compartidas primero; política exclusiva del orquestador al final.

## Convenciones para todos los agentes

### Idioma (conversación)
Cuando respondas en español, usa siempre español neutro. Evita el voseo y los regionalismos.

### Commits
- Conventional commits siempre en inglés.
- Un commit = una work unit (behavior, fix o docs). Nunca separar por tipo de archivo. Consultar la skill `work-unit-commits` para planificar los commits.
- NUNCA commitear, pushear ni abrir PR sin autorización explícita del usuario en el turno actual. Autorizar el cambio no autoriza el commit: el commit requiere su propia aprobación explícita.

### Backlog
- Cuando se quiera añadir un pendiente al backlog, revisar primero `ORCHESTRATOR-STATE.md` (sección "Tareas Pendientes" / "Bugs Activos"): no duplicar entradas existentes y respetar su numeración y formato.

### Búsqueda en `.agents/`
`.agents/` está trackeada en Git pero muchos buscadores la tratan como directorio oculto (punto inicial) y la omiten — glob puede devolver "no existe" para archivos reales. Antes de afirmar que un archivo de `.agents/` no existe, verifica con Grep (ruta explícita), `git ls-files` o `rg --hidden`.

### Strict TDD
Strict TDD es el default y prevalece sobre cualquier flag de engram/syncs. No se resuelve por flag: se aplica siempre.

### Tests en `funky-cli/`
Al tocar tests de funky-cli, carga la skill `vitest` antes de editar (naming, imports, límites). `tests/organization.test.js` las aplica. Revisar la sección "Repo conventions (funky-ai)" en `.agents/skills/vitest/SKILL.md`

---

## Solo orquestador — los subagentes pueden ignorar esta sección

### Flujo post-merge (docs y release)
Tras mergear una branch, sugerir en orden, solo si aplica (el usuario decide):
1. `docs-sync` — si tocó comandos, flags, templates o estructura (docs = CLI real). Delegar al agente custom `docs-sync` (definido en el `opencode.json` del proyecto); él commitea sus work units, el push queda para el orquestador.
2. `release` — feature → MINOR, breaking → MAJOR, fix significativo → PATCH. Inline en el orquestador: es write-gated (gates de git/gh); commit + push + tags propio. NUNCA un push final único que absorba los commits de docs sync.
Skills: `.agents/skills/docs-sync/` (ese archivo es también el prompt del agente custom vía `{file}`) y `.agents/skills/release/`.

### Trabajo con branch (PR opcional)
El PR es opcional (decisión del usuario). Tras el merge, sugerir borrar la branch en el mismo turno (`gh pr merge --delete-branch` con PR, `git branch -d` sin PR).
PR directo: issue-first (skills `issue-creation` + `branch-pr`); hotfix urgente documenta el issue tras el merge.

### Delegación eficiente
- Alcance por lote (caso canónico: `docs-sync`, corre tras merge/push a main): delega después de commitear y pasa el rango (`origin/main..HEAD`) en el handoff. El método de scoping/atribución vive en cada skill (ver "Entrada por lote" en docs-sync).
- Tests acotados durante la iteración (`pnpm test <archivo>`); suite completa solo al cierre.
