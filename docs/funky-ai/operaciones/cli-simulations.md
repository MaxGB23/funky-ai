# Matriz de Simulaciones CLI: Auditoría Crítica v1.7.0

A continuación se detallan los vectores de falla detectados durante la auditoría estática de `init.js` y `phase.js`, con foco en evitar flujos destructivos.

## Vector 1: ~~Sobreescritura Destructiva~~ [RESUELTO en v1.7.0]
- **Simulacion:** El usuario ya ejecuto `funky init`, lleno su `PROJECT-CANVAS.md` con detalles importantes y vuelve a ejecutar `funky init` para generarlos de nuevo.
- **Accion:** `funky init` detecta el archivo existente.
- **Resultado Actual:** ✅ El CLI detecta el archivo existente y frena con error — no sobreescribe nada.
- **Fix aplicado:** Validacion de existencia de archivos previo a escritura. Resuelto en v1.7.0.

## Vector 2: Interrupción de UX (Ctrl+C en Prompts)
- **Simulacion:** ~~El usuario inicia `funky init` en setup inicial~~ [OBSOLETO — el modo interactivo fue eliminado. `funky init` no tiene prompts, genera archivos y termina.]
- **Estado:** Flujo simplificado. No hay prompts que interrumpir.

## Vector 3: Errores de Entorno (Permisos Denegados)
- **Simulación:** El usuario corre `funky init` en un directorio de solo lectura.
- **Acción:** `fs.mkdirSync` y `fs.copyFileSync` intentan escribir.
- **Resultado Actual:** Lanza una excepción de Node (e.g. `EACCES`) en medio de la ejecución del loop `for`, dejando un setup corrupto o a la mitad, y el CLI catchea e imprime el error de Node crudo en el catch global de `init.js`.
- **Resultado Esperado (UX):** Debería manejar la excepción de manera que informe al usuario "Error de permisos al escribir en X" y evitar un stacktrace feo.

## Vector 4: Flags Invalidos (`funky init` con archivo previo)
- **Simulacion:** El usuario ejecuta `funky init` pero ya tiene un `PROJECT-CANVAS.md` de otra iteracion.
- **Accion:** `funky init` detecta archivo existente.
- **Resultado Actual:** La logica verifica si existe el archivo y frena con codigo `1` y el mensaje `"❌ Error: Ya existe PROJECT-CANVAS.md o INFRA-CANVAS.md en el directorio."`. 
- **Resultado Esperado (UX):** Correcto. Evita perdida de datos. No requiere fix.

## Vector 5: Fase Destructiva (`funky phase`)
- **Simulación:** El usuario ejecuta `funky phase explore` habiendo ya un `sdd-explore.md` en progreso con análisis.
- **Acción:** Ejecuta `runPhase` y revisa si el target existe.
- **Resultado Actual:** El CLI detecta el archivo y aborta la ejecución con mensaje claro evitando pérdida de datos.
- **Resultado Esperado (UX):** Correcto. No requiere fix.
