# Especificación Técnica: Smoke Test v1.7.0 (Out-of-Workspace)

## Casos de Prueba (Test Cases)

### TC1: Flujo Headless (SDD / PRD-First)
1. En un workspace externo vacío (fuera de `funky-ai`) y en un chat nuevo, el usuario y el Agente dialogan sobre el stack del proyecto.
2. El Agente ejecuta `funky init --template` para generar un `PROJECT-CANVAS.md` vacío con la estructura requerida, y luego lo llena con las decisiones arquitectónicas discutidas.
3. Se ejecuta `funky init` en la terminal.
4. Afirmar: La CLI detecta la existencia de `PROJECT-CANVAS.md`, **no** lanza ningún prompt interactivo (se ejecuta en silencio) e inicializa el ecosistema basado en el documento leído.

### TC2: Flujo Interactivo (CLI con Prompts)
1. En otro directorio externo completamente vacío (sin `PROJECT-CANVAS.md`), el usuario (humano) ejecuta `funky init`.
2. La CLI detecta que no hay canvas y lanza el fallback interactivo con `@clack/prompts`.
3. El usuario ingresa manualmente cada opción.
4. Afirmar: La experiencia TTY es fluida y al finalizar se genera correctamente el archivo físico `PROJECT-CANVAS.md` con la información provista.

## Criterios de Aceptación
- [ ] La CLI es ejecutada de forma global (ej. haciendo `npm link` previamente en el repo de `funky-ai`).
- [ ] Todo el testing ocurre fuera de la carpeta del proyecto actual.
- [ ] El veredicto final es reportado manualmente al Orquestador en este chat para cerrar la v1.7.0.
