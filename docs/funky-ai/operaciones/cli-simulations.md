# Matriz de Simulaciones CLI: Auditoría Crítica v1.7.0

A continuación se detallan los vectores de falla detectados durante la auditoría estática de `init.js` y `phase.js`, con foco en evitar flujos destructivos.

## Vector 1: ~~Sobreescritura Destructiva~~ [RESUELTO en v1.7.0]
- **Simulación:** El usuario ya corrió `funky init --template`, llenó su `PROJECT-CANVAS.md` con detalles importantes y vuelve a ejecutar `funky init` para inicializar el scaffolding.
- **Acción:** `funky init` detecta el archivo existente.
- **Resultado Actual:** ✅ El CLI detecta ambos Canvas y activa modo Headless — no sobreescribe ninguno. La validación de existencia es individual por archivo.
- **Fix aplicado:** Validación con `skipProjectCanvas` / `skipInfraCanvas` en `runInit()`. Resuelto en v1.7.0.

## Vector 2: Interrupción de UX (Ctrl+C en Prompts)
- **Simulación:** El usuario inicia `funky init` en modo interactivo, pero se arrepiente en la mitad del prompt de framework y aprieta `Ctrl+C`.
- **Acción:** `onCancel` dispara `process.exit(0)`.
- **Resultado Actual:** El proceso termina de forma limpia antes de que se llame a `runInit`. No se escriben archivos a disco.
- **Resultado Esperado (UX):** Es aceptable. Aunque podría usarse un código de salida `1` o distinto de `0` para que otros scripts sepan que la operación fue cancelada por el usuario.

## Vector 3: Errores de Entorno (Permisos Denegados)
- **Simulación:** El usuario corre `funky init` en un directorio de solo lectura.
- **Acción:** `fs.mkdirSync` y `fs.copyFileSync` intentan escribir.
- **Resultado Actual:** Lanza una excepción de Node (e.g. `EACCES`) en medio de la ejecución del loop `for`, dejando un setup corrupto o a la mitad, y el CLI catchea e imprime el error de Node crudo en el catch global de `init.js`.
- **Resultado Esperado (UX):** Debería manejar la excepción de manera que informe al usuario "Error de permisos al escribir en X" y evitar un stacktrace feo.

## Vector 4: Banderas Inválidas (`--template` con archivo previo)
- **Simulación:** El usuario ejecuta `funky init --template` pero ya tiene un `PROJECT-CANVAS.md` de otra iteración.
- **Acción:** Ejecuta el bloque de `--template` en `init.js`.
- **Resultado Actual:** La lógica verifica si existe el archivo y frena el proceso con código `1` y el mensaje `"❌ Error: El archivo PROJECT-CANVAS.md ya existe."`. 
- **Resultado Esperado (UX):** Correcto. Evita pérdida de datos. No requiere fix.

## Vector 5: Fase Destructiva (`funky phase`)
- **Simulación:** El usuario ejecuta `funky phase explore` habiendo ya un `sdd-explore.md` en progreso con análisis.
- **Acción:** Ejecuta `runPhase` y revisa si el target existe.
- **Resultado Actual:** El CLI detecta el archivo y aborta la ejecución con mensaje claro evitando pérdida de datos.
- **Resultado Esperado (UX):** Correcto. No requiere fix.
