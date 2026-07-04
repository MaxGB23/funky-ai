<MANDATORY_RELEASE_PROTOCOL>

### FASE X — Doc-Ops [ORQUESTADOR — Inline]
> **Objetivo:** Producir todos los artefactos de la release y ejecutar los archivados. El > **Modelo:** El que está activo en la sesión actual (contexto ya cargado = cero transcripción).

> **Instrucción de Filtrado:** Evalúa los elementos [CONDICIONAL]. Si la condición NO se cumple para esta feature, NO incluyas la tarea en la lista final generada (elimínala por completo para no generar ruido visual).

**🚨 CHECKLIST DOC-OPS (OBLIGATORIO - NO OMITIR):**
- [ ] **Tests [CONDICIONAL]:** Si la feature modificó código fuente testeable (comandos, utils, lógica de negocio) → Ejecutar `pnpm run test`. Si falla → PARAR y resolver el bug. El push nunca parte de una base rota.
- [ ] **Release Notes:** Generar `docs/funky-ai/releases/vX.Y.Z-release.md` usando como base `funky-cli/src/templates/release.md`. *(Redactar para consumo humano. IGNORAR Token Diet aquí.)*
- [ ] **README (Root) [CONDICIONAL]:** Si la release cambió la versión, comandos o arquitectura conceptual → Actualizar `README.md` raíz manteniéndolo como Architecture Hub.
- [ ] **CLI Docs (CLI README) [CONDICIONAL]:** Si la release incluyó nuevos comandos o flags → Actualizar tabla en `funky-cli/README.md`.
- [ ] **Package.json:** Bumpar `"version"` en `funky-cli/package.json` a la nueva versión.
- [ ] **Archivado:**(DEPRECADO) Mover `docs/openspec/changes/{feature}/` → `docs/openspec/archive/{version}-{feature}/`. Ejecutar AHORA (antes del Humano Gitops).
- [ ] **RFCs:** Decidir qué RFCs fueron implementados en esta release → Moverlos a `docs/openspec/archive/`. Ejecutar AHORA. (`proposals/` está deprecado — no usar).
- [ ] **Sincronización:** Actualizar `ORCHESTRATOR-STATE.md` (versión, rama, estado estable).
- [ ] **Smoke Test [DEPRECADO POR AHORA - IGNORAR]:** Si la feature altera el flujo E2E del proyecto → Agregar escenario de QA a `docs/operaciones/master-smoke-test.md`.
- [ ] **Preparar datos para Git-Ops:** Declarar en este mismo archivo (sección Git-Ops abajo): versión exacta, mensaje de commit, nombre del branch, mensaje del tag. El HUMANO puede recibir este archivo directamente — no se necesita `worker-handoff.md` separado para T1 git puro.

> ⚠️ **Regla de oro:** Todo lo que requiere criterio o genera texto → Orquestador inline. Todo lo mecánico post-archivado → Humano Git-Ops.

---

### FASE X+1 — Git-Ops [Humano]
> **Objetivo:** Comandos git puros en la terminal local del Humano.
> **Acción del Orquestador:** Al terminar la Fase X (Doc-Ops), el Orquestador DEBE resolver e imprimir un bloque de código Markdown con los comandos listos para copiar y pegar (con las variables reales ya completadas).

**🚨 CHECKLIST GIT-OPS (HUMANO - COPIAR Y PEGAR):**
- [ ] **Verificar estado:** `git status` — confirmar limpio y que no haya archivos inesperados fuera de stage.
- [ ] **Commit:** `git add -A && git commit -m "{mensaje declarado por Orquestador}"`
- [ ] **Merge:** `git checkout main && git merge --no-ff {branch-declarado}`
- [ ] **Tag:** `git tag -a {version} -m "{mensaje-declarado}"`
- [ ] **Push:** `git push origin main --tags`
- [ ] **Limpieza:** `git branch -d {branch-declarado}`

> ⚠️ Esta fase es de ejecución puramente humana y local. 

> **MANDATORY:** Tu ÚLTIMA respuesta DEBE incluir un bloque con todos los ítems de `MANDATORY_RELEASE_PROTOCOL` marcados como `[x]` o `[OMITIDO: razón]`. Sin este bloque, la Fase NO se considera completa. Además de los resultados de testing estructurados. Una vez terminado, la siguiente fase es funky-archive.

</MANDATORY_RELEASE_PROTOCOL>