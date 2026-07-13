CORRECCION DETECTADA: explore es EL primer lugar donde aparecen los NFRs. Cuando estás investigando el codebase, comparando approaches, te saltan cosas como:
- "Este endpoint ya tiene 300ms, agregarle X lo va a poner en 500ms"
- "La DB actual no escala horizontalmente"
- "Este approach requiere WebSockets, el otro polling — distintas implicancias de seguridad"
- "Si hacemos esto con server components, el bundle no crece"
Ahora sí completo:
explore ──► proposal ──► spec ──► design ──► tasks ──► apply ──► verify
  │            │           │         │          │         │          │
  │            │           │  NFRs locked │       │         │          │
  │            │           └─────┬────────┘       │         │          │
  │            │                 │                │         │          │
  │     NFRs formalized          │                │         │          │
  │     en proposal               │                │         │          │
  │                                │                │         │          │
  NFRs discovered        orquestador inyecta ──────┴─────────┴──────────┘
  acá                           en cada delegación downstream
1. sdd-explore → NFRs descubiertos durante la investigación (no estructurados, pero importantes)
2. sdd-propose → NFRs formalizados con intención y alcance
3. sdd-spec → NFRs lockeados con umbrales medibles
4. del orquestador hacia abajo → NFRs inyectados en cada delegación
O sea, la corrección es que el explore también tiene que devolver NFR candidates para que después proposal los formalice. Sin eso, si el usuario no explicitó NFRs y el subagente de explore no los levanta, llegan a spec sin contexto o no llegan.