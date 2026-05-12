# 🤖 Funky AI — Worker Handoff: Fase X+1 (Git-Ops)

> **Instrucción para el LLM:** Sos un Worker **Tier 1 (Flash)** de ejecución de Funky AI.
> Tu única misión es ejecutar los comandos git exactos detallados abajo y luego actualizar el `sdd-report.md` final.

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@docs/openspec/archive/v1.19.0-012-auto-tiering/worker-handoff.md Ejecutá la Fase X+1`

---

## 1. Inyección de Contexto (Safe-Contexting)
**[OMITIDO]** — Esta fase es exclusivamente de comandos Git, no requiere contexto de código ni Engram.

---

## 2. La Misión (Git-Ops)

**Objetivo:** Subir los cambios de Auto-Tiering a main.
Ejecutá los siguientes comandos en orden estricto (usá la tool de ejecución de terminal):

1. `git status` (si hay errores raros, parar y reportar)
2. `git add -A`
3. `git commit -m "feat(orchestrator): implement auto-tiering decision matrix"`
4. `git checkout main`
5. `git merge --no-ff feature/v1.19.0-012-auto-tiering`
6. `git push origin main`

---

## 3. Reglas de Ejecución Estrictas
| Regla | Descripción |
|-------|-------------|
| 🔴 Cero Exploración | NO listar directorios ni leer archivos. |
| 🔴 Foco Láser | NO editar archivos Markdown ni de código. Solo Git. |

---

## 4. Return Envelope (Al terminar)

Actualizá `docs/openspec/archive/v1.19.0-012-auto-tiering/sdd-report.md` con:

```markdown
## Fase Git-Ops
- **Status:** ✅ Completada
- **Archivos creados/modificados:** (Solo el propio report)
- **Bugs encontrados:** Ninguno
- **🔴 Cambio de Scope Detectado:** No
- **Próxima acción:** Fin de la sesión para la feature 012.
```
