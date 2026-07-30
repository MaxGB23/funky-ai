# 🤖 Funky AI — Worker Handoff: Fase [N] ([Nombre de la Fase])

---

## 1. Inyección de Contexto (Safe-Contexting)

### C) Especificación de Tarea
```
view_file docs/openspec/changes/{feature-name}/tasks.md
```

### D) Skills Requeridas (Explicit Routing)
```
view_file [⚠️ COMPLETAR: RUTAS EXACTAS DE LAS SKILLS EN .agents/skills/ O DEJAR VACÍO SI NO APLICA]
```

---

### 🔍 Jerarquía de Conocimiento (Doc-Ops)
1. **Prioridad 1 (Skills Estrictas):** Acata religiosamente las skills inyectadas en la sección §1.D. Son leyes absolutas para tu ejecución.
2. **Prioridad 2 (MCP context7):** Si la API es nueva/compleja, dudas de su sintaxis, y el Orquestador no te pasó ninguna skill en §1.D, estás **OBLIGADO** a usar el servidor MCP `context7` (`resolve-library-id` + `query-docs`) antes de escribir código.
3. **Extracción:** Si descubres un patrón nuevo usando `context7`, documéntalo en tu Return Envelope para que el Orquestador lo convierta en una Skill.

---

## 4. Criterios de Éxito
- [ ] Todos los checklists fueron marcados como completados con éxito "[x].
- [ ] El `report.md` fue actualizado con la sección de esta Fase.
- [ ] Ningún archivo fuera de scope fue modificado.
- [ ] Si se encontraron bugs no relacionados, están documentados con schema engram.

---

## 5. Return Envelope (Al terminar)

Actualiza `docs/openspec/changes/{feature-name}/report.md` con:

```markdown
## Fase [N] — [Nombre de la Fase]
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:**
  - `ruta/al/archivo.ext` (breve rol del archivo)
- **Detalle de Ejecución:**
  - [Lista de lo implementado: cambios de lógica, algoritmos, convenciones o reglas agregadas]
- **Bugs encontrados:** Ninguno / (schema engram si aplica)
- **🔴 Cambio de Scope Detectado:** No / Sí — [Si Sí: describir qué encontraste que invalida o modifica fases siguientes]
- **Próxima acción:** Qué debe hacer el Orquestador a continuación
```

> **[SISTEMA]** Si `🔴 Cambio de Scope Detectado` es **Sí**, el Orquestador DEBE revisar y actualizar `tasks.md` y los handoffs de fases siguientes ANTES de continuar la delegación.
