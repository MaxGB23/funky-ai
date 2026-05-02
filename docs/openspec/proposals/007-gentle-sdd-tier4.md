# Proposal 007: Tier 4 - Deep SDD (Gentle AI Flow)

**Estado:** 🟡 DRAFT (En definición)
**Autor:** Orquestador / Humano
**Fecha:** 2026-05-02

---

## 1. Contexto y Problema
El flujo SDD actual de Funky AI (Proposal -> Spec -> Tasks) es excelente para el 90% de las tareas de desarrollo (features, bugfixes, integraciones). Sin embargo, carece de la granularidad necesaria para **tareas hipercríticas** (ej. migraciones de base de datos, refactors masivos del core, o reescrituras de módulos enteros).

En estos casos críticos, el salto de un `spec.md` general a un `tasks.md` puede provocar "alucinaciones lógicas" o pérdida de contexto en los modelos de IA, ya que se le exige a un solo Worker o a un solo Orquestador pensar en demasiadas dimensiones simultáneamente.

## 2. Propuesta de Solución: Tier 4 "Gentle SDD"
Implementar un "Tier 4" opcional reservado exclusivamente para desarrollos de alto riesgo. Este tier emulará la orquestación pura de **Gentle AI**, dividiendo la carga cognitiva en 7 roles hiper-especializados, forzando un aislamiento total entre quien diseña, quien planea y quien ejecuta.

Dado que Funky AI opera mediante el "Disco Duro" y el Humano actúa como Router, el Tier 4 generará un pipeline de 7 archivos secuenciales. El Orquestador coordina el flujo, delega todo, y **nunca ejecuta**.

### Los 7 Sub-Agentes (Handoffs Manuales)

1. **Explorer (`01-explore.md`):** Lee código y analiza contexto. Su única salida es un mapa de impacto (qué archivos se tocan y cómo interactúan). No propone soluciones.
2. **Proposer (`02-proposal.md`):** Recibe el mapa y define *qué* cambiar y *por qué* a nivel de negocio/producto.
3. **Spec Writer (`03-spec.md`):** Recibe el proposal y baja los requisitos técnicos duros, edge cases y flujos.
4. **Designer (`04-design.md`):** El Arquitecto. Toma las specs y define decisiones técnicas (librerías, interfaces, patrones de diseño).
5. **Task Planner (`05-tasks.md`):** Recibe el diseño y divide el trabajo en tickets implementables (atomic commits).
6. **Implementer (`06-implement.md` / Código real):** Escribe código siguiendo **estrictamente** el plan. Prohibido tomar decisiones de arquitectura.
7. **Verifier (`07-verify.md`):** Valida la calidad y testea contra el `03-spec.md` y `04-design.md`. Es el QA implacable.

## 3. Impacto en la CLI (`funky-cli`)
Se deberá extender la CLI para soportar este flujo pesado:
- **Nuevos Templates:** Creación de una carpeta `funky-cli/src/templates/gentle-sdd/` con los 7 archivos base.
- **Comando Específico:** Un nuevo comando (ej. `funky phase --tier 4 <feature>` o `funky gentle <feature>`) que inyecte todo el pipeline de 7 pasos en una carpeta dedicada: `docs/openspec/gentle/<feature>/`.
- **Forzado de Roles (Action Forcing):** Cada template debe tener un `<system_prompt>` o instrucciones de Rol que bloqueen al LLM de intentar saltarse pasos. Al *Explorer* se le prohíbe proponer, al *Implementer* se le prohíbe diseñar.

## 4. Filosofía y Trade-offs
- **Pros:** Seguridad absoluta. Es prácticamente imposible que un LLM arruine el código si se somete a un Verifier independiente y a un Planner que atomiza el trabajo.
- **Cons:** Extrema fricción humana. Obliga al desarrollador a abrir y cerrar múltiples sesiones de chat pasando el contexto de un archivo al siguiente.
- **Decisión:** Justamente por su fricción, el Tier 4 es un "Glass to break in case of emergency". Solo se usa cuando el costo de fallar en producción es mayor que el costo de demorar 1 hora planificando.
