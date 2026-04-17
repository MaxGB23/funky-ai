# âš¡ GuÃ­a RÃ¡pida: Flujo de Trabajo "Funky AI"

**Para el Equipo de Desarrollo:**
Funky AI es una disciplina de trabajo para modelos pesados (Gemini Pro) en entornos sin automatizaciÃ³n de sub-agentes. Vos sos el **Router Humano**.

---

## ðŸ§  Conceptos Core
Consultar pilares y definiciones en [funky-ai.md](./funky-ai.md).

1. **Disco Duro:** Base de datos de persistencia en `docs/openspec/`.
2. **Orquestador:** Chat de planificaciÃ³n (PM). Prohibido codificar aquÃ­.
3. **Worker:** Chat virgen para ejecuciÃ³n tÃ©cnica. Se elimina tras cumplir la tarea.

---

## ðŸ›¤ï¸ El Flujo Paso a Paso

### 1. PlanificaciÃ³n (Orquestador)
1. Abrir chat "Orquestador".
2. Cargar contexto: `@ORCHESTRATOR-STATE.md`.
3. Ejecutar comandos SDD (ej. `/sdd-explore`, `/sdd-propose`).
4. Generar archivos fÃ­sicos: `explore.md`, `proposal.md`, `tasks.md`.

### 2. DelegaciÃ³n (Worker)
1. Abrir **NUEVO CHAT** vacÃ­o.
2. Inyectar tarea: `@tasks.md` + *"EjecutÃ¡ Paso X y generÃ¡ reporte"*.
3. El Worker realiza el Memory Polling autÃ³nomo (Internal Rules).
4. Generar reporte fÃ­sico ("Return Envelope"): `status`, `summary`, `artifacts`, `risks`.

### 3. SincronizaciÃ³n (Cierre)
1. **Borrar Chat Worker** inmediatamente.
2. Volver al **Chat Orquestador**.
3. Cargar reporte: `@report.md` + *"Paso completado. ActualizÃ¡ estado"*.

---

## ðŸš€ Workflow V1.2: CLI & Slash Commands
Uso de tÃ¡ndem Consola-Chat para pre-acondicionamiento psicolÃ³gico:

1. **Consola:** `funky phase [phase_name]` âž” Genera template `.md`.
2. **Chat:** `/sdd-[phase]` âž” Inyecta contexto psicolÃ³gico + `@template.md`.

---

## âš–ï¸ Matriz de DecisiÃ³n

| Tarea | Entorno | RazÃ³n |
| :--- | :--- | :--- |
| **Bugfixes, CRUD** | **VS Code (Auto)** | Bajo costo cognitivo. AutomatizaciÃ³n total. |
| **Scaffolding, Tests** | **VS Code (Auto)** | Velocidad y simplicidad. |
| **Refactors Core** | **Funky AI (Manual)** | Requiere IQ Gemini Pro. Evita alucinaciones. |
| **AuditorÃ­as / AST** | **Funky AI (Manual)** | Manejo masivo de tokens y contexto. |

**Regla:** Usar automatizaciÃ³n hasta que falle. Ante error lÃ³gico o alucinaciÃ³n âž” Migrar a Funky AI (Antigravity).

---

## ðŸš« Reglas de Oro (Golden Rules)

- âŒ Prohibido: Hilos gigantes (degradaciÃ³n de contexto).
- âŒ Prohibido: Reciclar Workers para tareas distintas.
- âŒ Prohibido: Arreglos silenciosos (todo bug va al reporte).
- âœ… Obligatorio: Bajar todo conocimiento a Markdown.
- âœ… Obligatorio: Actualizar `ORCHESTRATOR-STATE.md` al cerrar sesiÃ³n.
