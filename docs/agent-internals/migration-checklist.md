# Migration Checklist — AGY CLI hacia Orquestación Completa

> Tracker de los puntos que AGY CLI necesita resolver para poder reemplazar completamente a OpenCode como orquestador. Se actualiza conforme el tooling madure.

---

## Estado actual

```
Orquestador → Antigravity CLI  ✅ (funciona, con limitaciones documentadas)
Workers     → Antigravity IDE  ✅ (funciona bien, accept/reject diffs)
Handoff     → Manual (usuario)  ✅ (deliberado — human-in-the-loop)
```

---

## Bloqueantes críticos

### ❌ 1. Modelo por sub-agente

**Qué falta:** El parámetro `model` en `define_subagent`.

**Impacto:** Sin esto, no podés asignar modelos distintos por fase SDD. Todos los sub-agentes heredan el modelo de la sesión. No hay optimización de costo por rol.

**Workaround actual:** Cambiar manualmente el modelo de sesión antes de delegar, o usar la tabla de reasoning-depth guide del orquestador.

**Señal de resolución:** `define_subagent({ ..., model: "anthropic/claude-haiku-3" })` existe en el schema de tools.

---

### ❌ 2. Truncamiento silencioso de user_rules

**Qué falta:** El runtime truncó 5,291 bytes de reglas sin avisar. El agente no sabe qué perdió.

**Impacto:** El orquestador puede estar operando con instrucciones incompletas. Reglas de seguridad, protocolo de sesión, o delegación pueden estar cortadas.

**Workaround actual:** Medir manualmente el tamaño del `sdd-orchestrator.md` + todas las reglas inyectadas. Recortar para que entren completas. No hay herramienta de diagnóstico.

**Señal de resolución:** El runtime avisa cuando trunca (warning en UI o log), o aumenta el límite de inyección de `<user_rules>`.

---

### ⚠️ 3. Delegación síncrona

**Qué falta:** Una primitiva equivalente a `task()` de OpenCode que bloquee hasta que el sub-agente termine.

**Impacto:** AGY CLI solo tiene `invoke_subagent` (async). Para workflows secuenciales (A termina → B empieza), el orquestador tiene que manejar la espera vía `send_message` y lógica de polling, lo cual es frágil.

**Workaround actual:** El usuario como intermediario de handoff es síncono por naturaleza — el humano no pasa la siguiente tarea hasta ver que el worker terminó.

**Señal de resolución:** `invoke_subagent` tiene modo `blocking: true` o existe una tool `await_subagent`.

---

### ⚠️ 4. Envelope estructurado de respuesta

**Qué falta:** Un contrato de respuesta forzado por el runtime, no solo instruido.

**Impacto:** Los sub-agentes responden con texto libre. Si no siguen el contrato SDD, el orquestador no puede detectarlo a nivel de runtime — solo parseando texto.

**Workaround actual:** El prompt de cada sub-agente incluye el contrato SDD explícitamente. Funciona mientras el LLM lo respeta.

**Señal de resolución:** `invoke_subagent` tiene un campo `response_schema` que valida la respuesta.

---

### ⚠️ 5. Engram MCP Roto

**Qué falta:** El servidor MCP de Engram oficial no funciona en AGY CLI.

**Impacto:** El agente no tiene tools nativas de memoria (`mem_save`, `mem_search`) con búsqueda semántica. Depende de un "Falso Engram" gestionado manualmente mediante archivos `.md` y búsqueda de texto plano, lo que ensucia el contexto y gasta más tokens.

**Workaround actual:** Almacenamiento en archivos Markdown (`/docs/engram/` o `.atl/`).

**Señal de resolución:** Las tools `mem_*` aparecen disponibles y operativas en el toolset del CLI.

---

## Ventajas que ya tiene AGY CLI (no regresar a OpenCode por estas)

| Ventaja | Detalle |
|---|---|
| ✅ Workspace isolation | `branch` / `share` / `inherit` — OpenCode no tiene equivalente |
| ✅ Sub-agentes dinámicos | `define_subagent` en runtime es más flexible que 9 fijos |
| ✅ Seguridad por defecto | Ningún comando sin aprobación explícita |
| ✅ Sin `planning_mode` | No hay harness bloqueante en CLI |
| ✅ Estado persistente | `ORCHESTRATOR-STATE.md` + Falso Engram (MD files) |

---

## Criterio de migración completa

AGY CLI está listo para orquestación completa (reemplazar al humano como intermediario y a OpenCode) cuando:

- [ ] `define_subagent` soporta parámetro `model`
- [ ] El runtime no trunca `<user_rules>` silenciosamente (o avisa y el agente detecta)
- [ ] Existe delegación síncrona o mecanismo equivalente de await

Los bloqueantes ⚠️ (3 y 4) son mejoras de DX, no bloqueantes de producción — el workaround manual es viable.

---

## Historial de versiones de este doc

| Fecha | Cambio |
|---|---|
| 2026-06-09 | Creación inicial. Consolidado de `opencodepov-vs-agy.md` y `funcionamiento-agy-cli.md`. |
