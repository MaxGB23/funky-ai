# Documentar no es Enforcer: El Loop Vicioso de los Fixes Textuales

> **Propósito:** Capturar la lección arquitectónica más importante que Funky AI ha aprendido a través de sus releases — y que ha repetido en cada una de ellas sin saberlo. Este documento es una carta a cualquier futuro Orquestador (humano o LLM) que esté a punto de "fixear" algo con más documentación.

---

## El Patrón que se Repite

Mirá el historial de releases de Funky AI con distancia:

| Release | Síntoma que fixeó |
|---|---|
| v1.1 | El Memory Polling era manual — lo documentamos como regla pasiva |
| v1.2 | `post-mortem.md` era un monolito — lo fragmentamos en `engram/` |
| v1.3 | Las reglas eran muy largas — aplicamos Token Diet |
| v1.5 | Los templates eran esqueletos vacíos — los enriquecimos |
| v1.6 | No había tests — agregamos TDD + CI |
| v1.7 | 3 bugs destructivos que los tests no detectaron — agregamos Smoke Test al DoD |
| v1.8 | Cognitive Overload en Workers — aplicamos XML Roles + Action Forcing |

Cada fix fue correcto. Y sin embargo, después de v1.8, un Orquestador generó handoffs **sin el campo Tier**, que estaba documentado como anti-patrón explícito desde v1.5.

**¿Por qué? ¿Acaso no lo habíamos documentado?**

Lo habíamos documentado. Ahí está el problema.

---

## El Error de Razonamiento Fundamental

Operamos bajo una suposición implícita que nunca cuestionamos:

> *"Si documentamos algo lo suficientemente bien, el agente lo va a respetar."*

Esta suposición es **falsa por diseño**.

Un LLM no tiene memoria persistente entre chats. Cada sesión comienza desde cero. Cualquier protocolo que dependa de que el modelo "haya leído antes" una guía está diseñado para fallar. Y no falla *a veces* — falla *sistemáticamente*, de manera predecible, cada vez que el contexto esté saturado o el modelo no tome el camino explícito hacia esa documentación.

Cada vez que respondemos a un error con **más texto en una guía**, hacemos el sistema:
1. **Más largo** → más tokens → mayor probabilidad de "Lost in the Middle"
2. **Más dependiente de que el agente encuentre ese texto** → que depende de contexto y rutas de lectura
3. **Más frágil** → porque el próximo error también generará más texto

Es un **loop vicioso**:

```
Error ocurre
    → Documentamos el anti-patrón
        → Sistema tiene más texto
            → Más probabilidad de saturación
                → Error vuelve a ocurrir (u otro similar)
                    → Documentamos más...
```

---

## La Distinción que Cambia Todo: Documentación vs. Enforcement

En ingeniería de software tenemos una distinción fundamental que aplicamos al código pero olvidamos aplicar al protocolo:

| Documentación | Enforcement |
|---|---|
| Un comentario que dice "no usar `null` acá" | El compilador de TypeScript que te bloquea si usás `null` |
| Una guía que dice "escribí tests antes del código" | Un pipeline de CI que no permite merge sin coverage |
| Un anti-patrón que dice "no omitir el Tier" | Un template con `Tier: [COMPLETAR T1/T2/T3]` que visualmente rompe el flujo si no se llena |

**La documentación informa. El enforcement garantiza.**

Si querés que algo sea imposible de olvidar, no lo documentás — hacés que **omitirlo sea estructuralmente imposible o inmediatamente visible**.

---

## Los Tres Actores que Siempre Debemos Auditar

Funky AI tiene tres actores. Cada fix debe ser evaluado desde los tres antes de declararlo completo.

### 🧑 El Humano Router
- ¿Puede cometer este error sin saberlo?
- ¿El flujo lo lleva naturalmente hacia el comportamiento correcto, o tiene que "recordar" hacer algo extra?

### 🤖 El Orquestador LLM
- ¿La rule activa lo **fuerza** a hacer algo, o solo lo **sugiere**?
- ¿Hay un `ACTION: Execute` explícito que lo obligue a leer el template antes de generarlo?
- ¿O simplemente hay una guía que "debería haber leído"?

### 👷 El Worker LLM
- ¿El handoff es **auto-contenido**? ¿Puede ejecutar su misión sin haber leído nada más antes?
- ¿O depende de contexto acumulado que el Worker asume pero no tiene?

El Tier fue omitido porque nadie auditó qué pasaba cuando **el Orquestador genera un handoff**. Fijamos el Worker (v1.8: Token Diet, XML Roles) pero nadie se preguntó: *"¿y qué pasa si el Orquestador nunca leyó el template canónico antes de crear el handoff?"*

---

## Cómo Plantear Correctamente un Fix

Antes de cada fix, hacete estas preguntas en orden:

### 1. ¿Cuál es el mecanismo que hace posible este error?
No el error en sí — el **mecanismo subyacente**. Si el Tier fue omitido, el error no es "el agente olvidó el Tier". El mecanismo es: *"El Orquestador genera handoffs desde cero en lugar de usar el template canónico, y ninguna rule lo fuerza a hacer lo contrario."*

### 2. ¿Ese mecanismo sigue activo después de mi fix?
Si respondés "sí" o "tal vez", tu fix es un parche, no una solución. El error va a volver.

### 3. ¿Mi fix documenta o enforcea?
Si la respuesta es "documenta", preguntate: *¿existe un mecanismo de enforcement posible?* Si existe y no lo implementás, estás dejando una deuda técnica consciente.

### 4. ¿Consideré los tres actores?
¿Cómo experimenta este fix el Humano Router? ¿El Orquestador? ¿El Worker? Un fix que solo considera uno de los tres es incompleto.

### 5. ¿Cómo testeo que el fix funciona?
Para el CLI: tests unitarios y de integración. Para el protocolo: simulá un Orquestador en chat virgen. ¿Genera el handoff correcto sin haber leído las guías? Si no podés verificar esto, no sabés si tu fix funciona.

---

## Ejemplos Concretos: Del Parche al Enforcement

### ❌ Parche (lo que hemos hecho)
> "El Orquestador omite el Tier en handoffs → Lo agregamos a la lista de anti-patrones en `guia-flujo-completo.md`."

**Problema:** Esa guía existe desde v1.5. El anti-patrón estaba ahí. Lo ignoramos igual.

### ✅ Enforcement (lo que deberíamos hacer)
> "Agregar en `sdd-orchestrator.md` bajo `## Comandos y Acciones` una directiva `ACTION: Execute view_file on funky-cli/src/templates/sdd/worker-handoff.md` antes de crear cualquier handoff."
> 
> "Modificar el template `worker-handoff.md` para que `Tier: [⚠️ COMPLETAR: T1 / T2 / T3]` aparezca en la línea 1, en negrita, imposible de ignorar."

**Resultado:** El error se vuelve estructuralmente visible. El Orquestador que no lee la rule igual ve el placeholder roto en el template.

---

## La Pregunta que Deberíamos Hacernos en Cada Release

> **"¿Cómo diseño esto para que el error sea estructuralmente imposible, en lugar de documentalmente desaconsejado?"**

Si la respuesta es "no se puede enforcer, solo documentar", entonces al menos seamos honestos: estamos aceptando que ese error va a volver. Documentémoslo como una limitación conocida del sistema, no como un fix.

---

## Corolario: El Protocolo también es Software

Aplicamos TDD al CLI. Tenemos 18 tests que validan que `funky init` no sobreescribe archivos existentes.

Pero el protocolo de orquestación — las reglas, los handoffs, el flujo entre Orquestador y Worker — tiene **cero tests**.

¿Cómo sería un "test" para el protocolo? Algo así:

```
DADO: Un Orquestador en chat virgen, sin memoria previa.
CUANDO: El usuario le pide planificar una feature sustancial.
ENTONCES: 
  - Genera un tasks.md con fases delimitadas ✓
  - Lee el template canónico antes de crear el handoff ✓
  - El handoff incluye: Tier, Safe-Contexting, Misión, Return Envelope ✓
  - No ejecuta código de negocio inline ✓
```

Si no podés responder si eso se cumple sistemáticamente, el protocolo no está validado. Lo cual significa que cualquier "fix" al protocolo es fe, no ingeniería.

---

## Resumen Ejecutivo

| Principio | Descripción |
|---|---|
| **Documentar ≠ Enforcer** | Escribir el anti-patrón en una guía no garantiza que se cumpla |
| **El fix correcto = error imposible** | No documentalmente desaconsejado, estructuralmente imposible |
| **Auditar los tres actores** | Human Router, Orquestador LLM y Worker LLM — si uno queda fuera, el fix está incompleto |
| **El loop vicioso** | Más texto → más saturación → más errores → más texto |
| **El protocolo es software** | Merece la misma ingeniería que el código: testeo, enforcement, validación |

---

> **Relacionado:**
> - `docs/engram/discoveries.md` → `[DISCOVERY][documentation-vs-enforcement]`
> - `docs/funky-ai/core-concepts/testing-landscape.md` → Landscape de testing del ecosistema
> - `docs/funky-ai/core-concepts/manifiesto.md` → Regla 3: El Engram se consulta ANTES de modificar
