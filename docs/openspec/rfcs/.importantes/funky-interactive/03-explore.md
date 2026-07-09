# Funky-ai Interactive — Explore

> Investigación del código antes de comprometerse con un cambio.
> En Funky-ai existe en dos versiones: **Explore SDD** (fase formal del ciclo)
> y **Explore Ligero** (Sabueso desechable, fuera del SDD o en tiers bajos).

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
| **Interactivo** | Muestra resultado + "¿Querés ajustar algo o continuamos?" | Disponible (CLI nativo) |
| **Auto** | Si `Ready for Proposal: Yes`, arranca propose directo. Si `No`, frena | Disponible (CLI nativo) |
| **Handoff** | Prepara bloque de copy-paste para IDE, espera Return Envelope | Prepara bloque copy-paste con prompt de Sabueso, humano corre en IDE y trae findings |

### Casos especiales

- **`Ready for Proposal: No`** → no ofrece continuar. Explica qué falta.
- **`Status: blocked`** → muestra el bloqueo, no avanza.
- **Sin áreas afectadas** → el explore probablemente no hizo falta. Sugerir saltar a propose.

---

## Explore Ligero (Sabueso desechable)

### Cuándo se usa

- Investigaciones rápidas fuera del flujo SDD (Tier 0 preguntas sueltas).
- SDD Tier 1-2 donde `funky-explore` completo es excesivo.
- El orquestador necesita entender algo sin ensuciar su contexto.
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

### Consumo por el propose (Tier 2)

El Explore Ligero **no persiste artefacto**. Los hallazgos se pasan al propose
inline en el prompt de delegación:

```
Prompt del propose (Tier 2) = template de funky feature + EXPLORE FINDINGS
```

El orquestador toma el return del Sabueso y lo inyecta como una sección adicional
dentro del prompt del sub-agente propose. El propose **lee findings del prompt**,
no de un archivo.

**En Handoff:** el orquestador no puede inyectar findings porque el Sabueso
corre en el IDE. El flujo es:

```
1. Orquestador prepara bloque copy-paste del Sabueso
2. Humano abre chat en IDE, pega, ejecuta
3. Sabueso devuelve findings
4. Humano copia findings de vuelta al chat del orquestador
5. Orquestador los recibe y los pone en el bloque copy-paste del propose
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

Esto solo aplica en Tier 2. En Tier 3+, el explore persiste artefacto y el
propose lo lee desde disco.

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
El Sabueso no persiste artefacto ni tiene Return Envelope formal.

### Lo que NO hace el Explore Ligero

- No persiste artefacto
- No tiene status/return envelope formal
- No bloquea el flujo SDD
- No pregunta "Ready for Proposal"
- No recibe skills — es desechable y no escribe código
- En Handoff: el humano hace de puente, el orquestador prepara el copy-paste

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
| Explore Ligero | **No** — es desechable |

El orquestador cachea el skill registry una vez por sesión y filtra por fase.
Las skills se pasan como paths en el prompt de delegación, no como contenido
inline. El sub-agente las lee antes de arrancar su trabajo.

---

## Diferencias con Gentle AI

| Gentle AI | Funky-ai |
|-----------|----------|
| Un solo explore | Dos niveles: Explore SDD (formal) + Explore Ligero (desechable) |
| Siempre persiste artefacto | El Ligero no persiste nada |
| El orquestador siempre pregunta "Ready for Proposal" | El Ligero no tiene ese campo |
| No menciona Sabueso | El Sabueso es un rol documentado en spec-roles-subagents.md |
