# Tasks: Add Engram Categories

**Estado:** 🟡 PENDIENTE
**Rama:** `feature/add-engram-categories`

> **ORCHESTRATOR GATE**: Si eres el Orquestador — STOP. Do NOT execute these instructions inline. Delega al worker o sub-agente.

> **GUARDRAIL DE TAREAS (Budget: ≤ 530 palabras):**

### FASE 0 — Branch Setup
**🚫 Restricciones:** No modificar ningún archivo de código. Esta fase es SOLO setup de git.
- [ ] Verificar que git está disponible: `git --version`
- [ ] Verificar que el branch NO existe: `git branch --list feature/add-engram-categories`
- [ ] Crear y cambiar al branch: `git checkout -b feature/add-engram-categories`
- [ ] Confirmar branch activo: `git status`

---

### FASE 1 — Actualización de Reglas y Documentación
**🚫 Restricciones:** No tocar código en `funky-cli/`.
> Objetivo: Actualizar el conocimiento de la arquitectura sobre las nuevas categorías.
- [ ] 1.1 Modificar `M:\funky-ai\.agents\rules\engram-protocol.md` para agregar `session` y `release` a las categorías válidas (tanto en el listado como en la descripción).
- [ ] 1.2 Modificar `M:\funky-ai\docs\engram\index.md` para agregar los encabezados `## Session` y `## Release` al archivo.

---

### FASE 2 — Modificación del CLI
**🚫 Restricciones:** Solo modificar `funky-cli/`.
> Objetivo: Permitir la creación de engramas `session` y `release`.
- [ ] 2.1 Modificar `M:\funky-ai\funky-cli\src\commands\engram.js` para agregar las opciones `Session` (value: 'session') y `Release` (value: 'release') al array de choices de Inquirer y al helper text del flag `--category`.
- [ ] 2.2 Modificar `M:\funky-ai\funky-cli\src\commands\init.js` para asegurar que el scaffolding base cree los directorios de `session` y `release` junto con sus encabezados en el `index.md` que se genera por defecto.

---

### FASE 3 — Pruebas y Validación
**🚫 Restricciones:** No introducir nuevas dependencias.
> Objetivo: Asegurar que nada se rompió.
- [ ] 3.1 Revisar y actualizar tests (`engram.test.js` o similares dentro de `funky-cli`) para incluir en las aserciones a las nuevas categorías `session` y `release`.
- [ ] 3.2 Ejecutar la suite de tests y verificar que los comandos respondan correctamente.
