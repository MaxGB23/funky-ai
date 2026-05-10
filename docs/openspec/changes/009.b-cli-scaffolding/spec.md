# Spec: Comando `funky feature`

## 1. Arquitectura de Archivos
Se agregará un nuevo archivo al CLI:
- `funky-cli/src/commands/feature.js`

Este archivo seguirá el mismo patrón que `phase.js` y `init.js`, separando la lógica pura de la declaración de Commander para favorecer el testing unitario.

## 2. API Interna (`runFeature`)

```javascript
/**
 * Lógica pura del comando `funky feature`.
 * @param {object} opts
 * @param {string} opts.featureName    - Nombre de la feature (ej: 'auth-login').
 * @param {string} opts.cliTemplatesDir- Directorio absoluto de templates genéricos del CLI.
 * @param {string} opts.cwd            - Directorio de trabajo destino.
 * @returns {{ success: boolean, error?: string, path?: string }}
 */
export function runFeature({ featureName, cliTemplatesDir, cwd }) {
  // 1. Sanitizar featureName
  // 2. Determinar rutas (Golden vs Fallback)
  // 3. Crear docs/openspec/changes/<featureName>
  // 4. Copiar archivos (explore.md, proposal.md, spec.md, tasks.md)
  // 5. Retornar success
}
```

## 3. Integración en `index.js`
Se deberá importar `featureCommand` de `feature.js` y registrarlo en el programa principal en `funky-cli/bin/funky.js` o `funky-cli/src/index.js` (donde estén declarados los comandos).

## 4. Pruebas Mínimas Requeridas
- Verificar que usa `.agents/templates/sdd` si existe.
- Verificar fallback a `funky-cli/src/templates/sdd` si no existen templates locales.
- Verificar creación exitosa del directorio y copia de archivos.
- Verificar sanitización de nombres con espacios o caracteres no permitidos.
