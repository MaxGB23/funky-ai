# Color Highlight V2 🎨

Una extensión ultraliviana para VS Code que resalta valores de colores CSS/Web dentro de tu código. Rediseñada desde cero con una arquitectura moderna de alta velocidad y 0 *memory leaks* (basada en el patrón `DecorationMap`).

## ✨ Características

- ⚡ **Zero-Lag:** Motor basado en promesa (Promise.all) y *Debounce* de 150ms. Podés escribir un documento de 10.000 líneas y el editor no sufrirá interrupciones.
- 🧹 **Clean Render:** Los colores se inyectan sin ensuciar tu historial Git, mapeados dinámicamente al DOM del editor.
- ♿ **WCAG Auto-Contraste:** Si el color marcado choca con la legibilidad del texto, la extensión auto-calcula un color de fuente contrastante oscuro/claro para la mejora visual.
- 📦 **Multi-Soporte:** SCSS variables, LESS variables, CSS vanilla, Hex (A)RGB, HSL, HWB.

## 🚀 Instalación Local (Manual)

Como el proyecto funciona fuera del Marketplace por decisión arquitectónica (Clean Code local), la extensión se instala a través del empaquetado `.vsix`.

1. Abre la paleta de comandos de VS Code (`Ctrl+Shift+P` o `Cmd+Shift+P`).
2. Escribe y selecciona **`Extensions: Install from VSIX...`**.
3. Busca el archivo `color-highlight-v2-x.x.x.vsix` que se generó tras compilar.
4. (Opcional) Reinicia la ventana para que tome las cachés.

## ⚙️ Configuración (Settings)

Puedes personalizar cómo se ven los marcadores en VS Code buscando `colorHighlight` en tus configuraciones o en el `settings.json`:

| Configuración | Descripción | Default |
|---|---|---|
| `colorHighlight.markerType` | Forma del resaltado (`background`, `outline`, `underline`, `dot-before`, `dot-after`). | `background` |
| `colorHighlight.markRuler` | Si el color debe aparecer en la regla de posición (scrollbar lateral). | `false` |
| `colorHighlight.useARGB` | Soporte explícito de formato alpha HEX. | `false` |
| `colorHighlight.matchWords` | Reconocer nombres de colores de texto purista (`red`, `blue`). | `false` |

## 🛠️ Para Desarrolladores

Si querés aportar código o probar la extensión nativamente:
1. Asegurate de tener `pnpm` instalado.
2. Clona y entra al directorio `color-highlight-v2`.
3. Ejecutá `pnpm install` (usamos dependencias "pineadas" sin carets).
4. Ejecutá `pnpm run package` para compilar todo con `esbuild` y empacar mediante `vsce`.
