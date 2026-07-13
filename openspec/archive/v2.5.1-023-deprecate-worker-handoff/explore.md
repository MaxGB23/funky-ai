# Explore: 023-deprecate-worker-handoff
**TIER DE ORQUESTACIÓN ELEGIDO: "1"**

## 1. Contexto del Problema
Históricamente, el sistema SDD dependía de un archivo físico (`worker-handoff.md`) para pasar contexto y tareas del Orquestador a los Workers. Este es un antipatrón ("Disk I/O basura") que ya no es necesario gracias a los custom workflows (`/funky-worker`). Ahora, el workflow mismo actúa como System Prompt y define la identidad. El objetivo es eliminar la dependencia de este archivo intermedio y migrar hacia un modelo de **Message Passing directo**, donde el Orquestador inyecta el scope y las tareas directamente en la invocación del worker.

## 2. Estado Actual del Codebase
Actualmente, el uso y la inyección de `worker-handoff.md` están fuertemente acoplados en varias partes del sistema:
- **Orquestador (`.agents/rules/sdd-orchestrator.md`)**: Existen reglas (G1, G2, G3) que verifican la existencia del archivo físico y obligan a generarlo.
- **Templates (`.agents/templates/sdd/tasks.md` y `README.md`)**: Contienen instrucciones para generar y validar el archivo antes de la delegación.
- **CLI (`funky-cli/src/commands/feature.js` L42)**: Inyecta el template en cada nueva carpeta de feature.
- **CLI Bootstrapping (`funky-cli/src/commands/init.js` L28 y `sync-templates.js` L15)**: Copia `plantilla-worker-handoff.md` y `worker-handoff.md` al inicializar un workspace.
- **Tests (`funky-cli/tests/init.integration.test.js` y `init.test.js`)**: Validan la creación de los archivos template.
- **Archivos físicos**: Existen templates residuales en `.agents/templates/sdd/`, `.agents/templates/bootstrap/` y sus contrapartes en `funky-cli/src/templates/`.

## 3. Opciones de Arquitectura

| Opción | Descripción | Pros | Contras / Tradeoffs |
|--------|-------------|------|---------------------|
| **Opción A: Destrucción Total + Message Passing (Recomendada)** | Eliminar físicamente todos los templates de `worker-handoff.md`, purgar el CLI de sus inyecciones y modificar el Orquestador para delegar vía inyección en el prompt. El esquema de reporte se mueve a `/funky-worker`. | - Menos I/O de disco<br>- Flujo más limpio y rápido<br>- Alineado con la visión de workflows | - Requiere un refactor profundo de las reglas del Orquestador y tests del CLI |
| **Opción B: Soft-Deprecation (Desenchufar del CLI)** | Se elimina la inyección de nuevos archivos en `funky-cli`, pero se mantienen los archivos viejos por retrocompatibilidad. | - Menor riesgo de romper flujos antiguos | - Mantiene deuda técnica<br>- Código muerto en el repo |

## 4. Recomendación + Riesgos
**Opción recomendada:** Opción A (Destrucción Total + Message Passing)

**Justificación:**
Es la evolución natural del framework. La existencia de un archivo para pasar mensajes entre IAs va en contra de los nuevos flujos con custom workflows. Limpiar el scaffolding y los templates reduce la carga cognitiva, aligera el CLI y mejora la velocidad de ejecución. Además, permite trasladar el *Return Envelope Schema* directamente al prompt del worker (`funky-worker.md`), consolidando su identidad. 

**Riesgos mitigables:**
- **Rompimiento de Tests en el CLI:** Al eliminar la copia del template, fallarán los tests de `init.js`. **Mitigación:** Actualizar la suite de testing para reflejar la ausencia de `plantilla-worker-handoff.md`.
- **Rompimiento de `planning-handoff.md`:** La RFC pregunta si aplicar la misma lógica a `planning-handoff.md`. **Mitigación:** Limitar el scope estrictamente a `worker-handoff.md` en este ticket. El `planning-handoff.md` requiere un análisis separado dado su peso como contrato inicial (Tier 4).

> **[SISTEMA - PARA EL ORQUESTADOR]** Una vez finalizada la exploración, espera aprobación del humano, y luego utiliza este documento como base para generar el `proposal.md`
