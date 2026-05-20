# Spec: 016 Environment Selector

## 1. Interfaz Modificada (`init.js`)
```javascript
export function runInit({ 
  templatesDir, 
  targetBase, 
  canvasConfig, 
  selectedProtocols = [], 
  environment = 'ide' // <- NUEVO PARÁMETRO
}) {
  // ...
}
```

## 2. Mapa de Resolución Condicional
* **Archivos Comunes (se resuelven desde `bootstrap/` directo):**
  * `ORCHESTRATOR-STATE.md`
  * `agents-rules-secops.md`
  * Documentos del Engram y Handoff
* **Archivos Aislados (se resuelven interpolando `environment`):**
  * Source: `path.join(templatesDir, environment, 'agents-rules-sdd-orchestrator.md')` -> Destino: `.agents/rules/sdd-orchestrator.md`
  * Source: `path.join(templatesDir, environment, 'agents-rules-engram-protocol.md')` -> Destino: `.agents/rules/engram-protocol.md`

## 3. UI/UX del CLI
El primer prompt interactivo de Clack deberá usar el siguiente esquema aproximado:
```javascript
const environment = await p.select({
  message: 'Selecciona tu entorno de ejecución para Funky AI:',
  options: [
    { value: 'ide', label: 'Antigravity IDE (Extensión UI)', hint: 'Return Envelopes manuales en disco' },
    { value: 'cli', label: 'Antigravity CLI (Terminal)', hint: 'Soporte asíncrono y subagentes en background' }
  ]
});
```
