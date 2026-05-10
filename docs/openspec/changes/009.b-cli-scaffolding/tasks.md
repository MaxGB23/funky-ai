# SDD Tasks: 009.b CLI Scaffolding (funky feature)

> **Contexto:** Implementación de CLI-first Scaffolding para evitar que el Orquestador pierda invariantes estructurales durante la planificación SDD.

## FASE 0: Preparación
- [x] 0.1 Verificar rama activa (`feature/v1.17.0-009-base-templates` o derivar nueva).
- [x] 0.2 Correr `pnpm test` en `funky-cli` para asegurar que todo el set de pruebas actual pasa antes de iniciar.

## FASE 1: Core del Comando Feature
- [x] 1.1 Crear archivo `funky-cli/src/commands/feature.js`.
- [x] 1.2 Implementar función `runFeature` con inyección de dependencias (cwd, dirs) para testing.
- [x] 1.3 Lógica de detección: Buscar en `.agents/templates/sdd` primero, hacer fallback a templates del CLI si falla, emitiendo un warning.
- [x] 1.4 Lógica de FileSystem: Crear `docs/openspec/changes/<featureName>/` recursivamente.
- [x] 1.5 Lógica de copia: Iterar sobre `explore.md`, `proposal.md`, `spec.md`, `tasks.md` (y opcionalmente `worker-handoff.md`) y copiarlos al destino renombrados (ej. `sdd-tasks.md` o mantener el nombre original, a debatir en PR).

## FASE 2: Integración
- [x] 2.1 Exportar `featureCommand` como objeto Commander.
- [x] 2.2 Registrar el comando en la entrada principal del CLI (`funky-cli/bin/funky.js`).

## FASE 3: Testing
- [x] 3.1 Escribir tests unitarios para `runFeature` en `funky-cli/tests/` o donde residan los tests actuales (mockear `fs` o usar carpetas temporales).
- [x] 3.2 Verificar escenario de Golden Templates.
- [x] 3.3 Verificar escenario de Fallback.

## FASE 4: Documentación
- [x] 4.1 Actualizar el `README.md` del CLI con el nuevo comando `funky feature <name>`.
- [x] 4.2 Actualizar las reglas del Orquestador (`.agents/rules/sdd-orchestrator.md`) para indicar que el humano DEBE usar este comando, y el Orquestador SOLO DEBE modificar el archivo ya creado en lugar de generarlo.

---
## 🚫 Restricciones
- No utilizar dependencias externas nuevas para esto, `fs` nativo de Node.js es suficiente.
- El código debe ser TDD-friendly (pura lógica separada de Commander).

---
## 📦 MANDATORY_RELEASE_PROTOCOL
- [x] Ejecutar suite de testing completa.
- [x] Actualizar `ORCHESTRATOR-STATE.md`.
- [x] Generar reporte en `sdd-report.md`.
