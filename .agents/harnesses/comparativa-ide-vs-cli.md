# Comparativa Directa: Antigravity IDE vs CLI

> **Propósito:** Análisis side-by-side de los harnesses, costo en tokens y autonomía arquitectónica de ambos entornos.
> Basado en las introspecciones de [`antigravity-cli.md`](./antigravity-cli.md) y [`antigravity-ide.md`](./antigravity-ide.md).
>
> **Fecha:** 2026-06-09

---

## 1. Harnesses: Presencia y Tipo

| Bloque | CLI | IDE | Ganador |
|---|---|---|---|
| `<planning_mode>` | ❌ No existe | ✅ Presente — **bloqueante** | CLI ✅ |
| `<planning_mode_artifacts>` | ❌ No existe | ✅ Presente — fuerza artefactos fuera del repo | CLI ✅ |
| `<ephemeral_message>` | ❌ No existe | ✅ Presente — refuerzo silencioso por turno | CLI ✅ |
| `<artifacts>` | ⚪ Convención de output (libre) | 🔴 Acoplado a UI del IDE | CLI ✅ |
| `<user_rules>` | ✅ Defensa activa del usuario | ✅ Defensa activa del usuario | Empate |
| `<workflows>` SDD | ✅ Opt-in | ✅ Opt-in | Empate |
| `<skills>` | ✅ Opt-in | ✅ Opt-in | Empate |
| `<web_application_development>` | ✅ Opinionado, no bloqueante | ✅ Opinionado, no bloqueante | Empate |
| `<subagents>` | ✅ Presente | ❓ No documentado por IDE | CLI ✅ |
| `<conversation_transcript>` | ✅ Presente | ❓ No documentado por IDE | CLI ✅ |

---

## 2. Costo en Tokens (por turno)

| Métrica | CLI | IDE |
|---|---|---|
| **Total estimado** | ~3,570 tokens | ~1,900 (overhead exclusivo) + base compartida |
| Bloques bloqueantes | **0** | **2** (`planning_mode` + `ephemeral_message`) |
| Overhead condicional | ~680 tokens *(solo si es webapp)* | ~850 tokens *(planning activo siempre)* |
| Tokens "veneno" (restringen autonomía) | **0** | **~1,900** |
| Tokens de infraestructura útil | ~2,290 | ~0 en harnesses exclusivos |
| Tokens de inversión (user_rules) | ~600 | ~600 |

> **Nota:** El CLI paga más tokens en bruto, pero cada token trabaja a favor del agente.
> El IDE paga menos tokens exclusivos, pero todos sus harnesses trabajan **contra** el agente.

---

## 3. Autonomía de Escritura

| Aspecto | CLI | IDE |
|---|---|---|
| Escritura directa al repo | ✅ Libre | ⚠️ Condicionada al flujo `planning_mode` |
| Destino de artefactos | `AppDataDir\brain\` *(convención, no obligatorio)* | `AppDataDir\brain\` *(forzado por harness)* |
| Escritura fuera del repo | ✅ Posible si el usuario lo pide | ❌ Default al IDE, hay que luchar contra el drift |
| Bloqueo entre fases | ❌ Ninguno | ✅ Research → Plan → **Stop** → Approve → Execute |

---

## 4. Compatibilidad con Funky AI / SDD

| Criterio | CLI | IDE |
|---|---|---|
| Flujo Orquestador SDD respetado | ✅ Nativo | ⚠️ Requiere `user_rules` para sobrevivir |
| Riesgo de IDE Drift | **Nulo** | **Alto** sin la REGLA ABSOLUTA |
| Secuestro de flujo por harness | ❌ No ocurre | ✅ Ocurre si `user_rules` no lo frena |
| Workers pueden usar el IDE | N/A | ✅ Justificado para review visual de diffs |
| Orquestador debe usar el IDE | N/A | ❌ Demasiado friction para diseño/exploración |

---

## 3.5. Contexto: Implícito (IDE) vs Explícito (CLI)

> **Verificado en prueba real (2026-06-10)** — el IDE tiene 3 canales de inyección automática por turno:

**Canal 1 — `ADDITIONAL_METADATA` (siempre):**
```
Active Document: ruta/al/archivo.md (LANGUAGE_MARKDOWN)
Cursor is on line: 14
Other open documents:
- ruta/archivo1.md (LANGUAGE_MARKDOWN)
```

**Canal 2 — Diffs automáticos de archivos modificados (cuando el usuario edita):**
```
The following changes were made by the USER to: prueba-de-contexto-ide.md
+ Quiero meter una feature donde el cli genere un calendar con to-dos qué hacer.
```

**Canal 3 — View file actions (cuando el usuario abre/visualiza un archivo):**
```
The USER performed the following action:
Show the contents of file agy-datos-concretos.md from lines 3 to 27
[...contenido completo de esas líneas...]
```

| Aspecto | CLI | IDE |
|---|---|---|
| Paths de tabs abiertas | ❌ No aplica | 🔴 Automático, cada turno |
| Contenido de archivos editados | ❌ No aplica | 🔴 Diff completo automático al editar |
| Contenido de archivos visualizados | ❌ No aplica | 🔴 Líneas completas al abrir un archivo |
| Contenido vía `@mention` | ✅ El agente controla cuándo pedir más | 🔴 El usuario lo activa, sin filtro del agente |
| Cambios del agente re-inyectados | ❌ No aplica | ⚠️ El IDE los manda de vuelta como diff |
| Control del desarrollador | ✅ Total — el agente pide lo que necesita | ❌ Nulo sobre los canales 2 y 3 |
| Riesgo de contaminación real | **Nulo** | **Alto** — cualquier archivo que toques o abras entra al contexto |

> **Conclusión final (post-prueba):** El análisis intermedio que decía "solo paths, riesgo medio" estaba **incompleto**.
> Los canales 2 y 3 son silenciosos y automáticos: el usuario ni sabe que está alimentando el contexto del agente.
> Abrir un archivo irrelevante, editar una nota, revisar un TODO — todo llega al agente sin pedirlo.
>
> **El veredicto se mantiene y se refuerza:** el orquestador no puede vivir en el IDE. Contexto limpio = CLI.

---


## 5. Tabla de Veredicto General

| Dimensión | Ganador | Por qué |
|---|---|---|
| Autonomía de ejecución | **CLI** | Sin bloqueantes, escribe libre al repo |
| Costo tokens / comportamiento útil | **CLI** | ~0 tokens de veneno vs ~1,900 en IDE |
| UI de revisión de código | **IDE** | Accept/Reject diffs es genuinamente valioso |
| Riesgo de drift arquitectónico | **CLI** | El IDE necesita user_rules como salvavidas |
| Contexto de herramientas disponibles | **CLI** | Subagents, transcripts, más infraestructura |
| Volumen bruto de tokens inyectados | **IDE** | Menos tokens totales, pero todos tóxicos |

---

## 6. Recomendación de Uso Híbrido *(actualizada)*

```
Orquestador (CLI) ──────► diseño, exploración, planificación SDD
   contexto limpio,              │
   quirúrgico                    ▼
                          Workers (IDE) ──► ejecución táctica
                                             + review visual de diffs
                                             + Accept/Reject changes
```

**Regla de oro:**
- **CLI como cerebro**: Fases de `/funky-explore`, `/funky-design`, `/funky-propose`, `/funky-spec`, `/funky-tasks`
- **IDE como manos**: Fases de `/funky-apply` y `/funky-worker` donde la UI de diffs agrega valor real
- **La REGLA ABSOLUTA en `user_rules`** es el seguro que mantiene al IDE en su carril

> ⚠️ **Decisión de arquitectura (en evaluación):** Deprecar el orquestador en el IDE y migrarlo 100% al CLI.
> Razón: el contexto implícito del IDE (tabs abiertas, cursor, archivos irrelevantes) contamina el razonamiento
> del orquestador, que es el agente más crítico del sistema. El CLI garantiza contexto quirúrgico y control total.

> **TL;DR:** Los ~3,500 tokens del CLI son fijos, predecibles y 100% útiles. El IDE parece más barato en overhead exclusivo, pero su costo real es **variable e impredecible**: cada tab abierta, cada línea que tocas, cada archivo irrelevante se suma silenciosamente al contexto. Con 10 tabs abiertas el IDE puede superar al CLI fácilmente — y encima con tokens de contaminación. Las tools de infraestructura del CLI (subagentes, transcripts) no son bonus: son ventajas arquitectónicas reales que el IDE simplemente no tiene.

> **TL;DR JUSTIFICACIÓN:**Deprecar la orquestación en el IDE **no significa abandonar el IDE**. Hasta que el CLI no madure (específicamente en delegación síncrona, modelos por subagente y mejor UX para diffs), el IDE es insustituible como brazo ejecutor por las siguientes razones:
1. **Accept / Reject Changes:** La UI visual para revisar diffs antes de aplicar código es oro puro. El CLI edita archivos a ciegas, el IDE te deja ser un filtro de calidad humano.
2. **Notificaciones y Sonidos:** Ya tenemos el entorno configurado para que el IDE avise visual y sonoramente cuando un worker termina. En el CLI, dependes de estar viendo la terminal.
3. **Flujos Tácticos Cortos:** Para tirar código directo, formatear un archivo, o correr un script rápido, la inmediatez del IDE es mejor.

**El trato es:** (CLI) piensa la arquitectura, diseña el plano y guarda la memoria. (IDE) pega los ladrillos y te avisa cuando acabó para que revises cómo quedó la pared.
