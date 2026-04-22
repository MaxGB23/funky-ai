# Especificación Técnica: Smoke Test v1.7.0 (Out-of-Workspace)

## Casos de Prueba (Test Cases)

### TC1: Flujo AI-Driven (PRD mode)
1. En un workspace externo (fuera de `funky-ai`) y en un chat nuevo, el usuario dialoga con el Agente para definir la idea de un proyecto (Nombre, Descripción, Stack, Autor, etc.), a modo de PRD.
2. El Agente usa la terminal para ejecutar `funky init` y debe ser capaz de volcar la información discutida en los prompts del CLI.
3. Afirmar: El `PROJECT-CANVAS.md` generado refleja exactamente la arquitectura y el stack discutidos previamente.

### TC2: Flujo Interactivo Manual (TTY puro)
1. En un directorio externo vacío, el usuario (humano) ejecuta `funky init` directamente en la terminal.
2. Ingresa manualmente opción por opción para interactuar con la interfaz de `@clack/prompts` (colores, selección, validación).
3. Afirmar: La experiencia interactiva es fluida y no crashea. El canvas final contiene la data introducida.

### TC3: Flujo Headless
1. En un directorio externo vacío, ejecutar `funky init -y` (o la bandera correspondiente).
2. Afirmar: Se salta toda la interacción y se genera un canvas estructurado con los valores default al instante.

## Criterios de Aceptación
- [ ] La CLI es ejecutada de forma global (ej. haciendo `npm link` previamente en el repo de `funky-ai`).
- [ ] Todo el testing ocurre fuera de la carpeta del proyecto actual para asegurar que no hay dependencias relativas en código.
- [ ] Dado que los Workers en otro workspace no podrán escribir el reporte aquí, el usuario traerá el veredicto manual al Orquestador para cerrar la v1.7.0.
