# Especificación Técnica: Scaffolding Fixes v1.7.0

## 1. Script de Sync Automático (`funky-cli/scripts/sync-templates.js`)
Script Node nativo (sin dependencias externas) que copie los archivos vivos hacia la carpeta de distribución del CLI.
Deberá copiar destructivamente:
- `m:\funky-ai\.agents\rules\engram-protocol.md` → `agents-rules-engram-protocol.md`
- `m:\funky-ai\.agents\rules\secops.md` → `agents-rules-secops.md`
- `m:\funky-ai\.agents\rules\sdd-orchestrator.md` → `agents-rules-sdd-orchestrator.md`
- `m:\funky-ai\docs\funky-ai\workers\plantilla-worker-handoff.md` → `plantilla-worker-handoff.md` (NUEVA INCLUSIÓN)

## 2. Modificación de `init.js`
En el archivo `funky-cli/src/commands/init.js`, ampliar el array `filesToCopy` para incluir:
`{ src: 'plantilla-worker-handoff.md', dest: path.join('docs', 'funky-ai', 'workers', 'plantilla-worker-handoff.md') }`

## 3. Actualización de `package.json`
Añadir script: `"sync": "node scripts/sync-templates.js"`
Vincular el script `"sync"` para que corra automáticamente antes de los tests modificando el comando de test: `"test": "npm run sync && vitest run"` (o usando el lifecycle script `"pretest"` si aplica en pnpm).
