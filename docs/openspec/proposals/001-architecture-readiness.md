# Proposal: Architecture Readiness Assessment Template

**Estado:** 🟡 DRAFT (En definición)
**Autor:** Orquestador / Humano
**Fecha:** 2026-05-01

---

## 1. Contexto y Problema
Actualmente contamos con el `PROJECT-CANVAS.md`, el cual cubre de manera excelente la perspectiva de producto, alcance y negocio. Sin embargo, no existe una barrera de contención puramente **técnica** antes de iniciar el código.

Esto genera el riesgo de:
- Elegir stacks por "moda" o zona de confort ("porque el equipo lo conoce"), sin evaluar trade-offs reales.
- Desplegar infraestructuras que no soportan los Requisitos No Funcionales (NFRs), o que están sobredimensionadas.
- Encontrarnos con cuellos de botella ("bottlenecks") arquitectónicos en producción que cuestan carísimo refactorizar.

## 2. Propuesta de Solución: El "Architecture Gate"
Crear un archivo obligatorio llamado `architecture-assessment.md` que funcione no como un simple checklist reflexivo, sino como un **gate de arquitectura estricto**. No se puede empezar a codear sin esto.

Debe forzar decisiones mediante:
- **Presupuesto de Infraestructura (Soft/Hard Limit):** Cuánto hay para gastar por mes. Si el límite son $20 USD, descartamos clústeres Kubernetes y RDS multi-zona desde el día cero.
- **NFRs Cuantificados:** Nada de "alta concurrencia". Hablamos de RPS esperado, Latencia P95, SLA (99.9%), Volumen de datos (GB/mes).
- **Decision Log (ADR Raíz):** Por cada decisión clave (ej. DB, Lenguaje), exigir mínimo 2 alternativas consideradas, criterios de evaluación y trade-offs asumidos.
- **Infraestructura Completa:** Estrategia de escalado (horizontal/vertical), CI/CD, y observabilidad (Logs, Metrics, Tracing).
- **Riesgos y Puntos de Ruptura:** Responder explícitamente: *"¿Dónde va a fallar esto primero?"*
- **Librerías Críticas:** Validación por madurez (Mantenimiento, issue backlog, uso conocido en prod).

## 3. Estructura Sugerida del Template
```markdown
1. System Context & Constraints
2. Explicit Assumptions (Tráfico 90% lectura, máx 5 req/s por user)
3. Quantified NFRs (RPS, Latency, SLA)
4. Cost vs Performance Trade-offs (Presupuesto esperado vs SLA)
5. Architecture Overview & Request Flows (Flujos concretos)
6. Decision Log (Decisión, Alternativas, Trade-offs)
7. Infrastructure & Observability Strategy
8. Data Strategy & Storage
9. Critical Dependencies Evaluation
10. Risks & Failure Modes (Bottlenecks)
11. Validation Plan (Plan de load testing, triggers de invalidación)
```

## 4. Impacto en el SDD: El "Compilador de Decisiones"
Esto no es solo un template estático. La meta es convertir la CLI de Funky AI en un **generador de comportamiento emergente para IA**.

El flujo será el siguiente:
1. El dev escribe sus decisiones en `architecture-assessment.md`.
2. El CLI cruza los datos con **reglas determinísticas** (Anti-patterns como *Overengineering: K8s + 10 usuarios* o *Underengineering: Nodo único + SLA 99.9%*).
3. El CLI inyecta un "Challenge Pack" estructurado en `.agents/prompts/architecture-review.md`.

### Estructura Canónica del Challenge Pack Generado
Para no diluir la atención del agente, el documento generado tendrá un formato estricto:

- **Review Mode (Tono):** Instrucciones explícitas de comportamiento. *(Ej: "Sé crítico, no aceptes asunciones sin evidencia, prioriza riesgos de alto impacto. No te detengas en la primera respuesta; si es vaga, sigue indagando. Exige números concretos").*
- **Priorización (Deduplicación):** Máximo **5 Challenges Críticos** por revisión.
- **Estructura por Challenge (Orden Óptimo para LLMs):**
  1. `Type` / `Focus` / `Severity & Confidence:` (Prioridad y Enfoque primero).
  2. `Context & Problem:` Por qué falló la regla (RPS vs DB, o un NFR sin justificación).
  3. `Agent Instructions (MANDATORY):` Qué debe atacar el agente.
  4. `Questions to Ask:` Preguntas directas al dev.
  5. `Evidence Expected:` Qué sirve como prueba (Benchmarks, Load tests, etc).
  6. `Resolution Criteria` / `Expected Outcome:` Cuándo consideramos el issue cerrado.

- **Review Completion Criteria:** Condición de parada global para evitar loops infinitos del LLM (Ej: *"La revisión termina cuando todos los challenges críticos tienen una justificación basada en evidencia o la arquitectura fue actualizada"*).

5. Cuando el Orquestador (IA) lee esto en el IDE, ejecuta la revisión con una precisión brutal, condicionado por las reglas del CLI.

**Filosofía Subyacente:** Las reglas de la CLI generan límites y fricción; el Agente convierte esa fricción en un diálogo técnico de alto nivel. Simulamos literalmente a un Staff Engineer revisando tu arquitectura. Encauzamos la ambigüedad del LLM hacia preguntas útiles. Un sistema para inyectar pensamiento crítico en workflows de desarrollo.

## 5. Alcance de la Versión 1 (MVP)
Para evitar la dilución del sistema y medir el impacto real, la primera implementación estará restringida a:
- **Scope Limitado:** Solo 3 reglas iniciales (RPS vs DB, SLA vs Redundancia, Budget vs Infraestructura).
- **Output Único:** Generación de un solo archivo `architecture-review.md`.
- **Exclusiones V1:** Sin scoring automático, sin analíticas y sin reconocimiento de patrones (pattern recognition). 

**Métricas de Éxito de la V1:**
1. ¿El agente hace mejores preguntas que antes?
2. ¿Obliga al desarrollador a cambiar decisiones o justificar con evidencia?
3. ¿La fricción generada es útil (hace pensar) o molesta (estorba)?
