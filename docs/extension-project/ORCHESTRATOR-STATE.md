# ORCHESTRATOR-STATE

## Estado Actual del Proyecto
**QUÉ ESTÁ HECHO:**
- **Tarea A:** Greenfield scaffolding completado (entorno aislado v2 con ESBuild y pnpm), aplicando principios estrictos de SecOps (versiones pineadas explícitas).
- **Tarea B:** Migración de estrategias Regex lista e integradas a un motor central (`document-highlight.ts`), acopladas a un Debounce de 150ms.
- **Tarea C:** Implementación estricta en TS del renderizador `DecorationMap`, portando contraste funcional WCAG e inyección de decorators solucionando fugas de memoria (zombies).
- **Tarea D:** Lifecycle (Wiring) reconstruido desde cero. Se mapearon configs a `package.json` (`contributes.configuration`). Implementado loop de `trigger()` al arranque de VS Code, y manejador de setting changes aplicando el modelo de "Nuke & Re-bootstrap". Artifact (.js) de extensión compila a 38KB.

**QUÉ FALTA:**
- **Tarea E:** Generar el `README.md` final del Marketplace, empaquetar como `.vsix` utilizando `vsce` y realizar tests de integración e2e sobre archivos vivos.

---

## Arquitectura de Archivos Clave
Archivos alojados bajo `color-highlight-v2/src/`:
- `extension.ts`: Punto de entrada del lifecycle; se encarga del rastreo con un mapa por documento y reconstruye el estado (Nuke & Re-Bootstrap) ante cambios.
- `document-highlight.ts`: CORE del resaltado, consolida el debounce lógico, orquesta el procesamiento concurrente de promesas (regex parsing). 
- `lib/decoration-map.ts`: Clase que gestiona estáticamente la creación, listado y purga manual explícita (para eludir leaks del GC) de los decorator types de VS Code.
- `lib/dynamic-contrast.ts`: Puerto puro TypeScript del sistema funcional WCAG 2.0 (evitando incluir librerías zombie de nombres CSS).
- `lib/sass-importer.ts`: Stub mockeado de resolución (fallback) de SCSS de variables para no trabar el build (evita path loops problemáticos del viejo paquete).

---

## Bugs Históricos a NO Repetir
Extraídos de `post-mortem-v2.md`:
- **Microtareas bloqueantes (Performance):** JAMÁS ejecutar el ciclo lógico onDocumentChange por keystroke. Mantener el `Debounce de 150ms` o el editor se colgará en archivos grandes.
- **Typescript TS2353 con VS Code API (Render bugs):** No intentar bindear propiedas CSS inválidas en type definitions (ej `borderRadius`). Usar siempre inyección a `textDecoration: 'none; ...'`
- **Fugas de GC (Memory Leaks):** En los destructores/disposes de listas, limpiar explícitamente `this._keys.length = 0` y `.clear()` los mapas estáticos. Un simple "dispose de VSCode" es insuficiente.
- **Compilador TS6059:** Typescript NUNCA debe escanear las rutas generadas por Bundlers. Conservar `dist` y scripters en `exclude`.
- **Hot Reload inestable:** Omitir cualquier approach que trate de inyectar o actualizar configs dinámicamente mutando estados previos; obligatoriamente desechar el objeto y levantarlo de cero (*Nuke & Re-Bootstrap*).
- **SecOps con caret packages:** Evitar dependencias huérfanas derivadas. Pinear exacto y usar dependencias comprobadas de Node.

---

## Próximos Pasos
Ordenados por prioridad de ejecución para Worker de Turno:
1. **[Tarea E] Ejecutar Tests de Integración:** Habilitar un mock env para VS Code, probar estilos CSS/LESS/SCSS reales.
2. **[Tarea E] Publicar `.vsix`:** Integrar el `README-template.md` (como `README.md` oficial), configurar el publisher local y paquetizar con `vsce package`.
3. **Mejora Optativa de Tech Dept:** Evaluar sustituir mock de `sass-importer.ts` incorporando lógica nativa `vscode.workspace.findFiles` si se requiere cross-scoping de variables.

---

## Archivos de Contexto para la Próxima Sesión
*Para el próximo prompt de Orquestador, arrobar estrictamente los siguientes:*
- `@docs/extension-project/ORCHESTRATOR-STATE.md`
- `@color-highlight-v2/src/extension.ts`
- `@color-highlight-v2/package.json`
