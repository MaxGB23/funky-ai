# Tasks: [Nombre de la Funcionalidad o Cambio]

**Estado:** 🟡 PENDIENTE
**Rama:** `feature/nombre-del-branch`
**Ref:** `proposal.md`

---

## ✅ Checklist de Ejecución

### FASE 0 — Setup (Humano)
- [ ] `git checkout -b feature/nombre-del-branch`
- [ ] [Otras tareas de configuración manual inicial]

---

### FASE 1 — [Nombre de la Fase 1] (Worker)
> Objetivo: [Objetivo de esta fase]

- [ ] [Tarea específica 1]
- [ ] [Tarea específica 2]

**🚫 Restricciones:** [Ej: No modificar código fuente, solo tests.]

---

## 📋 Return Envelope (Para el Worker)

Al finalizar cada fase, actualizar `report.md` con:

```markdown
## Fase [N] — [Nombre]
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:** (lista)
- **Bugs encontrados:** (si aplica, con schema engram)
- **Próxima acción:** (qué debe hacer el Orquestador)
```

> **[SISTEMA - PARA EL ORQUESTADOR]** Al finalizar, estás obligado a crear un archivo físico `worker-handoff.md` para cada fase de Worker. NO redactes prompts en chat.
