# Proposal: 012-b — Comando `funky gentle <feature>`

## 1. Contexto
El flujo SDD estándar de Funky AI (Tier 1–3) es suficiente para el 90% de las tareas. Sin embargo, carece de granularidad para tareas hipercríticas donde un solo Worker pensar en demasiadas dimensiones simultáneas genera alucinaciones lógicas. Esta feature implementa el **Tier 4 (Gentle SDD)**: un pipeline de 7 roles hiper-aislados, cada uno con un `<system_prompt>` que bloquea explícitamente salirse de su responsabilidad.

El entrypoint del Tier 4 es el comando CLI `funky gentle <feature>`, en honor al framework Gentle AI que inspiró esta arquitectura.

## 2. Decisiones Técnicas

| Área | Decisión | Justificación |
|---|---|---|
| **Estructura del comando** | Comando nuevo `gentle.js`, independiente de `feature.js` | SRP — no contaminar el flujo estándar con lógica de Tier 4 |
| **Pattern de implementación** | Clon estructural de `runFeature()` con 3 parámetros distintos | Blueprint probado, testeable, mismo contrato de retorno |
| **Golden templates** | `.agents/templates/gentle/` (workspace-specific) | Consistente con el patrón establecido: workspace customiza, CLI provee fallback |
| **Fallback templates** | `funky-cli/src/templates/gentle/` | Garantiza que el comando funcione en repos sin `.agents/templates/gentle/` |
| **Destino del scaffolding** | `docs/openspec/gentle/<name>/` | Separado de `changes/` para distinguir flujo estándar de flujo hipercrítico visualmente |
| **Naming de templates** | Prefijo numérico `01-` … `07-` | Fuerza el orden secuencial del pipeline — el humano no puede confundir el flujo |

## 3. Scope

**En scope:**
- Comando `funky gentle <name>` con golden/fallback pattern
- 7 templates con `<system_prompt>` bloqueantes por rol
- Test unitario `gentle.test.js` (4 casos, mirror de `feature.test.js`)
- Registro en `bin/funky.js`
- Doc-Ops: README CLI, `funky-ai.md` (tabla de Tiers), `guia-flujo-completo.md`
- Ampliar `templates.test.js` para cubrir los 7 nuevos templates

**Fuera de scope (Non-Goals):**
- Integración automática entre fases (el humano es el router, siempre)
- Validación de que los templates se llenaron antes de pasar al siguiente rol
- GUI o wizard interactivo
- Modificación de `funky feature` o cualquier otro comando existente

## 4. Riesgos

| Riesgo | Mitigación |
|---|---|
| Drift golden ↔ fallback | Ampliar script `pretest` de sync para incluir `src/templates/gentle/` |
| Tests que mienten (cuentan menos de 7 `copyFileSync`) | El test debe asertir `toHaveBeenCalledTimes(7)` explícitamente |
| Templates demasiado restrictivos que bloqueen al LLM | Probar cada template en una sesión real post-implementación y ajustar tono |

> **[SISTEMA - PARA EL ORQUESTADOR]** Propuesta aprobada → sobrescribir `tasks.md`. Prerequisito: leer `.agents/templates/sdd/tasks.md` antes de generar.
