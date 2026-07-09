# Funky-ai Interactive — Preflight (Recomendación + Confirmación)

## Propósito

Este no es un formulario que el orquestador le pregunte al humano. Es el paso
cero donde el orquestador **analiza el pedido, recomienda valores para los
Inquirers de `funky feature`, y espera confirmación** para saber en qué
contexto va a operar el resto de la sesión.

No reemplaza a `funky feature`. El humano **siempre ejecuta el comando en el
CLI**. El orquestador solo aconseja para que la decisión sea informada.

## Flujo

```
Humano: "necesito implementar login con Google"
  │
  ▼
Orquestador: analiza (tamaño, riesgo, si toca docs, si cambia API pública)
  │
  ▼
Orquestador: recomienda al humano
  │
  ▼
Humano: ejecuta `funky feature login-con-google` con esos valores (o modificados)
  │
  ▼
Humano: vuelve al chat, informa qué eligió
  │
  ▼
Orquestador: guarda el contexto y arranca el flujo SDD
```

## Lo que recomienda el orquestador

El orquestador entrega un bloque de texto como este:

```markdown
Para arrancar, corre en el CLI:

  funky feature login-con-google

Mi recomendación:

  Tier:   T3 (Deep Feature) — toca lógica de auth, modelo nuevo, tests
  Docs:   No — es puro código, no cambia arquitectura documentada
  Release: Minor — nueva funcionalidad, compatible hacia atrás
  Modo:   Interactivo — tiene riesgo medio, conviene revisar fase por fase

Decime qué elegiste cuando termines para que yo sepa cómo seguimos.
```

### Cómo decide cada valor

| Variable | Criterio |
|----------|---------|
| **Tier** | T1 (bug/tweak < 100 líneas), T2 (standard feature < 300 líneas), T3 (deep feature, varios archivos, lógica nueva, incluye design) |
| **Docs** | Sí si toca modelos de datos, flujos existentes, o cambia comportamiento documentado |
| **Release** | Patch (bugfix), Minor (feature nueva), Major (breaking change), Ninguno |
| **Modo** | Interactivo si riesgo > Low o archivos > 5; Auto si es predecible y acotado; Handoff si el humano pidió específicamente IDE o el orquestador detecta que el cambio requiere herramientas visuales (diffs grandes, refactors complejos) |

## Modos de operación

| Modo | Cuándo recomendarlo | Comportamiento |
|------|--------------------|----------------|
| **Interactivo** | Defecto para Tier 2+ con riesgo medio o más de 5 archivos | Pausa entre fases, pregunta "¿Querés ajustar algo o continuamos?" |
| **Auto** | Tier 1, Tier 2 predecible, cambios rutinarios | Corre fases seguidas. Único checkpoint obligatorio antes de apply |
| **Handoff** | El humano explícitamente quiere IDE, o el cambio requiere diff visual complejo | El orquestador prepara prompts para llevar al IDE. Vuelta con Return Envelope |

## Lo que espera el orquestador después

El humano vuelve y dice algo como:

```markdown
Listo, elegí:
  Tier: T3
  Docs: No
  Release: Minor
  Modo: Interactivo
```

El orquestador **no confía ciegamente** — si ve una contradicción grande (ej.
humano dijo Tier 1 pero la feature estimada es +500 líneas), puede advertir:

```markdown
Dato: elegiste Tier 1, pero estimo ~500 líneas por el modelo nuevo y los
tests. Si querés lo dejamos en T1 igual y ajusto el proceso para que sea
más rápido, pero si preferís T3 tenemos más fases de validación.
¿Confirmamos T1 o subimos a T3?
```

Una vez confirmado, se cachean los valores para toda la sesión.

## Diferencias con Gentle AI

| Gentle AI | Funky-ai |
|-----------|----------|
| Pregunta 4 grupos al usuario directo | Recomienda, el humano elige en `funky feature` y confirma después |
| Incluye Artefactos (OpenSpec/Engram) | No se pregunta — siempre OpenSpec (file-based) |
| Incluye PRs upfront | No se pregunta upfront — se decide después si el forecast lo requiere |
| A1/A2 = Interactivo/Auto | Se agrega Handoff como tercer modo (específico Funky-ai) |

## Reglas

- El orquestador SIEMPRE recomienda. No preguntar "elegí ritmo, artefactos..." como formulario.
- Cachear Tier, Docs, Release, Modo para toda la sesión.
- Si el humano no dice el modo, asumir Interactivo.
- Si el humano no dice el Tier y el orquestador no puede inferirlo, preguntar directamente.
- **Ley de Invarianza:** El bloque copy-paste que el orquestador genera en modo
  Handoff debe ser **idéntico** al prompt que enviaría a un sub-agente nativo
  en CLI. La única diferencia es el canal: en CLI el prompt viaja directo al
  sub-agente, en Handoff el humano lo copia y pega. Esto permite que Handoff
  sirva como mecanismo de testeo y transparencia — el humano ve exactamente
  qué instrucciones recibe cada sub-agente.
