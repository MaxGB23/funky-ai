---
Worker: PATCH-F
Estado: ✅ Completado
Fecha: 2026-04-16
---

# Return Envelope — PATCH-F

## Archivos Creados

- `.agents/skills/sdd-proposal.md` — Primer Skill del ecosistema Funky AI. Template PRD-style con frontmatter `trigger: manual`, bloque de instrucciones al agente (Parte A) y template copiable en bloque de código (Parte B).

## Bugs Encontrados

- **Memory Polling — grep no matcheó**: El grep sobre `docs/post-mortem.md` buscando `sdd-proposal` y `proposal-sin-estado` retornó vacío. El motivo: el post-mortem usa el formato `### [discovery][proposal-sin-estado]` con el topic_key embebido inline en el heading H3 — no como campo separado. El grep por substring exacto no matchea porque el texto `[discovery][proposal-sin-estado]` vive al inicio de la línea 15 junto a la descripción. **No es un bloqueante** — el contenido fue localizado vía `view_file` y el anti-patrón fue correctamente referenciado. Sin embargo, esto revela que el Memory Polling debería usar `IsRegex: true` con el patrón `\[discovery\]\[proposal-sin-estado\]` para ser robusto contra ese formato.

## Notas de Diseño

### Decisión de Frontmatter: `trigger: manual`
Los Rules usan `trigger: model_decision` o `trigger: glob` porque se activan automáticamente por contexto o por detección de archivos. Los Skills son diferentes: son contratos de ejecución que el Orquestador delega explícitamente al Worker en el brief. Usar `trigger: manual` comunica esa semántica con precisión — este Skill no debe auto-activarse, debe ser citado en el prompt de delegación.

### Estructura del Skill: Dos partes diferenciadas
- **Parte A (instrucción al agente)**: Prosa técnica con campos obligatorios/opcionales y Audit Check. El receptor es el agente, no el humano.
- **Parte B (template copiable)**: Bloque de código markdown listo para `cp` o paste directo. Sin prosa, sin explicaciones — solo la estructura.

Esta separación evita que el agente mezcle "entender el Skill" con "ejecutar el template".

### Referencia al anti-patrón
El Skill cita explícitamente `[discovery][proposal-sin-estado]` de `docs/post-mortem.md` en su sección de "Contexto e Intención", cumpliendo el contrato de trazabilidad del ecosistema Funky AI.
