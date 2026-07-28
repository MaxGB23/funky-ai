# Relación: `funky estimate` ↔ `funky assess`

> Estos dos comandos son caras de la misma moneda. Uno evalúa la arquitectura, el otro pricea el proyecto. No tienen sentido separados.

---

## El problema actual

Hoy existen como islas:

```
funky assess  →  evalúa arquitectura, genera challenges
funky estimate →  calcula precio con fórmula simple
```

El estimate **no sabe** qué encontró el assess. El assess **no sabe** cuánto cuesta lo que detectó. Están desconectados.

---

## La relación real

**Para cobrar un proyecto, necesitas entender:**

1. **Qué se está construyendo** → canvases (PROJECT-CANVAS + INFRA-CANVAS)
2. **Qué tan complejo es realmente** → assess (challenges, incompatibilidades, NFRs)
3. **Cuánto vale eso en el mercado** → estimate (pricing)

Sin el paso 2, el paso 3 es una adivinanza. La fórmula actual `1000 × score × region × size × urgency` no captura:

- Que el proyecto tiene compliance HIPAA (implica infraestructura específica, audit logs, encryption at rest)
- Que el equipo es Junior pero eligió K8s (overengineering = más horas de aprendizaje y mantenimiento)
- Que el SLA es 99.99% con Single Node (necesita Redundancy multi-AZ = más costo infra)
- Que hay incompatibilidades que requieren re-diseño (más horas de trabajo)

---

## El flujo correcto

```
funky init --template
       │
       ▼
   Llenar canvases
       │
       ▼
   funky assess ──────────────────────────────────────┐
       │                                               │
       │  Genera challenges:                           │
       │  - "HIPAA + Vercel = riesgo legal"            │
       │  - "Junior + K8s = overengineering"           │
       │  - "SLA 99.99% + Single Node = imposible"    │
       │                                               │
       ▼                                               │
   funky estimate                                      │
       │                                               │
       │  Lee canvases (factores técnicos)  ◄──────────┘
       │  Lee challenges del assess (factores de riesgo)
       │  + factores contextuales (region, size, urgency)
       │                                               │
       ▼                                               │
   pricing-analysis.md                                 │
       │                                               │
       │  Incluye:                                     │
       │  - Piso base calculado                        │
       │  - Impacto de los challenges en el precio     │
       │  - Riesgos que incrementan costo              │
       │  - Prompt de mentoría Value-Based Pricing     │
       │                                               │
       ▼                                               │
   Decisión de pricing con contexto real ◄─────────────┘
```

---

## Qué aporta cada uno al pricing

| Fuente | Qué contribute | Ejemplo |
|---|---|---|
| **Canvases** | Stack tecnológico elegido | Next.js + Prisma + Tailwind |
| **Assess NFRs** | Restricciones reales del proyecto | Budget $30/mes, SLA 99.9%, GDPR |
| **Assess challenges** | Riesgos que incrementan costo | HIPAA implica audit trails, encryption, compliance officer |
| **Assess incompatibilidades** | Trabajo extra por re-diseño | Astro + NextAuth = cambiar framework o auth |
| **Estimate context** | Mercado y urgencia | US/EU x3, Rush x1.5 |
| **Estimate formula** | Cálculo base | $1000 × score × multipliers |

---

## Ejemplo concreto

### Escenario: App de salud con compliance

**Canvases:**
- Framework: Next.js
- DB: PostgreSQL + Prisma
- Auth: Custom JWT
- Deployment: Vercel

**Assess encuentra:**
- `compliance: HIPAA` + `infra_tech: Vercel` → **挑战: riesgo legal, Vercel no cumple HIPAA nativamente**
- `budget: $50` + `sla: 99.99%` → **挑战: SLA irrealizable con ese presupuesto**
- `team_seniority: Junior` + `compliance: HIPAA` → **挑战: compliance requiere seniority mínimo**

**Sin assess**, el estimate calcula:
```
$1000 × 2 (10 keys) × 1 (LATAM) × 1 (Startup) × 1 (Normal) = $2,000
```

**Con assess**, el estimate debería considerar:
- Cambiar de Vercel a un provider que cumpla HIPAA → +$200/mes infra
- Compliance gaps → +40h de trabajo para audit logs, encryption, BAA
- SLA irrealizable → o se reduce a 99.9% o se incrementa infra significativamente
- Junior + HIPAA → +20h de learning curve o contratar consultor

**Precio realista**: $2,000 (base) + $8,000 (compliance work) + $2,400 (riesgo) = **$12,400**

El assess reveló **$10,400 de costo invisible** que la fórmula del estimate no captura.

---

## Aspectos que el assess puede revelar y que impactan pricing

Estos son los que conocemos hoy. Iremos descubriendo más con el uso:

| Aspecto | Cómo impacta el precio |
|---|---|
| **Compliance (HIPAA, PCI, GDPR, SOX)** | Audit trails, encryption, BAA, compliance officer, infra certificada |
| **SLA alto (>=99.9%)** | Redundancy, multi-AZ, monitoring 24/7, on-call |
| **Overengineering** | Más horas de setup, mantenimiento, learning curve |
| **Underengineering** | Riesgo de re-escritura futura, deuda técnica |
| **Incompatibilidades** | Re-diseño, cambio de stack, migración |
| **Team junior + stack complejo** | Learning curve, mentoring, más tiempo de review |
| **Budget bajo + expectativas altas** | Trade-offs forzados, arquitectura subóptima con mitigaciones |
| **Integraciones múltiples** | APIs externas, webhooks, auth federado, testing de integración |

---

## Propuesta de evolución

### Fase 1 (ahora): assess genera contexto para estimate

- El estimate lee el assessment y factoriza los challenges en el cálculo
- Sin implementar reglas complejas — el prompt de mentoría ya puede preguntar sobre los challenges
            
### Fase 2 (futuro): estimate consume challenges automáticamente

- Cada challenge del assess tiene un "costo estimado" asociado
- La fórmula se enriquece: `basePrice + riskPremium + complianceCost`

### Fase 3 (futuro): pipeline integrado

```
funky init --template → llenar → funky assess → funky estimate → pricing completo
```

Un solo flujo que va de la planeación al pricing con contexto real.

---

## Conexión con los RFCs

| RFC | Relación |
|---|---|
| `001-assessment-guide-proposal.md` | La guía de NFRs enriquece los datos que alimentan ambos comandos |
| `008-arch-readiness-feedback.md` | Las reglas estáticas del assess se complementan con el pricing |
| `1.13.1-idea.md` | ARCHITECTURE-CONSTRAINTS.md alimentaría tanto assess como estimate |
| `recomendaciones.md` | "context.json" como output reutilizable que ambos comandos consumen |
