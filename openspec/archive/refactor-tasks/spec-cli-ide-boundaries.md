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
1. **¿Qué Tier?** (T1 / T2 / T3)
2. **¿Impacta Docs Core?** (Sí / No) → Determina la inyección de `docs.md`.
3. **¿Tipo de Release?** (Major / Minor / Patch / Ninguno) → Determina la inyección de `release.md`.

**El Rol del Orquestador:** El Orquestador analiza la petición del usuario y genera una recomendación sobre cómo responder estos Inquirers. Sin embargo, no tiene el poder de inyectarlos automáticamente. El desarrollador audita la sugerencia y confirma (o corrige) directamente en el prompt del CLI.

### Diagrama de Inyección (Deprecación de Pausas Manuales)
Una vez resueltos los Inquirers, el CLI inyecta los templates en cascada.
*Nota Arquitectónica: Históricamente existía un `[user: next]` para frenar la "alucinación en cadena" del Orquestador al llenar templates. Al introducir los subagentes "SDD ligeros" con alcance delimitado, este riesgo estructural desaparece. La inyección y planeación en Tier 1 y 2 ocurre de forma fluida, haciendo una pausa interactiva únicamente antes de la ejecución final.*

```text
funky feature <name>
  ├─ Inquirer 1: Tier (T1 / T2 / T3)
  ├─ Inquirer 2: Docs Core? (Sí / No)
  └─ Inquirer 3: SemVer Release? (Sí / No)
  Inquirer 3 debe decidirse con respecto a:
  - (Major / Minor / Patch / None)

Flujo de Inyección de Templates:
  ├─ T1 (Tweaks/Bugs)
  │     → inyecta tasks.md + [docs.md condicional] (release.md OMITIDO — bump de versión va en tasks.md)
  │     → inyecta report.md
  │
  ├─ T2 (Standard Features)
  │     → inyecta explore.md, -> SDD ligero
  │     → inyecta proposal.md → [SDD ligero]
  │     → inyecta spec.md → [SDD ligero]
  │     → inyecta tasks.md + ( [docs.md] + [release.md] CONDICIONALES)
  │     → inyecta report.md
  │
  └─ T3 (Deep Features)
        → No inyecta templates, workflows trabajan independientemente
        → inyecta tasks.md + docs.md + release.md, únicos templates que sí aplican

El modo Auto, interactivo y handoff no se implementarán en el cli, ya que no aportan nada en la inyeccion de templates. El cli está diseñado para agilizar este proceso unicamente.


Modo Automático:
  T1/T2 → fluido, sin pausas entre fases. Checkpoint pre-worker es el único freno.
  T3 → opcional pero NO recomendado. Si se activa, checkpoint pre-apply obligatorio.
```

---

## Reglas de Inyección: docs.md y release.md

### ¿Cuándo inyectar docs.md?

Se inyecta cuando el cambio afecta documentación o arquitectura:
- Toca documentación oficial (README, docs/, API docs)
- Hay decisiones arquitectónicas nuevas (ADRs)
- El cambio afecta cómo los usuarios interactúan con el sistema
- Se introducen patrones o convenciones nuevas

### ¿Cuándo inyectar release.md?

Se inyecta cuando hay funcionalidad nueva o breaking changes:
- Feature nueva (MINOR) — incluye release notes
- Breaking change (MAJOR) — incluye guía de migración
- Updates de dependencias que afectan a usuarios

### Regla por SemVer

| Tipo | release.md | docs.md | Justificación |
|------|-----------|---------|---------------|
| **Bugfix (PATCH)** | ✗ — bump en tasks.md | ✗ | Solo se actualiza package.json |
| **Feature (MINOR)** | ✓ | Cond. | Hay funcionalidad nueva, vale la pena |
| **Breaking (MAJOR)** | ✓ — obligatorio | ✓ — obligatorio | Ambos son obligatorios |

### ¿Cuándo NO inyectar ninguno?

- Bugfix interno que no afecta docs ni versión
- Refactor que no cambia comportamiento
- Chores (linting, CI, config interna)

---

## Modos de Ejecución del CLI (§7.2)

El CLI opera en dos modos que afectan **dos capas distintas** del flujo: la inyección de templates y la delegación a workflows.

### Modo Interactivo (Default para Tiers Altos)
Las pausas intencionales entre cada fase se reservan principalmente para Tier 3 (donde se requiere validación estricta de arquitectura de negocio). Esto no quita que no haya modo interactivo en tier 2.

**Capa 1 — Inyección de Templates (T1/T2):**
*(Deprecado)* Anteriormente se usaba `[user: next]` en el CLI para pausar entre templates. Ahora, gracias al scope cerrado de los SDD ligeros, el CLI inyecta y ejecuta la delegación de forma continua (fluida). La **única pausa obligatoria** es antes de lanzar al Worker para asegurar que el humano apruebe el plan maestro final. 

El cli creo que ya no debe preguntar el modo user:next, ya que dependiendo el tier elegido se inyectarán los templates necesarios de golpe, esto nos quita el trabajo manual de estar dando next constantemente, y lo mejor de todo, ya no hay riesgos de alucinaciones del orquestador inline, simplemente subagentes mas enfocados y un orquestador con contexto mas limpio.

**Capa 2 — Delegación a Workflows (T3):**
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

**En T3 — Auto-delegación a Workflows:**
No hay templates que inyectar. El "auto" aquí significa que las **delegaciones a workflows son automáticas**: el Orquestador elabora el prompt y lo pasa directamente al subagente nativo sin requerir copy-paste manual del humano. El Return Envelope también regresa automáticamente al Orquestador.
> **Nota:** El modo Auto en T3 es **opcional pero NO recomendado**. Dado que T3 absorbió el alcance de Tier 4 (rediseños mayores), la complejidad justifica supervisión humana entre fases. El checkpoint pre-apply (definido en `spec-cli-ide-boundaries.md`) ya existe como safety net incluso en modo Auto.

### Checkpoint Pre-Apply: CLI o IDE

**Siempre hay un checkpoint antes de apply**, incluso en modo Auto. El orquestador presenta el plan de implementación (batches, estimación de líneas) y el humano decide dónde ejecutar:

```markdown
⚡ Plan de implementación listo — "login-con-google"

**Batch 1**: Phase 1 (OAuthAccount model + migration) — ~120 líneas
**Batch 2**: Phase 2-3 (Service + routes + tests) — ~400 líneas

¿Dónde lo corremos?

- **CLI**: lo delego directo al worker acá mismo
- **IDE**: te preparo el bloque copy-paste para ver difs
```

**Comportamiento por modo:**

| Modo | Checkpoint pre-apply | Durante apply |
|------|---------------------|---------------|
| **Interactivo** | Muestra plan + "¿CLI o IDE?" + "¿Arrancamos?" | Después de cada batch, resultado + "¿Ajustar o continuamos?" |
| **Auto** | Checkpoint lite: muestra plan, pregunta solo si quiere IDE o deja que arranque | Si hay múltiples batches, arranca el siguiente automático. Si blocked, frena |
| **Handoff** | Prepara bloque copy-paste. No pregunta CLI/IDE porque ya está en IDE | Humano trae Return Envelope después de cada batch |

**Ley de Invarianza:** El prompt que el Orquestador genera para CLI (delegación directa) y para IDE (bloque copy-paste) debe ser **idéntico**. Solo cambia el canal de entrega, nunca el contenido.

---

## Transición de Entorno: Puente Manual (v1) → CLI Nativo (v2)

El patrón de delegación del Orquestador evoluciona en dos versiones. Esta distinción aplica a **toda** delegación, no solo al Sabueso:

**v1 — IDE / Modo Handoff (Actual):**
El Orquestador elabora el prompt del subagente → lo entrega al humano como bloque de copy-paste → el humano abre un nuevo chat, pega el prompt, obtiene el Return Envelope → lo pega de vuelta al Orquestador.
El humano actúa como "cable" entre agentes. Es el precio a pagar por las herramientas visuales del IDE (diffs, accept/reject).

**v2 — CLI Nativo (Futuro):**
El Orquestador elabora el mismo prompt → lo pasa directamente al subagente nativo → recibe el Return Envelope sin fricción manual. El humano solo interviene en los checkpoints de aprobación del Modo Interactivo.

**Ley de Invarianza:** El prompt que el Orquestador genera en v1 (copy-paste) y el que pasa en v2 (automático) deben ser **idénticos**. La única diferencia es el canal de entrega, nunca el contenido. El modo handoff no se deprecará, se mantendrá como una opción válida.

**Resolución:** El humano puede alternar entre modo Interactivo y Auto por fase dentro de un mismo Tier. El Orquestador debe respetar la decisión del humano en cada transición de fase. Esta flexibilidad es la razón por la que el checkpoint pre-apply se mantiene siempre activo, independientemente del modo seleccionado.
