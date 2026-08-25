# Explore: arbol-navidad-cli

## 1. Contexto del Problema
Se requiere implementar una feature de prueba en la CLI de Funky AI (`funky`) que permita renderizar en consola un árbol de navidad con múltiples variantes de diseño (ej. clásico, minimalista, ASCII art, con adornos y colores). 

El propósito técnico de esta feature es validar el flujo SDD Tier 3, verificar la extensibilidad del árbol de comandos de `funky-cli`, y definir un patrón limpio, modular y testeable bajo Strict TDD para la renderización de texto y estilos visuales en consola.

---

## 2. Estado Actual del Codebase
La CLI actual está empaquetada en el subdirectorio `funky-cli` y presenta la siguiente estructura y patrones:

- **Entry point principal:**
  - `funky-cli/bin/funky.js`: Inicializa la instancia principal de `commander` (`new Command()`), configura versión/nombre y registra subcomandos mediante `program.addCommand(cmd)`. También aplica el enriquecedor de ayuda `enrichCommandHelp(cmd, cmd.name())`.
- **Registro de Comandos:**
  - Los comandos residen en `funky-cli/src/commands/<commandName>.js` y exportan un `Command` de Commander (ej. `initCommand`, `featureCommand`, `estimateCommand`).
- **Separación de Lógica Pura y Terminal I/O:**
  - En los comandos existentes (`src/commands/feature.js` vs pure functions, `src/commands/estimate.js` vs `src/utils/estimateDomain.js`), la lógica de cálculo, validación y formateo de cadenas se extrae en funciones puras en `src/utils/` o en helpers exportados para permitir pruebas unitarias aisladas sin interacción de terminal.
- **Renderizado de Texto, Colores y Prompts:**
  - Runtime de Node: `"node": "^22.13.0 || >=23.5.0"` (según `funky-cli/package.json`).
  - Prompts interactivos: `@clack/prompts` (^1.7.0) e `@inquirer/prompts` (^8.5.2) están disponibles como dependencias.
  - Colores/Estilos de consola: Actualmente el proyecto usa emojis e impresiones directas con `console.log`. Al requerir Node >= 22.13.0, el proyecto tiene acceso nativo a `node:util` (`styleText`) o secuencias ANSI estándar, evitando añadir dependencias pesadas de terceros.
- **Suite de Pruebas y Runner:**
  - Configurado con `vitest` v4.1.10 ejecutado vía `pnpm test` (o `pnpm --filter funky-cli test`).
  - Los tests residen en `funky-cli/tests/*.test.js`.

---

## 3. Context Preservation

### Reglas del RFC / input fuente
- **Metodología activa:** Strict TDD [siempre]: activo. Runner: `pnpm test`. Todo código nuevo nace de un test fallido.
- **Funcionalidad:** Crear una feature de prueba en la CLI que imprima en consola un árbol de navidad con diferentes variantes de diseño (ej. clásico, minimalista, ASCII art, con adornos, etc.).
- **Objetivo especial:** Identificar el punto de extensión en el CLI actual para registrar el comando y analizar qué patrones o librerías internas existen para renderizar texto/colores en consola.

### Definiciones clave
- `arbol-navidad-cli`: Nombre de la feature y carpeta de trabajo en `openspec/changes/arbol-navidad-cli`.
- `Variantes de diseño`: Formatos visuales de renderizado del árbol (ej. `classic`, `minimalist`, `ascii`, `ornaments`).
- `Extension Point`: `funky-cli/bin/funky.js` donde se monta el subcomando en `program.addCommand(...)`.

### Scope no-negociable
- El flujo debe adherirse estrictamente a TDD (`pnpm test`).
- El comando debe ser invocable desde la CLI de `funky` (ej. `funky tree` o `funky xmas` o `funky arbol`).
- Se debe soportar selección de variantes (vía flag y/o interactivo).

---

## 4. Opciones de Arquitectura

| Opción | Descripción | Pros | Contras / Tradeoffs |
|---|---|---|---|
| **Opción A: Comando modular con Renderizador Puro (`treeRenderer.js`) + Secuencias ANSI / `styleText` nativo** | Crear `src/commands/tree.js` registrado en `bin/funky.js` que delega la generación de cadenas a un módulo puro `src/utils/treeRenderer.js`. Soporta flags (`--variant`, `--height`, `--no-color`) e interactividad opcional vía `@clack/prompts`. | - 100% testeable con TDD puro (tests unitarios verifican el string generado sin mockear I/O).<br>- Cero dependencias npm externas adicionales (usa Node nativo `styleText` / ANSI).<br>- Coherente con los patrones existentes (`estimateDomain.js`, `canvasDiscovery.js`). | - Requiere separar la interfaz de flags de la lógica del algoritmo de dibujo. |
| **Opción B: Comando monolítico inline en `src/commands/tree.js`** | Implementar la lógica del dibujo y el comando directamente dentro del action handler de Commander en `tree.js`. | - Menos archivos iniciales. | - Dificulta el testing unitario con TDD sin acoplarse al mockeo de `console.log` o `process.stdout`.<br>- Rompe la separación de responsabilidades observada en el codebase. |
| **Opción C: Integración con librería externa de ASCII Art / Colores (ej. `chalk`, `figlet`)** | Añadir dependencias en `package.json` para formatear y colorear el árbol. | - Menor código algorítmico custom. | - Incrementa dependencias y footprint innecesariamente cuando Node 22 ya cuenta con `styleText` nativo y templates de texto plano ANSI. |

---

## 5. Recomendación + Riesgos

**Opción recomendada:** **Opción A** (Comando modular con Renderizador Puro en `src/utils/treeRenderer.js` + integrador en `src/commands/tree.js`).

**Justificación:**
1. **Alineación con Strict TDD:** Al aislar el renderizador como funciones puras (`renderTree({ variant, height, color })`), los tests de Vitest pueden verificar línea por línea el output visual, los adornos aleatorios/fijos y la ausencia de secuencias ANSI cuando `color: false`.
2. **Punto de extensión limpio:** `funky-cli/bin/funky.js` solo necesita importar `treeCommand` y registrarlo con `program.addCommand(treeCommand)`.
3. **Sin dependencias extra:** Respeta la ligereza del proyecto usando capacidades nativas de Node 22 o ANSI y reutilizando `@clack/prompts` si se requiere modo interactivo.

**Riesgos mitigables:**
- *Riesgo 1: Incompatibilidad de colores ANSI en terminales sin soporte / pipes CI:*
  - *Mitigación:* Soportar flag `--no-color` y detectar automáticamente si `process.stdout.isTTY` o `NO_COLOR` están presentes.
- *Riesgo 2: Tests frágiles por caracteres de escape ANSI en assertions:*
  - *Mitigación:* Diseñar el renderizador para aceptar un flag `{ color: false }` o proveer helpers de strip-ansi en los tests unitarios.

---

## 6. NFR Candidates (Opcional)
- **NFR-1 (Portabilidad de Terminal):** El generador debe soportar ejecución en entornos sin color o no-TTY (CI / pipes) sin corromper la salida con secuencias de escape no deseadas.
- **NFR-2 (Performance / Zero Lag):** El renderizado debe ser síncrono e instantáneo (< 10ms).
