# 🤖 Funky AI — Worker Handoff: Fase 6 (Git-Ops)

> **Instrucción para el LLM:** Sos un Worker **Tier T1** (modelo rápido, ej. Flash) de ejecución de Funky AI.
> Tu única misión es ejecutar comandos git mecánicos sin tomar decisiones. NO redactes ni modifiques archivos de texto.

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo con el modelo Flash/Haiku y pegá:
> `@docs/openspec/archive/v1.19.0-002-cost-estimator/worker-handoff-gitops.md Ejecutá la Fase 6`

---

## 1. Tareas a Ejecutar en la Terminal

Ejecutá estrictamente esta secuencia de comandos usando la tool `run_command` (powershell/bash):

1. `git status` -> Verificar que el working tree tiene los cambios correctos y no hay archivos sin trackear inesperados.
2. `git add -A`
3. `git commit -m "feat: implement funky estimate (RFC 002) and release v1.19.0"`
4. `git checkout main`
5. `git merge --no-ff feature/v1.19.0-002-cost-estimator -m "release: v1.19.0 Cost Estimator"`
6. `git tag -a v1.19.0 -m "Release v1.19.0 - Cost Estimator"`
7. `git push origin main --tags`

---

## 2. Reglas de Ejecución

- **Cero decisiones:** Si alguno de los comandos falla o hay un conflicto de merge, **PARÁ INMEDIATAMENTE**. No intentes resolver el conflicto. Reportá el error al humano.
- **Sin edición:** NO utilices `write_to_file` ni `replace_file_content`.
- **Idempotencia:** Si ya estás en `main` o la rama cambió, ajustate, pero el merge debe venir de `feature/v1.19.0-002-cost-estimator`.

---

## 3. Return Envelope (Al terminar)

Escribí en el chat el siguiente reporte:

```markdown
## Fase 6 — Git-Ops
- **Status:** ✅ Completada
- **Comandos Ejecutados:** (Lista rápida)
- **Bugs/Conflictos:** Ninguno
```
