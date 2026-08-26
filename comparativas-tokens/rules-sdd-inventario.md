# Inventario de Tokens — Rules SDD del Framework

> Fecha: 2026-08-26  
> Proyecto: funky-ai  
> Alcance: los 27 archivos de `.agents/rules/` (routers, preflight, protocolos y contratos de delegación)

## Hallazgo completo (mayor a menor consumo)

| Archivo | Bytes | ~Tokens |
|---|---:|---:|
| sdd-orchestrator.md | 6,101 | 1,525 |
| tier3-router.md | 5,099 | 1,275 |
| sdd-preflight.md | 4,788 | 1,197 |
| tier2-router.md | 3,699 | 925 |
| tier1-router.md | 3,544 | 886 |
| engram-protocol.md | 2,623 | 656 |
| sabueso-route-a.md | 2,466 | 617 |
| tier3-interactive/interactive-verify.md | 2,234 | 559 |
| tier3-interactive/risk-decision.md | 2,233 | 558 |
| tier3-interactive/interactive-tasks.md | 1,767 | 442 |
| tier2-delegation/t2-explore.md | 1,647 | 412 |
| tier2-delegation/t2-verify.md | 1,624 | 406 |
| tier2-delegation/t2-apply.md | 1,555 | 389 |
| tier2-delegation/t2-spec.md | 1,519 | 380 |
| tier3-interactive/interactive-apply.md | 1,481 | 370 |
| tier2-delegation/t2-propose.md | 1,348 | 337 |
| codegraph.md | 1,322 | 331 |
| sdd-escalation-matrix.md | 1,200 | 300 |
| metodologias.md | 1,174 | 294 |
| tier3-interactive/interactive-design.md | 1,094 | 274 |
| tier3-interactive/interactive-propose.md | 1,017 | 254 |
| tier3-interactive/interactive-explore.md | 980 | 245 |
| secops.md | 952 | 238 |
| tier2-delegation/t2-tasks.md | 904 | 226 |
| tier3-interactive/interactive-spec.md | 886 | 222 |
| tier2-delegation/t2-archive.md | 864 | 216 |
| tier3-interactive/interactive-archive.md | 546 | 137 |
| **TOTAL** | **46,064** | **11,516** |

## Lecturas rápidas

- El gordo es `sdd-orchestrator.md` con ~1,525 tokens — casi el doble que el siguiente en la lista.
- Los tres `tier*-router.md` juntos suman ~3,086 tokens — son reglas de enrutamiento que se cargan frecuentemente.
- El total de ~11.5k tokens es manejable, pero si se cargan todas las rules simultáneamente en un contexto, eso ya empieza a pesar (más AGENTS.md, skills activas, etc.).

## Fórmula

`tokens ≈ bytes / 4` (estándar para texto mixto inglés/español con markdown). Mismo criterio estimado que el resto del directorio; pendiente de validación con conteo exacto.
