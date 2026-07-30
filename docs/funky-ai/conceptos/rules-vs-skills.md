# Concepto Core: Rules vs. Skills (La Regla de Oro)

En la arquitectura de **Funky AI** (y en el diseño de agentes estructurados en general), la decisión entre colocar una lógica como una *Rule* (Regla del IDE/Directorio) o como una *Skill* (Habilidad activa) es la diferencia entre un sistema de alto rendimiento y uno ahogado en saturación de memoria ("Token Bloat").

Esta es la guía oficial para diferenciar ambos conceptos.

---

## 🛡️ 1. Las "Rules" (Entorno Pasivo / Leyes de la Física)

Las Rules (`.agents/rules/*.md`) son **Guardarraíles Invisibles**. Son inyecciones de contexto que se activan silenciosamente por debajo de la mesa cuando el Humano (Router) manipula ciertos archivos o se sitúa en ciertos directorios.

### Cuándo crear una Rule:
Utiliza una Rule cuando necesites establecer las *Leyes inquebrantables* del Universo para tu código.
- **Se usa para:** Políticas de seguridad, convenciones de nombres obligatorias estáticas, disparadores de auditoría pasivos.
- **Característica:** **No contienen pasos de acción**. Son aserciones de estado ("Siempre usa `pnpm`", "Nunca le pongas tu nombre a los Commits").
- **Ejemplo en Funky AI:** 
  - `secops.md`: Bloquea estrictamente la ejecución de herramientas ajenas a la política de seguridad.
  - `engram-protocol.md`: Instruye que al estar en `docs/`, el bot asume el formato de datos MCP (What/Why/Where). No le dice "ejecuta 10 comandos", le dice "si escribes acá, escribe así".

### Riesgo Arquitectónico (El Anti-Patrón):
Si pones tareas procedimentales largas dentro de una Rule, el Agente cargará ese peso gigante (cientos de tokens) en su memoria de trabajo contínuamente, incluso cuando estés conversando sobre rediseñar un mísero `<div>` CSS. Eso destruye la retentiva del modelo y gasta contexto innecesariamente.

---

## 🛠️ 2. Las "Skills" (Entorno Activo / Flujos de Trabajo)

Los Skills (`.agents/skills/*.md`) son **Navajas Suizas de Ejecución**. Son manuales completos (Runbooks y recetarios) diseñados para iniciar, desarrollar y terminar una transacción compleja y con estado. 

### Cuándo crear una Skill:
Utiliza un Skill cuando tengas un Flujo de Trabajo (Workflow) que implique pasos mecánicos o procesos secuenciales pesados.
- **Se usa para:** Despliegues GitOps, creación de Pull Requests, flujos de TDD (Red->Green->Refactor), Inicialización de scaffolding de servidores.
- **Característica:** **Contienen Pasos de Acción**. Exigen la atención dedidcada del bot. Actúan como una función determinista con estado inicial y final.
- **Ejemplo en Funky AI:**
  - `git-ops.md` (Futuro): Un recetario que instruye al bot a correr `git diff`, generar una descripción semántica basada en reportes SDD y efectuar `gh pr create`. Le das a esto un "Play" explícito, aísla su foco temporalmente, y a terminar lo apagas.

---

## ⚖️ El Dictamen del Arquitecto

Si te haces la siguiente pregunta antes de guardar tu documento de Agente, nunca vas a fallar:

> *"¿Quiero que el Agente me aplique esta lógica TODO EL TIEMPO mientras hablamos relajados del código (Rule), o quiero LLAMAR explícitamente a esta lógica para que el Agente se ponga a trabajar y resuelva una tarea de inicio a fin (Skill)?"*
