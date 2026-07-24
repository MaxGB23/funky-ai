# Flujo: `funky estimate`

> Documentación del comando `funky estimate` — estimación de costos y pricing basado en los canvases del proyecto.

---

## 1. Propósito

`funky estimate` cruza la data técnica de los canvases (PROJECT-CANVAS + INFRA-CANVAS) con factores contextuales (región, tamaño, urgencia) para calcular un **"Piso Base"** de pricing y generar un prompt de mentoría de **Value-Based Pricing**.

**Dependencia**: Requiere que `funky init --template` ya haya sido ejecutado y los canvases estén llenos.

---

## 2. Flujo completo

```
USUARIO
   │
   ├─ funky estimate
   │
   ├─ FASE 1: EXTRACTION
   │   ├─ Lee PROJECT-CANVAS.md
   │   ├─ Lee INFRA-CANVAS.md
   │   ├─ Parsea por secciones (## Title → value)
   │   └─ Devuelve: { project: { framework: "Next.js...", ... }, infra: { database: "Prisma", ... } }
   │
   ├─ FASE 2: INTERACTIVE (@inquirer/prompts)
   │   ├─ select: "¿Región / Poder adquisitivo?" → LATAM / US/EU
   │   ├─ select: "¿Tamaño de la empresa?" → Startup / Enterprise
   │   └─ select: "¿Urgencia del proyecto?" → Normal / Alta (Rush)
   │
   ├─ FASE 3: CALCULATION
   │   ├─ complexityScore = contar keys del canvas (no contenido)
   │   │   ├─ >10 keys → score 3
   │   │   ├─ >5 keys → score 2
   │   │   └─ <=5 keys → score 1
   │   ├─ basePrice = 1000 × score × region × size × urgency
   │   └─ riskLevel = Alto/Medio/Bajo según scores
   │
   ├─ FASE 4: GENERATION
   │   └─ Crea docs/pricing-analysis.md con:
   │       ├─ Factores contextuales ingresados
   │       ├─ Factores técnicos extraídos (JSON crudo)
   │       ├─ Cálculo base con multiplicadores
   │       └─ Prompt de mentoría para Value-Based Pricing
   │
   └─ Output: "💰 Piso Base Calculado: $X,XXX USD"
```

---

## 3. Fórmula de cálculo

```javascript
basePrice = 1000 × complexityScore × regionMultiplier × sizeMultiplier × urgencyMultiplier
```

| Variable | Valores | Multiplier |
|---|---|---|
| `complexityScore` | <=5 keys | x1 |
| | 6-10 keys | x2 |
| | >10 keys | x3 |
| `region` | LATAM | x1 |
| | US/EU | x3 |
| `size` | Startup / Pyme | x1 |
| | Enterprise | x2 |
| `urgency` | Normal | x1 |
| | Alta (Rush) | x1.5 |

**Ejemplos:**

| Escenario | Score | Region | Size | Urgency | Piso Base |
|---|---|---|---|---|---|
| Proyecto simple, LATAM, startup, normal | 1 | x1 | x1 | x1 | **$1,000** |
| Proyecto completo, LATAM, startup, rush | 2 | x1 | x1 | x1.5 | **$3,000** |
| Proyecto completo, US/EU, enterprise, rush | 3 | x3 | x2 | x1.5 | **$27,000** |

---

## 4. Lo que produce

Genera `docs/pricing-analysis.md` con esta estructura:

```markdown
# Análisis de Estimación y Pricing

## 1. Registro de Datos

### Factores Contextuales (Ingresados)
- **Región / Poder Adquisitivo:** LATAM
- **Tamaño de la Empresa:** Startup
- **Urgencia del Proyecto:** Normal

### Factores Técnicos (Extraídos del Canvas)
- **Complejidad Base (Score):** 2
- **Riesgo Identificado:** Medio

```json
{ "project": { "Framework Base": "Next.js (App Router)", ... }, "infra": { ... } }
```

## 2. Cálculo Base Orientativo

- **Piso Base Calculado:** $2,000 USD
- **Multiplicadores Aplicados:**
  - Región: x1
  - Tamaño: x1
  - Urgencia: x1

> *Nota: Este piso es puramente orientativo y representa el costo de producción + un margen de seguridad inicial.*

## 3. Prompt de Mentoría (Value-Based Pricing)

> [SISTEMA - INSTRUCCIÓN PARA LA IA]
> Sos un Mentor Experto en Ventas B2B y Value-Based Pricing...
> Preguntá:
> 1. ¿Cuál es el impacto de negocio que esta herramienta le va a generar al cliente?
> 2. Basado en ese impacto, ¿cómo podemos ajustar este "Piso Base" para cobrar por el VALOR?
```

---

## 5. Problemas identificados

| # | Problema | Severidad | Detalle |
|---|---|---|---|
| 1 | **Complexity scoring es por cantidad de secciones, no por contenido** | Alta | Cuenta keys del canvas, no analiza si elegiste Vercel (barato) o K8s (caro). 9 secciones = score 2 siempre |
| 2 | **Fórmula demasiado simplista** | Alta | `1000 × score` no refleja realidad. Un proyecto con Prisma + Next.js + Auth no cuesta lo mismo que React + Vite solo |
| 3 | **Usa `@inquirer/prompts` en vez de `@clack/prompts`** | Media | Inconsistencia con el resto del CLI (init usa clack) |
| 4 | **No hay headless mode** | Media | Solo prompts interactivos, no soporta flags para automatización de agentes |
| 5 | **Canvas parsing es frágil** | Media | Parsea por `## ` split + regex. Si el canvas tiene formato irregular, falla silenciosamente |
| 6 | **No hay validación de canvas completos** | Baja | Si los canvases tienen "No definido / Pendiente", el cálculo usa esos strings como keys válidas |
| 7 | **El prompt de mentoría es genérico** | Baja | No usa los datos extraídos del canvas para personalizar las preguntas de pricing |

---

## 6. Relación con los RFCs de costos

| RFC | Qué propone | Relación con estimate |
|---|---|---|
| `001-assessment-guide-proposal.md` | Guía de NFRs con rangos de budget, RPS, SLA | Podría enriquecer los factores técnicos con NFRs reales en vez de contar keys |
| `008-arch-readiness-feedback.md` | Prevenir defaults ciegos (budget:0, rps:0) | estimate no valida que los canvases tengan datos reales |
| `1.13.1-idea.md` | ARCHITECTURE-CONSTRAINTS.md como capa de constraints | Los constraints (presupuesto, SLA, team) alimentarían un estimate mucho más preciso |
| `recomendaciones.md` | "context.json" como output reutilizable | estimate genera pricing-analysis.md, pero no un JSON estructurado que otros comandos puedan consumir |

---

## 7. Datos clave del código

| Archivo | Función |
|---|---|
| `funky-cli/src/commands/estimate.js` | Commando principal (188 líneas) |
| `runEstimateExtraction()` | Parsea canvases y extrae factores técnicos |
| `calculateEstimate()` | Fórmula de pricing |
| `generatePricingMarkdown()` | Genera el markdown de output |
| `bin/funky.js:8,24` | Import y registro del commando |
