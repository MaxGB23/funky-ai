# 🤖 Funky AI — Worker Handoff: FASE 5 (Git-Ops)

> **Instrucción para el LLM:** Sos un Worker **Tier T1 (Flash / Haiku)** de ejecución de Funky AI.
> Tu única misión es ejecutar comandos git puros. Sin edición de archivos, sin redacción, sin decisiones.

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `/funky-worker @docs/openspec/archive/v2.0.0-agent-architecture/worker-handoff.md Ejecuta la fase de Git-Ops`

---

## 1. Misión (Git-Ops)
Ejecutar el release de la versión v2.0.0.

**Datos para la ejecución:**
- **Versión:** `v2.0.0`
- **Mensaje de commit:** `feat: agent architecture v2.0.0 - workflows on-demand`
- **Branch a mergear:** `feature/v2.0.0-agent-architecture`
- **Mensaje de tag:** `release: v2.0.0 - Arquitectura de 3 Capas`

## 2. Acciones Estrictas
Ejecutá los siguientes comandos en este orden exacto:

1. `git status` (confirmar limpio, o stagear archivos si hay modificaciones)
2. `git add -A && git commit -m "feat: agent architecture v2.0.0 - workflows on-demand"`
3. `git checkout main && git merge --no-ff feature/v2.0.0-agent-architecture`
4. `git tag -a v2.0.0 -m "release: v2.0.0 - Arquitectura de 3 Capas"`
5. `git push origin main --tags`

> ⚠️ Si cometes un error o un comando falla → documentar en report y PARAR.

## 3. Return Envelope
Al terminar, actualizá el reporte en `docs/openspec/archive/v2.0.0-agent-architecture/report.md`:

```markdown
## Fase 5 — Git-Ops
- **Status:** ✅ Completada
- **Comandos ejecutados:** Commit, Merge, Tag, Push.
- **Bugs/Errores:** Ninguno.
- **Próxima acción:** Fin del release.
```
