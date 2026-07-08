# Estrategia de Consolidación: index-consolidado.md -> index.md

Este documento detalla la estrategia de integración de los nuevos pilares de diseño (actualmente en `drafts/index-consolidado.md`) hacia la estructura oficial de RFCs en `index.md`. No es necesario crear RFCs nuevos; la arquitectura actual soporta perfectamente estas adiciones como expansiones o nuevas subsecciones de los documentos existentes.

## 🎯 Metodología de Ejecución (Punto por Punto)

Para evitar saturación de contexto y prevenir "context decay", la consolidación no se hará de golpe. Se ejecutará **punto por punto** en el futuro siguiendo este flujo preventivo:

1. **Lectura Quirúrgica:** Antes de integrar cada punto, nos apoyaremos en `grep` para auditar las secciones específicas del documento destino(y otros docs si el grep encuentra coincidencias) y no atascar el contexto innecesariamente.
2. **Análisis de Colisiones:** Evaluaremos detalladamente si la información existente está desactualizada o si la nueva regla choca con algún contrato previo, evitando crear incongruencias arquitectónicas.
3. **Inyección Controlada:** Solo después de validar el contexto local, procederemos a inyectar o refactorizar la sección correspondiente.

---

## ⚠️ Lecciones Aprendidas (Anti-Patrones Documentados)

> Estos errores fueron cometidos por el agente en la primera ejecución de este documento. El siguiente agente **debe leer esto antes de tocar cualquier archivo**.

### Error 1: Saltar el grep y asumir que el contenido no existe
El agente leyó el `draft-consolidado.md` y procedió a inyectar "Fragmentación del Monolito de Tareas" en `spec-contracts-templates.md` **sin hacer un `grep_search` previo**. Dicho contenido ya existía en `spec-cli-ide-boundaries.md` (L41-L45). El resultado fue una duplicación de información que hubo que revertir.

**Regla:** Antes de inyectar cualquier pieza, hacer `grep_search` del concepto clave en todo el directorio `refactor-tasks/`. Si ya existe, evaluar si complementa o duplica. Si duplica → no tocar.

### Error 2: Ejecutar cambios sin aprobación previa (multi-archivo de golpe)
El agente inyectó los tres destinos del Pilar 1 (`spec-contracts-templates.md`, `spec-routing-tiers.md`, `spec-orchestrator-rules.md`) de una sola jalada sin presentar primero el analisis al humano ni esperar el *go*. Esto viola directamente la Metodología de Ejecución documentada en este mismo archivo (punto por punto).

**Regla:** Una pieza a la vez. Presentar la propuesta con el diff textual exacto. Esperar aprobación explícita. Solo entonces ejecutar.


---

## 🛠 Pilar 1: Ciclo de Cierre Determinista y Modularización de Templates

* **Centralización del Archivado y Flujo Secuencial (`tasks` -> `docs` -> `archive` -> `release`):**
  * **Destinos:** 
    * `spec-contracts-templates.md`: Añadir la parte de modularización y fragmentación de plantillas (complementando "El Template Siempre Manda").
    * `spec-routing-tiers.md`: Añadir el flujo lógico/secuencial (posiblemente dentro de "Arquitectura del `/funky-tasks`").
* **Ejecución de Docs y Release por el Orquestador:**
  * **Destino:** `spec-orchestrator-rules.md`. Aclarar en las secciones de "Guardrails de Edición de Templates (Regla JIT)" o "Persistencia Proactiva" que el Orquestador procesa `docs.md` y `release.md` de forma inline, sin delegar ciegamente.
* **Fusión de Specs en Tier 2:**
  * **Destino:** `spec-routing-tiers.md`. Integrar en el **punto 2 (Reglas de Release: SemVer x SDD)** especificando que T2 fusiona en corto de forma condicional.

## 🔄 Pilar 2: Estrategia de Batching Secuencial y Mutación de Tiers

* **Phase Batching y Ejecución Secuencial:**
  * **Destino:** `spec-orchestrator-rules.md`. Expandir el **punto 7 (Phase Batching y Ejecución Secuencial)** para incluir la regla de los mínimos de batches en T1/T2 y los límites de aprobaciones interactivas vs ejecución secuencial por fases en T3/T4.
* **Escenarios de Mutación (Subidas de T1 a T2 y T2 a T3):**
  * **Destino:** `spec-routing-tiers.md`. Añadir como subsección en el **punto 1 (Escalera de Tiers)**. Detallar cómo se gestionan estas mutaciones a medio vuelo y la purga de artefactos intermedios.
* **Diferenciación de Ejecución (Workers vs `/funky-apply`):**
  * **Destino:** `spec-roles-subagents.md`. Complementar el **punto 1 (El Barrio)** para definir explícitamente qué responsabilidades recaen sobre el Chalán/Mierdillo en los batches comparado con el workflow `/funky-apply`.

## 🧪 Pilar 3: Estrategia de Quality Assurance (Testing & Verify Guardrails)

* **Estrategia DRY de Tareas (Lógica de negocio vs Contrato estático):**
  * **Destino:** `spec-routing-tiers.md`. Inyectar directamente en el **punto 4 (Arquitectura del `/funky-tasks` y Deprecaciones)**.
* **Responsabilidad de Pruebas y Política NO-FIX Ciego (El Sabueso):**
  * **Destino:** `spec-roles-subagents.md`. Expandir el **punto 1 (El Barrio)** en la definición del Sabueso, remarcando su rol de diagnóstico puro y la restricción de "NO-FIX ciego". 
  * *Nota adicional:* La directiva de ejecutar tests en la fase final de `tasks.md` en T1/T2 puede integrarse también aquí o en `spec-routing-tiers.md`.
