---
trigger: manual
---

# Metodologías del Proyecto
<!-- Edita según tu proyecto. "Solo Orquestador" nunca se inyecta. Las entradas con [tag] se inyectan solo en delegaciones que coincidan: [siempre] = todas. -->

## Solo Orquestador (nunca se inyecta)
- **Conventional Commits:** obligatorio en todo commit propio.
- **Work unit commits:** sigue `.agents/skills/work-unit-commits/SKILL.md` en commits por fases/batches.

## Inyectables a Subagentes
- **Strict TDD** [siempre]: activo. Runner: `pnpm test`. Todo código nuevo nace de un test fallido. No todo es testeable: texto hardcodeado/templates, config y cambios triviales quedan exentos.
- **Estructura TDD de tasks** [tasks]: cada tarea de implementación se descompone en tests → implementación → verificación; tests SIEMPRE antes de código; cada task de tests declara el comportamiento que valida; verificación incluye el comando exacto del runner; sin tasks de refactor.
- **Testing frontend: Vitest** [apply · tareas que toquen tests]: carga antes `.agents/skills/vitest/SKILL.md` y respeta la sección "Repo conventions (funky-ai)".
- **Validación del proyecto** [verify · cierre T1]: `pnpm test` 