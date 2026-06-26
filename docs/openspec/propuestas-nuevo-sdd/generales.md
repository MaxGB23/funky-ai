El explore nunca debe inyectarse por CLI. Pero a su veces el custom workflow maneja el target exists/new.

El tasks sí debe inyectarse para acatar ordenes segun el tier, considerar tambien si el cli debe inyectar docs/release dependiendo el tier, para no andar creando templates en fixes que no requieres lanzar una release entera.

El specs debe corregirse cuando se aplique la nueva metodologia del openspec y sus specs source of truth en produccion.

El workflow de tasks tal vez deba recibir condicionales para saber si existe el docs.md y release.md

El apply debería aplicar todas las fases de golpe? Tiene todo el contexto, pero dependiendo la longitud de las tasks, este podría ir olvidandolo. 
En tareas cortas, siento que abrir un apply nuevo por fase haría que se releyeran los mismos artefactos por cada fase, lo que sería ineficiente, con un simple apply bastaría.