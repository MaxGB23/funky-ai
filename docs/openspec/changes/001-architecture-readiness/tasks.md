# Tareas: Architecture Readiness Assessment (MVP)

> **Contexto:** Esta iniciativa implementa un "Architecture Gate" obligatorio antes de la etapa de desarrollo. Un CLI parser detectará riesgos entre SLA, Presupuesto, y RPS, inyectando un "Challenge Pack" para que el Agente discuta la arquitectura con el desarrollador.

## Fases de Ejecución

- [ ] **Fase 0: Branch & Setup** (Humano / Agente Tier 1)
  - Ejecutar `git checkout -b feat/v1.12-arch-readiness` desde la rama `main`.

- [ ] **Fase 1: Creación de Templates** (Worker)
  - Crear `funky-cli/src/templates/sdd/architecture-assessment.md`. (Debe contener un bloque de metadatos en YAML frontmatter con: budget, rps, sla, redundancy, db_tech, infra_tech).
  - Crear `funky-cli/src/templates/sdd/architecture-review-template.md` (Este es el prompt canónico que guía el tono de la IA e incluirá un placeholder como `{{CHALLENGES}}`).

- [ ] **Fase 2: Motor de Reglas y Tests** (Worker)
  - Crear `funky-cli/src/utils/assessRules.js`.
  - Implementar la función de evaluación que aplique las 3 reglas determinísticas de MVP (ver `spec.md`).
  - Crear `funky-cli/test/assessRules.test.js` (Vitest) para asegurar el correcto funcionamiento lógico de las reglas.

- [ ] **Fase 3: Comando CLI `funky assess`** (Worker)
  - Crear `funky-cli/src/commands/assess.js`.
  - Implementar el flujo de lectura del template de assessment, pase por el motor de reglas, e inyección final en `.agents/prompts/architecture-review.md` si hay errores detectados.
  - Registrar el nuevo comando en la entrada principal del CLI (`funky-cli/src/index.js` o equivalente).
  - Test de integración básico si es viable.

- [ ] **Fase 4: Integración en el Flujo Inicial** (Worker)
  - Modificar `funky-cli/src/commands/init.js` para que el archivo vacío `architecture-assessment.md` se copie a `docs/` junto con el `PROJECT-CANVAS.md` cuando se inicializa un proyecto.
  - Asegurarse de que todos los tests existentes de Vitest (`npm run test`) sigan pasando en verde, actualizando mocks si el comando `init` lo requiere.

- [ ] **Fase 5: Actualización del Estado y Release** (Orquestador - Próxima Sesión)
  - El Orquestador recogerá los `report.md` del Worker.
  - Se volcarán aprendizajes en el Engram.
  - Actualización de `ORCHESTRATOR-STATE.md`.
  - Creación del tag / PR para el release de la feature.
