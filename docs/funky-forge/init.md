# funky init — Project Canvas

## ¿Qué problema resuelve?

Pasar de una idea difusa a un proyecto esbocelado. `funky init` genera cinco archivos base — `brief-funcional.md`, `PROJECT-CANVAS.md`, `INFRA-CANVAS.md`, `canvas-planning-guide.md` y `init-prompt.md` — que obligan a definir primero QUÉ se construye y para quién (el brief funcional), luego las decisiones técnicas (los canvases), y al final el prompt de acompañamiento que evalúa el conjunto completo antes de escribir una sola línea de código.

## ¿Cuándo usarlo?

Siempre es el paso 1, al inicio del proyecto. Se puede volver a ejecutar para actualizar las guías (`canvas-planning-guide.md`, `init-prompt.md`) a la versión más reciente; las decisiones del proyecto (brief y canvases) nunca se sobrescriben automáticamente.

## ¿Cuándo NO usarlo?

No hay un guard que bloquee la ejecución: el comando siempre completa con exit 0 salvo error real de I/O. Si ya existe `brief-funcional.md`, `PROJECT-CANVAS.md` o `INFRA-CANVAS.md` en `docs/funky-ai/canvas/`, no se sobrescriben; se omiten y se recomienda eliminar o mover (con backup) si quieres regenerarlas.

## Árbol de archivos

### Templates leídos (inputs)

```
funky-cli/src/templates/init/
├── brief-funcional.md
├── PROJECT-CANVAS.md
├── INFRA-CANVAS.md
├── canvas-planning-guide.md
└── init-prompt.md
```

### Archivos generados (outputs)

```
docs/funky-ai/canvas/
├── brief-funcional.md          (solo si no existía previamente)
├── PROJECT-CANVAS.md           (solo si no existía previamente)
├── INFRA-CANVAS.md             (solo si no existía previamente)
├── canvas-planning-guide.md    (si existe: pregunta Y/N antes de actualizar)
└── init-prompt.md              (si existe: pregunta Y/N antes de actualizar)
```

## Diagrama de flujo

```
funky init
  │
  └─► runInit({ templatesDir, targetBase })
        │  Intentions (orden garantizado):
        ├─ mkdir docs/funky-ai/canvas/
        ├─ copy brief-funcional.md          ← primero: "qué" antes del "cómo" (R7)
        ├─ copy PROJECT-CANVAS.md
        ├─ copy INFRA-CANVAS.md
        ├─ copy canvas-planning-guide.md    ← guía: se actualiza con confirmación
        └─ copy init-prompt.md              ← guía: se actualiza con confirmación (última)
        │
        └─► executeIntentions({ askConfirm })
              ├─ mkdir (si no existe)
              ├─ copy archivo nuevo: se crea sin preguntar
              ├─ copy guía existente: Y/N → actualiza u omite (sin TTY: omite)
              ├─ copy decisión existente: omite + recomendación (eliminar/mover/backup)
              └─ logs por operación
```

## canvas-planning-guide.md y init-prompt.md

Son las guías. Si ya existen y hay terminal, `funky init` pregunta Y/N si quieres actualizarlas con la versión más reciente: `y` → sobrescribe y exit 0; `n` → no sobrescribe y exit 0 (decisión válida, nunca un error). Sin terminal (CI), no se pregunta y las guías se omiten.

## Contrato de feedback

| Caso | Comportamiento | Exit |
|---|---|---|
| Archivo nuevo | Se crea sin preguntar | 0 |
| Guía existente (`canvas-planning-guide.md`, `init-prompt.md`) | Pregunta Y/N: `y` → actualiza; `n` → no actualiza (decisión válida) | 0 |
| Decisión existente (`brief-funcional.md`, `PROJECT-CANVAS.md`, `INFRA-CANVAS.md`) | No pregunta, no sobrescribe; recomienda eliminar o mover de ubicación (backup) | 0 |
| Error real (lectura/escritura, sin permisos) | Mensaje de error claro | 1 |

Regla clave: "el usuario decidió no actualizar" es una operación completada correctamente, nunca un error. Sin terminal (CI): default `n` logueado — no sobrescribir guías sin input humano.

## Salida esperada

Ejecución limpia (no existía nada):

```
✅ Creado directorio: docs/funky-ai/canvas
✅ Creado: docs/funky-ai/canvas/brief-funcional.md
✅ Creado: docs/funky-ai/canvas/PROJECT-CANVAS.md
✅ Creado: docs/funky-ai/canvas/INFRA-CANVAS.md
✅ Creado: docs/funky-ai/canvas/canvas-planning-guide.md
✅ Creado: docs/funky-ai/canvas/init-prompt.md

✅ Canvases creados. Ejecuta `funky scaffold` para instalar el ecosistema completo.
```

Si las decisiones ya existían (se omiten con recomendación) y las guías no:

```
✅ Creado directorio: docs/funky-ai/canvas
⚡ Omitiendo (ya existe): brief-funcional.md. Contiene decisiones del proyecto: no se sobrescriben automáticamente. Si quieres regenerarla, elimínalo o muévelo con backup a otra ubicación.
✅ Creado: docs/funky-ai/canvas/PROJECT-CANVAS.md
✅ Creado: docs/funky-ai/canvas/INFRA-CANVAS.md
✅ Creado: docs/funky-ai/canvas/canvas-planning-guide.md
✅ Creado: docs/funky-ai/canvas/init-prompt.md

✅ Canvases creados. Ejecuta `funky scaffold` para instalar el ecosistema completo.
```

Con terminal, si una guía ya existe, `funky init` pregunta `Ya existe <guía>. ¿Quieres actualizarla con la versión más reciente?` y registra `✅ Actualizada: <guía>` en caso de `y`.
