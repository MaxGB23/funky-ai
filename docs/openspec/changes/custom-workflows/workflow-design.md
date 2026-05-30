# Feature 020 — Phase Workflows: Decisiones Arquitectónicas

> Documento de referencia. Captura los debates y decisiones tomadas antes de continuar la generación de los 8 workflows.
>
> **Leyenda de estado:** ✅ Decidido | ⚠️ En debate | 🔲 Pendiente de decisión

---

## Decisiones Tomadas

### ✅ D1 — Modelo Mental: Workers en chats dedicados

Cada fase SDD (`explore`, `propose`, `spec`, `design`, `tasks`, `apply`, `verify`, `archive`) tiene su propio workflow que ejecuta un **worker en un chat dedicado**, NO el Orquestador inline.

```
FLUJO APROBADO:

  Orquestador (chat principal)
       │
       ├── Genera worker-handoff.md MÍNIMO
       │     └── solo: feature name, tier, fase a ejecutar
       │
       └── Le dice al humano: "Abrí chat nuevo con /funky-explore @worker-handoff.md"

  Worker (chat nuevo, limpio)
       │
       ├── Carga el workflow /funky-{fase}  ← instrucciones completas de la fase
       ├── Lee contexto desde disco         ← el filesystem ES la memoria
       ├── Ejecuta su misión
       └── Escribe artefacto + Return Envelope de cierre
```

**Por qué NO inline en el Orquestador:** Context Dilution a partir de la fase 3-4. Es exactamente el problema que resolvió v2.0. Los phase workflows son la extensión natural de esa decisión.

---

### ✅ D2 — Return Envelope: reporte de cierre, no transición

El Return Envelope es un **reporte de cierre**, NO una pregunta de "¿seguimos?".

❌ Mal: `¿Listo para proposal?: Sí / No`
✅ Correcto: `Cerrá este chat. Llevá este report al Orquestador.`

El agente de una fase no sabe ni le importa qué sigue. Eso lo decide el Orquestador + el humano.

---

### ✅ D3 — Contexto entre fases: el filesystem es la memoria

No hay problema de contexto porque cada artefacto vive en disco entre sesiones.

| Fase | Lee del disco | Escribe al disco |
|------|--------------|-----------------|
| explore | `ORCHESTRATOR-STATE.md`, `engram/index.md` | `explore.md` |
| propose | `ORCHESTRATOR-STATE.md`, `explore.md` | `proposal.md` |
| spec | `proposal.md` | `spec.md` |
| design | `proposal.md`, `spec.md` | `design.md` |
| tasks | `proposal.md`, `spec.md`, `design.md` | `tasks.md` |
| apply | `tasks.md`, `spec.md`, `design.md` | `tasks.md` (marks ✅) + `sdd-report.md` |
| verify | todos los anteriores | `verify-report.md` |
| archive | todos los anteriores | mueve a `archive/` |

Cada agente arranca fresco y lee lo que el anterior dejó escrito. Cero dependencia de memoria de sesión.

---

### ✅ D4 — Diferencia con el flujo actual

| Aspecto | Hoy | Con Feature 020 |
|---------|-----|--------------------|
| Instrucciones de fase | Escritas a mano en `worker-handoff.md` | Viven en el workflow `/funky-{fase}` |
| `worker-handoff.md` | Grande, con instrucciones completas | Mínimo: feature name + tier + apuntador |
| Slash command de ejecución | Solo `/funky-worker` para todo | `/funky-explore`, `/funky-apply`, etc. |
| Rol del Orquestador | Redacta instrucciones de cada fase | Solo coordina y genera handoffs delgados |

### ✅ D1 — Autosuficiencia de Fases (Adiós redundancia en handoffs)

Los 8 workflows SDD (`/funky-explore`, etc.) son slash commands propios, que contienen internamente TODA la lógica de bootstrap (leer engram, tasks) y cómo entregar el Return Envelope. El `worker-handoff.md` no se elimina, pero se mantiene intacto solo para ser usado por el `funky-worker` genérico en T1 y T2.

---

### ✅ D4 — Diferencia con el flujo actual

| Aspecto | Hoy | Con Feature 020 |
|---------|-----|--------------------|
| Instrucciones de fase | Escritas a mano en `worker-handoff.md` | Viven en el workflow `/funky-{fase}` |
| `worker-handoff.md` | Grande, con instrucciones completas | Mínimo: feature name + tier + apuntador |
| Slash command de ejecución | Solo `/funky-worker` para todo | `/funky-explore`, `/funky-apply`, etc. |
| Rol del Orquestador | Redacta instrucciones de cada fase | Solo coordina y genera handoffs delgados |

---

### ✅ D6 — Tiers Aplicables y Overhead de Chats

1. **Tier 1 y Tier 2:** Operación 100% **inline** por el Orquestador. Delega a `funky-worker` estándar usando el `worker-handoff.md` de siempre.
2. **Tier 3:** Operación **inline híbrida (Micro-planning)**. Mantiene la velocidad de T1/T2, usa templates avanzados (NFRs, Devil's Advocate) y omite lo que no sirve. Puede abortar y pedir workflows aislados si siente *Context Dilution*.
3. **Tier 4:** Operación **100% Workflows (Feature 020)**. El Orquestador NO genera handoff, manda al humano a abrir chats aislados para las 8 fases SDD. (Supremacía arquitectónica por Context Window limpio y máximo límite de tokens). Se planea deprecar `/funky gentle`.

PENDIENTE PREGUNTAR CÓMO EL HUMANO INICIA EL CHAT DEL SUBAGENTE, YA QUE DESPUES DE TIPEAR /funky-<fase> debe pasarle unos minimos datos de contexto como name de la feature, etc.
---

### ✅ D7 — Deprecación de Tiers en Workers

Los Tiers son exclusivos de Orquestación. Un Worker de ejecución es agnóstico al Tier, solo sigue el `tasks.md` como máquina láser. Se eliminó la obligación de llenar el campo Tier en los handoffs.

---

## Estructura Base de Cada Workflow (✅ Aprobada)

Todos los 8 workflows siguen esta plantilla:

```markdown
---
trigger: /funky-{fase}
description: SDD {Fase} Phase — {descripción una línea}
---

# {Emoji} Funky AI — Fase: {Nombre}

## Identidad
{Rol del agente. Qué hace y qué NO hace. 3-4 líneas.}

## Prerequisitos (Bootstrap)
1. view_file ORCHESTRATOR-STATE.md
2. grep_search docs/engram/index.md  (Stage 1 — siempre)
3. view_file artefactos previos relevantes de la fase

## Lo que recibís
{Feature name + Tier (vienen del handoff o del humano al invocar).}

## Qué hacer
### Paso 1 → N: {instrucciones de la fase}
### Paso Final: Escribir artefacto
{Estructura exacta del artefacto a producir en disco.}

## Reglas Estrictas
| 🔴/🟡/🟢 | Regla | Descripción |
{Budget de palabras. Restricciones de scope. Qué está prohibido.}

## Return Envelope (Al terminar)
status: success | partial | blocked
resumen: {1-3 oraciones}
artefacto: {ruta exacta del archivo escrito}
siguiente fase sugerida: /funky-{siguiente}
riesgos: {o "Ninguno"}

> Cerrá este chat. Llevá este report al Orquestador.
```

---

## Fix Pendiente: `funky-explore.md` (v1 → v2)

El archivo ya existe pero tiene dos errores:

1. **Return Envelope** pregunta "¿Listo para proposal?" → eliminar, reemplazar con cierre
2. **Prerequisitos** usan `view_file` para engram en lugar de `grep_search docs/engram/index.md`

---

## Estado de los 8 Workflows

| # | Fase | Workflow | Estado |
|---|------|----------|--------|
| 1 | Explore | `/funky-explore` | ⚠️ Creado — pendiente fix (D2 + bootstrap) |
| 2 | Propose | `/funky-propose` | 🔲 Pendiente |
| 3 | Spec | `/funky-spec` | 🔲 Pendiente |
| 4 | Design | `/funky-design` | 🔲 Pendiente |
| 5 | Tasks | `/funky-tasks` | 🔲 Pendiente |
| 6 | Apply | `/funky-apply` | 🔲 Pendiente |
| 7 | Verify | `/funky-verify` | 🔲 Pendiente |
| 8 | Archive | `/funky-archive` | 🔲 Pendiente |
