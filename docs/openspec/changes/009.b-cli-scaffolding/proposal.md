# Proposal: Implementación del comando `funky feature <name>`

## 1. Objetivo
Introducir un nuevo comando al CLI (`funky feature`) diseñado específicamente para la etapa de ejecución de Spec-Driven Development (SDD). Este comando reemplazará la necesidad de que el Orquestador genere el andamiaje estructural en cada sesión, resolviendo el problema de la pérdida de formato e invariantes.

## 2. Descripción de la Solución
En lugar de forzar al LLM a recordar y reescribir un template de cero (con alto riesgo de perder la FASE 0, constraints y protocolos de release), el CLI tomará control del Scaffolding Dinámico:
1. Buscará el **Golden Template** (los templates adaptados durante la inicialización del proyecto) que residen en `.agents/templates/sdd/`.
2. Hará un `cp` (copia) hacia el directorio específico de la feature `docs/openspec/changes/<name>/`.

De este modo, el Orquestador recibe un archivo perfectamente estructurado y contextualmente consciente del proyecto. Su única tarea será rellenar los "slots" vacíos de las tareas técnicas específicas.

## 3. Especificación del Comando
**Comando:** `funky feature <name>`
**Alias (Opcional):** `funky feat <name>`

### Flujo de Ejecución:
1. **Validación de Argumentos:** 
   - El `<name>` debe ser provisto y formateado para carpetas (ej. kebab-case).
2. **Resolución de Rutas:**
   - Origen A (Golden Templates): `process.cwd() + '.agents/templates/sdd/'`
   - Origen B (Fallback genérico): `funky-cli/src/templates/sdd/`
   - Destino: `process.cwd() + 'docs/openspec/changes/<name>/'`
3. **Lógica de Copia:**
   - Intentar usar Origen A. Si no existe, usar Origen B lanzando un warning por consola (`⚠️ Usando templates genéricos. Ejecute funky init para generar Golden Templates.`).
   - Crear el directorio Destino si no existe (con `fs.mkdirSync(..., { recursive: true })`).
   - Copiar los archivos clave (mínimo `tasks.md`, `explore.md`, `proposal.md`, `spec.md`) agregándoles el prefijo `sdd-` si aplica.
4. **Feedback Visual:**
   - Mensaje de éxito por consola con la ruta creada.

## 4. Impacto
- **DX (Developer Experience):** El humano solo tira `funky feature mi-tarea` y tiene todo listo para invocar al Orquestador.
- **Confiabilidad:** 0% de probabilidad de que el LLM rompa los invariantes del release protocol.
- **Simplicidad:** Aprovecha el trabajo de adaptación ya realizado en el issue 009.
