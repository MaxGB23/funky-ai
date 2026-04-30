# ⚡ Guía Rápida: Flujo de Trabajo "Funky AI"

**Para el Equipo de Desarrollo:**
Funky AI es una disciplina de trabajo para modelos pesados (Gemini Pro) en entornos sin automatización de sub-agentes. Vos sos el **Router Humano**.

---

## 🧠 Conceptos Core
Consultar pilares y definiciones en [funky-ai.md](./funky-ai.md).

1. **Disco Duro:** Base de datos de persistencia en `docs/openspec/`.
2. **Orquestador:** Chat de planificación (PM). Prohibido codificar aquí.
3. **Worker:** Chat virgen para ejecución técnica. Se elimina tras cumplir la tarea.

---

## 🛤️ El Flujo Paso a Paso

### 1. Planificación (Orquestador)
1. Abrir chat "Orquestador".
2. Cargar contexto: `@ORCHESTRATOR-STATE.md`.
3. Usar el CLI `funky phase [phase]` + Chat (`/sdd-[phase]`).
4. Generar archivos físicos: `sdd-explore.md`, `sdd-proposal.md`, `sdd-tasks.md`.

### 2. Delegación (Worker)
1. Abrir **NUEVO CHAT** vacío.
2. Inyectar tarea: `@tasks.md` + *"Ejecutá Paso X y generá reporte"*.
3. El Worker realiza el Memory Polling autónomo (vía .agents/rules/engram-protocol.md).
4. Generar reporte físico ("Return Envelope"): status, executive_summary, artifacts, next_recommended, risks.

### 3. Sincronización (Cierre)
1. **Borrar Chat Worker** inmediatamente.
2. Volver al **Chat Orquestador**.
3. Cargar reporte: `@report.md` + *"Paso completado. Actualizá estado"*.

---

## 🚀 Workflow V1.2: CLI & Slash Commands
Uso de tándem Consola-Chat para pre-acondicionamiento psicológico:

1. **Consola:** `funky phase [phase_name]` ➔ Genera template `.md`.
2. **Chat:** `/sdd-[phase]` ➔ Inyecta contexto psicológico + `@template.md`.

---

## ⚖️ Matriz de Decisión

| Tarea | Entorno | Razón |
| :--- | :--- | :--- |
| **Bugfixes, CRUD** | **VS Code (Auto)** | Bajo costo cognitivo. Automatización total. |
| **Scaffolding, Tests** | **VS Code (Auto)** | Velocidad y simplicidad. |
| **Refactors Core** | **Funky AI (Manual)** | Requiere IQ Gemini Pro. Evita alucinaciones. |
| **Auditorías / AST** | **Funky AI (Manual)** | Manejo masivo de tokens y contexto. |

**Regla:** Usar automatización hasta que falle. Ante error lógico o alucinación ➔ Migrar a Funky AI (Antigravity).

---

## 🚫 Reglas de Oro (Golden Rules)

- ❌ Prohibido: Hilos gigantes (degradación de contexto).
- ❌ Prohibido: Reciclar Workers para tareas distintas.
- ❌ Prohibido: Arreglos silenciosos (todo bug va al reporte).
- ✅ Obligatorio: Bajar todo conocimiento a Markdown.
- ✅ Obligatorio: Actualizar `ORCHESTRATOR-STATE.md` al cerrar sesión.
