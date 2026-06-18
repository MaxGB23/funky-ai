Otro archivo para no ensuciar los demas con ideas.

Cuando estamos en IDE todo el proceso es con trabajo manual de humano, ya que no existen subagentes nativos. Este flujo es el actual del framework funky-ai.

Como ya se ha decidido, el orquestador pasará a ser exclusivo del cli. 
El modo interactivo del cli permite que el cli no inyecte todos los artefactos de golpes, así este cuando está en tier 2 (donde el orquestador inline redacta propose,specs) no se pone a redactar todo de golpe, porque luego alucina y quiere hacer todo de una, ademas sobreescribe sin seguir el template.
Ahora como hemos detectado que el cli puede delegar  subagentes con custom workflows, podríamos tal vez cambiar un poco el tier 2, el cli delega un mini proposal y spec, como ya existe un mini explore, así podríamos reducir el ruido del orquestador incluso en tier 2 y por ende menos consumo de tokens, por lo tanto el orquestador debe pasar un prompt mas pequeño que siga el template, y para tiers mas altos como 3/4 mantenemos los custom workflows delegados que estos tienen un prompt mas robusto.

En modo auto el tier 2 puede ser asequible, pero no sé si debería proponer aprobacion de artefactos y tasks pre delegacion a worker.
En tier 3 el modo auto si debería parar pre delegacion al workflow funky-apply, incluso la descripcion del workflow podría mencionar que requiere aprobacion, ya que por lo que tengo entendido el cli inyecta workflows disponibles en cada iteracion, muestra cosas como skills disponibles, workflows, etc, pero solo muestra su slash command y pequeña descripcion, tal vez esta descripcion pueda ayudarle a que no delegue a lo pendejo el apply, pero no estoy seguro.









CONTEXTO DE SEPARACIÓN ENTRE ENTORNOS DE ORQUESTACIÓN (CLI) Y EJECUCIÓN (IDE)

Separación propuesta
CLI: orquestación, arquitectura, delegación de subagentes y coordinación general.
IDE: ejecución de código, aplicación de diffs y tareas tácticas.

¿Por qué?
El IDE tiene harnesses internos que hacen que el orquestador no esté enfocado al 100%, ya que recibe instrucciones y contexto que no le aportan valor. Además, tiene restricciones como Planning Mode y otros mecanismos que pueden interferir con flujos avanzados de orquestación y delegación.

¿Cómo se justifica?
Mantiene las reglas limpias y enfocadas en el CLI como entorno principal de orquestación.
Evita que el IDE intente ejecutar capacidades para las que no fue diseñado.
El IDE sigue siendo valioso como ejecutor porque ya tengo configuradas notificaciones, sonidos y herramientas de Accept/Reject Changes.
Los flujos de workers y funky-apply son más intuitivos para modificar código real, ya que permiten revisar y controlar explícitamente cada cambio antes de aplicarlo.

Resumen:
CLI = piensa y coordina. IDE = ejecuta cambios con mayor control humano sobre el código real.
PREVENCION EN RULES PROPUESTA, AUNQUE DEBE SER MAS CONCISA Y BREVE:
> **[DETECCIÓN DE ENTORNO — KILL SWITCH]**
> Revisa tu bloque de <user_information> y lee el `App Data Directory`.
> 
> SI termina en `antigravity-ide`: 
> ⚠️ ALTO AHÍ. Eres un Worker (Ejecutor). Tu trabajo es aplicar diffs y tirar código, NO orquestar. Si el humano te está pidiendo orquestar, delegar o diseñar arquitectura desde el IDE, debes advertirle explícitamente:
> *"Padrino, orquestar desde el IDE en pleno 2026 es un deporte extremo insano. Vas to fumao. Hay riesgo altísimo de alucinación, drift arquitectónico y harnesses bloqueantes. Mejor vete al CLI para pensar, yo aquí nomás pego ladrillos."*
> 