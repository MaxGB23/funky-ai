# Fase Explore: 009.b - Scaffolding Dinámico (CLI-first SDD)

## 1. El Problema a Resolver
Según el debate registrado en `docs/funky-ai/drafts/cli-sdd-scaffolding-debate.md`, nos encontramos ante un problema sistémico de "fricción de protocolo": el Orquestador frecuentemente comete errores al generar artefactos SDD de memoria (ej. `sdd-tasks.md`), olvidando secciones invariantes vitales (como la FASE 0, los protocolos de release, o los checkpoints).
La solución propuesta es el **CLI-first Scaffolding**, donde el comando `funky phase ff <name>` inyecte el andamiaje duro del archivo. Sin embargo, esto entra en conflicto con el pendiente `009`, que establece que los templates deben estar adaptados contextualmente. Si el CLI escupe un template pelado, el Orquestador deberá reescribirlo casi por completo para adaptarlo, lo que nos devuelve al riesgo de pérdida de estructura.

## 2. Diagnóstico Arquitectónico
El conflicto fundamental es: **Determinismo Estructural (CLI) vs. Adaptación Cognitiva (LLM).**

Actualmente el CLI:
- Copia un template base a la carpeta actual (`sdd-<fase>.md`).
- No maneja rutas específicas (como `docs/openspec/changes/<name>`).

Actualmente el Orquestador:
- Trata de recrear o sobreescribir el archivo entero, lo cual rompe la inmutabilidad de la estructura obligatoria.

## 3. Exploración de Soluciones

### El Enfoque del "Golden Template" (Template Adaptado Copiado)
Gracias a la discusión interactiva, llegamos a una conclusión arquitectónica superior: no necesitamos que el CLI maneje un cascarón genérico vacío, ni tampoco que el Orquestador lo modifique estructuralmente en cada feature.

Recordemos que el pendiente `009` (Base Templates) ya estableció que durante la inicialización del proyecto, los templates se adaptan según el Canvas y se guardan en `.agents/templates/` (o `.agents/rules/`). Esos archivos ya contienen la arquitectura, los constraints y el stack del proyecto. Son el **Golden Template**.

**El flujo propuesto es:**
1. **Responsabilidad del CLI (`funky phase ff <name>`):** 
   - Crear el directorio `docs/openspec/changes/{name}/`.
   - Hacer un simple `cp` (copia) del template *ya adaptado* que vive en `.agents/templates/sdd/tasks.md` (y demás artefactos si aplica) hacia el nuevo directorio.
2. **Responsabilidad del Orquestador:** 
   - Abrir ese archivo ya inyectado. Como es una copia del Golden Template, ya tiene la FASE 0, los protocolos de release y el contexto del proyecto intactos.
   - El Orquestador solo se dedica a inyectar las tareas específicas de la *feature actual* (presumiblemente en una sección o bloque designado).

### Cambios Requeridos en `funky-cli`
1. Crear el subcomando `funky phase ff <name>`.
2. El comando debe buscar los templates en la ruta `.agents/templates/sdd/` del workspace actual (o donde estén definidos los adaptados). Si no existen, puede hacer un fallback a los templates globales del CLI.
3. Copiar los archivos a `docs/openspec/changes/{name}/`.

## 4. Próximos Pasos (Hacia el Proposal)
1. **Validar la ruta exacta** de los templates adaptados en el estado actual del repositorio. ¿Están en `.agents/templates/sdd/`?
2. **Definir el comando exacto**: `funky phase ff <name>` vs `funky feature <name>`.
3. Escribir el `proposal.md` con los specs técnicos para modificar el código de `funky-cli/src/commands/phase.js` (o crear un comando nuevo).
