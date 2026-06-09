El comando funky init pregunta sobre frameworks y no hay opcion para especificar decidir luego, el formato --template es mejor opcion actualmente.

el 000-template debería estar dentro de .agents/templates que son los golden, verificar si hay algun comando especifico para la generacion de golden 

La inyeccion de docs\funky-ai\workers\plantilla-worker-handoff.md debería estar deprecada. No aporta valor alguno.


FUNKY FEATURE
Inyecta todos los templates como design, pero esto se solucionará con la feature que añade tiers a funky feature
El planning handoff viene incluido, no sé qué hacer con este file, si debería tener un comando especial o algo.


| Archivo | Golden | Base |
Engram | ACTUALIZADO | ACTUALIZADO
sdd-orchestrator | ACTUALIZADO | ACTUALIZADO
secops | ACTUALIZADO | ACTUALIZADO
tasks

EXPLORE en custom workflow podría usarse desde tier 2, incluso en tier 1.

ver si el index del engram se puede reemplazar por buscar palabras clave unicamente. Ver si es mas eficiente y posible