# Worker Handoff — Auditoría README.md v1.6.0

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@docs/openspec/changes/v1.6-tdd-ci/worker-handoff-readme-audit.md Ejecutá la auditoría`

---

## 🎯 Misión
Auditar y actualizar `README.md` para que refleje con precisión el estado real del repositorio en v1.6.0. Cada ruta listada en el README debe existir en el disco. Las secciones deben estar actualizadas.

## 📂 Contexto
- **Rama activa:** `main`
- **Versión actual:** v1.6.0
- **Repo GitHub:** `https://github.com/MaxGB23/funky-ai`
- **Archivo a auditar:** `README.md` (root del repo)

---

## ✅ Tareas

### 1. Auditoría de rutas (verificar existencia real)
Para cada archivo/carpeta listado en el README, verificá con `list_dir` o `view_file` si realmente existe en el disco. Documentá en el report cuáles existen y cuáles están rotos.

Rutas a verificar (extraídas del README actual):

**Sección 1 — Core Concepts:**
- `docs/funky-ai/core-concepts/manifiesto.md`
- `docs/funky-ai/core-concepts/filosofia.md`
- `docs/funky-ai/core-concepts/rules-vs-skills.md`

**Sección 2 — Manuales Operativos:**
- `docs/funky-ai/funky-ai.md`
- `docs/funky-ai/funky-ai-team-guide.md`
- `docs/funky-ai/funky-ai-tutorial-app.md`
- `docs/funky-ai/guia-flujo-completo.md`

**Sección 3 — IDE Setup:**
- `docs/prompts/GEMINI-funky-global.md`
- `.agents/rules/engram-protocol.md`
- `.agents/rules/secops.md`

**Sección 5 — Roadmap:**
- `docs/BACKLOG.md`
- `docs/funky-ai/propuestas/propuesta-v1.2-cli-ecosystem.md`
- `docs/funky-ai/releases/v1.1.0-release.md`

**Sección 7 — Referencia:**
- `docs/funky-ai/refactor/auditoria-claude-md.md`
- `docs/funky-ai/refactor/inventario-completo-skills.md`
- `docs/gentle-ai/`

**Sección 8 — Journey:**
- `docs/funky-ai/journey/01-orchestrator-vs-worker-boundary.md`

### 2. Agregar entradas faltantes
Los siguientes archivos/secciones existen pero NO están en el README. Agregarlos donde corresponda:

- **Sección 5 — Releases:** Agregar las releases faltantes: `v1.2.0`, `v1.3.0`, `v1.4.0`, `v1.5.0`, `v1.6.0` (verificar si existen en `docs/funky-ai/releases/`).
- **Sección 1 — Core Concepts:** Verificar si `docs/funky-ai/core-concepts/testing-landscape.md` existe y agregarlo.
- **Sección 4 — CLI:** Mencionar que desde v1.6 el CLI tiene tests (`pnpm test` en `funky-cli/`).

### 3. Eliminar entradas rotas
Si alguna ruta no existe en el disco, eliminar la fila de la tabla del README. No dejar links muertos.

## ⚠️ Restricciones
- **NO inventar rutas.** Solo listar lo que realmente existe en disco.
- **NO modificar** la estructura de secciones ni los títulos del README.
- **NO agregar** archivos al disco. Solo editar el `README.md`.

## 📋 Return Envelope

Al terminar, actualizar `docs/openspec/changes/v1.6-tdd-ci/report.md` con:

```markdown
## Auditoría README
- **Status:** ✅ Completada / ❌ Bloqueada
- **Rutas rotas encontradas:** (lista)
- **Rutas agregadas:** (lista)
- **Bugs encontrados:** (incluyendo anti-patrones descartados)
- **Próxima acción:** Orquestador hace commit final del README
```

> **[SISTEMA — PARA EL WORKER]** Al terminar, decile al humano que vuelva al chat del Orquestador con el reporte. El Orquestador hará el commit final.
