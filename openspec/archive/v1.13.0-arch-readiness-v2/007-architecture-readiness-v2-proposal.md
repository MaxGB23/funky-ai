# Proposal: Architecture Readiness Gate v2 (Context Expansion)

**Estado:** 🟡 DRAFT (En definición)
**Autor:** Orquestador / Humano
**Fecha:** 2026-05-03

---

## 1. Contexto y Problema
En la versión 1.12.0 se introdujo la primera iteración de la **Architecture Readiness Gate** (`funky assess`). Si bien cumple su función validando inconsistencias obvias (ej. Presupuesto vs Infra), el template actual (`architecture-assessment.md`) es demasiado superficial.
Un LLM Orquestador necesita un contexto hiper denso (Garbage In, Garbage Out) para realizar una crítica arquitectónica real. Sin campos específicos sobre NFRs (Non-Functional Requirements) críticos, la IA no puede juzgar tradeoffs complejos como "Vercel vs VPS para datos gubernamentales".

Además, actualmente `funky assess` solo genera un prompt de review si la validación por reglas del CLI falla. Esto asume que si el código pasa la heurística dura, está bien. Pero el CLI es solo un filtro rápido; la auditoría real y debate arquitectónico **siempre** debe ocurrir con la IA.

## 2. Propuesta de Solución
Refactorizar el template y el comando para la versión 1.13.0:

### A. Expansión del Template (`architecture-assessment.md`)
Ampliar los campos obligatorios para obligar al humano a transpirar en la etapa de planeación. Campos a incorporar:
- **Compliance / Data Residency:** ¿Maneja datos críticos (médicos, gubernamentales, bancarios)? ¿Debe residir en una región específica? (Dicta el Hosting).
- **Expected Peak Concurrency:** Carga máxima (RPS/usuarios) en el peor escenario.
- **Team Seniority:** Nivel de experiencia del equipo (Dicta si usar PaaS como Vercel o Clusters complejos como K8s).
- **Hosting Budget:** Límite monetario realista por mes.
- **SLA / Redundancy:** Expectativa de uptime (99.9%) y estrategia de redundancia.

### B. Refactor de `funky assess`
Modificar la lógica en `funky-cli/src/commands/assess.js`:
- Seguirá evaluando las reglas duras implementadas en v1.12.0.
- **Cambio Estructural:** Independientemente de si las reglas del CLI fallan (exit code 1) o pasan invictas (exit code 0), el comando **SIEMPRE** generará el archivo `.agents/prompts/architecture-review.md`.
- Si hay "Challenges" del CLI, el prompt le pedirá a la IA que se ensañe con ellos. Si no los hay, le pedirá a la IA que busque puntos ciegos.

### C. Sinergia con la Feature 002 (Project Cost Estimator)
Toda esta densidad de información (Seniority, Compliance, Budget) es el insumo directo para la futura **Calculadora de Presupuestos**. El Assessment pasa a ser el corazón financiero y técnico del proyecto.

## 3. Criterios de Éxito (DoD)
- ✅ `funky-cli/src/templates/sdd/architecture-assessment.md` expandido con los nuevos NFRs.
- ✅ `funky assess` genera el prompt de review de IA sistemáticamente, sin importar el éxito de las reglas locales.
- ✅ Tests unitarios de `assess.js` actualizados y en verde.
- ✅ Smoke Test en directorio virgen para validar que el prompt se genere con los valores expandidos.
