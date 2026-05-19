# 🤖 Funky AI — Worker Handoff: Fase 4 (Integración Inquirer en CLI)

> **Instrucción para el LLM:** Sos un Worker **Tier T3** de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, y luego actualizar el `sdd-report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `/funky-worker @docs/openspec/changes/015-on-demand-protocols/worker-handoff.md Ejecutá la Fase 4`

---

## 1. Inyección de Contexto (Safe-Contexting)

### A) Estado Global del Proyecto
```
view_file ORCHESTRATOR-STATE.md
```

### B) Memoria Persistente (Memory Polling — Two-Stage)
```
view_file docs/engram/index.md
```

### C) Especificación de Tarea
```
view_file docs/openspec/changes/015-on-demand-protocols/tasks.md
view_file docs/openspec/changes/015-on-demand-protocols/spec.md
```

### D) Archivos de Implementación (Lectura Obligatoria)
```
view_file funky-cli/src/commands/init.js
view_file funky-cli/src/templates/protocols/index.md
```

---

## 2. La Misión (Surgical Task)

**Objetivo:** Modificar `funky-cli/src/commands/init.js` para que durante `funky init` (en el flujo interactivo, NO en el modo Headless) se pregunte al usuario qué protocolos desea importar.

### ⚠️ ADVERTENCIA CRÍTICA — Decisión Arquitectónica

El CLI usa `@clack/prompts` (importado como `p`), **NO `inquirer`**. El `tasks.md` menciona "inquirer" como referencia genérica al concepto de selección interactiva, pero la implementación DEBE usar `@clack/prompts` para ser consistente. Usar `inquirer` sería introducir una dependencia nueva e innecesaria.

### Pasos de Implementación

**Paso 1 — Leer el flujo de `funky init`:**

Analizá `funky-cli/src/commands/init.js`. El flujo interactivo es la rama `else` del bloque condicional que comienza en la línea ~137. Los modos Headless (canvas ya existentes) NO deben ser modificados.

**Paso 2 — Agregar la función helper de protocolos:**

Justo antes de la exportación `export const initCommand`, definí una función que:
1. Lea el directorio `funky-cli/src/templates/protocols/` en tiempo de ejecución.
2. Genere la lista de opciones filtrando el archivo `index.md` (que no es un protocolo seleccionable).
3. Retorne un array de objetos `{ value, label }` para `p.multiselect`.

```js
/**
 * Lee los templates de protocolos disponibles en el CLI y genera opciones para el prompt.
 * @returns {{ value: string, label: string }[]}
 */
function getProtocolOptions() {
  const protocolsDir = path.join(__dirname, '../templates/protocols');
  if (!fs.existsSync(protocolsDir)) return [];
  return fs
    .readdirSync(protocolsDir)
    .filter(f => f.endsWith('.md') && f !== 'index.md')
    .map(f => ({ value: f, label: f.replace('.md', '') }));
}
```

**Paso 3 — Agregar el prompt al flujo interactivo:**

Dentro de la rama `else` del flujo interactivo, DESPUÉS del bloque `infraGroup` y ANTES de `p.outro('📝 Generando Canvas...')`, agregá:

```js
const protocolOptions = getProtocolOptions();
let selectedProtocols = [];

if (protocolOptions.length > 0) {
  const protocolsAnswer = await p.multiselect({
    message: '¿Qué protocolos on-demand querés importar? (Opcional)',
    options: protocolOptions,
    required: false,
  });
  if (!p.isCancel(protocolsAnswer)) {
    selectedProtocols = protocolsAnswer;
  }
}
```

**Paso 4 — Copiar los protocolos seleccionados en `runInit`:**

Modificá la función `runInit` para aceptar un parámetro adicional `selectedProtocols: string[]` (array de nombres de archivo, ej: `['devil-advocate.md']`).

Al final del loop de `filesToCopy`, y ANTES del `return`, agregá la lógica de copia de protocolos:

```js
// Copia de protocolos on-demand seleccionados
if (selectedProtocols && selectedProtocols.length > 0) {
  const protocolsSrcDir = path.join(templatesDir, '..', 'protocols');
  const protocolsDestDir = path.join(targetBase, '.agents', 'protocols');
  
  for (const protocolFile of selectedProtocols) {
    const srcPath = path.join(protocolsSrcDir, protocolFile);
    const destPath = path.join(protocolsDestDir, protocolFile);
    if (fs.existsSync(destPath)) {
      console.log(`⚡ Salteando (ya existe): .agents/protocols/${protocolFile}`);
      skippedCount++;
    } else {
      fs.mkdirSync(protocolsDestDir, { recursive: true });
      fs.copyFileSync(srcPath, destPath);
      console.log(`✅ Creado: .agents/protocols/${protocolFile}`);
      createdCount++;
    }
  }

  // También copiar/regenerar index.md en destino listando solo los protocolos importados
  const indexDestPath = path.join(protocolsDestDir, 'index.md');
  const indexSrcPath = path.join(protocolsSrcDir, 'index.md');
  if (!fs.existsSync(indexDestPath) && fs.existsSync(indexSrcPath)) {
    fs.mkdirSync(protocolsDestDir, { recursive: true });
    fs.copyFileSync(indexSrcPath, indexDestPath);
    console.log(`✅ Creado: .agents/protocols/index.md`);
    createdCount++;
  }
}
```

**Paso 5 — Actualizar la llamada a `runInit`:**

En la llamada `runInit({ templatesDir, targetBase, canvasConfig })`, pasá también `selectedProtocols`:

```js
runInit({ templatesDir, targetBase, canvasConfig, selectedProtocols });
```

**Paso 6 — Actualizar firma de `runInit`:**

Modificá el JSDoc y la desestructuración del parámetro de `runInit` para incluir `selectedProtocols`:

```js
/**
 * @param {object} opts
 * @param {string} opts.templatesDir
 * @param {string} opts.targetBase
 * @param {object} opts.canvasConfig
 * @param {string[]} [opts.selectedProtocols] - Array de nombres de archivo de protocolo a copiar.
 */
export function runInit({ templatesDir, targetBase, canvasConfig, selectedProtocols = [] }) {
```

**Paso 7 — Marcar tareas completadas:**

Marcá en `docs/openspec/changes/015-on-demand-protocols/tasks.md` todos los ítems de la Fase 4 como `[x]`.

---

## 3. Reglas de Ejecución Estrictas

| Regla | Descripción |
|-------|-------------|
| 🔴 NO usar `inquirer` | Usar ÚNICAMENTE `@clack/prompts` ya importado como `p`. |
| 🔴 No romper modo Headless | Los bloques `if (hasProjectCanvas && hasInfraCanvas)` no se modifican. |
| 🔴 Acción Directa | Escribí al disco usando tools. Una sola llamada al tool por archivo. |
| 🟢 Idempotencia | Si el protocolo ya existe en destino, saltear. |

---

## 4. Return Envelope (Al terminar)

Actualizá `docs/openspec/changes/015-on-demand-protocols/sdd-report.md` agregando al final:

```markdown
## Fase 4
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:** (rutas)
- **🔴 Cambio de Scope Detectado:** No / [describir si hubo]
- **Próxima acción:** Avisar al Orquestador para ejecutar Doc-Ops (Fase X)
```
