# Gobernanza de QA y Smoke Testing

> **Propósito:** Definir el marco de trabajo para un equipo de desarrolladores sobre cuándo y cómo ejecutar validaciones manuales (Smoke Tests E2E), evitando la parálisis por análisis, el testeo excesivo manual, y las regresiones en el entorno de producción.

Este documento establece las reglas de equipo para la ejecución del `master-smoke-test.md` en el ciclo de Spec-Driven Development (SDD).

---

## 1. La Regla del SemVer (Versionamiento)
El trigger principal para ejecutar QA manual está atado al tipo de release que el Orquestador planifique, basándose en Versionamiento Semántico.

- 🟢 **Patch (vX.X.1): Prohibido hacer Smoke Test.**
  Si la feature es un fix menor o un parche aislado, la suite automatizada de pruebas unitarias/integración (ej. Vitest) DEBE ser suficiente. Confiamos ciegamente en la CI. Si la CI está en verde, se integra y se publica.
  
- 🟡 **Minor (vX.1.0): Smoke Test Parcial.**
  Agrega nuevas funcionalidades sin romper retrocompatibilidad. El QA manual SOLO se ejecuta para los escenarios específicos en el `master-smoke-test.md` que pertenezcan al dominio de la nueva feature.
  
- 🔴 **Major (v1.0.0): Smoke Test Total y Obligatorio.**
  Existen *breaking changes* o refactorizaciones arquitectónicas masivas (ej. cambiar el sistema de inyección de templates). Se frena el pipeline de desarrollo. Todo el equipo debe validar el flujo completo ejecutando el `master-smoke-test.md` de la A a la Z en entornos de prueba limpios.

---

## 2. La Regla del "Core Touch" (Radio de Explosión)
Existen casos donde un cambio califica como "Patch" pero afecta el sistema nervioso central de la aplicación (ej. el parser del FileSystem, la capa de red, o el enrutador de CLI).

- Si un PR modifica **lógica core del dominio principal**, se activa obligatoriamente la ejecución del escenario de QA correspondiente en el Smoke Test manual, sin importar el tipo de release.
- Modificaciones en comandos aislados, utilidades secundarias o templates no disparan esta regla.

---

## 3. La Regla de la Maduración (Shift a la Automatización)
El `master-smoke-test.md` es una herramienta de transición, no un depósito infinito de tareas manuales. Para evitar la carga operativa sobre el equipo, aplicamos la siguiente métrica:

> **Regla de Tres Strikes:** Si el equipo ejecuta el mismo escenario manual del Smoke Test en tres releases distintas, el próximo ticket de máxima prioridad en el Backlog DEBE ser la automatización de ese escenario (ej. scripts E2E en Bash, o frameworks como Playwright/Cypress). Una vez automatizado, el escenario se elimina del Ledger manual.

---

## 4. Enforcement en el Día a Día (Git-Ops)
Para garantizar que estas reglas se cumplan sin microgestión, el sistema de Pull Requests (o los Handoffs de Funky AI) deben incorporar el siguiente mecanismo de validación (Action Forcing):

El desarrollador (o Worker) debe validar este checkpoint al proponer un cambio:
`[ ] ¿Esta PR/Feature altera flujos E2E y requiere actualizar o ejecutar escenarios según qa-governance.md?`

Esta simple pregunta obliga al autor a clasificar el impacto de su código antes de realizar el merge.
