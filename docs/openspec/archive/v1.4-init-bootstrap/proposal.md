# Proposal: v1.4 — "funky init" Real Bootstrap

**Fecha:** Abril 2026
**Rama:** `feature/v1.4-init-bootstrap`
**Tipo:** Tier 1 — Refactor + Feature Adición (Worker único)

---

## 🎯 Problema a Resolver

El comando `funky init` actual es un cascarón: solo crea la carpeta `docs/engram/` vacía.
Cuando un usuario init-iza un proyecto nuevo, el LLM **improvisa** las reglas de memoria y protocolo basándose en su contexto global, lo que genera divergencias respecto a las versiones canónicas y auditadas del protocolo (v1.3).

**Consecuencia directa:** Imposible garantizar consistencia entre proyectos. El protocolo Funky AI es diferente en cada repo nuevo.

---

## ✅ Criterios de Aceptación

1. `funky init` debe crear, en el `cwd()` del usuario, la estructura de memoria completa con archivos canónicos copiados desde los templates del CLI, **no inventados por el LLM**.
2. Los archivos de bootstrap deben ser las versiones comprimidas y estables de la v1.3.
3. `funky phase <nombre>` debe soportar los 5 templates del ciclo SDD completo: `explore`, `proposal`, `tasks`, `worker-handoff`, `report`.
4. Los templates de `tasks.md` y `report.md` DEBEN incluir bloques ocultos (`> **[SISTEMA - PARA EL ORQUESTADOR]**`) con las reglas de "Worker Handoff" y "Squash & Trash" respectivamente (In-Template Rule Injection).
5. Si algún archivo ya existe, el CLI debe advertir y NO sobreescribir (idempotencia).
6. La operación debe loggear cada archivo creado con su ruta absoluta.

---

## 🏗️ Arquitectura de la Solución

### Estrategia de Desarrollo Local (v1.4a)
Para evitar el "infierno de versiones" en NPM, usaremos `pnpm link --global`. El CLI se desarrollará en su carpeta y se linkeará al sistema, permitiendo pruebas instantáneas en `m:\funky-ai--test`. No publicaremos en el registry hasta validar estabilidad total.

### Nueva estructura del CLI

```
funky-cli/
└── src/
    ├── commands/
    │   ├── init.js          ← REFACTORIZAR (actualmente solo mkdirSync)
    │   └── phase.js         ← Mantener, agregar templates faltantes
    └── templates/
        ├── sdd/             ← Templates de FASES (ya existen 2, agregar 2)
        │   ├── explore.md   ← ✅ Existe
        │   ├── design.md    ← ✅ Existe (renombrar a proposal.md)
        │   ├── tasks.md     ← ❌ CREAR (Inyectar regla de generar handoff)
        │   ├── worker-handoff.md ← ❌ CREAR (Nuevo template de delegación)
        │   └── report.md    ← ❌ CREAR (Inyectar regla de Squash & Trash)
        └── bootstrap/       ← ❌ CREAR TODA ESTA CARPETA
            ├── ORCHESTRATOR-STATE.md
            ├── agents-rules-engram-protocol.md
            ├── agents-rules-secops.md
            ├── engram-discoveries.md
            └── engram-bugfixes.md
```

### Lógica del nuevo `init.js`

```
funky init
  ├── Crear docs/engram/ (ya existe, mantener)
  ├── Copiar bootstrap/ORCHESTRATOR-STATE.md → ./ORCHESTRATOR-STATE.md
  ├── Copiar bootstrap/agents-rules-engram-protocol.md → .agents/rules/engram-protocol.md
  ├── Copiar bootstrap/agents-rules-secops.md → .agents/rules/secops.md
  ├── Copiar bootstrap/engram-discoveries.md → docs/engram/discoveries.md
  └── Copiar bootstrap/engram-bugfixes.md → docs/engram/bugfixes.md
```

---

## 📦 Fuente de los Templates de Bootstrap

Los archivos canónicos de v1.3 están en el repo de Funky AI:

| Template de Bootstrap | Fuente Canónica |
|---|---|
| `ORCHESTRATOR-STATE.md` | Crear template vacío con estructura mínima |
| `engram-protocol.md` | `.agents/rules/engram-protocol.md` del repo |
| `secops.md` | `.agents/rules/secops.md` del repo |
| `discoveries.md` | Crear template vacío con headers del schema |
| `bugfixes.md` | Crear template vacío con headers del schema |
| `sdd-orchestrator` | Extraer del GEMINI.md global (bloque SDD) |

---

## ⚠️ Riesgos

- El `sdd-orchestrator.md` vive en el `GEMINI.md` global del usuario, no en el repo. El Worker debe extraer ese bloque y materializarlo como template.
- El template de ORCHESTRATOR-STATE debe ser **genérico** (sin datos de Funky AI hardcodeados).

---

## 🚫 Fuera de Scope

- No publicar en NPM en esta iteración.
- No modificar `funky phase` más allá de agregar templates faltantes.
