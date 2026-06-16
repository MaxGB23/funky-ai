# Handoff: Debate RFC Draft-Tasks

> **Para:** Siguiente instancia del Orquestador  
> **Contexto:** Sesión de diseño arquitectónico sobre desacoplamiento de templates SDD e inyección dinámica de artefactos. El documento principal es `docs/openspec/rfcs/draft-tasks.md`.

---

## ¿Qué estamos construyendo?

Estamos rediseñando el sistema de templates del SDD de Funky AI. El monolítico `tasks.md` se divide en 3 templates especializados (`tasks`, `docs`, `release`), y toda la lógica de cuándo inyectar cada uno se coordina con los Tiers de Orquestación. El documento `draft-tasks.md` es el RFC borrador con las decisiones ya tomadas y las ideas pendientes de aprobar.

---

## Decisiones ya tomadas y aprobadas (Secciones 1–6 del draft)

- **Sección 1:** División del monolito en `tasks.md`, `docs.md` (condicional) y `release.md` (condicional).
- **Sección 2:** Reglas SemVer cruzadas con Tiers (None/Patch/Minor/Major).
- **Sección 3:** Flujo de inyección del CLI con 3 Inquirers (Tier, Docs Core, Tipo de Release).
- **Sección 4:** El Orquestador recomienda Inquirer 2 y 3, el humano decide en el CLI.
- **Sección 5:** Custom Workflows solo se preguntan en T3/T4. En T1/T2 el proceso SDD estándar es obligatorio.
- **Sección 6:** Escalera de Tiers definitiva:
  - **T1:** Fast Track directo. El Orquestador puede hacer tasks inline o delegar al workflow.
  - **T2 (Sandwich):** Orquestador hace `proposal` y `spec` inline. Delega `explore` y `tasks` a workflows para proteger su contexto. Workers ejecutan las tareas.
  - **T3:** Cada fase SDD en un chat aislado con custom workflows. NFRs bajan en cascada de ser requeridos unicamente. El workflow funky-apply reemplaza al worker.
  - **T4:** 8 roles, 100% workflows aislados, rediseño masivo.
---

## Ideas en la Sección 7 (Pendientes de aprobación formal)

| # | Idea | Estado del debate |
|---|------|-------------------|
| 7.1 | Ciclo de vida de NFRs: Discovery en explore → Formalización en proposal → Umbrales en spec → Cascada downstream | ✅ Acordada en debate. Pendiente aprobación formal |
| 7.2 | Modos CLI: Interactivo (default) vs Automático (aplica en T2 features predecibles) | ✅ Acordada en debate. Pendiente aprobación formal |
| 7.3 | Material bruto del Orquestador actual con inconsistencias — ver puntos 7.3.1/2/3 sin redactar aún | ⏳ Pendiente debatir (el humano tiene sorpresas) |
| 7.4 | Explore Ligero: subagente `research` desechable. v1 con aprobación (canary test), v2 autónomo | ✅ Acordada. Ver `blueprint-migracion-delegacion.md` |
| 7.5 | `/funky-tasks` agnóstico al Tier. Deprecar Microplanning y G2. Detección de riesgo en Return Envelope | ✅ Acordada en debate. Pendiente aprobación formal |

---

## Puntos pendientes de debatir (el humano tiene más)

El humano mencionó que tiene puntos adicionales no redactados aún en el draft. Los que ya están abiertos son:

### Punto 2 — Rules del Orquestador (Parcialmente discutido)
Las rules actuales en `sdd-orchestrator.md` están desactualizadas. Se identificaron estas inconsistencias en el draft (L111-154):
- La **Escalation Matrix** (T1–T4) ya no corresponde con la nueva Sección 6.
- Los comandos `/sdd-explore` (deprecated), `/sdd-propose` y `/sdd-ff` necesitan revisión.
- El **G2 (RIESGO ALTO)** fue deprecado en 7.5.
- La **Orchestration Checklist** (PRE-0, ítem 1 y 2) sigue siendo válida pero necesita actualizar el lenguaje.
- El **Pipeline de Artefactos** ahora lo ejecuta el workflow de tasks, no el Orquestador.
- **Pendiente decidir:** ¿Cómo queda redactada la nueva tabla de Tiers concisa para el Orquestador?

### Punto 3 — Cruce de la nueva lógica con SemVer (No debatido)
Cómo la nueva Sección 6 (separación de Tiers) se coordina con las Reglas de Release de la Sección 2. Pendiente de debatir.

### Sorpresas del humano (No reveladas)
El humano tiene más puntos arquitectónicos que no ha redactado aún para no saturar el contexto. Comenzar la siguiente sesión preguntándole cuáles son.

---

## Archivos clave a leer antes de continuar

1. `docs/openspec/rfcs/refactor-tasks/draft-tasks.md` — El RFC principal con todo lo debatido.