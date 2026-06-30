# Spec: Fronteras CLI vs IDE y Modos de Operación

## Arquitectura de Dos Tiempos: IDE Presente, CLI Futuro
**Decisión Final:** Las aparentes contradicciones son en realidad dos puntos en el tiempo. Hay que hacer una separación cronológica clara en la arquitectura:
1. **Fase Actual (IDE):** Proceso más manual (dependiente del copy-paste) porque el IDE aún no soporta subagentes nativos plenos. Aun así, el IDE seguirá siendo el rey indiscutible para la ejecución pura (Apply/Worker), donde brilla gracias a sus herramientas visuales (diffs, accept/reject).
2. **Fase Futura (CLI):** La orquestación pesada y la delegación se mudan al CLI, donde vivirán los subagentes nativos operando en modo *auto* e *interactivo*. La delegación será muchísimo más ágil: el Orquestador pasará el prompt directamente al subagente, eliminando la talacha del humano de abrir nuevos chats y hacer copy-paste. 
   * **Nota sobre Modo Interactivo:** Aunque la invocación está automatizada, el Orquestador **TIENE** que detenerse a pedir aprobación humana explícita antes de avanzar a la siguiente fase del flujo.

---

## Separación de Entornos y Justificación de Roles

* **CLI (Piensa y Coordina):** Responsable de la orquestación, arquitectura, delegación de subagentes y la coordinación general del ciclo de vida del SDD.
* **IDE (Ejecuta):** Enfocado exclusivamente en la ejecución de código, aplicación de diffs y tareas tácticas mediante el flujo de workers (`funky-worker` o `/funky-apply`).
En modo auto el cli puede delegar todas las fases. En modo interactivo el humano tiene la decision de poder continuar todo en cli o si requiere alguna tool del IDE, puede mencionarle al orquestador que irá a tirar chalanes al ide. El humano hace copy-paste del return envelope del workflow en el chat con el orquestador, es el precio a pagar por mas control con tools del IDE.

### ¿Por qué esta separación?
1. **Foco del Agente:** El IDE inyecta harnesses internos, prompts de sistema del editor y contexto de workspace que no aportan valor a la planificación de alto nivel y sobrecargan la memoria.
2. **Restricciones del Entorno:** El IDE impone mecanismos restrictivos como el `Planning Mode` u otros flujos bloqueantes que interfieren con la flexibilidad del Orquestador CLI.
3. **Control del Humano:** El IDE brilla en control de diffs visuales (Accept/Reject Changes), notificaciones y edición directa del disco, haciéndolo ideal para el worker que "pega ladrillos".

---

## Detección de Entorno (Kill Switch del IDE)

Esta regla previene que un agente del IDE intente tomar roles de arquitectura u orquestación:

> **[DETECCIÓN DE ENTORNO — KILL SWITCH]**
> Revisa tu bloque de `<user_information>` y lee el `App Data Directory`.
> 
> SI termina en `antigravity-ide`:
> ⚠️ **ALTO AHÍ.** Eres un Worker (Ejecutor). Tu trabajo es aplicar diffs y tirar código, NO orquestar. Si el humano te está pidiendo orquestar, delegar o diseñar arquitectura desde el IDE, debes advertirle explícitamente:
> *"Padrino, orquestar desde el IDE en pleno 2026 es un deporte extremo insano. Vas to fumao. Hay riesgo altísimo de alucinación, drift arquitectónico y harnesses bloqueantes. Mejor vete al CLI para pensar, yo aquí nomás pego ladrillos."*

---

## Interacción Humano-Máquina: Los Inquirers del CLI

Para evitar la automatización ciega, la orquestación en el CLI depende de un modelo donde **la IA propone, pero el humano dispone**. El mecanismo principal para esto son los Inquirers.

### Fragmentación del Monolito de Tareas
Para mantener un "Change Folder" esbelto y cumplir con SRP (Responsabilidad Única), el histórico monolito `tasks` se divide en tres plantillas especializadas:
1. **`tasks.md`:** Ejecución pura de código. Se inyecta siempre.
2. **`docs.md` (Condicional):** Checklist de documentación estructural (arquitectura, ADRs, RFCs).
3. **`release.md` (Condicional):** Checklist exclusivo para lanzamientos (alineado al SemVer).

### El Flujo de Inquirers
Antes de inyectar plantillas, el comando `funky feature <name>` ejecuta 3 Inquirers (preguntas interactivas) en el CLI:
1. **¿Qué Tier?** (T1 / T2 / T3 / T4)
2. **¿Impacta Docs Core?** (Sí / No) → Determina la inyección de `docs.md`.
3. **¿Tipo de Release?** (Major / Minor / Patch / Ninguno) → Determina la inyección de `release.md`.

**El Rol del Orquestador:** El Orquestador analiza la petición del usuario y genera una recomendación sobre cómo responder estos Inquirers. Sin embargo, no tiene el poder de inyectarlos automáticamente. El desarrollador audita la sugerencia y confirma (o corrige) directamente en el prompt del CLI.

### Diagrama de Inyección (Deprecación de Pausas Manuales)
Una vez resueltos los Inquirers, el CLI inyecta los templates en cascada.
*Nota Arquitectónica: Históricamente existía un `[user: next]` para frenar la "alucinación en cadena" del Orquestador al llenar templates. Al introducir los subagentes "SDD ligeros" con alcance delimitado, este riesgo estructural desaparece. La inyección y planeación en Tier 1 y 2 ocurre de forma fluida, haciendo una pausa interactiva únicamente antes de la ejecución final.*

**Pendiente por definir el diagrama final**
```text
funky feature <name>
  ├─ Inquirer 1: Tier
  ├─ Inquirer 2: Docs Core?
  └─ Inquirer 3: SemVer Release?

Flujo de Inyección de Templates:
  ├─ T1 (Tweaks/Bugs)
  │     → inyecta tasks.md + [docs.md] + [release.md] → Espera Aprobación → Execute
  │
  ├─ T2/T3 (Standard/Complex Features) 
  │     → inyecta explore.md → [SDD ligero]
  │     → inyecta proposal.md → [SDD ligero]
  │     → inyecta spec.md → [SDD ligero]
  │     → inyecta tasks.md + worker-handoff.md + [docs.md = Obligatorio T3] + [release.md] 
  │     → Espera Aprobación Humana Final → Execute
  │
  └─ T4 (Rediseño Mayor)
        → "Rediseño masivo. Correr: funky gentle <name>" → Exit
```

---

## Modos de Ejecución del CLI (§7.2)

El CLI opera en dos modos que afectan **dos capas distintas** del flujo: la inyección de templates y la delegación a workflows.

### Modo Interactivo (Default para Tiers Altos)
Las pausas intencionales entre cada fase se reservan principalmente para Tiers 3 y 4 (donde se requiere validación estricta de arquitectura de negocio). Esto no quita que no haya modo interactivo en tier 2.

**Capa 1 — Inyección de Templates (T1/T2):**
*(Deprecado)* Anteriormente se usaba `[user: next]` en el CLI para pausar entre templates. Ahora, gracias al scope cerrado de los SDD ligeros, el CLI inyecta y ejecuta la delegación de forma continua (fluida). La **única pausa obligatoria** es antes de lanzar al Worker para asegurar que el humano apruebe el plan maestro final. 

El cli creo que ya no debe preguntar el modo auto/interactivo, ya que dependiendo el tier elegido se inyectarán los templates necesarios de golpe, esto nos quita el trabajo manual de estar dando next constantemente, y lo mejor de todo, ya no hay riesgos de alucinaciones del orquestador inline, simplemente subagentes mas enfocados y un orquestador con contexto mas limpio.

**Capa 2 — Delegación a Workflows (T3/T4):**
Al terminar cada workflow, el Orquestador recibe el **Return Envelope** (resumen estructurado del resultado), lo presenta al humano y pregunta:
> *"¿Cómo lo ves, lo aprobamos o tienes observaciones para despertar al mismo subagente?"*

- Si hay observaciones → el mismo subagente se despierta con el feedback inyectado en el prompt.
- Si hay aprobación → el Orquestador lanza el siguiente workflow y mata al subagente que ha sido aprobado.

### Modo Automático
Aplica a todos los Tiers, pero su efecto varía:

**En T1/T2 — Auto-inyección de Templates:**
El CLI inyecta todos los templates y ejecuta todas las fases secuencialmente sin pausas de aprobación. El dev obtiene el paper trail SDD completo sin tener que aprobar paso a paso.
- *Ideal para:* Standard Features altamente predecibles (CRUDs simples, cambios rutinarios).
- *Riesgo:* Si la feature es más compleja de lo estimado, el agente se arranca sin supervisión y la primera alucinación contamina todas las fases siguientes.

**En T3/T4 — Auto-delegación a Workflows:**
No hay templates que inyectar. El "auto" aquí significa que las **delegaciones a workflows son automáticas**: el Orquestador elabora el prompt y lo pasa directamente al subagente nativo sin requerir copy-paste manual del humano. El Return Envelope también regresa automáticamente al Orquestador.

---

## Transición de Entorno: Puente Manual (v1) → CLI Nativo (v2)

El patrón de delegación del Orquestador evoluciona en dos versiones. Esta distinción aplica a **toda** delegación, no solo al Sabueso:

**v1 — IDE / Modo Handoff (Actual):**
El Orquestador elabora el prompt del subagente → lo entrega al humano como bloque de copy-paste → el humano abre un nuevo chat, pega el prompt, obtiene el Return Envelope → lo pega de vuelta al Orquestador.
El humano actúa como "cable" entre agentes. Es el precio a pagar por las herramientas visuales del IDE (diffs, accept/reject).

**v2 — CLI Nativo (Futuro):**
El Orquestador elabora el mismo prompt → lo pasa directamente al subagente nativo → recibe el Return Envelope sin fricción manual. El humano solo interviene en los checkpoints de aprobación del Modo Interactivo.

**Ley de Invarianza:** El prompt que el Orquestador genera en v1 (copy-paste) y el que pasa en v2 (automático) deben ser **idénticos**. La única diferencia es el canal de entrega, nunca el contenido.

**PENDIENTE** 
1. El humano podría decidir hacer ciertas fases en modo auto y otras en interactivo. 
2.Tambien en modo auto cuando llegamos a la fase de chambear (worker/apply), aun estando en modo auto ya se decidió que se debe pedir aprobación antes de lanzarlos directamente, por lo que aquí podríamos elegir que el orquestador los lance directamente él una vez aprobados o mencionarle que para esa feature en concreto nosotros como humanos lo haremos en el IDE para mas control y tools integradas.
3. Este punto tal vez podría corresponder a otra sección o file, por lo que hay que revisarlo antes de tomar decisiones. La idea es determinar qué diferencia al tier 3 del 4, actualmente creo que tienen la misma cantidad de workflows, creo que el tier 3 se ha probado el no usar el design y el verify, pero no se qué tan factible sea. El quitar el design puede hacer el proceso mas fluido, pero el verify creo que es importante ya que en mi experiencia siempre han salido inconsistencias que se solucionan en esta fase. 
Tambien he pensado en deprecar el tier 4 y que el tier 3 sea el mas potente, para evitar las mierdas de meter has_design, etc, pero es algo que aun no tengo claro, y queda pendiente organizar todos los drafts primero antes de tomar decisiones pendejas.

