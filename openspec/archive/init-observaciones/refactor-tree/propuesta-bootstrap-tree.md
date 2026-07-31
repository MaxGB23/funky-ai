# Propuesta: Árbol de `--bootstrap`

**⚠️ REGLA DE ORO: Todos los templates se inyectan con su nombre exacto. El CLI NO renombra archivos.**  
El nombre del source ES el nombre del destino. Verificar que el naming no esté alterado por el CLI.

```
funky-cli/src/templates/
├── bootstrap/                          ← fuente de --bootstrap
│   ├── ORCHESTRATOR-STATE.md           → raíz
│   ├── README.md                       → raíz
│   ├── TEMPLATE_GUIDE.md               → raíz
│   │
│   ├── funky-ai-rules/                 → .agents/rules/  (copia recursiva)
│   │   ├── engram-protocol.md
│   │   ├── sdd-escalation-matrix.md
│   │   ├── sdd-orchestrator.md
│   │   ├── sdd-preflight.md
│   │   ├── secops.md
│   │   ├── tier1-router.md
│   │   ├── tier2-router.md
│   │   ├── tier3-router.md
│   │   ├── tier2-delegation/
│   │   │   ├── t2-archive.md
│   │   │   ├── t2-explore.md
│   │   │   ├── t2-propose.md
│   │   │   ├── t2-spec.md
│   │   │   ├── t2-tasks.md
│   │   │   └── t2-verify.md
│   │   └── tier3-interactive/
│   │       ├── interactive-apply.md
│   │       ├── interactive-archive.md
│   │       ├── interactive-design.md
│   │       ├── interactive-explore.md
│   │       ├── interactive-propose.md
│   │       ├── interactive-spec.md
│   │       ├── interactive-tasks.md
│   │       ├── interactive-verify.md
│   │       └── risk-decision.md
│   │
│   └── sdd/                            → .agents/templates/sdd/  (copia recursiva)
│       ├── docs.md
│       ├── explore.md
│       ├── proposal.md
│       ├── release-checklist.md
│       ├── release-notes.md
│       ├── report.md
│       ├── spec.md
│       └── tasks.md
│       ── 000-rfc-template.md          → openspec/rfcs/000-rfc-template.md  (excepción: destino distinto)
│
├── sdd/                                ← fuente de funky feature (sin bootstrap)
│   ├── docs.md
│   ├── explore.md
│   ├── proposal.md
│   ├── release-checklist.md
│   ├── report.md
│   ├── spec.md
│   └── tasks.md
│
└── funky-pipeline/                     ← fuente para init(sin flags)/assess/estimate/pipeline
    └── → docs/funky-pipeline/

Generado por --bootstrap además:
  - .agents/templates/sdd/docs-live-index.md → generado (no copiado)
  - PROJECT-CANVAS.md / INFRA-CANVAS.md     → generado por init (sin flags)
```

**Notas:**
- `engram-*` templates ya son administrados por `funky engram add`. No necesitan cambios ni estar en init.
- `docs/engram/index.md` ya es administrado por `funky engram add`. Se removió de init.
- `000-rfc-template.md` está dentro de `bootstrap/sdd/` por orden, pero su destino es `openspec/rfcs/`.
- `release-notes.md` vive en `bootstrap/sdd/`, NO en raíz de bootstrap.
Al final deben pasar los tests con pnpm, en caso de requerir actualizar un test, se debe preguntar por aprobacion. hay que ser muy cuidadosos en esta parte, ya que hemos refactorizado por completo todo el tree.