# 📘 Flujo Interno: `funky init`

> **Versión documentada:** v1.7.0  
> **Última actualización:** 2026-04-23  
> **Estado:** ⚠️ Bugs conocidos documentados en sección 4

---

## 1. Visión General

El comando `funky init` es el punto de entrada al ecosistema Funky AI. Su responsabilidad es generar la estructura base de un proyecto: reglas de agente, memoria persistente (engram), templates SDD y el canvas del proyecto.

Tiene **dos modos de ejecución** que se activan automáticamente según el estado del directorio:

| Modo | Condición | Comportamiento |
|---|---|---|
| **Interactivo** | No existe `PROJECT-CANVAS.md` | Lanza prompts con `@clack/prompts`, genera canvas con los valores elegidos |
| **Headless** | Existe `PROJECT-CANVAS.md` | Omite prompts, preserva el canvas tal cual, solo copia archivos faltantes |

Además existe el flag `--template` (`-t`) para generar un canvas vacío sin ejecutar el scaffolding completo.

---

## 2. Árbol de Decisión (Flujo Completo)

```
funky init [--template?]
│
├─ ¿flag --template?
│   └─ SÍ
│       ├─ ¿existe PROJECT-CANVAS.md?
│       │   ├─ SÍ  → ❌ Error: "ya existe" → process.exit(1)
│       │   └─ NO  → generateCanvasMarkdown({}) → escribe canvas vacío → process.exit(0)
│       └─ (fin, no continúa al scaffolding)
│
└─ ¿existe PROJECT-CANVAS.md en cwd?
    │
    ├─ SÍ → Modo Headless
    │       canvasConfig = { fromHeadless: true }
    │       └─ runInit()
    │           ├─ Copia 7 archivos estáticos (skip si ya existen)
    │           └─ "⚡ Salteando: PROJECT-CANVAS.md"
    │
    └─ NO → Modo Interactivo
            └─ @clack/prompts group:
                ├─ select: Patrón Arquitectónico (pattern)
                ├─ select: Framework UI (ui)
                └─ confirm: TDD (testing) → devuelve boolean
            │
            canvasConfig = { pattern, ui, testing }
            │
            └─ runInit()
                ├─ Copia 7 archivos estáticos (skip si ya existen)
                └─ generateCanvasMarkdown(canvasConfig) → escribe PROJECT-CANVAS.md
```

---

## 3. Archivos Involucrados

### 3.1 Código fuente

| Archivo | Rol |
|---|---|
| `src/commands/init.js` | Orquestador del comando: detecta modo, lanza prompts, llama a `runInit()` |
| `src/utils/canvas.js` | Función `generateCanvasMarkdown(config)`: interpola el canvas como string Markdown |

### 3.2 Templates estáticos (copiados tal cual)

Ubicación: `src/templates/bootstrap/`

| Archivo fuente | Destino en el proyecto |
|---|---|
| `ORCHESTRATOR-STATE.md` | `ORCHESTRATOR-STATE.md` |
| `agents-rules-engram-protocol.md` | `.agents/rules/engram-protocol.md` |
| `agents-rules-secops.md` | `.agents/rules/secops.md` |
| `agents-rules-sdd-orchestrator.md` | `.agents/rules/sdd-orchestrator.md` |
| `engram-discoveries.md` | `docs/engram/discoveries.md` |
| `engram-bugfixes.md` | `docs/engram/bugfixes.md` |
| `plantilla-worker-handoff.md` | `docs/funky-ai/workers/plantilla-worker-handoff.md` |

> ⚠️ Todos son **estáticos**. Se copian con `fs.copyFileSync`, sin interpolación de variables. El canvas NO alimenta ninguno de estos archivos.

### 3.3 Archivo dinámico

| Archivo | Generado por | Con datos de |
|---|---|---|
| `PROJECT-CANVAS.md` | `generateCanvasMarkdown(config)` | Respuestas de los prompts (modo interactivo) o vacío `{}` (modo `--template`) |

---

## 4. Bugs Conocidos (v1.7.0)

### BUG-01 — Mismatch de clave `ui` → `styling`

**Síntoma:** El usuario elige "Tailwind" en el prompt de UI, pero la sección 4 del canvas muestra `No definido`.

**Causa:** Desacoplamiento entre la clave que guarda `init.js` y la que lee `canvas.js`.

```js
// init.js — guarda con clave "ui":
canvasConfig = { pattern, ui: group.ui, testing }

// canvas.js — lee con clave "styling":
## 4. Estrategia de Estilos y UI
${config.styling || 'No definido'}  // → "ui" nunca llega acá
```

**Fix:** Unificar la clave a `styling` en `init.js`, o viceversa. Requiere decisión de naming canónico.

---

### BUG-02 — `testing` se guarda como `boolean`, no como texto

**Síntoma:** La sección 5 del canvas muestra el literal `true` en lugar de texto descriptivo.

**Causa:** `p.confirm()` de `@clack/prompts` devuelve `boolean`. Se interpola directamente sin transformación.

```js
// Valor recibido:
testing: true  // (boolean)

// Canvas resultante:
## 5. Testing y CI/CD
true            // ← no es texto legible
```

**Fix:** Transformar el boolean antes de pasarlo al canvas:
```js
testing: group.testing ? 'TDD — Test-Driven Development' : 'Sin estrategia de testing definida'
```

---

## 5. Deuda Técnica Identificada

### DT-01 — Los templates estáticos no consumen el canvas

El `ORCHESTRATOR-STATE.md`, las reglas de agente y los demás archivos de bootstrap son copiados como archivos estáticos sin ninguna referencia al `PROJECT-CANVAS.md`. Esto significa que el ecosistema generado es genérico e independiente del tipo de proyecto configurado.

**Impacto:** Un proyecto Next.js + Clean Architecture y uno Astro + Modular reciben exactamente los mismos archivos de contexto para el agente. La IA no tiene forma de saber con qué stack está trabajando a menos que el usuario edite los archivos manualmente.

**Dirección de solución:** Migrar los templates críticos (al menos `ORCHESTRATOR-STATE.md`) a un sistema de interpolación que consuma el `canvasConfig` generado en el `init`.

---

### DT-02 — Modo Headless no parsea el canvas existente

Cuando se detecta un `PROJECT-CANVAS.md`, el CLI lo respeta (no lo sobreescribe) pero tampoco lo lee. El `canvasConfig` en modo headless es `{ fromHeadless: true }` — un flag vacío.

**Impacto:** En una re-inicialización headless, no es posible poblar los archivos estáticos con los datos que ya estaban definidos en el canvas.

**Dirección de solución:** Implementar un parser de Markdown que extraiga las secciones del canvas y reconstruya el `canvasConfig`, para que el headless pueda usarlo igual que el interactivo.

---

### DT-03 — Preguntas del CLI insuficientes para proyectos de escala real

Los prompts actuales cubren solo 3 dimensiones (patrón, UI y TDD). No capturan información sobre framework base, runner de testing, gestión de estado ni estrategia de deployment, que son decisiones arquitectónicas fundamentales que deberían quedar registradas en el canvas desde el inicio.

Ver observación completa: `testeo-de-features/v1.7/interactive/observaciones-interactive.md` → OBS-03.

---

## 6. Idempotencia

`funky init` es idempotente por diseño. Ejecutarlo múltiples veces en el mismo directorio es seguro:

- Cada archivo de la lista estática se verifica con `fs.existsSync()` antes de copiarse
- Si existe → `⚡ Salteando (ya existe): <archivo>`
- Si no existe → `✅ Creado: <archivo>`
- El `PROJECT-CANVAS.md` nunca se sobreescribe en modo headless

---

## 7. Estructura resultante post `funky init`

```
proyecto/
├── .agents/
│   └── rules/
│       ├── engram-protocol.md
│       ├── secops.md
│       └── sdd-orchestrator.md
├── docs/
│   ├── engram/
│   │   ├── discoveries.md
│   │   └── bugfixes.md
│   └── funky-ai/
│       └── workers/
│           └── plantilla-worker-handoff.md
├── ORCHESTRATOR-STATE.md
└── PROJECT-CANVAS.md
```
