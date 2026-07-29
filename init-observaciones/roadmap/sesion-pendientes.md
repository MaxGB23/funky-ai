# Pendientes para sesión futura

> Generado: 2026-07-28
> Origen: Sesión de documentación post-roadmap
**TODA DOCUMENTACIÓN DEBE USAR ESPAÑOL NEUTRO**
---

## 1. Deprecar comandos obsoletos

### `funky phase`
- **Situación:** Inyecta templates SDD uno por uno. El agente es más eficiente leyendo el template directamente del repo que ejecutando un comando.
- **Bug detectado:** `funky phase worker-handoff` rompe porque el template se llama `planning-handoff.md`, no `worker-handoff.md`. El mismatch pasó desapercibido porque el comando no se usa.
- **Templates afectados:** explore.md, proposal.md, tasks.md, planning-handoff.md, report.md, docs.md, spec.md.
- **Decisión:** Deprecar `funky phase`. Los templates se quedan como referencia de formato en el repo.

### `funky gentle`
- **Situación:** Tier 4 está deprecado. Los 7 templates de gentle/ existen pero no se usan.
- **Archivos:** `src/commands/gentle.js`, `src/templates/gentle/01-*.md` a `07-*.md`.
- **Decisión:** Deprecar `funky gentle`.

### `funky release`
- **Situación:** `release.md` debería inyectarse via `--bootstrap`, no mediante un comando separado. El agente puede generar notas de release siguiendo el template.
- **Archivos:** `src/commands/release.js`, `src/templates/sdd/release.md`.
- **Decisión:** Mover release.md a bootstrap templates; deprecar `funky release`.

### `planning-handoff.md`
- **Situación:** Ya está deprecado. No se inyecta con ningún comando activo.
- **Decisión:** Eliminar de `src/templates/sdd/` al limpiar los comandos deprecados.

---

## 2. Sincronizar README con estado real

- La tabla de "Fases SDD Disponibles" lista `worker-handoff` pero el template real es `planning-handoff.md` (deprecado).
- Hay 14 templates en `src/templates/sdd/` pero el README solo lista 5 inyectables. Si se deprecan los comandos, la tabla cambia completamente.
- Actualizar después de la limpieza de comandos.

---

## 3. Vector 3 de cli-simulations.md

- **Problema:** `funky init` en directorio de solo lectura lanza excepción EACCES con stacktrace feo.
- **Estado:** Pendiente de fix.
- **Acción:** Manejar la excepción en init.js con mensaje "Error de permisos al escribir en X" en vez del error de Node crudo.

---

## 4. Diagrama de responsabilidad de comandos

- Hacer un diagrama/mapeo de qué archivos maneja cada comando (init, --bootstrap, assess, estimate, pipeline).
- Útil para entender solapamientos y como referencia al deprecar comandos.
- **No hacer ahora** — pendiente para sesión futura.

---

## 5. Revisión de `docs/funky-ai/guias/funky-ai.md`

- Doc conceptual sobre los 3 pilares del ecosistema.
- No se tocó en la sesión de documentación porque el roadmap no cambió la arquitectura conceptual.
- Verificar si sigue siendo precisa o necesita actualización.

CORRER TESTS CON PNPM ANTES DE PUSHEAR A MAIN