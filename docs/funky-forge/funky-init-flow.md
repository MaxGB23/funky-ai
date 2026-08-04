# 📘 Flujo Interno: `funky init` y `funky scaffold`

> **Versión documentada:** v3.2.0+  
> **Ultima actualizacion:** 2026-07-29  
> **Estado:** ✅ Estable

---

## 1. Vision General

El CLI tiene dos comandos de inicialización:

1. **`funky init`** — Genera PROJECT-CANVAS.md, INFRA-CANVAS.md y la guía de planeacion.
2. **`funky scaffold`** — Copia toda la estructura base del ecosistema Funky AI (reglas de agentes, ORCHESTRATOR-STATE, directorios engram, plantillas SDD). No requiere canvases, pero si existen los respeta.

No existen modos interactivos ni prompts. El CLI genera los archivos y termina. El equipo discute las decisiones en chat con IA, no en la terminal.

---

## 2. Arbol de Decision (Flujo Completo)

### `funky init`

```
funky init
│
├─ ¿existe PROJECT-CANVAS.md o INFRA-CANVAS.md?
│   ├─ SI  → Error: "ya existe" → process.exit(1)
│   └─ NO  → mkdir docs/funky-ai/canvas/
│             → copy PROJECT-CANVAS.md, INFRA-CANVAS.md
│             → copy canvas-planning-guide.md (si no existe)
│             → "Ejecuta `funky scaffold` para instalar el ecosistema"
│             → process.exit(0)
```

### `funky scaffold`

```
funky scaffold
│
├─ runScaffold({ templatesDir: bootstrap, targetBase: cwd })
│   ├─ Copia archivos root (ORCHESTRATOR-STATE.md, README.md, TEMPLATE_GUIDE.md)
│   ├─ Copia reglas de agente → .agents/rules/
│   ├─ Copia templates SDD → .agents/templates/sdd/
│   ├─ Copia docs compartidos (docs-live-index.md, docs-index/template.md) → .agents/templates/sdd/
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
| `src/commands/init.js` | Orquestador del comando `funky init`: genera canvases, verifica duplicados |
| `src/commands/scaffold.js` | Orquestador del comando `funky scaffold`: ejecuta `runScaffold()` para copiar el ecosistema |
| `src/utils/canvas.js` | Funcion `generateCanvasMarkdown(config)`: interpola el canvas como string Markdown |

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

### 3.3 Archivos dinámicos (generados por `funky init`)

| Archivo | Generado por | Con datos de |
|---|---|---|
| `PROJECT-CANVAS.md` | `generateProjectCanvasMarkdown(config)` | `projectData` del canvasConfig. Por defecto vacio `{}` con placeholders guia |
| `INFRA-CANVAS.md` | `generateInfraCanvasMarkdown(config)` | `infraData` del canvasConfig. Por defecto vacio `{}` con placeholders guia |

---

## 4. Idempotencia

`funky init` y `funky scaffold` son idempotentes por diseño. Ejecutarlos múltiples veces en el mismo directorio es seguro:

- Cada archivo se verifica con `fs.existsSync()` antes de copiarse o escribirse
- Si existe → `⚠️ ... ya existe. No se sobrescribió.`
- Si no existe → se crea
- El `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` nunca se sobreescriben

---
