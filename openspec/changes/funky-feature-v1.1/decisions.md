Punto 1: --resume ✅ Cerrado
Bien decidido. Es un CLI propio, vos lo conocés, y el caso es excepcional. Agregar auto-detección de estado sería over-engineering para un caso que jamás va a ocurrir en la práctica. Simplificidad beats elegancia cuando el usuario es el dueño del tool.

Punto 2: Sin reglas temporales ✅ Cerrado
Buen criterio. Crear reglas de agentes efímeras mete complejidad innecesaria en el ciclo de vida de los archivos de configuración. La protección real viene del bloqueo físico de archivos (el Wizard). Lo que no existe no se puede pisar.

Punto 3: Templates por Tier (el más jugoso de todos)
Acá sí hay que pensar bien. Mirá la Escalation Matrix actual:

Tier	Criterio	¿Qué archivos tiene sentido inyectar?
T1 Flash	Fix trivial, 1 archivo	Directo a tasks.md. Ni siquiera tiene sentido correr funky feature para esto.
T2 Standard	Feature normal, 2-5 archivos	explore.md → proposal.md → spec.md → tasks.md → worker-handoff.md
T3 Deep	Core, NFRs, refactors	Igual que T2 pero con secciones de riesgo reforzadas en cada template
T4 Gentle	Rediseño titánico	7 roles aislados con funky gentle. Acá es donde la cosa se pone interesante...
La pregunta crítica que me surge: ¿debería funky feature ni siquiera aceptar T1? Un fix trivial no merece un ciclo SDD. Diría que el Wizard debería detectar T1 y decirte: "Loco, esto es T1. No abrís una feature, vas directo a ejecutar. ¿Confirmás?". Así evitamos el anti-patrón de crear burocracia donde no hace falta.

Y para T3: los templates son iguales en estructura que T2, pero lo que cambia es el contenido de las secciones. El CLI podría inyectar secciones extras de análisis de riesgo o simplemente marcar el template con un banner de [⚠️ RIESGO ALTO]. ¿Le ves sentido a esto o preferís que sean templates completamente separados?