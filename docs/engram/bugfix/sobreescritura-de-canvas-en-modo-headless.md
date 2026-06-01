### [bugfix][cli-headless-overwrite] Sobreescritura de Canvas en modo Headless
**What:** La ejecución de `funky init` cuando ya existía un `PROJECT-CANVAS.md` pisaba el archivo original con un template vacío.
**Why:** El código pasaba `canvasConfig = { fromHeadless: true }` a `runInit`, pero `runInit` no verificaba explícitamente el flag `fromHeadless` antes de llamar a `generateCanvasMarkdown` y escribir en disco.
**Where:** `funky-cli/src/commands/init.js`
**Learned:** Siempre validar los flags pasados al objeto de configuración dentro de la lógica pura (no solo en el command handler de Commander) para evitar flujos destructivos no intencionados.