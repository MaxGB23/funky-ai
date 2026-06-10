# Agent Internals — Índice

> Documentación técnica sobre el funcionamiento interno de Antigravity CLI y su comparativa con OpenCode.
> Fuentes originales: `opencodepov-vs-agy.md` y `funcionamiento-agy-cli.md` (raíz del repo).
>
> **Última actualización:** 2026-06-09

---

## Propósito

Centralizar el conocimiento arquitectónico sobre cómo funcionan ambos agentes por dentro: configuración, delegación, memoria, tokens. Sirve como referencia para decidir cuándo Antigravity CLI está maduro para asumir orquestación completa.

---

## Documentos

| Doc | Qué cubre | Veredicto rápido |
|---|---|---|
| [configuracion.md](./configuracion.md) | Cómo arrancan, qué archivos leen, cómo se inyecta el contexto | OpenCode gana (declarativo) |
| [subagentes.md](./subagentes.md) | Estáticos vs dinámicos, recursión, workspace isolation | Empate técnico, distinta filosofía |
| [delegacion.md](./delegacion.md) | Primitivas de delegación, envelope de respuesta, sync vs async | OpenCode gana (estructurado) |
| [modelo-contexto-tokens.md](./modelo-contexto-tokens.md) | Modelo por sub-agente, token consumption, truncation bug | OpenCode gana (modelo por agente) |
| [skills-y-memoria.md](./skills-y-memoria.md) | Sistema de skills, lazy loading, Engram MCP | Empate |
| [seguridad.md](./seguridad.md) | Permisos, aprobaciones, modelo de confianza | AGY CLI gana |
| [migration-checklist.md](./migration-checklist.md) | Qué debe resolver AGY CLI para orquestación completa | Tracker de madurez |
| [conclusion.md](./conclusion.md) | Gap analysis vs Gentle AI + OpenCode, cuándo migrar | **Lectura obligada** |

---

## Estado actual del setup

```
Orquestador → Antigravity CLI  (cerebro, estado, SDD)
Workers     → Antigravity IDE  (ejecución, accept/reject diffs, notificaciones)
Handoff     → Manual (usuario copia el prompt listo del Orquestador al Worker)
```

Ver [`../.agents/harnesses/comparativa-ide-vs-cli.md`](../.agents/harnesses/comparativa-ide-vs-cli.md) para el análisis de harnesses y tokens.

---

## Comparativa rápida (resumen ejecutivo)

| Área | OpenCode | AGY CLI | Ganador |
|---|---|---|---|
| Configuración | JSON declarativo, versionable | Inyectado en runtime, no inspeccionable | OpenCode |
| Sub-agentes | 9 fijos, restrictivos, hojas del árbol | 2 estáticos + dinámicos, pueden clonarse | Empate / filosofía distinta |
| Modelo por sub-agente | ✅ Por config | ❌ Hereda sesión | OpenCode |
| Delegación síncrona | ✅ `task()` | ❌ Solo async | OpenCode |
| Envelope estructurado | ✅ Semi-estructurado | ❌ Texto plano | OpenCode |
| Workspace isolation | ❌ No existe | ✅ `branch` / `share` / `inherit` | AGY CLI |
| Memoria persistente | ✅ Engram MCP | ✅ Engram MCP | Empate |
| Skills | ✅ Mismo sistema | ✅ Mismo sistema | Empate |
| Seguridad por defecto | Matriz configurable | ✅ Siempre pide aprobación | AGY CLI |
| Madurez general | Alta | Media | OpenCode |
