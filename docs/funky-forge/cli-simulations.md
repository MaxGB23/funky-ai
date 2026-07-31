# Matriz de Simulaciones CLI: Auditoría Crítica

A continuación se detallan los vectores de falla detectados durante auditorías del CLI, con foco en evitar flujos destructivos. Versión cubierta: v3.2.0+.

## Vector 1: ~~Sobreescritura Destructiva~~ [RESUELTO en v1.7.0]
- **Simulación:** El usuario ya ejecutó `funky init`, llenó sus canvases con detalles importantes y vuelve a ejecutar `funky init`.
- **Acción:** `funky init` detecta los archivos existentes.
- **Resultado Actual:** ✅ El CLI frena con error — no sobreescribe nada. También aplica a `funky scaffold` (cada archivo se verifica con `existsSync` antes de copiar).
- **Fix aplicado:** Validación de existencia de archivos previo a escritura. Resuelto en v1.7.0.

## Vector 2: Errores de Entorno (Permisos Denegados) [RESUELTO]
- **Simulación:** El usuario corre `funky init` en un directorio de solo lectura.
- **Acción:** `fs.mkdirSync` y `fs.copyFileSync` / `fs.writeFileSync` intentan escribir.
- **Resultado Anterior:** ⚠️ Lanzaba excepción EACCES de Node crudo — setup potencialmente incompleto.
- **Fix Aplicado:**
  - `executeIntentions()` (usado por init): cada operación FS captura EACCES y lanza `"Error de permisos al crear directorio / copiar archivo en X. Verifica que tengas permisos de escritura."`
  - `init.js` catch blocks: propagan el mensaje amigable sin stacktrace.
  - `assess.js` y `estimate.js`: cada FS op detecta `err.code === 'EACCES'` y muestra mensaje amigable con la ruta específica.
- **Resultado Actual:** ✅ Mensaje claro y sin stacktrace. El usuario sabe qué archivo/directorio causó el problema.

## Vector 3: Flags Inválidos (`funky init` con archivo previo)
- **Simulación:** El usuario ejecuta `funky init` pero ya tiene un `PROJECT-CANVAS.md` de otra iteración.
- **Acción:** `funky init` detecta archivo existente.
- **Resultado Actual:** ✅ Frena con código `1` y mensaje claro. En `funky scaffold` no aplica porque instala el framework aunque no haya canvases.
- **Resultado Esperado (UX):** Correcto. No requiere fix.

## Vector 4: Assess con Canvases Incompletos
- **Simulación:** El usuario ejecuta `funky assess` con canvases que tienen `[Responde aquí]` sin reemplazar.
- **Acción:** `assess.js` escanea los canvases, detecta placeholders.
- **Resultado Actual:** ✅ Advierte "Canvases incompletos" pero continúa y genera la guía igual. Nunca falla.
- **Resultado Esperado (UX):** Correcto por diseño — assess no debe bloquear.

## Vector 5: Estimate sin contexto de Assess
- **Simulación:** El usuario ejecuta `funky estimate` sin haber corrido `funky assess` primero (sin `docs/architecture-decisions.md`).
- **Acción:** `estimateDomain.js` busca el archivo de decisiones.
- **Resultado Actual:** ✅ Advierte "Sin decisiones documentadas" pero genera la guía con contenido parcial. `exit(0)`.
- **Resultado Esperado (UX):** Correcto por diseño — estimate nunca falla aunque falte contexto.

## Vector 6: Pipeline sin `context.json`
- **Simulación:** El usuario ejecuta `funky pipeline assess` o `funky pipeline all` en un proyecto sin `docs/funky-ai/pipeline/context.json`.
- **Acción:** `pipeline.js` busca `context.json` en `docs/funky-ai/pipeline/`.
- **Resultado Actual:** ✅ `initContext()` crea `context.json` automáticamente si no existe. `pipeline assess` funciona igual.
- **Resultado Esperado (UX):** Correcto. No requiere fix.
