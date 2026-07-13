# SDD Explore — Memory Polling v2

> **Feature:** `memory-polling-v2`
> **Fecha:** 2026-05-01
> **Orquestador:** Antigravity (Claude Sonnet 4.6 Thinking)

---

## 1. Problema

El protocolo actual de Memory Polling en Funky AI tiene **dos fallas sistémicas**:

### Falla 1 — Costo de Tokens No Controlado

El protocolo manda ejecutar `grep_search` sobre `docs/engram/discoveries.md` y `docs/engram/bugfixes.md` como primer paso en cada sesión.

**El problema:** `grep_search` devuelve TODAS las líneas que coincidan con el patrón. Si el término es amplio (ej. `"agent"`, `"template"`) o el archivo creció (discoveries.md ya tiene 129 líneas / 18KB), puede retornar cientos de tokens de golpe — en una operación que ocurre antes de cualquier tarea productiva.

A medida que el engram crece (y va a crecer), este costo se vuelve insostenible.

### Falla 2 — Compliance No Enforceado

El `sdd-orchestrator.md` dice "ejecutá Memory Polling antes de cambios estructurales". Pero dado el `[DISCOVERY][documentation-vs-enforcement]`, sabemos que **documentar no es enforcer**. No hay mecanismo que verifique si el agente lo ejecutó o simplemente lo saltó.

---

## 2. Contexto del Engram Relevante

| Tag | Impacto en este Feature |
|-----|------------------------|
| `[DISCOVERY][agent-cognitive-load]` | Token Diet — el contexto saturado produce omisiones |
| `[DISCOVERY][In-Template Rule Injection]` | Las reglas deben vivir cerca de la ejecución, no globalmente |
| `[DISCOVERY][documentation-vs-enforcement]` | Documentar ≠ enforcer. El fix correcto hace el error imposible estructuralmente |
| `[DISCOVERY][agent-dry-handoffs]` | No duplicar información. Usar punteros a SSOT |

---

## 3. Métricas del Estado Actual

| Archivo | Líneas | Tamaño | Entradas |
|---------|--------|--------|----------|
| `docs/engram/discoveries.md` | 129 | 18KB | 19 entries |
| `docs/engram/bugfixes.md` | 46 | 5KB | 6 entries |
| **Total** | **175** | **23KB** | **25 entries** |

**Proyección a 6 meses:** si se agrega ~1 discovery por versión y Funky AI lleva ~2 versiones/mes → ~37 versiones más → potencialmente 50+ entries → discoveries.md > 300 líneas.

---

## 4. Restricciones del Problema

- ❌ No hay SQLite ni vectores (a diferencia de Gentle AI)
- ❌ No hay capacidad de background indexing
- ✅ El agente puede leer archivos específicos con `view_file` (líneas exactas)
- ✅ El agente puede hacer `grep_search` con términos muy específicos (ej. el tag exacto)
- ✅ Se puede crear un archivo de índice liviano que el agente lea primero

---

## 5. Hipótesis de Solución

**Two-Stage Polling** + **Engram Index Layer**:

1. **Etapa 1 (barata):** Leer `docs/engram/index.md` — un archivo de ~25-30 líneas con una entrada por discovery/bugfix, en formato `[TAG] — resumen de una línea`.
2. **Etapa 2 (quirúrgica, condicional):** Si el índice revela un tag relevante para la tarea actual, ejecutar `grep_search "[TAG]"` para extraer solo esa entrada.

**Resultado:** el agente lee 25-30 líneas en vez de 175. Reducción de ~85% en costo de tokens del polling. Y el índice es lo suficientemente rico como para detectar si existe conocimiento previo relevante.

---

## 6. Scope del Cambio

**Archivos afectados:**
- `docs/engram/index.md` — CREAR (índice liviano)
- `.agents/rules/sdd-orchestrator.md` — MODIFICAR (protocolo de polling)
- `funky-cli/src/templates/sdd/worker-handoff.md` — MODIFICAR (§1.B Safe-Contexting)
- `docs/engram/discoveries.md` — MODIFICAR (agregar discovery de este patrón)
- `ORCHESTRATOR-STATE.md` — MODIFICAR (bump a v1.11.0)

**Fuera de scope:**
- Cambios en el CLI (funky-cli código JS)
- Tests automatizados (no aplica — cambios de protocolo)
- GitHub Actions

---

*Siguiente paso: `sdd-proposal.md`*
