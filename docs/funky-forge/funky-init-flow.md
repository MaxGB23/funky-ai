# 📘 Flujo Interno: `funky init` y `funky scaffold`

> **Versión documentada:** v4.3.2  
> **Ultima actualizacion:** 2026-08-08  
> **Estado:** ✅ Estable

---

## 1. Vision General

El CLI tiene dos comandos de inicialización:

1. **`funky init`** — Genera el brief funcional, PROJECT-CANVAS.md, INFRA-CANVAS.md y las guías (canvas-planning-guide.md, init-prompt.md), el brief primero.
2. **`funky scaffold`** — Copia toda la estructura base del ecosistema Funky AI (reglas de agentes, ORCHESTRATOR-STATE, directorios engram, plantillas SDD). No requiere canvases, pero si existen los respeta.

No hay modos interactivos obligatorios: el CLI genera los archivos y termina. La única confirmación interactiva es la Y/N para actualizar guías existentes (ver sección 3.3); el equipo discute las decisiones en chat con IA, no en la terminal.

---

## 2. Arbol de Decision (Flujo Completo)

### `funky init`

```
funky init
│
└─► runInit({ templatesDir, targetBase }) → executeIntentions
      ├─ mkdir docs/funky-ai/canvas/
      ├─ copy brief-funcional.md                    (kind: decision — primero: "qué" antes del "cómo")
      ├─ copy PROJECT-CANVAS.md                     (kind: decision)
      ├─ copy INFRA-CANVAS.md                       (kind: decision)
      ├─ copy canvas-planning-guide-template.md     (kind: guide)
      └─ copy init-prompt-template.md               (kind: guide, última)
            │
            ├─ Archivo nuevo      → ✅ Creado (sin preguntar)
            ├─ Decisión existente → ⚡ Omitiendo + recomendación (eliminar/mover con backup)
            ├─ Guía existente + TTY  → Y/N: ✅ Actualizada / ⚡ Omitiendo
            ├─ Guía existente sin TTY → omite (default n)
            └─ Summary: "Canvases creados" / "Canvases listos: N creados, M conservados" / "Nada que crear"
```

### `funky scaffold`

```
funky scaffold
│
├─ runScaffold({ templatesDir: bootstrap, targetBase: cwd })
│   ├─ Copia archivos root (ORCHESTRATOR-STATE.md, README.md, TEMPLATE_GUIDE.md)
│   ├─ Copia reglas de agente → .agents/rules/
│   ├─ Copia templates SDD → .agents/templates/sdd/
│   ├─ Copia docs compartidos (docs-live-index.md, docs-index/_indice-seccional-template.md) → .agents/templates/sdd/
│   ├─ Crea directorios engram (docs/engram/{architecture,pattern,...})
│   └─ Cada archivo existente se saltea (idempotente)
│
└─ (fin)
```

---

## 3. Archivos Involucrados

### 3.1 Código fuente

| Archivo | Rol |
|---|---|
| `src/commands/init.js` | Orquestador del comando `funky init`: expone `runInit({ templatesDir, targetBase })` (función pura que devuelve las intenciones ordenadas, cada una con su `kind`: decision/guide) y el action que ejecuta `executeIntentions()` con confirmación Y/N para guías |
| `src/commands/scaffold.js` | Orquestador del comando `funky scaffold`: ejecuta `runScaffold()` para copiar el ecosistema |
| `src/utils/fs-adapter.js` | `executeIntentions(intentions)`: ejecuta mkdir/copy con skip-if-exists y logs |

### 3.2 Templates estáticos (copiados por `funky scaffold`)

Ubicación base: `src/templates/bootstrap/`

| Archivo fuente | Destino en el proyecto | Comportamiento |
|---|---|---|
| `ORCHESTRATOR-STATE.md` | `ORCHESTRATOR-STATE.md` | Estático general |
| `funky-ai-rules/engram-protocol.md` | `.agents/rules/engram-protocol.md` | Estático |
| `funky-ai-rules/secops.md` | `.agents/rules/secops.md` | Estático |
| `funky-ai-rules/sdd-orchestrator.md` | `.agents/rules/sdd-orchestrator.md` | Estático |
| *(scaffold de directorios)* | `docs/engram/architecture/`, `pattern/`, `discovery/`, `decision/`, `bugfix/` | Creados con `fs.mkdirSync` — no son archivos copiados sino directorios vacíos |
| `TEMPLATE_GUIDE.md` | `TEMPLATE_GUIDE.md` | Estático general |
| `sdd/000-rfc-template.md` | `openspec/rfcs/000-rfc-template.md` | Estático general |

> ⚠️ Todos son **estáticos**. Se copian con `fs.copyFileSync` o `fs.writeFileSync`, sin interpolación de variables. El canvas NO alimenta ninguno de estos archivos.

### 3.3 Archivos generados por `funky init`

`funky init` copia los templates estáticos de `src/templates/init/` (sufijo `-template` en el nombre de fuente) al directorio canónico `docs/funky-ai/canvas/`, en el orden de las intenciones de `runInit`:

| Archivo (output) | Generado desde | Comportamiento |
|---|---|---|
| `brief-funcional.md` | `src/templates/init/brief-funcional.md` | Primer output: define el "qué" antes del "cómo". kind `decision`: no se sobrescribe |
| `PROJECT-CANVAS.md` | `src/templates/init/PROJECT-CANVAS.md` | kind `decision`: no se sobrescribe |
| `INFRA-CANVAS.md` | `src/templates/init/INFRA-CANVAS.md` | kind `decision`: no se sobrescribe |
| `canvas-planning-guide.md` | `src/templates/init/canvas-planning-guide-template.md` | kind `guide`: si existe, Y/N (sin TTY: default `n`) |
| `init-prompt.md` | `src/templates/init/init-prompt-template.md` | kind `guide`: si existe, Y/N (sin TTY: default `n`). Última intención |

No existe un guard que bloquee la ejecución: cada archivo se maneja por su `kind`. Las decisiones existentes se omiten con recomendación de eliminar/mover con backup; las guías existentes solo se actualizan con confirmación Y/N (sin terminal, default `n`). El comando siempre completa con exit 0 salvo error real de I/O.

---

## 4. Idempotencia

`funky init` y `funky scaffold` son idempotentes por diseño. Ejecutarlos múltiples veces en el mismo directorio es seguro:

- Cada archivo se verifica con `fs.existsSync()` antes de copiarse o escribirse
- Decisión existente (`brief-funcional.md`, `PROJECT-CANVAS.md`, `INFRA-CANVAS.md`) → `⚡ Omitiendo (ya existe): <archivo>...` con recomendación de eliminar/mover con backup
- Guía existente (`canvas-planning-guide.md`, `init-prompt.md`) → Y/N (con terminal) o default `n` logueado (sin terminal); nunca se sobrescribe sin input humano
- Si todo existe → `ℹ️ Nada que crear: todos los archivos ya existen.`

---
