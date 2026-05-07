# Bugfixes

### [BUG][ci-lockfile-mismatch] CI falla con `--frozen-lockfile` al pinear versión exacta post-instalación
**Síntoma:** `pnpm install --frozen-lockfile` falla en GitHub Actions con error de mismatch entre `package.json` y `pnpm-lock.yaml`.
**Causa:** El lockfile fue generado con `"vitest": "^4.1.4"`. Luego el Orquestador lo cambió a `"vitest": "4.1.4"` (SecOps) sin regenerar el lockfile. El `--frozen-lockfile` detecta la inconsistencia y rechaza la instalación.
**Anti-patrón:** Escuchar a Copilot/GitHub que sugiere volver al caret `^` — eso viola SecOps y es la solución incorrecta.
**Fix correcto:** Regenerar el lockfile localmente con `pnpm install` (sin flags) dentro del directorio del paquete, y luego commitear el `pnpm-lock.yaml` actualizado junto con el `package.json`.
**Regla:** Siempre que se modifique una versión en `package.json`, regenerar el lockfile ANTES del commit y del push.


### [bugfix][worker-prompt-persistence] Semántica de escritura en Prompts de Workers
**What:** Todo prompt destinado a instanciar a un Worker debe exigir explícitamente el uso de la tool de FileSystem para persistir su reporte en disco (ej: "escribir a un archivo `report.md`").
**Why:** Los LLMs son extremadamente literales. Si el Orquestador pide que "devuelvan un Return Envelope en markdown", el Worker lo imprimirá en su chat UI, perdiéndose la persistencia en el disco para la arquitectura Openspec.
**Where:** Protocolo de Orquestación (Redacción de Prompts para Tier 2/3).
**Learned:** NUNCA utilizar la palabra "devolveme" al pedir artefactos. La heurística absoluta de comunicación entre agentes debe ser: *"Creá un archivo físico con formato Return Envelope en la ruta [X]"*.

### [bugfix][git-ops-orchestrator] Generación de planes sobre rama principal (main)
**What:** El Orquestador planificó (creó proposal.md y tasks.md) y estuvo a punto de delegar la ejecución a un Worker sin haber aislado el entorno con una rama nueva (feature branch).
**Why:** Delegar a un Worker estando en `main` rompe la arquitectura Git-Ops y arriesga corromper el código base estable.
**Where:** Workflow de Orquestación (Fase 0).
**Learned:** Siempre ejecutar `git status` y crear una rama ANTES de generar el template de Handoff para el Worker.

### [bugfix][worker-tier-omission] Omisión de Tier en templates de ejecución
**What:** Se obvió la declaración explícita de Tier (ej. "Sos un Worker Tier 1") en el `worker-handoff.md`.
**Why:** Omitir el Tier elimina el pre-acondicionamiento psicológico del modelo. Sin Tier, el Worker puede sobre-arquitectar (actuar como Tier 3) en tareas simples.
**Where:** Generación de prompts de Worker Handoff.
**Learned:** Cada instrucción a un sub-agente DEBE declarar explícitamente su Tier.

### [bugfix][phase-template-path] Mismatch de ruta en `phase.js` tras mover templates a subcarpeta
**What:** Al mover los templates SDD de `src/templates/` a `src/templates/sdd/`, el comando `phase.js` quedó apuntando a la ruta antigua y hubiera fallado con "template no existe".
**Why:** La instrucción de la Fase 3 prohibía tocar archivos `.js`, por lo que el Worker creó la subcarpeta sin actualizar la referencia en el comando.
**Where:** `funky-cli/src/commands/phase.js` línea 14.
**Learned:** Cuando un Worker mueve o reorganiza templates, DEBE listar explícitamente en sus restricciones si puede o no actualizar las referencias en los comandos JS. La ambigüedad genera deuda. Alternativa: el Orquestador debe delegar la reorganización de templates y la actualización de rutas en la misma Fase, no en fases separadas.

### [bugfix][cli-headless-overwrite] Sobreescritura de Canvas en modo Headless
**What:** La ejecución de `funky init` cuando ya existía un `PROJECT-CANVAS.md` pisaba el archivo original con un template vacío.
**Why:** El código pasaba `canvasConfig = { fromHeadless: true }` a `runInit`, pero `runInit` no verificaba explícitamente el flag `fromHeadless` antes de llamar a `generateCanvasMarkdown` y escribir en disco.
**Where:** `funky-cli/src/commands/init.js`
**Learned:** Siempre validar los flags pasados al objeto de configuración dentro de la lógica pura (no solo en el command handler de Commander) para evitar flujos destructivos no intencionados.

### [BUG][stale-post-mortem-ref] sdd-orchestrator.md apuntaba a archivo DEPRECATED en Memory Polling
**What:** `.agents/rules/sdd-orchestrator.md` referenciaba `docs/post-mortem.md` como destino del Memory Polling y la consolidación de Engram. Este archivo está marcado como `DEPRECATED` en `ORCHESTRATOR-STATE.md` desde v1.2.
**Why:** La regla global nunca fue actualizada cuando se migró al sharded engram (`discoveries.md` + `bugfixes.md`) en v1.2.
**Where:** `.agents/rules/sdd-orchestrator.md` — sección de Memory Polling y Session Close.
**Learned:** Cada vez que un archivo de infraestructura se depreca, hacer `grep_search` sobre `.agents/rules/` para detectar referencias stale. El riesgo real: el agente busca en el lugar equivocado y silencia memoria acumulada sin ningún error visible.

### [bugfix][worker-report-false-positive] Worker Git-Ops marca ítems Doc-Ops como completados sin ejecutarlos
**What:** El Worker que ejecutó la Fase 3 (Git-Ops) marcó `[x] README: Actualizado` en el `sdd-report.md` a pesar de que su única responsabilidad era ejecutar comandos git — nunca edita archivos de texto.
**Why:** El template del Return Envelope en el `sdd-report.md` lista todos los ítems del MANDATORY_RELEASE_PROTOCOL, incluyendo los de Doc-Ops. El Worker los marcó como completados sin verificar quién los ejecutó realmente.
**Where:** `sdd-report.md` — sección MANDATORY_RELEASE_PROTOCOL Checkpoint. Detectado al auditar el `sdd-tasks.md` completado en la release v1.16.0.
**Learned:** (1) El checklist del Return Envelope del Worker Git-Ops debe listar SOLO los ítems de Git-Ops, no todo el MANDATORY_RELEASE_PROTOCOL. (2) El Orquestador debe auditar el `sdd-tasks.md` marcando ítems como completados al recibir cada report — ese ejercicio expone gaps que el report puede ocultar. (3) Alternativa estructural: dividir el sdd-report.md en dos secciones separadas: "Doc-Ops (Orquestador)" y "Git-Ops (Worker)".
