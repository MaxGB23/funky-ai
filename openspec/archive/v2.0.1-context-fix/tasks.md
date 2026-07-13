# Tasks: [Nombre de la Funcionalidad o Cambio]

**Estado:** 🟡 PENDIENTE
**Rama:** `feature/nombre-del-branch`
**Ref:** `sdd-proposal.md`

> **[SISTEMA - PARA EL ORQUESTADOR]** Antes de delegar la primera fase, verificá el Planning Checklist en `.agents/rules/sdd-orchestrator.md`. Generá un `worker-handoff.md` basado en `funky-cli/src/templates/sdd/worker-handoff.md`. **NO delegues mediante prompts en el chat.**

> **[SISTEMA - PREREQUISITO]** ¿Existe `sdd-spec.md` en esta misma carpeta (`docs/openspec/changes/{feature}/`)? Si **NO** existe → **PARAR. Generarlo primero.** El `tasks.md` sin `spec.md` es construir sin plano arquitectónico.

---

## ✅ Checklist de Ejecución

> **[SISTEMA — ORQUESTADOR — ENFORCEMENT]** Al completar cada ítem:
> 1. Marcarlo `[x]` en este archivo **INMEDIATAMENTE**.
> 2. Guardar el archivo al disco antes de continuar al siguiente ítem.
> Un `tasks.md` desactualizado = próxima sesión ciega. Sin excusas.

### FASE 0 — Branch Setup [T1]
> **Tier:** T1 — Git ops puras, cero ambigüedad. Delegable a Worker.

- [x] Verificar que git está disponible: `git --version` (si falla → documentar en Return Envelope y PARAR)
- [x] Verificar que el branch NO existe: `git branch --list feat/vX.Y-{name}`
- [x] Crear y cambiar al branch: `git checkout -b feat/vX.Y-{name}`
- [x] Confirmar branch activo: `git status`
- [x] Documentar en Return Envelope: branch confirmado ✅

**🚫 Restricciones:** No modificar ningún archivo de código. Esta fase es SOLO setup de git.

---

### FASE 1: Recuperación y Unificación de la Capa 2 (El Orquestador vuelve al repo)
> **Objetivo:** Consolidar toda la lógica de planificación en un único archivo gestionado por el IDE, recuperando reglas perdidas.
> **Worker Tier:** T2 (Manipulación de Markdown/Reglas)

- [ x] **1.1 Rescue Feature 012:** Recuperar la lógica exacta del "Paso 0 (Auto-Tiering)" y la "Escalation Matrix" desde `docs/openspec/archive/v1.19.0-012-auto-tiering/spec.md`.
- [ x] **1.2 Fusión de Lógica:** Tomar los Checklists y Reglas (G1/G2/G3) de `docs/openspec/archive/v2.0.0-agent-architecture/funky-orchestrator.md` y fusionarlos con la lógica rescatada (1.1) dentro del archivo definitivo: `.agents/rules/sdd-orchestrator.md`.
- [ x] **1.3 Depuración y Limpieza:** Asegurarse de que el nuevo archivo consolidado no contenga reglas del Worker. Eliminar físicamente el archivo viejo `.agents/rules/sdd-orchestrator-core.md` (evitando nombres confusos).
- [ x] **1.4 Ajuste del Trigger:** Validar que `sdd-orchestrator.md` mantenga el frontmatter `trigger: model_decision`.

---

### FASE 2: Pruebas Locales (Dogfooding en Golden Templates) [HUMANO]
> **Objetivo:** Probar el comportamiento en vivo dentro del propio repo oficial antes de tocar el código del CLI.

- [x] **2.1 Sandbox Test:** Abrir un chat en blanco y verificar que el IDE inyecte correctamente `.agents/rules/sdd-orchestrator.md`.
- [x] **2.2 Validación de Auto-Tiering:** Pedir una feature y comprobar que el Orquestador realiza el "Paso 0" y se detiene a pedir confirmación del Tier.

---

### FASE 3: Migración al Core (Fix de la Raíz del CLI)
> **Objetivo:** Una vez aprobado el comportamiento, propagar el fix al código fuente del CLI.
> **Worker Tier:** T2

- [x] **3.1 Actualizar init.js y Templates Base:** Copiar el `.agents/rules/sdd-orchestrator.md` testeado hacia `funky-cli/src/templates/bootstrap/agents-rules-sdd-orchestrator.md`.
- [x] **3.2 Modificar el Bootstrap:** Actualizar la lógica en `funky-cli/src/commands/init.js` si fuera necesario para apuntar al archivo correcto.
- [x] **3.3 Actualización de Handoffs:** Revisar `funky-cli/src/templates/sdd/worker-handoff.md` para asegurar que instruya el uso de `/funky-worker` y no invoque al orquestador.

---

### FASE 4: Auditoría de Pérdida de Datos (Diff Analysis) [Worker T3]
> **Objetivo:** Evitar regresiones silentes al comparar la migración final con los archivos legacy.

- [x] **4.1 Recopilación Forense:** Cargar en contexto los archivos actuales (`.agents/rules/sdd-orchestrator.md` y `funky-worker.md`) frente a los backups legacy (`gemini-funky-backup.md` y el viejo `funky-orchestrator.md`).
- [x] **4.2 Diff de Arquitectura:** Analizar la matriz cruzada para identificar si alguna regla de comportamiento del monolito pre-v2.0.0 quedó fuera de la mudanza.
- [x] **4.3 Diff de CLI:** Comparar `.agents/rules/sdd-orchestrator.md` contra su backup estático en `funky-cli/src/templates/bootstrap/agents-rules-sdd-orchestrator.md` para garantizar paridad.
- [x] **4.4 Rescate Final:** Re-insertar las instrucciones huérfanas en el Orquestador o en el Worker antes de cerrar la feature.

---

<OPTIONAL_DOC_UPDATE>

> **[SISTEMA — ORQUESTADOR — DECISIÓN REQUERIDA]**
> Analizá los cambios de esta feature contra el índice de abajo. Si algún doc cubre exactamente lo que cambió → expandí esta fase con tareas concretas. Si ninguno aplica → **eliminá este bloque completo del archivo.**
> **Regla de contexto:** NO abras ningún doc del índice todavía. La columna "Aplica si..." es suficiente para decidir. Solo abrís el archivo en el momento exacto de editarlo.

### 📚 Índice de Docs Vivos

| # | Doc | Cubre | Aplica si... |
|---|-----|-------|--------------|
| 1 | `docs/funky-ai/operaciones/funky-init-flow.md` | Árbol de decisión de `funky init`, tabla de archivos estáticos del bootstrap, modos Headless / Interactivo / `--template` | Se modificó `init.js`, cambió qué archivos copia el bootstrap, o cambió el comportamiento del flag `--template` o modo Headless |
| 2 | `docs/funky-ai/operaciones/guia-flujo-completo.md` | Ciclo de vida end-to-end: exploración → init → phase → workers → release, con comandos y output esperado | Cambió la secuencia de comandos recomendada, se agregó un nuevo modo o flag al CLI, o cambió el flujo de uso habitual |
| 3 | `funky-cli/README.md` | Tabla de comandos y flags disponibles, fases SDD, estructura de carpetas resultante del `funky init` | Se agregó, modificó o eliminó un comando, flag o fase SDD del CLI |
| 4 | `docs/funky-ai/guias/funky-ai.md` | Pilares del ecosistema, Tiers de complejidad (T0–T3), criterio de decisión Chat vs SDD | Cambió la arquitectura conceptual del protocolo Funky AI o se añadió un pilar nuevo |
| 5 | `docs/funky-ai/operaciones/cli-simulations.md` | Vectores de falla conocidos y simulaciones de bugs del CLI | Se encontró un nuevo vector de falla, se cerró uno existente, o se modificó el comportamiento ante errores |
| 6 | `funky-cli/src/templates/bootstrap/canvas-planning-guide.md` | Opciones disponibles para cada campo de PROJECT-CANVAS e INFRA-CANVAS | Se agregaron / eliminaron opciones en los Canvas o cambió el schema de alguno |
| 7 | `docs/funky-ai/operaciones/escenarios-de-uso.md` | Escenarios de uso del CLI mapeados al estado inicial del usuario (sin definir, definido, repo existente) | Se agrega un nuevo comando o modo al CLI que cambia alguno de los flujos de entrada |

### FASE 5.A — Doc-Update [ORQUESTADOR — Inline]
> Docs existentes afectados por los cambios de esta feature.

- [x] **Doc [#1] — `docs/funky-ai/guias/comando-vs-archivos.md`:** Sección `funky init` → actualizar la referencia obsoleta de `.agents/rules/orchestrator-core.md` a `.agents/rules/sdd-orchestrator.md`.
- [x] **Nuevo Doc — `docs/funky-ai/conceptos/agent-config-architecture.md`:** ✅ Creado inline. Documenta la arquitectura de 3 Capas con diagrama Mermaid, inventario de archivos de configuración, la Asimetría Operativa Orquestador/Worker y la sección de Tiers duales (Orquestador vs Worker).

**🚫 Restricción:** Abrir cada archivo SOLO en el momento de editarlo.


---

<MANDATORY_RELEASE_PROTOCOL>

### FASE X — Doc-Ops [ORQUESTADOR — Inline, modelo actual]
> **Objetivo:** Producir todos los artefactos de la release y ejecutar los archivados. El Orquestador lo hace inline mientras el contexto está fresco — no se delega a un Worker.
> **Modelo:** El que está activo en la sesión actual (contexto ya cargado = cero transcripción).

**🚨 CHECKLIST DOC-OPS (OBLIGATORIO - NO OMITIR):**
- [x] **Tests [CONDICIONAL]:** [OMITIDO: sin cambios en código fuente — solo docs/templates/config].
- [x] **Release Notes:** Generar `docs/funky-ai/releases/v2.0.1-release.md`.
- [x] **README [CONDICIONAL]:** Actualizar `README.md` raíz.
- [x] **CLI Docs:** [OMITIDO: sin nuevos comandos].
- [x] **Package.json:** Bumpar `"version"` en `funky-cli/package.json` a v2.0.1.
- [x] **Archivado:** Mover `docs/openspec/changes/v2.0.1-context-fix/` → `docs/openspec/archive/v2.0.1-context-fix/`.
- [x] **RFCs:** [OMITIDO: sin RFCs específicos en esta release].
- [x] **Sincronización:** Actualizar `ORCHESTRATOR-STATE.md`.
- [x] **Smoke Test [CONDICIONAL]:** [OMITIDO: sin cambios de integración E2E].
- [x] **Preparar datos para Worker Git-Ops:** Declarado en `worker-handoff.md`.

> ⚠️ **Regla de oro:** Todo lo que requiere criterio o genera texto → Orquestador inline. Todo lo mecánico post-archivado → Worker Git-Ops.

---

### FASE X+1 — Git-Ops [Worker T1 — ⚡ Flash / Haiku]
> **Objetivo:** Comandos git puros. Sin edición de archivos, sin redacción, sin decisiones.
> **Modelo:** Flash / Haiku — el más liviano disponible. Si comete un error → documentar y PARAR.
> **Prerequisito:** El Orquestador completó la Fase Doc-Ops y los archivados ya están ejecutados.

**🚨 CHECKLIST GIT-OPS (OBLIGATORIO - NO OMITIR):**
- [x] **Verificar estado:** `git status` — confirmado limpio.
- [x] **Commit:** `git add -A && git commit -m "fix(orchestrator): restore Layer 2 placement and rescue Auto-Tiering (v2.0.1)"`
- [x] **Merge:** `git checkout main && git merge --no-ff feature/v2.0.1-context-fix -m "release: v2.0.1 context fix"`
- [x] **Tag:** `git tag -a v2.0.1 -m "v2.0.1: Fix Context Fading, rescue Feature 012 Auto-Tiering"`
- [x] **Push:** `git push origin main --tags`

> ⚠️ Esta fase NO edita archivos de texto. Solo ejecuta comandos git. Si algo falla → documentar en `sdd-report.md` y PARAR.


</MANDATORY_RELEASE_PROTOCOL>

---

## 📋 Return Envelope (Para el Worker)

Al finalizar cada fase, actualizar `sdd-report.md` con:

> **MANDATORY:** Tu ÚLTIMA respuesta DEBE incluir un bloque con todos los ítems de `MANDATORY_RELEASE_PROTOCOL` marcados como `[x]` o `[OMITIDO: razón]`. Sin este bloque, la Fase NO se considera completa.

```markdown
## Fase [N] — [Nombre]
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:** (lista)
- **Bugs encontrados:** (si aplica, usar schema engram. OBLIGATORIO: incluir intentos fallidos y anti-patrones descartados, no solo bugs finales)
- **Próxima acción:** (qué debe hacer el Orquestador)
```

---

> **[SISTEMA — ORQUESTADOR — LEER ANTES DE COMUNICAR AL HUMANO]**
> Antes de escribir cualquier instrucción al humano, verificar **en este orden**:
> 1. ¿`worker-handoff.md` generado en `docs/openspec/changes/{feature}/`? Si **NO** → generarlo AHORA. No se delega ninguna fase sin handoff.
> 2. ¿Revisaste el Planning Checklist (items 0–4) en `.agents/rules/sdd-orchestrator.md`? Si **NO** → leerlo antes de continuar.
> 3. Solo después de confirmar los dos puntos anteriores, instruir al humano: *"Cerrá este chat, abrí uno nuevo y decíme: `@docs/openspec/changes/{feature}/worker-handoff.md Ejecutá la Fase N`"*
