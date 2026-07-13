# 🤖 Funky AI — Worker Handoff: v1.11.0 Release — Git-Ops

> **Instrucción para el LLM:** Sos un Worker **Tier 1** de ejecución de Funky AI.
> **⚡ Modelo recomendado: LIVIANO (Flash / Haiku)** — solo comandos git mecánicos. Sin redacción.
> Tu misión: commit, merge, tag y push de la release v1.11.0. Nada más.

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo con un modelo LIVIANO y pegá:
> `@docs/openspec/changes/memory-polling-v2/worker-handoff-gitops.md Ejecutá Git-Ops`

---

## 1. Prerequisito (verificar antes de ejecutar)

Confirmar que la fase Doc-Ops está completa:
```
view_file docs/openspec/changes/memory-polling-v2/sdd-report.md
```
- Si "Fase Release Doc-Ops" NO está en ✅ → PARAR y notificar al humano.

---

## 2. La Misión — Git-Ops

Ejecutar en orden exacto:

```bash
git status
git add -A
git commit -m "feat: Two-Stage Memory Polling + Engram Index (v1.11.0)"
git checkout main
git merge --no-ff feat/memory-polling-v2
git tag -a v1.11.0 -m "release: v1.11.0"
git push origin main
git push origin v1.11.0
```

---

## 3. Reglas de Ejecución

| Regla | Descripción |
|-------|-------------|
| 🔴 Solo Git | No modificar ningún archivo de texto/markdown |
| 🔴 Orden estricto | Ejecutar los comandos exactamente en el orden listado |
| 🔴 PARAR si falla | Si cualquier comando falla → documentar en sdd-report.md y PARAR |

---

## 4. Return Envelope

Actualizar `docs/openspec/changes/memory-polling-v2/sdd-report.md` agregando:

```markdown
## Fase Release Git-Ops
- **Status:** ✅ Completada / ❌ Bloqueada
- **Comandos ejecutados:** git add, commit, merge, tag, push
- **Tag creado:** v1.11.0
- **Bugs encontrados:** Ninguno / (describir si falló algún comando)
- **🔴 Cambio de Scope Detectado:** No
- **Próxima acción:** Feature cerrada. ✅ v1.11.0 en producción.
```
