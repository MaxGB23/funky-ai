# Resumen: Fase 1 — Templates

> Estado: **Completada**
> Inicio: 2026-07-28
> Compleción: 2026-07-28

---

## Objetivo

Que los canvases capturen decisiones reales, no solo nombres de stack.

## Qué se hizo

1. **Archivos huérfanos** — 4 archivos en `bootstrap/` que se empaquetaban pero nunca se copiaban fueron agregados a `filesToCopy` en `init.js`:
   - `engram-discoveries.md` → `docs/engram/discoveries.md`
   - `engram-bugfixes.md` → `docs/engram/bugfix/bugfixes.md`
   - `architecture-assessment-guide.md` → `docs/architecture-assessment-guide.md`
   - `agents-rules-secops-setup.md` → `.agents/rules/secops-setup.md`

2. **Fix sync-templates.js** — se eliminó la referencia a `worker-handoff.md` que no existía. Array pasa de 5 a 4 elementos.

3. **Mejores preguntas en canvas.js** — se reemplazaron los placeholders genéricos ("No definido / Pendiente") por preguntas guía con ejemplos concretos en cada sección, tanto en PROJECT-CANVAS como INFRA-CANVAS. Cada placeholder incluye:
   - Pregunta guía: "¿Qué framework elegiste y por qué?"
   - Ejemplo concreto: "Next.js (App Router) — Necesitamos SSR para SEO + performance"
   - `[Responde aquí]` como marcador de edición
   - Marcador `> 💡 *Si aplica*` en secciones avanzadas (Estrategia UI, Deployment)

4. **Contenido pedagógico en canvas-planning-guide.md** — se agregaron 9 notas del arquitecto (una por categoría), marcador condicional en la sección Runner, y una sección completa de "🔍 Análisis de Compatibilidad (para el agente IA)" con 4 pasos accionables para detectar incompatibilidades de stack.

5. **Deprecación del modo setup inicial** — se eliminó completamente:
   - Import de `@clack/prompts`
   - Función `getProtocolOptions()`
   - ~145 líneas de prompts interactivos (console.clear, p.intro, p.select, p.confirm, p.multiselect, p.group, etc.)
   - Reemplazado por mensaje de error: `❌ No se encontraron PROJECT-CANVAS.md ni INFRA-CANVAS.md. Ejecuta \`funky init --template\` para generarlos.`
   - README.md actualizado sin mención al wizard

## Archivos modificados/creados

| Archivo | Cambio |
|---------|--------|
| `funky-cli/src/commands/init.js` | +4 orphaned files; -1 import @clack/prompts; -getProtocolOptions(); -bloque interactivo (~145 líneas) |
| `funky-cli/src/utils/canvas.js` | ~38 → ~85 líneas: placeholders por sección con preguntas guía, ejemplos, marcadores condicionales |
| `funky-cli/src/templates/bootstrap/canvas-planning-guide.md` | ~73 → ~117 líneas: +9 Architect Notes, +marcador condicional Runner, +sección LLM compatibility |
| `funky-cli/scripts/sync-templates.js` | -1 línea: worker-handoff.md eliminado de filesToSync |
| `funky-cli/tests/canvas.test.js` | Tests actualizados de 4→8: placeholders específicos, marcadores condicionales, infra-canvas |
| `funky-cli/tests/init.test.js` | +test para 4 orphaned files, conteo 9→13 |
| `funky-cli/README.md` | Línea 25 actualizada sin mención a wizard |
| `funky-cli/src/templates/bootstrap/agents-rules-engram-protocol.md` | Sync con .agents/ source (session/release categories) |
| `funky-cli/src/templates/bootstrap/agents-rules-sdd-orchestrator.md` | Sync con .agents/ source (simplificación de tiers) |
| `init-observaciones/roadmap/README.md` | Item 7 agregado (deprecación + criterio de completado) |

## Descubrimientos

- `sync-templates.js` sincroniza archivos de `.agents/` hacia `bootstrap/`. Al correrlo como parte de la Fase 1, también actualizó templates no relacionados (engram-protocol, sdd-orchestrator) — efecto colateral, no un bug.
- Los placeholders de canvas.js NO deben contener la cadena "No definido / Pendiente" porque el spec scenario validaba su ausencia.
- Los orphaned files no siguen un patrón uniforme de destino: algunos se copian planos al target, otros preservan subpath (`.agents/rules/`, `docs/engram/`).
- La variable `environment` quedó como código muerto en init.js tras eliminar el modo interactivo. Inofensiva pero eliminable en limpieza futura.

## Problemas encontrados y resueltos

- **Canvas spec scenarios originales esperaban "No definido" — se reemplazaron por placeholders semánticos.** Los tests se actualizaron para validar `not.toContain('No definido / Pendiente')` y buscar preguntas guía reales.
- **Tarea 5 (deprecación) era la de mayor riesgo** porque eliminaba ~160 líneas del flujo principal. Se ejecutó al final y se verificó con 78 tests existentes + inspección manual.
- **El bloque interactivo eliminado contenía lógica de protocolos.** `selectedProtocols` se inicializa como `[]` y nunca se usa. Es correcto pero quedó código muerto.

## Lo que quedó pendiente

- Eliminar variable `environment` (código muerto en init.js)
- Simplificar / eliminar bloque de copia de protocolos en `runInit()` (nunca se ejecuta en el flujo headless)
- Warning preexistente en sync-templates.js sobre `docs/funky-ai/cli/canvas-planning-guide.md` no encontrado en la raíz del workspace (no relacionado con esta fase)

## Stats finales

| Métrica | Valor |
|---------|-------|
| Commits | 1 (`2303038`) |
| Archivos cambiados | 16 |
| Líneas agregadas | +2832 |
| Líneas eliminadas | -272 |
| Tests | 78 pasan (14 archivos) |
| Spec compliance | 20/20 escenarios |
| SDD phases | explore → propose → spec → design → tasks → apply → verify → archive |
