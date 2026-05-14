# Proposal: Arquitectura de Agentes v2.0.0 (Rediseño de Configuración)

## 1. Contexto
Basado en la exploración, implementaremos la **Opción B (Arquitectura de 3 Capas)** para eliminar la sobrecarga cognitiva (*Context Dilution*) de los agentes. Esto transformará cómo se inyectan las instrucciones al modelo, pasando de un prompt global masivo a un sistema donde el tono es global, las reglas del workspace son condicionales, y los roles operativos (Orquestador, Worker) se fragmentan en Workflows invocables bajo demanda.

## 2. Decisiones Técnicas

| Área | Decisión | Justificación Corta |
|------|----------|---------------------|
| **Capa 1: Global** | Token Diet extrema. Solo Tono y Personalidad (Rioplatense, filosofía, senior architect). | Garantiza consistencia en toda interacción sin inflar el contexto con lógicas operativas. |
| **Capa 2: Workspace Rules** | División del `sdd-orchestrator.md` masivo en partes referenciables. | Evitar cargar todas las reglas del Orquestador si solo se va a ejecutar una acción puntual. |
| **Capa 3: Workflows On-Demand** | Migrar los roles operativos a Workflows Antigravity (`/orchestrator`, `/worker`). | Aislamiento perfecto. El modelo lee exactamente las reglas de su rol actual y nada más. |
| **Delegación Handoff** | Reemplazar "Ejecutá la Fase N" por un comando tipo slash: `/worker-execute <ruta/al/handoff>`. | Aprovecha los triggers nativos de Workflows de Antigravity, forzando la inyección del contexto correcto en el nuevo chat. |

## 3. Stack / Scope
**Mapeo de Capas (Scope de esta task):**
- **Global:** Refactor de `GEMINI-funky-global.md`
- **Workspace:** Limpieza y fragmentación de `.agents/rules/*.md`
- **Workflows:** Creación de los archivos en `~/.gemini/antigravity/global_workflows/` para Orquestador y Worker.

**Fuera de Scope (Non-Goals):**
- **Comando `funky setup` / `funky prompt`:** La inyección automática de estos Workflows al entorno del desarrollador se reserva para la **Task 011** (Bootstrap de Prompts).

## 4. Riesgos
- **Rompimiento de Templates CLI:** Al cambiar el texto de delegación, tenemos que actualizar los templates canónicos (`.agents/templates/sdd/worker-handoff.md` y `funky-cli/src/templates/sdd/worker-handoff.md`).

> **[SISTEMA - PARA EL ORQUESTADOR]** Si la propuesta es aprobada, procedé a generar el `sdd-spec.md` y luego el `sdd-tasks.md`.
