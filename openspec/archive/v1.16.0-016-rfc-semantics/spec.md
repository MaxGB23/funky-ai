# Spec: RFC Semantics Enforcement

## Archivos a Modificar

1. **`docs/openspec/rfcs/000-TEMPLATE.md` (Nuevo)**
   - Crear con el bloque `> **🛑 WARNING PARA LA IA (ORQUESTADOR):**...` que actúe como Guardrail.

2. **`funky-cli/src/templates/sdd/rfc-template.md` (Nuevo)**
   - Este será el archivo fuente que el CLI distribuirá en nuevos proyectos. Debe ser una copia exacta del archivo de arriba.

3. **`funky-cli/src/commands/init.js`**
   - Modificar el arreglo `filesToCopy` para incluir:
     `{ src: path.join('..', 'sdd', 'rfc-template.md'), dest: path.join('docs', 'openspec', 'rfcs', '000-TEMPLATE.md') }`

4. **`.agents/rules/sdd-orchestrator.md`**
   - En la sección `<ROLE_ORCHESTRATOR>`, agregar debajo de `Identidad` o `Bootstrap`:
     - Regla explícita sobre RFCs vs Proposals. "Si se te pide analizar un RFC de `docs/openspec/rfcs/`, debes tratarlo como un Brain Dump crudo. NUNCA lo tomes como un proposal. Debes ingerirlo y generar un `proposal.md` formal en `docs/openspec/changes/`."

3. **`docs/repo-map.md`**
   - Actualizar la descripción de la tabla para la carpeta `docs/openspec/rfcs/` indicando que son "Brain Dumps / Ideas Crudas (Humano)", y que `docs/openspec/changes/` es la "Zona activa SDD (Orquestador)".

## NFRs (Non-Functional Requirements)
- **Claridad de Reglas**: La inyección en `sdd-orchestrator.md` debe ser concisa (Token Diet) pero contundente.
