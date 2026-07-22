# Funky-ai Interactive — Explore

> Investigación del código antes de comprometerse con un cambio.
> En Funky-ai existe en tres versiones: **Explore SDD** (fase formal del ciclo),
> **Route A — Research Sencillo** (ad-hoc, cualquier tier, sin artefacto), y
> **Route B — Explore Ligero Tier 2** (Sabueso de Lava, persiste `explore.md`).

---

## Explore SDD (fase formal)

### Cuándo se usa

- Tier 3+ donde el cambio requiere entender el estado actual del código antes
  de proponer algo.
- El orquestador decide si hace falta exploración o si puede saltar directo
  a propose según el análisis del preflight.

### Lo que devuelve el sub-agente (`funky-explore`)

**Envelope** (Section D):

```markdown
**Status**: success | partial | blocked
**Summary**: Exploración de {topic} completada. N áreas afectadas, M enfoques comparados.
**Artifacts**: `docs/openspec/changes/{change}/explore.md`
**Next**: sdd-propose
**Risks**: riesgos encontrados o None
```

**Artefacto persistido**:

```markdown
## Exploration: {topic}
### Current State
### Affected Areas
### Approaches (con pros/cons/effort)
### Recommendation
### Risks
### Ready for Proposal: Yes/No
```

### Lo que presenta el orquestador

```markdown
🔍 Explore complete — "login-con-google"

📋 **Resumen**: El auth actual usa JWT con email/password vía Prisma.
No hay soporte para OAuth ni providers externos.

📁 **Áreas afectadas**:
- `src/auth/service.ts` — lógica de intercambio de código por token
- `prisma/schema.prisma` — nuevo modelo OAuthAccount
- `src/auth/routes.ts` — nueva ruta de callback OAuth

⚖️ **Enfoques**:
1. **Manual con webfetch** — sin deps externas, más control
   Esfuerzo: Medio
2. **Passport.js** — más rápido, agrega dependencia pesada
   Esfuerzo: Bajo

✅ **Recomendación**: Manual con webfetch

⚠️ **Riesgos**: Refresh token rotation no está cubierta actualmente
```

### Comportamiento por modo

| Modo | Explore SDD | Explore Ligero |
|------|------------|----------------|
| **Interactivo** | Muestra resultado + "¿Quieres ajustar algo o continuamos?" | Route A: Disponible (CLI nativo). Route B: Persiste explore.md + resumen |
| **Auto** | Si `Ready for Proposal: Yes`, arranca propose directo. Si `No`, frena | Route A: Disponible (CLI nativo). Route B: Persiste explore.md, propose lo lee desde disco |
| **Handoff** | Prepara bloque de copy-paste para IDE, espera Return Envelope | Route A: Prepara bloque copy-paste con prompt de Sabueso. Route B: Prepara bloque copy-paste de Sabueso de Lava + template de explore.md |

### Casos especiales

- **`Ready for Proposal: No`** → no ofrece continuar. Explica qué falta.
- **`Status: blocked`** → muestra el bloqueo, no avanza.
- **Sin áreas afectadas** → el explore probablemente no hizo falta. Sugerir saltar a propose.

---

## Route A — Research Sencillo (Sabueso desechable)

Investigaciones rápidas ad-hoc, **independientes de cualquier tier**.
No persiste artefacto. Los findings se devuelven inline.

### Cuándo se usa

- Preguntas sueltas de Tier 0 (el orquestador investiga para responder).
- Cualquier tier donde `funky-explore` completo es innecesario.
- El orquestador necesita entender algo rápido sin ensuciar su contexto.
- En CLI: se delega directo a sub-agente nativo.
- En Handoff: el orquestador prepara bloque copy-paste, el humano lo corre en el IDE.

### Return estándar

El Sabueso devuelve **únicamente** esto — sin envelope, sin status, sin artifacts:

```markdown
## Hallazgo: {título corto del finding}
**Qué**: {una línea — el finding concreto}
**Dónde**: `path/to/file.ext[:línea]`
**Contexto**: {2-3 líneas — por qué importa, cómo se relaciona}
```

Si hay múltiples hallazgos, se repite el bloque. Cada Sabueso resuelve una
sola investigación — no mezclar preguntas distintas en una misma invocación.

### Consumo por el orquestador

Route A **no persiste artefacto**. Los hallazgos se usan inline para responder
al humano o como contexto en el prompt de otra delegación:

```
Prompt del propose (Tier 2) = template de funky feature + EXPLORE FINDINGS
```

**En Handoff:** el orquestador no puede inyectar findings porque el Sabueso
corre en el IDE. El flujo es:

```
1. Orquestador prepara bloque copy-paste del Sabueso
2. Humano abre chat en IDE, pega, ejecuta
3. Sabueso devuelve findings
4. Humano copia findings de vuelta al chat del orquestador
5. Orquestador los recibe y los usa inline
```

El bloque de copy-paste del Sabueso en Handoff:

```markdown
Necesito que investigues esto en el código:
{tarea concreta}
Sos un Sabueso de solo lectura. Devolveme SOLO esto:

## Hallazgo: {título}
**Qué**: {una línea}
**Dónde**: `path/file.ext[:línea]`
**Contexto**: {2-3 líneas}

Sin ruido, sin explicaciones, sin resúmenes.
```

### Lo que presenta el orquestador

```markdown
🔎 Hallazgo: Validador sincrónico
**Qué**: El validador de tokens usa `jsonwebtoken.verify()` sincrónico,
no hay versión asincrónica.
**Dónde**: `src/auth/validate.ts:42`
**Contexto**: Si migramos a endpoints async, este validador va a bloquear
el event loop. Conviene planificar el cambio.
```

No hay "¿Querés ajustar algo?" porque es una respuesta, no una fase del ciclo.

### Lo que NO hace Route A

- No persiste artefacto
- No tiene status/return envelope formal
- No bloquea el flujo SDD
- No pregunta "Ready for Proposal"
- No recibe skills — es desechable y no escribe código
- En Handoff: el humano hace de puente, el orquestador prepara el copy-paste

---

## Route B — Explore Ligero Tier 2 (Sabueso de Lava)

**Tier 2 exclusivo.** Persiste `explore.md` como insumo para propose.
Usa `define_subagent` (lectura + escritura). No reemplaza a Explore SDD (Tier 3+).

### Cuándo se usa

- Tier 2 cuando hay un RFC/spec como input, o la tarea requiere entender
  reglas, definiciones y constraints de un documento fuente.
- El orquestador delega para no ensuciar su contexto con código basura.

### Lo que devuelve

Persiste el artefacto `explore.md` en `openspec/changes/{change}/explore.md`.
Devuelve un hallazgo resumen:

```markdown
## Hallazgo: {título corto}
**Qué**: {1-3 líneas — resumen del análisis}
**Dónde**: `openspec/changes/{change}/explore.md`
**Context Preservation**: {SÍ/NO — si se pudo volcar el contexto del RFC}
```

### Consumo por el propose (Tier 2)

El propose **lee `explore.md` desde disco**, no del prompt.
El orquestador pasa el path al propose como artefacto anterior:

```
Prompt del propose (Tier 2) = template de funky feature + path a explore.md
```

### Lo que NO hace Route B

- No reemplaza a Explore SDD (Tier 3+) — es un template ligero enfocado
  en Context Preservation, no en análisis profundo de opciones de arquitectura.
- No tiene Return Envelope formal.

---

## Skills a futuro

Cuando el orquestador tenga acceso al skill registry (Archivos En Gram), puede
pasar skills relevantes a los sub-agentes SDD que **escriben código**:

| Fase | Skills útiles |
|------|--------------|
| `sdd-apply` | go-testing, vitest, playwright, work-unit-commits |
| `sdd-verify` | go-testing, vitest, playwright |
| `sdd-design` | cognitive-doc-design |
| `sdd-spec` | cognitive-doc-design (opcional) |
| `sdd-explore` | Ninguna — investigación pura |
| `sdd-propose` | Ninguna — definición de alcance |
| Explore Ligero Route A | **No** — es desechable, no persiste nada |
| Explore Ligero Route B | **No** — enfocado en Context Preservation, no escribe código |

El orquestador cachea el skill registry una vez por sesión y filtra por fase.
Las skills se pasan como paths en el prompt de delegación, no como contenido
inline. El sub-agente las lee antes de arrancar su trabajo.

---

## Diferencias con Gentle AI

| Gentle AI | Funky-ai |
|-----------|----------|
| Un solo explore | Tres variantes: Explore SDD (formal), Route A (desechable, sin persistencia), Route B Tier 2 (persiste `explore.md`) |
| Siempre persiste artefacto | Route A no persiste nada; Route B persiste `explore.md` |
| El orquestador siempre pregunta "Ready for Proposal" | El Ligero no tiene ese campo |
| No menciona Sabueso | El Sabueso es un rol documentado en spec-roles-subagents.md |
