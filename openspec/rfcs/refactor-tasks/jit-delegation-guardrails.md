# JIT Delegation Guardrails

> **Trigger:** Se activa justo antes de invocar el primer subagente de la sesión.
> **Relación:** Referenciado desde `spec-orchestrator-rules.md` §2 y §5.

---

## Guardrail 1: No Edición Inline de Templates

**[Trigger: Antes de redactar proposal/spec/tasks]**

Como Orquestador, **TIENES ESTRICTAMENTE PROHIBIDO** editar, llenar o sobreescribir los templates de planeación (`proposal.md`, `spec.md`, `tasks.md`) de forma directa o inline.

**Mecanismo obligatorio:** Delegar siempre la redacción a subagentes (SDD ligeros / Chalán Crikoso). Cada subagente modifica un solo artefacto a la vez respetando su estructura y frontmatter.

### Excepción: `docs.md` y `release.md`

El Orquestador ejecuta `docs.md` y `release.md` de forma **INLINE**. No se delega a subagente porque el Orquestador es el único con contexto fresco de toda la sesión SDD.

- **Soporte de `/funky-tasks`:** Este workflow digiere las tareas de cierre. El Orquestador ejecuta directamente las tareas digeridas, apoyándose de `grep` y manteniendo su ventana de memoria limpia.

---

## Guardrail 2: Checklist Pre-Delegación

**[Trigger: Justo antes de invocar cualquier subagente]**

Antes de delegar a cualquier subagente, verificar:

1. **¿El CLI ya inyectó scaffolding?** (`funky feature <name>` ejecutado por el humano)
   - Si NO → **FRENA**. Pídele al humano que lo corra. **NUNCA** generes scaffolding manualmente.
   - `funky feature` es intervención humana explícita. El humano confirma nombre, Tier e Inquirers — es el "go" formal del SDD. El orquestador solo recomienda, nunca ejecuta.

2. **¿Ya ejecuté Memory Polling?**
   - Si NO → Ejecutar ahora antes de delegar (§4 del spec principal).

---

## Arquitectura de Rules

```
[Rule: sdd-orchestrator.md]       → Reglas generales siempre activas (§1, §3, §4, §6, §7, §8)
[Rule: jit-delegation-guardrails] → Se activa justo antes de delegar (este archivo)
```

Las rules JIT se cargan bajo demanda, no saturan el contexto del orquestador en sesiones que no necesitan delegación.
