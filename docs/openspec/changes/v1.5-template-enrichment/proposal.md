# Proposal: v1.5 — SDD Template Enrichment + CLI README

**Feature:** `v1.5-template-enrichment`
**Fecha:** 2026-04-19
**Rama:** `feature/v1.5-template-enrichment`
**Origen:** Gaps detectados post-release v1.4 durante testing del flujo completo.

---

## 1. Contexto

Tras lanzar la v1.4 y redactar la guía de flujo completo (`docs/funky-ai/guia-flujo-completo.md`), se detectaron dos inconsistencias críticas:

1. **Los templates SDD son esqueletos vacíos.** `funky phase worker-handoff` genera un archivo de 14 líneas que no incluye las secciones reales del protocolo (Memory Polling, Reglas de Ejecución, Return Envelope). La plantilla canónica oficial tiene 83 líneas.

2. **El CLI no tiene README.** Alguien que llegue al repo no puede instalar ni usar `funky` sin leer el código fuente.

3. **Uso de Conocimiento (Doc-Ops).** Los Workers carecen de una jerarquía estricta para resolver dudas de librerías. Corren el riesgo de alucinar APIs o abusar de `context7`, quemando tokens innecesariamente, en vez de priorizar Skills locales.

Los tres gaps fueron registrados en `docs/engram/discoveries.md`.

---

## 2. Decisiones Técnicas

### Gap 1: Templates SDD thin

| Opción | Descripción | Tradeoff |
|--------|-------------|----------|
| A — Reemplazar archivos | Sobreescribir los 5 templates en `src/templates/sdd/` con versiones enriquecidas | ✅ Simple. ⚠️ Rompe proyectos existentes que ya generaron el template si hay un `funky phase` update |
| B — Versionar templates | Mantener la versión thin y crear una versión `-full` alternativa | ❌ Complejidad innecesaria para esta escala |
| C — Enriquecer + guideline en Orquestador | Sobreescribir templates Y documentar en la guía que el Orquestador siempre debe personalizar el worker-handoff | ✅ Mejor UX + educación |

**Decisión: Opción C.** Sobreescribir los 5 templates con versiones completas que sean guías reales, no esqueletos. La guía de flujo ya establece que el Orquestador personaliza la sección "La Misión".

### Gap 2: README del CLI

Un solo `README.md` estándar con:
- Qué es Funky AI CLI
- Prerequisitos (`pnpm setup`)
- Instalación (`pnpm link --global`)
- Comandos disponibles con ejemplos
- Estructura de archivos que genera

### Gap 3: Doc-Ops y Context7
Establecemos una "Jerarquía de Conocimiento":
1. Prioridad 1: `.agents/skills/` (Local, estandarizado, barato).
2. Prioridad 2: MCP `context7` (Solo si no hay Skill o hay dudas de API).
3. Extracción: Si `context7` genera un patrón útil, se extrae a una nueva Skill.

**Decisión:** Inyectar esta jerarquía como regla dura (`Jerarquía de Conocimiento (Doc-Ops)`) en `plantilla-worker-handoff.md` y `funky-cli/src/templates/sdd/worker-handoff.md`.

---

## 3. Stack / Scope

- Solo archivos Markdown y texto plano.
- No hay cambios de código JS en esta feature.
- Afecta: `funky-cli/src/templates/sdd/` (5 archivos) + `funky-cli/README.md` (nuevo).

---

## 4. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Sobreescribir templates rompe proyectos en vuelo que ya usaron `funky phase` | Bajo impacto: los archivos generados ya están en el proyecto del usuario, no se actualizan automáticamente. Solo afecta futuros `funky phase`. |
| El README queda desactualizado con el tiempo | Agregar al DoD de releases futuras: "¿README actualizado?" |
