# Especificación Técnica: Auditoría Crítica v1.7.0

## Artefactos Esperados

### 1. Documento de Simulaciones (`docs/funky-ai/cli-simulations.md`)
El Worker debe generar este archivo de Markdown con una tabla o estructura de lista que cubra al menos los siguientes vectores de falla:
- **Sobreescritura Destructiva:** Comportamiento ante archivos ya existentes.
- **Interrupción de UX:** Interrupción de proceso (Ctrl+C, SIGINT) durante prompts.
- **Errores de Entorno:** Permisos denegados, disco lleno, rutas no válidas.
- **Banderas Inválidas:** Inputs inesperados en los comandos de Commander.

Para cada vector, el formato obligatorio es:
- **Simulación:** (Descripción del escenario)
- **Acción:** (Comando ejecutado)
- **Resultado Actual:** (Lo que hace el código fuente hoy)
- **Resultado Esperado (UX):** (Cómo DEBERÍA comportarse para proteger al usuario)

### 2. Fixes de Código
Una vez que el documento es validado, el código de `init.js` debe modificarse para cumplir con los resultados esperados. Específicamente:
- La función `runInit` NO debe llamar a `generateCanvasMarkdown` ni `fs.writeFileSync` si `canvasConfig.fromHeadless` es `true`.
- Se debe manejar apropiadamente el cierre de la aplicación durante los prompts interactivos si el usuario cancela (actualmente se hace un exit 0, auditar si deja basura en disco).

### 3. Tests de Regresión
- Se debe agregar un test a `init.integration.test.js` (o `init.test.js`) que simule la existencia previa de `PROJECT-CANVAS.md` y aserte que NO se modificó su contenido tras llamar a `runInit`.
