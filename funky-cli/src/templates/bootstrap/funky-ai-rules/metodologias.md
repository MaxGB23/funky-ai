---
trigger: manual
---

# Metodologías del Proyecto

<!-- Edita según tu proyecto. "Solo Orquestador" nunca se inyecta a subagentes; las entradas con [tag] se inyectan solo en delegaciones que coincidan ([siempre] = todas). El orquestador cachea este archivo al inicio de sesión y las inyecta como bloque `Contexto Previo`. Excepciones por tipo de tarea van dentro de la entrada; excepciones por tier van en el router correspondiente. -->

## Solo Orquestador (nunca se inyecta)
<!-- Ejemplos — borra o adapta: -->
<!-- - **Conventional Commits:** obligatorio en todo commit propio. -->
<!-- - **Work unit commits:** sigue la skill de tu preferencia para commits por fases/batches. -->
<!-- - **Validación del proyecto:** {comandos de lint/test/build} — define si aplican al cierre del tier o a fases Verify. -->

## Inyectables a Subagentes
<!-- Ejemplos — borra o adapta: -->
<!-- - **Strict TDD** [siempre]: activo. Runner: {comando}. Todo código nuevo nace de un test fallido. No todo es testeable: texto hardcodeado/templates, config y cambios triviales quedan exentos. -->
<!-- - **Testing:** {runner} [{fases · tareas que toquen tests}]: carga la skill/ruta de convenciones antes de editar tests. -->
