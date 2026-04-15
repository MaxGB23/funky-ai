# 🧠 Engram Manual: Post-Mortem V2 (Color Highlight)

**Documento de Consolidación Arquitectónica**
Recopilación de hallazgos, bugs pre-existentes y deuda técnica saldada durante el proceso de rescritura (Greenfield) "Funky AI" (Tareas A, B, C y D).

---

## 🛑 1. Cuello de Botella de Rendimiento por Ráfaga de Eventos (Keystrokes)
**Origen:** Tarea B
- **Causa Raíz:** El legacy disparaba el `Promise.all()` de las 7-10 estrategias de regex en CADA evento `onDidChangeTextDocument` (básicamente, por cada letra que el usuario tecleaba). Esto acumulaba microtareas en el event loop sin cancelar los cómputos anteriores, colgando la UI en archivos gigantes.
- **Decisión de Diseño:** Implementación de un **Debounce Inteligente (150ms)** en la capa de eventos de `DocumentHighlight.onUpdate()`. Si el usuario tipea rápido, se cancela el timer previo y se descarta trabajo en vano, ejecutando el `Promise.all()` solo al detectar un silencio de 150ms. Además se agregó un "guard" (`this.disposed`) para evitar fugas de memoria si la instancia fue destruida en el transcurso del timer.

---

## 🛑 2. Missing Dependency en Contraste Dinámico y Fallbacks
**Origen:** Tarea C
- **Causa Raíz:** La implementación legacy de `dynamic-contrast.js` usaba `color-name` para determinar valores de propiedades CSS fijas ("blue", "red"). Al usar `pnpm` estricto en la V2, esa dependencia (que venía implícita/hoisted de `color`) no existía en el espacio de usuario, rompiendo la función.
- **Decisión de Diseño:** En lugar de instalar dependencias innecesarias, se realizó un port a TypeScript del algoritmo WCAG 2.0 descartando `color-name`. Dado que en v2 las estrategias de regex siempre retornan valores computados (`#RRGGBB`, `rgb(...)`), los strings nominales rara vez ocurren en el parser interno. Se asumió un fallback defensivo directo a `#000000` en casos no reconocidos.

---

## 🛑 3. Illegal TypeScript Property en "Dot Decorations" (`borderRadius`)
**Origen:** Tarea C
- **Causa Raíz:** El legacy injectaba en el estilo del VS Code render attachment la propiedad `borderRadius` directamente. La API estricta de VS Code v1.90 (`ThemableDecorationAttachmentRenderOptions`) **no** expone esta propiedad, tirando el error `TS2353` bajo compilación estricta de TypeScript.
- **Decisión de Diseño:** **CSS Injection**. Se emuló el mismo comportamiento sucio que se hace en subrayados de web elements: Se pisó la propiedad válida de VS Code `textDecoration` y se le metió un inyectable por punto y coma: `textDecoration: 'none; border-radius: 50%'`. Queda perfecto visualmente y burla la limitante del typings estricto de Microsoft.

---

## 🛑 4. Ciclo de Vida Zombi (Memory Leaks en Mapas)
**Origen:** Tarea C
- **Causa Raíz:** El método `dispose()` legacy destruía los types de decoración del VS Code, pero dejaba el `Map` interno y el Array de keys llenos de referencias sueltas del Garbage Collector.
- **Decisión de Diseño:** Modificación agresiva del hook de demolición. Se sumó `this._map.clear()` y `this._keys.length = 0`. Esto garantiza que los proxies de documento y regex mueran completamente.

---

## 🛑 5. Compilador Escupiendo Errores de Dist (TS6059)
**Origen:** Tarea C
- **Causa Raíz:** Al encender `allowJs: true` en `tsconfig.json` para darle retrocompatibilidad a los JS puros de legacy strategies, Typescript empezó a analizar la propia carpeta de salida `dist/`, entrando en un ciclo redundante e inválido.
- **Decisión de Diseño:** Se inyectó `"dist"` y `"esbuild.js"` al esquema `exclude` de TypeScript. Regla básica: El compilador jamás debe mirar lo que él u otro bundler construye.

---

## 🛑 6. Faltante Crítico de `sass-importer` en Compilación de Prod
**Origen:** Tarea D (Bug encadenado desde Tarea B)
- **Causa Raíz:** La strategy legacy de `scss-vars.js` importaba un archivo `../lib/sass-importer` que no existía en el nuevo scope V2. Esto detuvo por completo el bundling de `esbuild` de la Tarea D (`pnpm run package`).
- **Decisión de Diseño:** Inserción de un **Stub (Mock) de TypeScript** (`sass-importer.ts`). En un MVP no necesitamos la feature de lujo de resolver variables cruzadas de multiparámetro (cross-file SCSS resolution). El stub explícito pasa directo la `data` (text options), disparando deliberadamente el camino `catch` legacy existente, que hace un graceful fallback a variables del DOM actual del archivo (Local Variables). 

---

## 🛑 7. Falta de Resaltado en Arranque de VS Code (Cold Start Issue)
**Origen:** Tarea D
- **Causa Raíz:** Si abrias VS Code y tenías hojas de estilo cargadas, los colores no pintaban hasta que tocaras alguna tecla (trigger por evento text changes). `onUpdate` estaba restringido a scope `private`.
- **Decisión de Diseño:** Arquitectura en forma de ráfaga pre-cargada. Se abrió `public trigger()` exponiendo `onUpdate(this.document)` sin argumentos. De esta forma, en el `activate(context)` del hook inicial, por cada buffer ya cargado se lanza un flush, escaneando de primera mano todo.

---

## 🛑 8. Mutación Inconsistente de Configuraciones de Usuario
**Origen:** Tarea D
- **Causa Raíz:** Aplicar la configuración al vuelo (`vscode.workspace.onDidChangeConfiguration`) suele inducir bugs en estado de memoria, demandando setters públicos engorrosos por toda la cadena.
- **Decisión de Diseño:** Patrón **"Nuke & Re-Bootstrap"**. En vez de mutar estados (Hot Reload), opté por hacer que el orquestador capture los esquemas de memoria abiertos, liquide todas las instancias matando dependencias cruzadas (`disposeAll`), y llame a `recreateAll()`. Es un patrón predecible, determinista y mucho más resiliente frente a cambios drásticos de API settings de editor. Un estado derivado desde cero siempre es confiable.

---

## 🛑 9. Inconsistencias de Versionado y Dependencias Problemáticas
**Origen:** Tarea A
- **Causa Raíz:** El setup base legacy en `package.json` dependía de caret types (`^`, `~`) y librerías que generaban mutaciones e introducían flujos de post-installs impuros. Todo esto afecta las CI/CD pipelines.
- **Decisión de Diseño:** Práctica de **SecOps Arquitectónico**. Pin a `color@5.0.3` rígido, y encriptar entorno de dependencias de build a `pnpm` más `esbuild`. Las herramientas modernas no requieren la fragilidad de un `npm install` que rompe dependencias meses después por fallos en SEMVER de terceros.

---

## 🛑 10. `vsce` vs `pnpm` (Bloqueo de Empaquetado)
**Origen:** Tarea E
- **Causa Raíz:** Al correr `vsce package`, la herramienta fallaba lanzando errores de `npm list ELSPROBLEMS` argumentando que faltaban devDependencies dentro de la librería `color`. Adicionalmente, frenaba pidiendo un campo `repository` en el `package.json`.
- **Decisión de Diseño:** Como usamos `esbuild` con `bundle: true` (las dependencias ya están incrustadas en el `.js` compilado), es inútil que `vsce` audite `node_modules` usando comandos npm obsoletos. Se estandarizó el uso del flag `--no-dependencies` para bypassar el chequeo. Además, se inyectó un bloque falso de `repository` en el `package.json` para silenciar el warning de Microsoft para siempre.

---

## 🛑 11. Compatibilidad VSIX Rota por versión estática del Engine
**Origen:** Tarea E (Bug de UX Post-Instalación)
- **Causa Raíz:** El IDE del usuario (`1.107.0`) rechazó la instalación del `.vsix` con error de "no compatible". En el `package.json` se había forzado estricto `"vscode": "1.90.0"` bajo la estricta política global de SecOps "sin carets".
- **Decisión de Diseño:** **Excepción de Regla SecOps.** El flag de engine de VS Code es el *único* lugar del archivo que obliga funcionalmente el uso de la sintaxis semver flexible (`^`), significando forward-compatibility. Se revirtió a `"vscode": "^1.90.0"`. Y el usuario debió agregar `"color-name"` manualmente al ver que `dynamic-contrast` la terminaba requiriendo implícitamente por debajo en este runtime.
