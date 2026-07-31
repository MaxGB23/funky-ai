# Pendientes para sesión futura

> Generado: 2026-07-28
> Origen: Sesión de documentación post-roadmap
> Todo el contenido de este archivo usa español neutro.

---

## 1. Diagrama de responsabilidad de comandos (PASO 1)

**Objetivo:** Tener un mapa completo de qué archivos inyecta cada comando, para decidir qué eliminar.

Hacer un diagrama que muestre por cada comando:

| Comando | Archivos que inyecta o genera |
|---------|------------------------------|
| `funky init` (sin flags) | PROJECT-CANVAS.md, INFRA-CANVAS.md, canvas-planning-guide.md |
| `funky init --bootstrap` | ORCHESTRATOR-STATE.md, .agents/rules/*, docs/engram/*, docs/architecture-assessment.md, docs/architecture-assessment-guide.md, openspec/rfcs/000-TEMPLATE.md, TEMPLATE_GUIDE.md, README.md, docs/funky-ai/cli/canvas-planning-guide.md, docs/funky-ai/workers/plantilla-worker-handoff.md, docs/engram/discoveries.md, docs/engram/bugfix/bugfixes.md |
| `funky assess` | docs/architecture-review.md, docs/architecture-decisions.md |
| `funky estimate` | docs/pricing-guide.md, docs/pricing-decisions.md, prompt IA en consola |
| `funky pipeline` | context.json (raíz), orquesta assess + estimate |
| `funky phase` | sdd-{explore|proposal|tasks|planning-handoff|report|docs|spec}.md |
| `funky gentle` | openspec/gentle/<name>/01-*.md a 07-*.md |
| `funky release` | docs/funky-ai/releases/vX.Y.Z-release.md |
| `funky engram add` | docs/engram/{category}/{tag}.md + actualiza docs/engram/index.md |
| `funky feature` | openspec/changes/<name>/* (explore, proposal, tasks, docs, release) |

> **Nota:** Hacer el diagrama visual (puede ser un diagrama de flujo o tabla) como referencia para el paso 2.

---

## 2. Eliminar comandos obsoletos (PASO 2)

Usar el diagrama del paso 1 para identificar qué commandos y templates ya no tienen sentido.

### `funky phase`
- **Motivo:** El agente es más eficiente leyendo el template directamente del repositorio que ejecutando un comando para inyectarlo.
- **Bug detectado:** `funky phase worker-handoff` rompe porque el template se llama `planning-handoff.md`, no `worker-handoff.md`. El mismatch pasó desapercibido porque el comando no se usa.
- **Templates que inyecta:** explore.md, proposal.md, tasks.md, planning-handoff.md, report.md, docs.md, spec.md.
- **Acción:** Eliminar `src/commands/phase.js` y su registro en `bin/funky.js`. Los templates se quedan como referencia de formato en el repositorio.

### `funky gentle`
- **Motivo:** Tier 4 está deprecado. Los 7 templates existen pero no se usan.
- **Archivos a eliminar:** `src/commands/gentle.js`, `src/templates/gentle/` (carpeta completa), registro en `bin/funky.js`.
- **Acción:** Eliminar comando completo y sus templates.

### `funky release`
- **Motivo:** `release.md` debería inyectarse via `--bootstrap`, no mediante un comando separado. El agente puede generar notas de release siguiendo el template.
- **Archivos:** `src/commands/release.js`, registro en `bin/funky.js`.
- **Acción:** Mover `release.md` a `src/templates/bootstrap/` para que se copie con `--bootstrap`. Eliminar `funky release`.

### `planning-handoff.md`
- **Motivo:** Ya está deprecado. No se inyecta con ningún comando activo.
- **Acción:** Eliminar `src/templates/sdd/planning-handoff.md`.

---

## 3. Actualizar README y documentación (PASO 3)

Después de eliminar los comandos:

- Remover `funky phase`, `funky gentle`, `funky release` de la tabla de comandos en `funky-cli/README.md`.
- Remover la tabla de "Fases SDD Disponibles" completa (o reemplazarla con una nota de que los templates existen como referencia).
- Sincronizar `escenarios-de-uso.md` y `guia-flujo-completo.md` si referencian estos comandos.
- Actualizar `docs-index` correspondientes en `.agents/templates/sdd/docs-index/`.

---

## 4. Vector 3 de cli-simulations.md [RESUELTO]

- **Problema:** `funky init` en directorio de solo lectura lanzaba excepción EACCES con stacktrace sin formato.
- **Solución:** 
  - `executeIntentions()`: cada FS op captura EACCES y relanza con mensaje amigable (ruta + sugerencia de permisos).
  - `assess.js` y `estimate.js`: mismo patrón en catch blocks directos.
  - `init.js`: propaga el mensaje sin stacktrace.
- **Estado:** ✅ Resuelto en Punto 5.

---

## 5. Revisión de `docs/funky-ai/guias/funky-ai.md`

- Documento conceptual sobre los 3 pilares del ecosistema.
- No se modificó en la sesión de documentación porque el roadmap no cambió la arquitectura conceptual.
- Verificar si sigue siendo precisa o necesita actualización.

---

## Notas adicionales

- Ejecutar `pnpm test` en `funky-cli/` antes de pushear a `main`.
- Revisar que no queden argentinismos en la documentación operativa (excluir `gentle-ai-global.md` que los usa por diseño).
- Este archivo está en `init-observaciones/roadmap/sesion-pendientes.md`.
