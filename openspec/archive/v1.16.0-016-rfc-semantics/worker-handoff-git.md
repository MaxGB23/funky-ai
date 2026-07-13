# 🤖 Funky AI — Worker Handoff: Fase X+1 (Git-Ops)

> **Instrucción para el LLM:** Sos un Worker **Tier T1 — ⚡ Flash / Haiku** de ejecución de Funky AI.
> Tu única misión es ejecutar comandos git para consolidar la feature.
> **NO redactes código ni edites archivos. Solo comandos en terminal.**

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@docs/openspec/archive/v1.16.0-016-rfc-semantics/worker-handoff-git.md Ejecutá la Fase X+1 (Git-Ops)`

---

## 1. Inyección de Contexto (Safe-Contexting)

### A) Especificación de Tarea
```
view_file docs/openspec/archive/v1.16.0-016-rfc-semantics/tasks.md
```

---

## 2. La Misión (Surgical Task)

**Objetivo:** Hacer commit de los cambios de la Tarea 016 y mergear a main.

**Directiva Agent DRY:**
Leé tus tareas a ejecutar directamente desde la Fase X+1 en `tasks.md` (cargado en §1.A).

- Commit message declarado por el orquestador: `docs(sdd): define rfc semantics and guardrails`
- Rama: `feat/v1.16.0-016-rfc-semantics`

---

## 3. Reglas de Ejecución Estrictas

| Regla | Descripción |
|-------|-------------|
| 🔴 Git Ops Puro | No edites ningún archivo de texto. |
| 🔴 Foco Láser | Solo ejecutar `git status`, `git add`, `git commit`, `git checkout main`, `git merge`. |

---

## 4. Criterios de Éxito

- [ ] Commit creado con éxito.
- [ ] Merge a main exitoso.

---

## 5. Return Envelope (Al terminar)

Actualizá `docs/openspec/archive/v1.16.0-016-rfc-semantics/sdd-report.md` con:

```markdown
## Fase X+1 — Git-Ops
- **Status:** ✅ Completada
- **Comandos ejecutados:** (lista de comandos git exitosos)
- **Bugs/Conflictos:** Ninguno / (describir si falló el merge)
```
