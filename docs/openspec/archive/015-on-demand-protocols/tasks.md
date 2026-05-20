# Tasks: 015 Protocolos On-Demand

**Estado:** 🟢 COMPLETADO
**Rama:** `feature/v2.1.0-015-on-demand-protocols`
**Ref:** `sdd-proposal.md`

> **[SISTEMA - PARA EL ORQUESTADOR]** Antes de delegar la primera fase, verificá el Planning Checklist en `.agents/rules/sdd-orchestrator.md`. Generá un `worker-handoff.md` basado en `funky-cli/src/templates/sdd/worker-handoff.md`. **NO delegues mediante prompts en el chat.**

> **[SISTEMA - PREREQUISITO]** ¿Existe `sdd-spec.md` en esta misma carpeta (`docs/openspec/changes/{feature}/`)? Si **NO** existe → **PARAR. Generarlo primero.** El `tasks.md` sin `spec.md` es construir sin plano arquitectónico.

---

## ✅ Checklist de Ejecución

> **[SISTEMA — ORQUESTADOR — ENFORCEMENT]** Al completar cada ítem:
> 1. Marcarlo `[x]` en este archivo **INMEDIATAMENTE**.
> 2. Guardar el archivo al disco antes de continuar al siguiente ítem.

### FASE 0 — Branch Setup [T1]
> **Tier:** T1 — Git ops puras, cero ambigüedad. Delegable a Worker.

- [x] Verificar que git está disponible: `git --version`
- [x] Verificar que el branch NO existe: `git branch --list feature/v2.1.0-015-on-demand-protocols`
- [x] Crear y cambiar al branch: `git checkout -b feature/v2.1.0-015-on-demand-protocols`
- [x] Confirmar branch activo: `git status`
- [x] Documentar en Return Envelope: branch confirmado ✅

**🚫 Restricciones:** No modificar ningún archivo de código. Esta fase es SOLO setup de git.

---

### FASE 1 — Infraestructura Local de Protocolos (Worker)
> Objetivo: Crear la carpeta `.agents/protocols/` y los primeros archivos de prueba en el root del repo.

- [x] Crear directorio `.agents/protocols/`.
- [x] Crear `.agents/protocols/index.md` con un formato de tabla listando protocolos disponibles.
- [x] Crear `.agents/protocols/devil-advocate.md` con las instrucciones detalladas para el rol de auditor estricto.

**🚫 Restricciones:** No modificar lógica del CLI todavía.

---

### FASE 2 — Modificación de Templates Tasks (Worker)
> Objetivo: Añadir la regla de "evaluación de riesgo" y etiquetado proactivo a los templates del ciclo SDD.

- [x] Modificar `.agents/templates/sdd/tasks.md` inyectando la instrucción sobre marcar fases con `[⚠️ RIESGO ALTO]`.
- [x] Modificar `funky-cli/src/templates/sdd/tasks.md` para replicar el mismo cambio.

---

### FASE 3 — CLI Templates para Protocolos (Worker)
> Objetivo: Crear la estructura de templates de protocolos que el CLI distribuirá a los nuevos repositorios.

- [x] Crear el directorio `funky-cli/src/templates/protocols/`.
- [x] Copiar/crear `index.md` allí.
- [x] Copiar/crear `devil-advocate.md` allí.

---

### FASE 4 — Integración Inquirer en CLI [⚠️ RIESGO ALTO - Sugiero protocolo: devil-advocate.md] (Worker T3)
> Objetivo: Modificar el flujo de inicialización del CLI para preguntar interactivamente qué protocolos importar.

- [x] Analizar el flujo de `funky init` o un comando equivalente en `funky-cli/src/commands/`.
- [x] Inyectar un prompt de `inquirer` (tipo `checkbox`) para listar los protocolos del directorio de templates.
- [x] Implementar la copia selectiva de protocolos al directorio de destino.
- [x] Regenerar/limpiar el `index.md` generado en destino para que solo liste los protocolos importados.

---

<MANDATORY_RELEASE_PROTOCOL>

### FASE X — Doc-Ops [ORQUESTADOR — Inline, modelo actual]
> **Objetivo:** Producir todos los artefactos de la release y ejecutar los archivados. El Orquestador lo hace inline.

**🚨 CHECKLIST DOC-OPS:**
- [x] **Tests [CONDICIONAL]:** `pnpm run test` — 11 suites, 39 tests ✅
- [x] **Release Notes:** `docs/funky-ai/releases/v2.1.0-release.md` ✅
- [x] **CLI Docs:** Sin cambio de interfaz pública. No amerita doc adicional.
- [x] **Package.json:** Bumpeado `2.0.1` → `2.1.0` ✅
- [x] **Archivado:** N/A — sin convención de archive definida en el proyecto.
- [x] **Sincronización:** `ORCHESTRATOR-STATE.md` actualizado ✅
- [x] **Preparar datos para Git-Ops:** ↓ ver abajo

---

### FASE X+1 — Git-Ops [Worker T1 — ⚡ Flash / Haiku]
> **Objetivo:** Comandos git puros.

**🚨 CHECKLIST GIT-OPS:**
- [x] **Verificar estado:** `git status`
- [x] **Commit:** `git commit`
- [x] **Merge:** `git merge`
- [x] **Tag:** `git tag`
- [x] **Push:** `git push`

</MANDATORY_RELEASE_PROTOCOL>
