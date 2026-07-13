# Observaciones y Mejoras Pendientes: Architecture Readiness v2

**Estado:** 🔵 Para futura iteración (v1.14.0 o backlog) DESCARTADO
**Contexto:** Refinamientos sugeridos tras la validación de la Feature 007 (Architecture Readiness Gate v2).

## 1. Ampliación de Reglas Estáticas en `assessRules.js`
Actualmente el CLI extrae correctamente los nuevos NFRs (`compliance` y `team_seniority`), pero la validación estática local (`assessRules.js`) no los aprovecha. Se delega toda la crítica a la IA. 
**Mejora:** Agregar "Low-Hanging Fruits" para evitar gasto innecesario de tokens.
- **Ejemplo A:** Si `compliance` incluye "HIPAA" o "PCI" e `infra_tech` es "Vercel" o similar, levantar un warning inmediato sobre las implicaciones legales y de residencia de datos.
- **Ejemplo B:** Si `team_seniority` es "Junior" e `infra_tech` es "Kubernetes" o "EKS", arrojar un challenge instantáneo sobre la sobre-complejidad operativa.

## 2. Prevención de Defaults Ciegos (Lazy Defaults)
El frontmatter en `architecture-assessment.md` provee valores iniciales como `budget: 0` y `rps: 0`.
**Mejora:** 
- En `evaluateAssessment()`, chequear si los valores siguen siendo los defaults exactos. Si es así, fallar (exit 1) y exigirle al desarrollador que reemplace los defaults por estimaciones reales. "Zero no es una estimación válida, ponete las pilas".

## 3. Escalabilidad de Interpolación en el CLI
En `assess.js` la inyección de variables al template de IA se hace mediante `.replace('{{VAR}}', value)`.
**Mejora:**
- Reemplazar por expresiones regulares globales (ej. `.replace(/{{NFR_COMPLIANCE}}/g, metadata.compliance)`) para evitar que fallos silenciosos ocurran si en el futuro se repite la variable a lo largo del prompt.

