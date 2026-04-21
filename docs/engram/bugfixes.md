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
