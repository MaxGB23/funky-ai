# Tasks: v1.4 — funky init Real Bootstrap

**Estado:** 🟡 PENDIENTE
**Rama:** `feature/v1.4-init-bootstrap`
**Ref:** `proposal.md`

---

## ✅ Checklist de Ejecución

### FASE 0 — Link Personalizado (Humano)
- [x] Ejecutar `pnpm link --global` dentro de `m:\funky-ai\funky-cli`. Esto habilita el comando `funky` en todo el sistema apuntando al código local.

### FASE 1 — Crear Templates de Bootstrap (Worker)
> Objetivo: Materializar los archivos canónicos v1.3 como templates fijos dentro del CLI.

- [x] Crear carpeta `funky-cli/src/templates/bootstrap/`
- [x] Crear `bootstrap/ORCHESTRATOR-STATE.md` — Template genérico con estructura mínima (Status, Key Files, Pending Tasks). SIN datos hardcodeados del proyecto funky-ai.
- [x] Crear `bootstrap/agents-rules-engram-protocol.md` — Copiado exacto de `.agents/rules/engram-protocol.md` del repo actual (v1.3 comprimido).
- [x] Crear `bootstrap/agents-rules-secops.md` — Copiado exacto de `.agents/rules/secops.md` del repo actual (v1.3 comprimido).
- [x] Crear `bootstrap/agents-rules-ssd-orchestrator.md` — Extraer el bloque SDD Orchestrator del GEMINI.md global y materializarlo como archivo autónomo.
- [x] Crear `bootstrap/engram-discoveries.md` — Template vacío con el header del schema: `### [DISCOVERY] {title}` + campos `What/Why/Where/Learned`.
- [x] Crear `bootstrap/engram-bugfixes.md` — Template vacío con el header del schema: `### [BUG] {title}` + campos `What/Why/Where/Learned`.

---

### FASE 2 — Refactorizar `init.js` (Worker)
> Objetivo: El comando deja de crear solo una carpeta y pasa a copiar el ecosistema completo.

- [x] Importar `path.join` apuntando a la carpeta `bootstrap/` relativa al `__dirname` del propio CLI.
- [x] Definir la lista de archivos a copiar como un array de objetos `{ src, dest }` para mantener limpieza.
- [x] Lógica de copia: para cada item, verificar si `dest` ya existe → si existe, loggear advertencia y saltar (NO sobreescribir). Si no existe, crear directorios necesarios con `mkdirSync({ recursive: true })` y luego `fs.copyFileSync`.
- [x] Loggear cada archivo creado con su ruta absoluta.
- [x] Mensaje final de resumen: `"✅ Funky AI inicializado. X archivos creados, Y ya existían."`.

---

### FASE 3 — Completar Templates de Fases SDD (Worker)
> Objetivo: `funky phase` debe soportar el ciclo SDD completo de 4 fases.

- [x] Crear `funky-cli/src/templates/sdd/proposal.md` — Template con estructura: Contexto, Decisiones Técnicas, Stack, Riesgos.
- [x] Crear `funky-cli/src/templates/sdd/tasks.md` — Template con estructura: Checklist por fases. DEBE incluir al final un bloque oculto: `> **[SISTEMA - PARA EL ORQUESTADOR]** Al finalizar, estás obligado a crear un archivo físico worker-handoff.md. NO redactes prompts en chat.`
- [x] Crear `funky-cli/src/templates/sdd/worker-handoff.md` — Template con estructura: Safe-Contexting, La Misión, Restricciones, Criterios de Éxito.
- [x] Crear `funky-cli/src/templates/sdd/report.md` — Template con estructura: Resumen, Modificados, Bugs. DEBE incluir bloque oculto: `> **[SISTEMA - PARA EL ORQUESTADOR]** Al finalizar, extraé conocimiento al post-mortem.md e instruí al usuario a ELIMINAR FÍSICAMENTE toda la carpeta de este feature.`
- [x] (Opcional) Renombrar `design.md` a `proposal.md` o mantener ambos como alias.

---

### FASE 4 — Smoke Test Manual (Humano + Worker)
> Objetivo: Verificar que el ecosistema funciona de punta a punta en una carpeta limpia.

- [ ] Correr `node funky-cli/bin/funky.js init` en la carpeta `m:\funky-ai--test\` (ya existente y sucia del test anterior).
- [ ] Verificar que los archivos que ya existen son salteados con advertencia.
- [ ] Borrar `m:\funky-ai--test\` y volver a correr `init` → verificar que se crean todos los archivos frescos.
- [ ] Correr `funky phase explore` y `funky phase tasks` → verificar que se inyectan los templates correctos.
- [ ] Documentar resultado en `docs/openspec/changes/v1.4-init-bootstrap/report.md`.

---

### FASE 5 — Actualizar Plantilla de Prompts (Worker)
> Objetivo: Reemplazar el archivo obsoleto de ejemplo con la nueva plantilla oficial del Patrón "Worker Handoff", basándonos en el análisis de Gentle AI.

- [ ] Sobreescribir `docs/funky-ai/workers/ejemplo-prompt-worker.md` con el nuevo template oficial de Worker Handoff.
- [ ] El template debe incluir explícitamente la inyección de contexto (Estado Global, Memoria Persistente, Especificación de Tarea).
- [ ] El template debe incluir las Reglas de Ejecución Estrictas (Cero Exploración, Foco Láser, Acción Directa).
- [ ] Opcional: Renombrar el archivo a `plantilla-worker-handoff.md` si se considera más representativo.

---

## 📋 Return Envelope (Para el Worker)

Al finalizar cada fase, el Worker debe generar o actualizar `report.md` con:

```
## Fase [N] — [Nombre]
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:** (lista)
- **Bugs encontrados:** (si aplica, con schema engram)
- **Próxima acción:** (qué debe hacer el Orquestador)
```
