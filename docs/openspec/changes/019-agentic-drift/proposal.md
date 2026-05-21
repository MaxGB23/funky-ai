# Proposal: CLI Stateful Wizard (Agentic Drift Prevention)

## 1. Contexto
Para evitar que el Orquestador salte fases (Batching) y sobrescriba templates de andamiaje (Overwrite Trap), se convierte `funky feature` en un **Stateful Wizard**. El proceso retiene en memoria qué fase SDD está activa y bloquea físicamente la existencia de los archivos siguientes hasta que el humano apruebe y avance. Ref: RFC `02-agentic-drift-overwrite-trap.md`.

## 2. Decisiones de Diseño Cerradas

| # | Decisión | Resultado |
|---|----------|-----------|
| 1 | Recuperación de sesión ante cierre de terminal | `funky feature --resume <name>`. Sin auto-detección de estado. |
| 2 | Guardrail de Overwrite para el agente activo (efímero) | Solo bloqueo físico (archivo no existe). Sin reglas de agente efímeras. |
| 3 | Diferenciación T2 vs T3 | Template Composition con **marcadores de inyección** en los templates base. Sin directorios separados. |
| 4 | Comportamiento con T1 | Crea carpeta con `tasks.md` simplificado + `worker-handoff.md` + `report.md`. Sin explore/proposal/spec. |
| 5 | Comportamiento con T4 | Redirige a `funky gentle`. El Wizard no maneja rediseños titánicos. |
| 6 | Phase Workflows especializados (`/funky-spec`, etc.) | **Fuera de scope.** Feature 020, capa transversal a todos los tiers. |

## 3. Archivos Inyectados por Tier

| Archivo | T1 Flash | T2 Standard | T3 Deep |
|---------|:--------:|:-----------:|:-------:|
| `explore.md` | ❌ | ✅ | ✅ + marcadores NFR/Devil's Advocate |
| `proposal.md` | ❌ | ✅ | ✅ |
| `spec.md` | ❌ | ✅ | ✅ |
| `tasks.md` | ✅ simplificado | ✅ completo | ✅ completo |
| `worker-handoff.md` | ✅ | ✅ | ✅ |
| `report.md` | ✅ | ✅ | ✅ |

> **Fundamento T1:** El Orquestador delega a Workers el 95% de las veces incluso en fixes triviales. El overhead de `explore/proposal/spec` no aplica, pero el `handoff` y el `report` son esenciales para el flujo de delegación.

## 4. Arquitectura: Template Composition con Marcadores

Un único template base por archivo. El CLI resuelve los marcadores en memoria según el Tier antes de escribir al disco. **No hay templates duplicados.**

### Marcadores en `explore.md` (T2/T3)
```md
<!-- T3:NFR_SECTION -->   ← reemplazado por nfr-analysis.md en T3, eliminado en T2
<!-- T3:DEVIL_ADVOCATE --> ← reemplazado por devil-advocate.md en T3, eliminado en T2
```

### Marcadores en `tasks.md` (T1 vs T2/T3)
```md
<!-- T1:REMOVE -->
[bloque: prerequisito spec.md, estructura multi-fase con placeholders]
<!-- /T1:REMOVE -->
```
- **T1:** el CLI elimina los bloques marcados. Conserva Fase 0 (Branch Setup), Fase 1 (fix simple), `MANDATORY_RELEASE_PROTOCOL` y Return Envelope.
- **T2/T3:** los marcadores se eliminan limpiamente y el template queda completo.

### Función de composición
```js
function injectTemplate(src, dest, tier, protocolsDir) {
  let content = fs.readFileSync(src, 'utf-8');

  if (tier === 'T1') {
    content = content.replace(/<!-- T1:REMOVE -->[\s\S]*?<!-- \/T1:REMOVE -->/g, '');
  }
  if (tier === 'T3') {
    const nfr = fs.readFileSync(path.join(protocolsDir, 'nfr-analysis.md'), 'utf-8');
    const devil = fs.readFileSync(path.join(protocolsDir, 'devil-advocate.md'), 'utf-8');
    content = content.replace('<!-- T3:NFR_SECTION -->', nfr);
    content = content.replace('<!-- T3:DEVIL_ADVOCATE -->', devil);
  }
  // Limpiar marcadores residuales en cualquier tier
  content = content.replace(/<!-- T3:[A-Z_]+ -->/g, '');

  fs.writeFileSync(dest, content.trim(), 'utf-8');
}
```

## 5. Arquitectura: Stateful Wizard

```
funky feature <name>
  └─ Inquirer: ¿Qué Tier? (T1 / T2 / T3 / T4)
       ├─ T1 → inyecta tasks.md (simplificado) + worker-handoff.md + report.md → done
       ├─ T2/T3 → inyecta explore.md → proceso en espera
       │     [user: next] → inyecta proposal.md → espera
       │     [user: next] → inyecta spec.md → espera
       │     [user: next] → inyecta tasks.md + worker-handoff.md + report.md → done
       └─ T4 → "Esto es un rediseño mayor. Corré: funky gentle <name>" → exit
```

Comandos internos: `next`, `status`, `exit`, `help`.
Recuperación: `funky feature --resume <feature-name>` (lee `.funky-session.json` en la carpeta de la feature).

## 6. Proposed Changes

### Componente: CLI Core

#### [MODIFY] `funky-cli/src/commands/feature.js`
- Agregar prompt interactivo de selección de Tier con `@inquirer/prompts`.
- Refactorizar de inyección masiva (`copyFileSync` directo) a máquina de estados secuencial.
- Implementar REPL interno con comandos `next` / `status` / `exit` / `help`.
- Implementar `--resume <name>`: lee `.funky-session.json` y retoma desde la última fase completada.
- T4: mensaje de redirección a `funky gentle` y salida limpia.
- Implementar `injectTemplate(src, dest, tier, protocolsDir)` con resolución de marcadores.

### Componente: Templates SDD

#### [MODIFY] `funky-cli/src/templates/sdd/explore.md`
- Agregar marcadores `<!-- T3:NFR_SECTION -->` y `<!-- T3:DEVIL_ADVOCATE -->` en posiciones correctas.

#### [MODIFY] `funky-cli/src/templates/sdd/tasks.md`
- Agregar bloques `<!-- T1:REMOVE --> ... <!-- /T1:REMOVE -->` alrededor del prerequisito de spec.md y la estructura de fases placeholder.

#### [MODIFY] `.agents/templates/sdd/explore.md` (Golden Template)
- Misma actualización de marcadores que el template de CLI.

#### [MODIFY] `.agents/templates/sdd/tasks.md` (Golden Template)
- Misma actualización de marcadores que el template de CLI.

### Componente: Templates Protocols

#### [NEW] `funky-cli/src/templates/protocols/nfr-analysis.md`
- Bloque de análisis de NFRs (performance, seguridad, escalabilidad) para inyección T3.

#### [NEW] `funky-cli/src/templates/protocols/risk-matrix.md`
- Bloque de matriz de riesgo estructurado para inyección T3.

### Componente: Auditoría y Actualización de Rules

#### [AUDIT] `.agents/rules/sdd-orchestrator.md`
> [!WARNING]
> Antes de implementar, corroborar que las reglas del Orquestador no contradigan la nueva metodología. Puntos críticos a revisar:
> - La regla actual de `/sdd-explore` asume que todos los archivos ya existen al momento de editar. Con el Wizard, solo existe el archivo de la fase actual.
> - El Planning Checklist (ítem 0) pide verificar que existe `explore.md`. En T1 ese archivo no existirá nunca — la regla necesita ser consciente del Tier.
> - El Return Statement (G3) referencia `sdd-tasks.md`. Verificar que el path sea correcto para todos los tiers.

#### [MODIFY] `.agents/rules/sdd-orchestrator.md` — Regla Permanente Anti-Overwrite
Agregar como regla dura y permanente. Ref: RFC `02-agentic-drift-overwrite-trap.md`:

```md
## 🔴 Regla de Escritura — PROHIBICIÓN DE OVERWRITE (MANDATORY)
NUNCA usar `write_to_file` con `Overwrite: true` sobre archivos dentro de
`docs/openspec/changes/`. Toda edición sobre archivos ya inyectados por
`funky feature` DEBE hacerse exclusivamente con `replace_file_content`.
Violar esta regla destruye el andamiaje arquitectónico de la feature.
```

> **Nota:** Esta regla es complementaria al bloqueo físico del Wizard.
> El Wizard previene el **Batching** (archivos que aún no existen).
> Esta regla previene el **Overwrite Trap** (archivos ya inyectados en disco).
> Son capas de defensa ortogonales — ambas son necesarias.

## 7. Verification Plan

### Automated Tests
- Unit tests para la máquina de estados: transiciones válidas e inválidas.
- Test de `injectTemplate`: T1 (bloques eliminados), T2 (marcadores limpios), T3 (marcadores reemplazados por contenido de protocolos).
- Test de `--resume`: simular `SIGINT`, verificar que `.funky-session.json` persiste y retoma desde fase correcta.

### Manual Verification
1. `funky feature test-t2` → T2 → verificar que **solo** aparece `explore.md`.
2. Intentar que una IA edite `proposal.md` → debe fallar (archivo inexistente).
3. Escribir `next` → verificar aparición de `proposal.md`.
4. `funky feature test-t3` → T3 → verificar que `explore.md` contiene NFR y Devil's Advocate en posición correcta.
5. `funky feature test-t1` → T1 → verificar que aparecen solo `tasks.md` + `worker-handoff.md` + `report.md`, y que `tasks.md` NO tiene el bloque prerequisito de spec.
6. `Ctrl+C` durante T2 → `funky feature --resume test-t2` → verificar retoma desde fase correcta.
7. T4 → verificar mensaje de redirección y salida sin crear archivos.
