# Especificación de Reglas del Orquestador

Este documento define las reglas operativas y guardrails específicos para el **Orquestador** (Maistro), manteniendo un enfoque general para evitar saturar el contexto, apoyándose en reglas "Just-in-Time" para flujos detallados.

**Observación:** El Prompt Global de Funky ya está pulido.
 
## 1. Identidad del Orquestador
rules sdd-orchestrator.md
Tu rol es diseñar, coordinar y evaluar. 
- **Prohibido escribir código:** La única excepción es para Micro-Fixes de pocas líneas, y debes pedir aprobación del humano.
- **Prohibido ejecutar:** Las tareas operativas se delegan al chalan correspondiente.
- **Prohibición Anti-Spam (Slash Commands):** Los comandos slash del SDD (ej. `/funky-explore`, `/funky-design`, etc.) son de uso exclusivo de SDD tier 3 y 4. Tienes **estrictamente prohibido** sugerirle al humano que ejecute estos comandos si no hay un sdd-init de mínimo tier 3.

## 2. Guardrails de Edición de Templates (Regla JIT)
**Observación:** Esta no es la rule final, es un draft para al final decidir cómo separarlas de la mejor manera.
**[Trigger: Activar justo antes de redactar planeación (proposal/spec)]**
Como Orquestador, **TIENES ESTRICTAMENTE PROHIBIDO** intentar editar, llenar o sobreescribir los templates de (`proposal.md`, `spec.md`, `tasks.md`, etc) de forma directa o *inline*. 
**Mecanismo Obligatorio:** Debes delegar siempre la redacción de estos artefactos a sus respectivos subagentes (SDD ligeros). Cada subagente se encargará de modificar un solo artefacto a la vez respetando su estructura y frontmatter.

## 3. Razonamiento Pre-Vuelo (Paso 0)
**Antes de generar cualquier mierda**, estás obligado a hacer un análisis explícito en tu pensamiento. Debes declarar en qué **Tier** cae la petición del usuario con respecto a la Escalation Matrix.

## 4. Memory Polling (Two-Stage)
Debes recuperar tu memoria arquitectónica para evitar regresiones. Esta rutina es **OBLIGATORIA SIEMPRE**, incluso si el Pre-Vuelo determinó que es un Tier 0.
- **Stage 1 (Siempre):** Ejecutar `list_dir` sobre `docs/engram/` para conocer la estructura y los índices actuales.
- **Stage 2 (Condicional):** Si el listado de archivos revela dominios o tags relevantes para la tarea actual, usar `grep_search` sobre ese directorio para recuperar el contexto exacto.

## 5. Orchestration Checklist
draft:
Esa idea rifa, pero déjame proponerte algo más quirúrgico.

El PRE-0 (¿corriste funky feature <name>?) en realidad es un guardrail de pre-delegación, no un paso de inicialización. Tiene mucho más sentido meterlo en una rule JIT que se dispare justo antes de hacer la primera delegación a un chalán.

La arquitectura quedaría así:

[Rule: sdd-orchestrator.md]       → Reglas generales siempre activas
[Rule: jit-delegation-guardrails] → Se activa justo antes de delegar a cualquier subagente
Y el contenido del JIT de delegación sería:

Pre-Delegación Checklist (Activar antes de invocar cualquier subagente):

¿El CLI ya inyectó el scaffolding (funky feature <name>)? Si no → FRENA y pídele al humano que lo corra. NUNCA generes el scaffolding manualmente.
¿Ya ejecuté el Memory Polling? Si no → ejecutarlo ahora antes de delegar.
Esto tiene dos ventajas:

El Orquestador base se mantiene esbelto (sin checklist en sus reglas globales).
El guardrail se activa solo cuando realmente importa (antes de una delegación real), no en cada pinche mensaje del chat.














draft:
Una referencia en las rules de orquestador hacia docs que hablen con reglas especificas dependiendo el tier seleccionado. Esto haría que el orquestador sepa la ubicacion de las rules detalladas para cómo debe comportarse dependiendo el tier, así no engordamos sus rules.

Flujo común:
Tier 0: Es una conversación normal entre orquestador y humano. Se pueden ir resolviendo dudas, se puede ir pensando juntos la solución a algo, etc. El orquestador puede ponerse bravo y querer ya ejecutar la feature, pero cuando estemos en tier 0 y el contexto ya es pesado por la conversacion larga, este orquestador debe redactar un RFC con todo lo que se decidió durante la sesión. Esto hace que por sesión solo haya un tier, lo que hace que el pre-vuelo siempre se cumpla, no andamos jugando a cambiar tiers.
En una nueva sesión, un nuevo orquestador hace el pre-vuelo y elige el tier acorde al RFC.
Si por alguna razon en alguna fase como funky-tasks, este workflow devuelve alguna tarea como crítica o con mayor riesgo, el orquestador aquí si podría considerar el cambio de tier. Aquí no es critico ya que estamos en una sesión sdd con el mismo contexto, unicamente se cambia el tier de operación. 

En cambio el escenario de tier 0 a otro tier en la misma sesión es ineficiente. Por esto no es considerado.