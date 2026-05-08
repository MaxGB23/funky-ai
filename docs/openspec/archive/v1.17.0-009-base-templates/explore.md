# Explore: 009 - Base Project Templates & Customization

## Contexto
El comando `funky init` inyecta templates que están íntimamente acoplados al desarrollo de `funky-cli` (como el README actual y tareas de release específicas). Si inicializamos un proyecto genérico (ej. un SaaS), estos templates ensucian el repositorio. Además, los templates actuales de SDD como `tasks.md` o las reglas de Agentes tienen hardcodeadas rutas hacia `funky-cli/src/templates/...`, lo cual rompe el modelo si el CLI inyecta esto en un proyecto nuevo.

## Problema de Aislamiento
Si modificamos los templates en `funky-cli/src/templates` para hacerlos agnósticos, corremos el riesgo de romper el propio ciclo SDD de `funky-ai`, ya que nuestro Orquestador local usa esos archivos como su fuente de verdad para la orquestación del monorepo.

## Exploración de Solución
1. **Aislamiento Seguro y Backup:** Crear un directorio privado en `funky-ai` (ej. `.agents/templates/`) y copiar allí TODOS los templates actuales (`sdd/`, `bootstrap/`, `README`). Esto servirá como el entorno seguro para el Orquestador local y también funcionará como un **backup histórico/legacy** de los templates "gordos", permitiendo comparaciones a futuro sin perder el registro de cómo operaba el repo original.
2. **Desacoplamiento:** Actualizar `.agents/rules/sdd-orchestrator.md` para que lea de `.agents/templates/` en lugar de `funky-cli/src/`.
3. **Purgado de Templates:** Limpiar `funky-cli/src/templates/` dejándolos como bases agnósticas (invariantes).
4. **Guía de Customización:** Introducir `TEMPLATE_GUIDE.md` que el CLI inyectará para explicar cómo mutar los templates en base al Canvas y Arch-Assessment.
