# 🗺️ Matriz: Comandos CLI vs Archivos Inyectados

Este documento es el **Cheat Sheet definitivo** para entender exactamente qué archivos genera cada comando de la CLI de Funky AI, cuál es su propósito y cómo se integran en el ecosistema (Separation of Concerns).

---

## 🚀 1. Inicialización de Proyecto

### Comando: `funky init`
El Big Bang. Se ejecuta una sola vez por repositorio para inicializar la matriz documental.

| Archivo(s) Inyectado(s) | Función | Cómo se complementan |
|-------------------------|---------|----------------------|
| `PROJECT-CANVAS.md`<br>`INFRA-CANVAS.md` | Base de datos declarativa del proyecto (Stack, Arquitectura, Testing). | Le dicen al Orquestador y a los Workers **QUÉ** tecnologías usar, evitando que el LLM invente dependencias. |
| `.agents/rules/sdd-orchestrator.md`<br>`.agents/rules/secops.md`<br>`.agents/rules/engram-protocol.md` | Guardrails arquitectónicos (Capa 2). Reglas duras de seguridad y comportamiento. | Fuerzan el **CÓMO**. Le enseñan al IDE a inyectar contexto condicional según la acción que estés haciendo. |
| `ORCHESTRATOR-STATE.md` | El "Save State" del proyecto. Versión actual, tareas pendientes y estado del release. | Funciona como el cerebro de corto plazo del Orquestador al iniciar una sesión. |
| `docs/engram/discoveries.md`<br>`docs/engram/bugfixes.md` | Memoria a largo plazo (Two-Stage Memory Polling). | Evita que los agentes cometan el mismo error dos veces en el mismo proyecto. |

---

## 🏗️ 2. Flujo SDD Estándar (Tiers 1 a 3)

### Comando: `funky feature <name>`
Scaffolding masivo. Crea la carpeta en `openspec/changes/{name}/` con todos los templates de golpe.

| Archivo Inyectado | Función | Cómo se complementan (La Cascada) |
|-------------------|---------|------------------------------------|
| `explore.md` | **(Fase 1)** Descubrimiento. Impacto en el código actual, viability. | Alimenta directamente al Proposal. Sin Explore, el Proposal alucina contextos. |
| `proposal.md` | **(Fase 2)** Decisiones técnicas. Patrones a usar, trade-offs. | Es el "Contrato". La Spec se basa en estas decisiones. |
| `spec.md` | **(Fase 2)** Arquitectura detallada, endpoints, interfaces. | Traduce la idea del Proposal en diagramas y esquemas técnicos. |
| `tasks.md` | **(Fase 3)** Checklist de ejecución. Fases atómicas. | Toma la Spec y la convierte en trabajo duro y delegable. |
| `worker-handoff.md` | **(Fase 4)** Aislante. El sobre cerrado para el Worker. | Toma UNA sola fase del `tasks.md` y se la da a un Worker sin revelarle el resto del proyecto. |
| `report.md` | **(Fase 5)** Return Envelope. Resultados de la ejecución. | Vuelve al Orquestador para que decida si avanzar a la siguiente fase o corregir bugs. |

> 💡 **Nota:** El comando `funky phase <fase>` inyecta estos mismos archivos de a uno por vez, en caso de que no quieras generar el scaffolding completo de golpe.

---

## ☢️ 3. Flujo SDD Hipercrítico (Tier 4)

### Comando: `funky gentle <name>`
Deep SDD. Se usa para tareas de altísimo riesgo. Crea `openspec/gentle/{name}/`.

| Archivo(s) Inyectado(s) | Función | Cómo se complementan |
|-------------------------|---------|----------------------|
| `1-explore.md` a `7-verify.md` | Pipeline secuencial de 7 pasos. Cada archivo contiene un `<system_prompt>` estricto y aislado (ej. "Sos el Crítico", "Sos el Implementador"). | **Aislamiento de Rol.** En vez de que un solo Orquestador piense todo, forzás a 7 agentes distintos a pasarse la posta. El output de la Fase 1 es el input inmutable de la Fase 2, anulando por completo las alucinaciones por sobrecarga. |

---

## 🛠️ 4. Utilidades Auxiliares

### Comando: `funky estimate`
| Archivo Inyectado | Función | Complemento |
|-------------------|---------|-------------|
| `docs/pricing-analysis.md` | Calcula complejidad de desarrollo y genera un reporte de Value-Based Pricing. | Lee pasivamente los Canvas (`PROJECT` e `INFRA`) para calcular un multiplicador de complejidad técnica antes de la fase de exploración comercial. |

### Comando: `funky assess`
| Archivo Inyectado | Función | Complemento |
|-------------------|---------|-------------|
| `docs/architecture-assessment.md` | Architecture Readiness Gate. Audita si el repo cumple las políticas. | Trabaja como un linter arquitectónico. Si el Assessment falla, detiene la delegación a Workers hasta que se fije la deuda técnica. |
