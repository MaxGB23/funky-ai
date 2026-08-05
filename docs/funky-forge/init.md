# funky init — Project Canvas

## ¿Qué problema resuelve?

Pasar de una idea difusa a un proyecto esbocelado. `funky init` genera cuatro archivos base — `brief-funcional.md`, `PROJECT-CANVAS.md`, `INFRA-CANVAS.md` y `canvas-planning-guide.md` — que obligan a definir primero QUÉ se construye y para quién (el brief funcional) y luego las decisiones técnicas (los canvases), antes de escribir una sola línea de código.

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
├── brief-funcional.md
├── PROJECT-CANVAS.md
├── INFRA-CANVAS.md
└── canvas-planning-guide.md
```

### Archivos generados (outputs)

```
docs/funky-ai/canvas/
├── brief-funcional.md          (solo si no existía previamente)
├── PROJECT-CANVAS.md
├── INFRA-CANVAS.md
└── canvas-planning-guide.md   (solo si no existía previamente)
```

## Diagrama de flujo

```
funky init
  │
  ├─► Guard: ¿Existe PROJECT-CANVAS.md o INFRA-CANVAS.md?
  │     └─ SÍ → ❌ Error + exit(1)
  │
  └─► runInit({ templatesDir, targetBase })
        │  Intentions (orden garantizado):
        ├─ mkdir docs/funky-ai/canvas/
        ├─ copy brief-funcional.md          ← primero: "qué" antes del "cómo" (R7)
        ├─ copy PROJECT-CANVAS.md
        ├─ copy INFRA-CANVAS.md
        └─ copy canvas-planning-guide.md
        │
        └─► executeIntentions
              ├─ mkdir (si no existe)
              ├─ copy cada archivo (skip silencioso si el destino ya existe)
              └─ logs por operación
```

## canvas-planning-guide.md y brief-funcional.md

Son la excepción a la regla: se copian solo si no existen y se omiten silenciosamente si ya fueron copiados en una ejecución anterior, permitiendo que el comando complete sin error. Solo `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` provocan un error si ya están presentes (el guard de `funky init`).

## Salida esperada

```
✅ Creado directorio: docs/funky-ai/canvas
✅ Creado: docs/funky-ai/canvas/brief-funcional.md
✅ Creado: docs/funky-ai/canvas/PROJECT-CANVAS.md
✅ Creado: docs/funky-ai/canvas/INFRA-CANVAS.md
✅ Creado: docs/funky-ai/canvas/canvas-planning-guide.md

✅ Canvases creados. Ejecuta `funky scaffold` para instalar el ecosistema completo.
```

Si `canvas-planning-guide.md` ya existía de una ejecución anterior:

```
✅ Creado directorio: docs/funky-ai/canvas
✅ Creado: docs/funky-ai/canvas/brief-funcional.md
✅ Creado: docs/funky-ai/canvas/PROJECT-CANVAS.md
✅ Creado: docs/funky-ai/canvas/INFRA-CANVAS.md
⚡ Salteando (ya existe): docs/funky-ai/canvas/canvas-planning-guide.md

✅ Canvases creados. Ejecuta `funky scaffold` para instalar el ecosistema completo.
```

Si también `brief-funcional.md` ya existía, aparece la misma línea `⚡ Salteando (ya existe)` para el brief, antes de los canvases, y el comando completa sin error.
