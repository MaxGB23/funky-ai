# RFC: `.importantes` — Índice de Referencias Activas

Este índice consolida los documentos fundamentales que definen los contratos de retorno entre subagentes y orquestador, la estrategia de delegación, y la implementación interactiva del framework Funky-ai. Son los RFCs que se consultan más frecuentemente al diseñar, extender o auditar el comportamiento del orquestador.

---

* 📄 **[MANIFEST.md](MANIFEST.md)**
  * **Propósito:** Mapa maestro de todos los archivos en `.importantes/`, sus estados (activo/eliminado/histórico), y sus relaciones con los specs aprobados en `refactor-tasks/index.md`.
  * **Cuándo leerlo:** Primero. Si no sabés qué archivo consultar, acá está la tabla de contenido y el estado de cada documento.
  * **Contenido:**
    * **Estado de archivos:** Qué existe, qué fue eliminado, qué es histórico.
    * **Relaciones entre archivos:** Qué concepto se define dónde y se implementa dónde.
    * **Gaps resueltos:** Qué problemas del manifiesto anterior ya están cerrados.

* 📄 **[sdd-phase-returns.md](sdd-phase-returns.md)**
  * **Propósito:** Fuente de verdad única para los contratos de retorno (envelope + contenido específico) de cada fase SDD. Define qué devuelve cada sub-agente al orquestador.
  * **Cuándo leerlo:** Obligatorio al implementar, modificar o auditar workflows de cualquier fase SDD. También relevante al diseñar flujos interactivos.
  * **Contenido:**
    * **Envelope Común:** Estructura mínima `status / summary / artifacts / next / risks` que toda fase devuelve.
    * **Dos mecanismos de entrega:** Built-in (workflows) vs Inline (ligeros Tier 2).
    * **Tres modos de operación:** Interactivo, Auto, Handoff — comportamiento del orquestador por modo.
    * **Fases detalladas (0-8):** Preflight, Init, Explore, Propose, Spec, Design, Tasks, Apply, Verify, Archive — cada una con envelope, return específico, artefacto persistido, presentación interactiva, comportamiento por modo, y casos especiales.
    * **Review Workload Guard:** Reglas de batching proactivo cuando forecast >400 líneas.
    * **Tabla transversal de modos:** Resumen de comportamiento de todas las fases por modo (Interactivo/Auto/Handoff).

* 📄 **[estrategia-entregables-returns.md](estrategia-entregables-returns.md)**
  * **Propósito:** Plan de implementación secuencial para los contratos de retorno y la capa interactiva. Divide el trabajo en 5 cortes verticales con dependencias duras.
  * **Cuándo leerlo:** Relevante al planificar la implementación de los contratos de retorno, o al entender el orden en que se construyó el framework.
  * **Contenido:**
    * **Mapa de Dependencias:** Grafo Mermaid de los 5 cortes y su ruta crítica.
    * **Corte 1 (Core):** Envelope común, preflight, cacheo de sesión, routing de fases por Tier.
    * **Corte 2 (T2 Auto):** Pipeline completo Tier 2 en modo automático — 7 fases end-to-end.
    * **Corte 3 (Interactivo):** Templates de presentación, pregunta de cierre, Review Workload Guard.
    * **Corte 4 (Tier 3):** Fases pesadas — design, explore SDD completo, verify completo, batching.
    * **Corte 5 (Handoff):** Bloques copy-paste, Ley de Invarianza, ciclo IDE.
    * **Tabla de esfuerzo:** ~18 sesiones totales, distribuidas por corte.

* 📄 **[funky-inputs.md](funky-inputs.md)**
  * **Propósito:** Documentar qué recibe cada sub-agente cuando el orquestador delega trabajo. Contrato de delegación para Tier 3 (custom workflows) y Tier 2 (SDD Ligeros).
  * **Cuándo leerlo:** Relevante al modificar prompts de delegación, crear nuevos workflows, o auditar que los subagentes reciban la información correcta.
  * **Contenido:**
    * **Contrato Base E1:** Parámetros mínimos `feature_name` + `tag` para todos los workflows Tier 3.
    * **Tier 3 workflows:** Explore SDD (excepción con contexto especial), Propose, Spec, Design, Tasks, Apply, Verify, Archive (solo E1).
    * **Tier 2 Ligeros:** Cinco elementos que el orquestador arma — tarea, artefacto anterior, template, tag, formato de retorno.
    * **Explore Ligero (Sabueso de Lava):** Delegación `define_subagent`, produce `explore.md` con Context Preservation.
    * **Propose/Spec/Verify Ligeros:** Mini-delegaciones con Chalán Crikoso, prompts armados por orquestador.
    * **Viaje de artifacts:** Tabla de qué artefacto pasa de cada fase a la siguiente.

---

## 📂 `funky-interactive/` (Activo)

Directorio de 10 archivos que definen los contratos de retorno y presentación interactiva para cada fase del framework. Es la **fuente de verdad de implementación**.

Cada archivo documenta **tres cosas** por fase:
1. Lo que devuelve el sub-agente (envelope / return contract)
2. Lo que presenta el orquestador al humano (template de presentación)
3. Comportamiento por modo (Interactive, Auto, Handoff)

* 📄 **[01-preflight.md](funky-interactive/01-preflight.md)** — Paso cero: el orquestador **recomienda** valores (Tier, Docs, Release, Modo) y espera confirmación. No es un formulario.

* 📄 **[02-init.md](funky-interactive/02-init.md)** — Bootstrap del proyecto SDD. ⏳ Sugerencia a futuro, no implementado aún.

* 📄 **[03-explore.md](funky-interactive/03-explore.md)** — Investigación del código. Dos versiones: Explore SDD (Tier 3+, persiste artefacto) y Explore Ligero/Sabueso (Tier 1-2, findings inline, sin artefacto).

* 📄 **[04-propose.md](funky-interactive/04-propose.md)** — Contrato con el usuario: qué se hace, qué no, cómo, y rollback plan. Tier 2 mini-delegación vs Tier 3 workflow completo.

* 📄 **[05-spec.md](funky-interactive/05-spec.md)** — Delta specs con requirements y escenarios Given/When/Then. Tier 2 solo happy paths + error principal.

* 📄 **[06-design.md](funky-interactive/06-design.md)** — Decisiones técnicas, arquitectura, archivos afectados. Solo Tier 3. No existe versión ligera.

* 📄 **[07-tasks.md](funky-interactive/07-tasks.md)** — Desglose en tareas + Review Workload Forecast. No hay chained PRs — el split es batching secuencial en la misma rama.

* 📄 **[08-apply.md](funky-interactive/08-apply.md)** — Implementación de tareas en batches. Checkpoint pre-apply SIEMPRE (incluso en Auto). Worker Reactivo si se satura.

* 📄 **[09-verify.md](funky-interactive/09-verify.md)** — Quality gate: build + tests + validación. Veredictos: PASS / FUNCTIONAL WARNINGS / COSMETIC WARNINGS / FAIL con Acción explícita para el orquestador.

* 📄 **[10-archive.md](funky-interactive/10-archive.md)** — Cierre del ciclo: fusiona delta specs al source of truth. No pregunta "ajustar o continuar" — pregunta qué sigue.

---
