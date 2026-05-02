# Spec: Architecture Readiness Assessment (MVP)

## 1. Arquitectura de Archivos (CLI)
- `funky-cli/src/commands/assess.js`: Nuevo comando `funky assess`.
- `funky-cli/src/utils/assessRules.js`: Motor de reglas determinísticas (el "Compilador de Decisiones").
- `funky-cli/src/templates/sdd/architecture-assessment.md`: Template canónico que el desarrollador debe llenar.
- `funky-cli/src/templates/sdd/architecture-review-template.md`: Template base para estructurar el Challenge Pack que el Agente leerá.

## 2. Motor de Reglas (MVP - 3 Reglas)
Para que el CLI pueda parsear de forma determinística las decisiones del usuario, el template `architecture-assessment.md` debe incluir un Frontmatter en YAML o un bloque de metadatos estandarizado con al menos:
- `budget`: Presupuesto mensual en USD.
- `rps`: Requests per second esperados.
- `sla`: SLA esperado (ej. 99.9, 99.99).
- `redundancy`: Nivel de redundancia (ej. "Single Node", "Multi-AZ").
- `db_tech`: Tecnología de base de datos elegida.
- `infra_tech`: Plataforma de cómputo (ej. "VPS", "K8s", "Vercel").

El archivo `assessRules.js` exportará una función `evaluateAssessment(metadata)` que ejecutará las siguientes **3 Reglas Duras (MVP)**:
1. **Budget vs Infra (Overengineering):** Si `budget < 50` y `infra_tech` menciona "K8s" o "Kubernetes", generar un challenge crítico exigiendo justificación de cómo planean costear/mantener un clúster con ese budget.
2. **RPS vs DB (Cuello de Botella):** Si `rps > 1000` y `db_tech` es "SQLite" (y no menciona explícitamente sharding/réplicas de lectura), generar un challenge alertando de lockeos en la DB.
3. **SLA vs Redundancia (Underengineering):** Si `sla >= 99.9` y `redundancy` es "Single Node", generar un challenge ya que cualquier downtime o deploy invalida el SLA esperado.

## 3. Comportamiento del Comando `funky assess`
El flujo del nuevo comando será:
1. **Lectura/Generación:** Buscar el archivo `docs/architecture-assessment.md`. Si no existe, lo copia desde los templates y le pide al humano que lo complete y vuelva a correr el comando.
2. **Evaluación:** Si existe, parsea los metadatos y corre `assessRules.js`.
3. **Generación del Challenge Pack:** Si alguna regla se rompe, el comando agarra el `architecture-review-template.md`, le inyecta los challenges generados, y lo guarda en `.agents/prompts/architecture-review.md`.
4. **Handoff:** Muestra por consola un mensaje como: *"⚠️ 2 Challenges Críticos de Arquitectura generados. Levantá un agente Orquestador y referenciá `.agents/prompts/architecture-review.md` para iniciar la evaluación."*

## 4. Pruebas (Test Plan)
- **Unit Tests:** `assessRules.test.js` con múltiples mocks de metadatos para asegurar que los triggers se disparen cuando deben y no den falsos positivos.
- **Integration Test:** Mockear la lectura de un `architecture-assessment.md` y verificar que el `.agents/prompts/architecture-review.md` se genere correctamente en disco.
