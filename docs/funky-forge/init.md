# funky init — Project Canvas

## ¿Qué problema resuelve?

Pasar de una idea difusa a un proyecto esbocelado. `funky init` genera dos archivos base — `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` — que obligan a responder las preguntas fundamentales antes de escribir una sola línea de código.

## ¿Cuándo usarlo?

Siempre es el paso 1. Se ejecuta una sola vez por repositorio, al inicio del proyecto.

## ¿Cuándo NO usarlo?

Si ya existe `PROJECT-CANVAS.md` o `INFRA-CANVAS.md` en `docs/funky-ai/canvas/`. El comando falla deliberadamente con código de salida 1 para evitar sobrescribir trabajo existente.

```
❌ Error: Ya existe PROJECT-CANVAS.md o INFRA-CANVAS.md en docs/funky-ai/canvas/.
```

## Árbol de archivos

### Templates leídos (inputs)

```
funky-cli/src/templates/init/
├── PROJECT-CANVAS.md
├── INFRA-CANVAS.md
└── canvas-planning-guide.md
```

### Archivos generados (outputs)

```
docs/funky-ai/canvas/
├── PROJECT-CANVAS.md
├── INFRA-CANVAS.md
└── canvas-planning-guide.md   (solo si no existía previamente)
```

## Diagrama de flujo

```
funky init
  │
  ├─► findCanvases
  │     ├─ ¿Existe PROJECT-CANVAS.md?   → SÍ → ❌ exit(1)
  │     └─ ¿Existe INFRA-CANVAS.md?     → SÍ → ❌ exit(1)
  │
  └─► runInit
        ├─ Intención: mkdir docs/funky-ai/canvas/
        ├─ Intención: copy PROJECT-CANVAS.md
        ├─ Intención: copy INFRA-CANVAS.md
        ├─ ¿Existe canvas-planning-guide.md?
        │     └─ NO → Intención: copy canvas-planning-guide.md
        │
        └─► executeIntentions
              ├─ mkdir (si no existe)
              ├─ copy cada archivo (skip si ya existe)
              └─ muestra logs por operación
```

## canvas-planning-guide.md

Es la excepción a la regla: se copia solo si no existe. Los otros dos archivos (`PROJECT-CANVAS.md` e `INFRA-CANVAS.md`) siempre provocan un error si ya están presentes. `canvas-planning-guide.md`, en cambio, se omite silenciosamente si ya fue copiado en una ejecución anterior, permitiendo que el comando complete sin error.

## Salida esperada

```
✅ Creado directorio: docs/funky-ai/canvas
✅ Creado: docs/funky-ai/canvas/PROJECT-CANVAS.md
✅ Creado: docs/funky-ai/canvas/INFRA-CANVAS.md
✅ Creado: docs/funky-ai/canvas/canvas-planning-guide.md

✅ Canvases creados. Ejecuta `funky scaffold` para instalar el ecosistema completo.
```

Si `canvas-planning-guide.md` ya existía de una ejecución anterior:

```
✅ Creado directorio: docs/funky-ai/canvas
✅ Creado: docs/funky-ai/canvas/PROJECT-CANVAS.md
✅ Creado: docs/funky-ai/canvas/INFRA-CANVAS.md
⚡ Salteando (ya existe): docs/funky-ai/canvas/canvas-planning-guide.md

✅ Canvases creados. Ejecuta `funky scaffold` para instalar el ecosistema completo.
```
