## Lo que presenta el orquestador

```markdown
[✅/❌] Verify complete — "[feature-name]"

🧪 **Tests**: [n] passed / [n] failed / [n] skipped
📊 **Coverage**: [xx]% (threshold [xx]%) [✅/❌]
[✅/⚠️/❌] **Build**: [Passed/Failed]

🎯 **Verdict**: [PASS / PASS WITH WARNINGS / FAIL]

🔧 **Cosmetic**: [n] warnings — [Plan de acción, ej: los arreglo inline ahora]
```

```markdown
❌ Verify complete — "[feature-name]"

🧪 **Tests**: [n] passed / [n] failed
[✅/⚠️/❌] **Build**: [Passed/Failed]

🎯 **Verdict**: FAIL

🐛 **Functional warnings**:
- [ID-REQUERIMIENTO] no cubierto — [Razón de la falla]

→ [Acción recomendada, ej: Hay que re-aplicar para cubrir los escenarios faltantes].
```

## Acción del orquestador según veredicto
| Veredicto | Acción del orquestador |
|-----------|----------------------|
| **PASS** | Archive directo |
| **CRITICAL** | NO archivar. Delega /funky-apply con los issues como tareas → re-verify |
| **FUNCTIONAL WARNING** | Delega /funky-apply con los issues como tareas → re-verify |
| **COSMETIC WARNING** | Fix inline si <5 líneas / 1 archivo. Si no, /funky-apply |
| **SUGGESTION** | Anota en archive, no requiere acción |
| **FAIL** | No pregunta. Explica que hay que re-aplicar |

## Comportamiento por modo
| Modo | Comportamiento |
|------|---------------|
| **Interactivo** | Muestra resultado. Según veredicto: pasa a archive, pregunta "¿arreglo inline?", o explica que hay que re-aplicar |
| **Auto** | PASS → archive directo. CRITICAL/FUNC WARN → aplica la acción sin preguntar. COSMETIC → fix inline si aplica. FAIL → frena |
| **Handoff** | Prepara bloque copy-paste idéntico al prompt nativo |

## NFR Tracing
Si las tasks incluyeron tags NFR, el agente verify debe confirmar que los umbrales definidos en el `spec.md` se cumplieron. El agente tiene la instrucción estricta de validar **CUALQUIER tag que empiece con `nfr:*`**, no solo los de esta tabla.

| Ejemplo de Tag | Qué verifica (basado en el spec) |
|-----|-------------|
| `nfr:latency` | Que el endpoint/función responda dentro del umbral. |
| `nfr:security` | Que no se introduzcan vulnerabilidades (ej. sanitización). |
| `nfr:observability`| Que existan los logs, trazas o métricas exigidas. |
| `nfr:*` (Cualquiera) | Que la métrica dura dictada en el spec se cumpla o falla el build. |