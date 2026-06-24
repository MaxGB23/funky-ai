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

