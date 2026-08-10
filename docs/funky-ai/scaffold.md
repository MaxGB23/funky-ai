# funky scaffold — Scaffold agnóstico OpenSpec/SDD

## ¿Qué problema resuelve?

`funky scaffold` instala la base documental común a cualquier ecosistema que trabaje con **OpenSpec/SDD**: el `README.md` del proyecto (interpolado con `{{project_name}}`), el `ORCHESTRATOR-STATE.md` como hub de estado, el template de `release-notes.md` y el template de RFC. Es **framework-agnostic**: no instala reglas de agentes ni templates de proceso de ningún framework en particular.

Sin `funky scaffold` el proyecto carece del README con su punto de entrada (`ORCHESTRATOR-STATE.md`) y de los templates base de release notes y RFC que el ciclo SDD espera encontrar.

## ¿Cuándo usarlo?

En un proyecto que quiere adoptar la convención documental OpenSpec/SDD sin instalar el framework completo. Es idempotente: los archivos existentes se skipean sin sobrescribirse.

```bash
funky scaffold
```

## Árbol completo de inyección (4 archivos)

| Destino | Origen | Propósito |
|---|---|---|
| `README.md` | `bootstrap/README.md` (interpolado) | Matriz documental del proyecto; `ORCHESTRATOR-STATE` como hub |
| `ORCHESTRATOR-STATE.md` | `bootstrap/ORCHESTRATOR-STATE.md` | Estado global del proyecto y contexto de recuperación de sesión |
| `.agents/templates/sdd/release-notes.md` | `bootstrap/sdd/release-notes.md` | Template de release notes del ciclo SDD |
| `openspec/rfcs/000-rfc-template.md` | `bootstrap/sdd/000-rfc-template.md` | Template de RFC del proyecto |

El README es el **único template cuyo contenido se generalizó** para el scaffold agnóstico: deja de apuntar a canvas/engram como puntos centrales y asume `ORCHESTRATOR-STATE` como hub. `funky sdd install` usa el MISMO template de README (paridad de bytes).

## Diferencia con `funky sdd install`

| | `funky scaffold` | `funky sdd install` |
|---|---|---|
| Alcance | Base documental agnóstica (4 archivos) | Framework Funky AI completo |
| README | Mismo template generalizado | Mismo template generalizado |
| Reglas de agentes (`.agents/rules/`) | No | Sí (23) |
| Templates de proceso SDD (`.agents/templates/sdd/`) | Solo `release-notes.md` | Sí (8 + docs compartidos) |
| Directorios engram (`docs/engram/`) | No | Sí (7) |
| `TEMPLATE_GUIDE.md` | No | Sí |

## Diagrama de flujo

```
funky scaffold
  │  runAgnosticScaffoldCommand()
  │  runAgnosticScaffold({ templatesDir, targetBase })
  │
  ├── README.md                  →  raíz                        (create, {{project_name}} interpolado)
  ├── ORCHESTRATOR-STATE.md      →  raíz                        (copy)
  ├── release-notes.md           →  .agents/templates/sdd/      (copy)
  └── 000-rfc-template.md        →  openspec/rfcs/              (copy)
```

La función `runAgnosticScaffold()` es pura: no escribe nada directamente. Ensambla un arreglo de *intenciones* (`{ action, src, dest, content }`) que luego `executeIntentions()` procesa.
