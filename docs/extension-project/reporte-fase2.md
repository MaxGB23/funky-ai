# Reporte SDD - Fase 2: Levantamiento Arquitectónico y AST

**Proyecto:** `color-highlight`
**Estado de la Fase:** ✅ Completado.
**Rol ejecutado:** Funky AI Sub-Agente (Worker Mode).

## 1. Flujo de Inicialización (`color-highlight.js`)
El núcleo reactivo de la extensión reside en la clase `DocumentHighlight`, la cual funciona con el **Patrón Observador**.
- Se instancia por cada documento abierto.
- Registra el evento nativo de VS Code `workspace.onDidChangeTextDocument` para escuchar cualquier tecleo del usuario y dispara el método `onUpdate()`.
- **Control de Concurrencia:** Tiene un guardrail inteligente dentro de `updateRange()`. Compara la `version` del documento; si el usuario tipea rápido, descarta el *AST tree* viejo para no inyectar colores en coordenadas obsoletas.

## 2. La Arquitectura de Estrategias (`src/strategies`)
La extensión implementa el **Patrón Strategy (Estrategia)** de manera impecable para evitar un `match` de Regex masivo que trabe el main thread.
- En el constructor, ensambla un array dinámico `this.strategies` dependiendo de la configuración y el `languageId` (ej. si es `scss`, pushea la estrategia `findScssVars`).
- Cada archivo en `src/strategies/` (como `css-vars.js`, `hex.js`, `words.js`) expone una función pura.
- El motor ejecuta un `await Promise.all(this.strategies.map(fn => fn(text)))`, mandando a correr todas las expresiones regulares en paralelo sobre el texto completo. Cada estrategia devuelve un objeto estándar: `{start, end, color}`.

## 3. El Motor de Render (`lib/decoration-map.js`)
Convierte los metadatos de AST en estilos visuales (CSS-like) inyectables.
- Implementa una clase `DecorationMap` con estado in-memory (Caché `Map`).
- Expone el método `get(color)`. Si el color no existe en la caché, genera on-the-fly un objeto de reglas compatible con VS Code.
- Soporta modos como `background`, `outline`, `underline` e incluso micro-bloques tipo `dot` usando seudo-elementos `before/after` virtuales en el editor.
- **Acoplamiento Directo:** Usa la API crítica `vscode.window.createTextEditorDecorationType(rules)` vinculando directamente el color encontrado (ej. `#FFFFFF`) a una clase CSS interna del editor. Luego, el motor base aplica un `editor.setDecorations()` masivo agrupando las coordenadas en arreglos (`Range`).

## ⚠️ Diagnóstico para Refactorización (Fase 3)
1. **Riesgo Local:** Al correr `Promise.all` mapeando la totalidad del texto para *cada pulsación del teclado*, en archivos de 10.000 líneas la memoria y el ciclo de CPU de NodeJS pueden sufrir micropausas (debido a la limitación asíncrona pero monohilo).
2. **Propuesta:** Introducir Debounce en `onUpdate` o limitar el análisis exclusivamente al "Viewport" / líneas visibles.
3. El código estructural (Patrones) es robusto. La refactorización debería centrarse puramente en compilar con dependencias modernas, actualizar la versión nativa de VS Code e inyectar el debounce de performance.
