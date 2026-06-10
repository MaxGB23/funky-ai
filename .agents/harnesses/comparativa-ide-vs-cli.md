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

## 6. Recomendación de Uso Híbrido

```
Orquestador (CLI) ──────► diseño, exploración, planificación SDD
                                        │
                                        ▼
                          Workers (IDE) ──► ejecución táctica
                                             + review visual de diffs
                                             + Accept/Reject changes
```

**Regla de oro:**
- **CLI como cerebro**: Fases de `/funky-explore`, `/funky-design`, `/funky-propose`, `/funky-spec`, `/funky-tasks`
- **IDE como manos**: Fases de `/funky-apply` y `/funky-worker` donde la UI de diffs agrega valor real
- **La REGLA ABSOLUTA en `user_rules`** es el seguro que mantiene al IDE en su carril

> **TL;DR:** El CLI es libre y caro en tokens útiles. El IDE es barato en tokens pero caro en fricción arquitectónica. Úsalos según su naturaleza, no sus limitaciones.
