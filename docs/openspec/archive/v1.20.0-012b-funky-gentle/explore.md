# Explore: 012-b — Comando `funky gentle` (Tier 4 Deep SDD)

## 1. Mapa de Impacto Técnico

### Archivos a crear
| Archivo | Rol |
|---|---|
| `funky-cli/src/commands/gentle.js` | Lógica pura del comando + `Command` de Commander |
| `funky-cli/src/templates/gentle/01-explore.md` | Template fallback — rol Explorer |
| `funky-cli/src/templates/gentle/02-proposal.md` | Template fallback — rol Proposer |
| `funky-cli/src/templates/gentle/03-spec.md` | Template fallback — rol Spec Writer |
| `funky-cli/src/templates/gentle/04-design.md` | Template fallback — rol Designer |
| `funky-cli/src/templates/gentle/05-tasks.md` | Template fallback — rol Task Planner |
| `funky-cli/src/templates/gentle/06-implement.md` | Template fallback — rol Implementer |
| `funky-cli/src/templates/gentle/07-verify.md` | Template fallback — rol Verifier |
| `.agents/templates/gentle/` (× 7) | Golden templates del workspace (mismos 7, curados) |
| `funky-cli/tests/gentle.test.js` | Tests unitarios del comando |

### Archivos a modificar
| Archivo | Cambio |
|---|---|
| `funky-cli/bin/funky.js` | Registrar `gentleCommand` (1 import + 1 `addCommand`) |
| `funky-cli/README.md` | Agregar `funky gentle` a la tabla de comandos |
| `docs/funky-ai/guias/funky-ai.md` | Agregar el Tier 4 a la tabla de Tiers (si existe sección de Tiers) |
| `docs/funky-ai/operaciones/guia-flujo-completo.md` | Mencionar `funky gentle` como entrypoint del Tier 4 |

### Archivos que NO se tocan
- `funky-cli/src/commands/feature.js` — el nuevo comando es independiente (SRP)
- `funky-cli/src/commands/phase.js` — no relacionado
- Todo el sistema de `init`, `assess`, `estimate`, `release`

---

## 2. Análisis del Blueprint Existente (`feature.js`)

El comando `gentle.js` es un clon estructural de `feature.js` con **3 diferencias**:

| Aspecto | `funky feature` | `funky gentle` |
|---|---|---|
| Golden templates | `.agents/templates/sdd/` | `.agents/templates/gentle/` |
| Fallback templates | `src/templates/sdd/` | `src/templates/gentle/` |
| Destino | `docs/openspec/changes/<name>/` | `docs/openspec/gentle/<name>/` |
| Archivos copiados | 5 (`explore`, `proposal`, `spec`, `tasks`, `worker-handoff`) | 7 (`01-explore` … `07-verify`) |

La función pura `runGentle({ featureName, cliTemplatesDir, cwd })` sigue exactamente el mismo contrato de retorno: `{ success: boolean, error?: string, path?: string }`.

---

## 3. Impacto en Tests

El patrón de `feature.test.js` es el blueprint exacto para `gentle.test.js`. Los 4 casos de test se replican:
1. Crea directorio y copia los 7 archivos desde golden templates
2. Usa fallback si golden no existe
3. Sanitiza el nombre correctamente
4. Falla si el directorio ya existe

**Gotcha detectado (engram `[test-mock-drift]`):** El mock de `fs.existsSync` debe cubrir los 7 archivos del gentle, no solo 5. Si se agrega un template y no se actualiza el mock, el test pasa en verde con `copyFileSync` llamado menos veces de las esperadas.

**Gotcha detectado (engram `[cli-template-sync-drift]`):** El script de pretest que sincroniza templates debe ampliarse para cubrir la carpeta `gentle/` además de `sdd/`.

---

## 4. Diseño de Templates Gentle

Cada template necesita un `<system_prompt>` XML que **bloquee** al LLM de salirse de su rol. La restricción es la característica central del Tier 4.

| Template | Rol | Restricción clave |
|---|---|---|
| `01-explore.md` | Explorer | PROHIBIDO proponer soluciones. Solo mapear impacto. |
| `02-proposal.md` | Proposer | PROHIBIDO diseñar técnicamente. Solo "qué/por qué" (negocio) |
| `03-spec.md` | Spec Writer | PROHIBIDO tomar decisiones de librería o patrón |
| `04-design.md` | Designer | PROHIBIDO escribir código real |
| `05-tasks.md` | Task Planner | PROHIBIDO implementar. Solo atomic commits |
| `06-implement.md` | Implementer | PROHIBIDO tomar decisiones de arquitectura |
| `07-verify.md` | Verifier | PROHIBIDO agregar funcionalidades. Solo validar contra spec y design |

---

## 5. Riesgos

| Riesgo | Mitigación |
|---|---|
| Drift entre golden (`.agents/`) y fallback (`src/templates/gentle/`) | Ampliar script de sync del `pretest` para incluir `gentle/` |
| `templates.test.js` no cubre `gentle/` | Agregar aserciones para los 7 templates en el mismo archivo |

> **[SISTEMA - PARA EL ORQUESTADOR]** Con este mapa de impacto, procedé a sobrescribir `proposal.md`.
