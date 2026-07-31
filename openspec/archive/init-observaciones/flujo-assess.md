# Flujo: `funky assess`

> Documentación del comando `funky assess` — auditoría arquitectónica basada en NFRs y reglas estáticas.

---

## 1. Propósito

`funky assess` evalúa la arquitectura propuesta del proyecto contra reglas estáticas de validación y genera un **prompt de desafío arquitectónico** para que un agente de IA actúe como Devil's Advocate y cuestione las decisiones.

**Dependencia**: Requiere `docs/architecture-assessment.md` con el frontmatter completado.

---

## 2. Flujo completo

```
USUARIO
   │
   ├─ funky assess
   │
   ├─ FASE 0: SETUP (si no existe el assessment)
   │   ├─ ¿Existe docs/architecture-assessment.md?
   │   │   ├─ NO → Copia el template desde src/templates/sdd/
   │   │       Mensaje: "Completa el archivo y vuelve a ejecutar funky assess"
   │   │       process.exit(0)
   │   │
   │   │   └─ SÍ ↓
   │
   ├─ FASE 1: PARSING
   │   ├─ Lee docs/architecture-assessment.md
   │   ├─ Extrae frontmatter (---...---)
   │   └─ Devuelve: { budget, rps, sla, redundancy, db_tech, infra_tech, compliance, team_seniority }
   │
   ├─ FASE 2: RULES EVALUATION (assessRules.js)
   │   ├─ Regla 1: Budget < $50 + K8s → "Overengineering"
   │   ├─ Regla 2: RPS > 1000 + SQLite (sin sharding) → "Cuello de Botella"
   │   ├─ Regla 3: SLA >= 99.9% + Single Node → "Underengineering"
   │   └─ Devuelve: array de challenges (0 a 3)
   │
   ├─ FASE 3: GENERATION
   │   ├─ Lee src/templates/sdd/architecture-review-template.md
   │   ├─ Interpola: {{CHALLENGES}}, {{NFR_COMPLIANCE}}, {{NFR_CONCURRENCY}},
   │   │            {{NFR_SENIORITY}}, {{NFR_BUDGET}}, {{NFR_SLA}}
   │   ├─ Crea .agents/prompts/architecture-review.md
   │   └─ Output: "Levanta un agente y apúntalo a .agents/prompts/architecture-review.md"
   │
   └─ EXIT CODE
       ├─ challenges > 0 → exit(1)
       └─ challenges = 0 → exit(0)
```

---

## 3. El assessment template

El archivo `docs/architecture-assessment.md` tiene frontmatter + secciones de texto libre:

```yaml
---
budget: 0              # USD/mes
rps: 0                 # requests per second
sla: 0.0               # porcentaje (ej. 99.9)
redundancy: "Single Node"  # Single Node / Multi-AZ / Multi-Region
db_tech: "SQLite"      # SQLite / PostgreSQL / MongoDB / etc.
infra_tech: "VPS"      # VPS / K8s / EKS / Vercel / etc.
compliance: "None"     # None / GDPR / HIPAA / PCI / SOX
team_seniority: "Junior"  # Junior / Semi-Senior / Senior / DevOps Dedicado
---

# Architecture Assessment

## 1. Descripción General
[Escribir aquí]

## 2. Componentes Clave
[Escribir aquí]

## 3. Non-Functional Requirements (NFRs)
- **Compliance & Data Residency:** [Detallar]
- **Expected Peak Concurrency:** [Carga máxima]
- **Team Seniority / Capabilities:** [Capacidades]
- **Hosting Budget:** [Límite mensual]
- **SLA & Redundancy:** [Disponibilidad]

## 4. Restricciones y Supuestos
[Escribir aquí]
```

**Nota**: Los valores del frontmatter son **defaults vacíos** (budget:0, rps:0). Si el usuario no los cambia, el assess los evalúa como si fueran estimaciones reales — esto es un problema conocido (RFC `008`).

---

## 4. Las 3 reglas estáticas

| # | Regla | Condición | Challenge generado |
|---|---|---|---|
| 1 | **Budget vs Infra (Overengineering)** | `budget < 50` AND (`infra_tech` incluye "k8s" o "kubernetes") | "Justifica cómo planean costear y mantener un clúster con ese presupuesto" |
| 2 | **RPS vs DB (Cuello de Botella)** | `rps > 1000` AND `db_tech` incluye "sqlite" AND NO menciona sharding/réplica | "Los RPS esperados son muy altos para SQLite sin estrategia de sharding" |
| 3 | **SLA vs Redundancia (Underengineering)** | `sla >= 99.9` AND `redundancy` es "single node" | "Cualquier downtime o deploy invalida este SLA" |

---

## 5. Lo que produce

Genera `.agents/prompts/architecture-review.md` — un prompt para agente de IA con:

```markdown
# Challenge Pack de Arquitectura

## Contexto del Proyecto (NFRs Extraídos)
- **Compliance:** GDPR
- **Concurrency:** 500 rps
- **Seniority:** Junior
- **Budget:** $30/mes
- **SLA:** 99.9%

## Challenges Detectados por el CLI
- **SLA vs Redundancia (Underengineering):** El SLA esperado es >= 99.9% pero
  la redundancia es 'Single Node'. Cualquier downtime o deploy invalida este SLA.

## Tono y Comportamiento Esperado
1. Devil's Advocate: Cruza los NFRs en busca de inconsistencias invisibles
2. Curiosidad sobre Juicio: Pregunta POR QUÉ tomaron esa decisión
3. Enfoque en Trade-offs: Propón alternativas con pros/contras
4. Pragmatismo sobre Purismo: Entiende el contexto del proyecto
```

El agente debe llegar a un acuerdo o documentar el riesgo aceptado en `ORCHESTRATOR-STATE.md`.

---

## 6. Problemas identificados

| # | Problema | Severidad | Detalle |
|---|---|---|---|
| 1 | **Solo 3 reglas estáticas** | Alta | Hay combinaciones peligrosas no cubiertas: HIPAA+Vercel, Junior+K8s, Compliance+Serverless. RFC `008` ya las identificó |
| 2 | **Defaults ciegos pasan silenciosamente** | Alta | budget:0, rps:0, sla:0.0 son valores por defecto del template. Si el usuario no los cambia, el assess los evalúa como reales. RFC `008` propone fallar si siguen en default |
| 3 | **Interpolación con `.replace()` simple** | Media | Si la variable aparece más de una vez en el template, solo reemplaza la primera. RFC `008` propone regex global |
| 4 | **El template review es genérico** | Media | No incluye los datos de los canvases (PROJECT-CANVAS/INFRA-CANVAS), solo el frontmatter del assessment |
| 5 | **No hay headless mode** | Baja | El assess es enteramente no-interactivo (lee archivo, evalúa, genera output), pero no tiene flags para automatización |
| 6 | **Exit code confuso** | Baja | exit(1) cuando hay challenges, pero el mensaje dice "✅ Evaluación local completa" — contradicción visual |

---

## 7. Relación con los RFCs de costos

| RFC | Qué propone | Estado |
|---|---|---|
| `001-assessment-guide-proposal.md` | Guía de llenado para el assessment con explicación de NFRs | Propuesto, no implementado |
| `008-arch-readiness-feedback.md` | Más reglas estáticas, prevenir defaults ciegos, regex global | Propuesto, no implementado |
| `1.13.1-idea.md` | Separar constraints en ARCHITECTURE-CONSTRAINTS.md | Propuesto, no implementado |
| `recomendaciones.md` | assess SIEMPRE debe generar review IA (no solo cuando fallan reglas) | Recomendado, no implementado |

---

## 8. Datos clave del código

| Archivo | Función |
|---|---|
| `funky-cli/src/commands/assess.js` | Commando principal (76 líneas) |
| `funky-cli/src/utils/assessRules.js` | 3 reglas estáticas de validación (35 líneas) |
| `funky-cli/src/templates/sdd/architecture-assessment.md` | Template del assessment con frontmatter |
| `funky-cli/src/templates/sdd/architecture-review-template.md` | Template del prompt para agente IA |
