Resumen clave
- Hoy no hay NFRs explícitos en SDD — quedan implícitos en spec/design, sin trazabilidad
- El orquestador no inyecta NFRs al delegar — cada subagente arranca sin contexto no-funcional
- sdd-verify solo verifica funcionalidad — no mide performance, seguridad, escalabilidad
- Sin NFRs modelados, el pipeline produce código correcto pero sin garantías
Lo que agregaría
1. Sección obligatoria ## Non-Functional Requirements en spec — con umbrales medibles (P95 < 200ms, 99.9% uptime, etc.)
2. Inyección automática por el orquestador — al delegar design/apply/tasks, pasar los NFRs relevantes como prefacio al prompt
3. Tags NFR en tasks — cada tarea que toque un NFR lleva nfr:latency, nfr:security, etc. Así sabés qué verificar después
4. Verificación multi-nivel — sdd-verify no solo corre tests existentes sino que ejecuta benchmarks o chequeos contra los umbrales definidos
5. Trazabilidad vertical — desde proposal hasta archive, cada artifact referencia los NFRs del upstream. Podés preguntar "¿este cambio cumple con el SLA de latency?" en cualquier fase
El cambio concreto en el DAG
- proposal → spec → design → tasks → apply → verify → archive
+ proposal → spec → design → tasks → apply → verify → archive
+               ↑ NFRs    ↑ NFRs   ↑ NFRs   ↑ NFRs  ↑ NFRs
+               └─────────┴────────┴────────┴───────┘
O sea: los NFRs se definen una vez en spec y bajan en cascada por el orquestador a todas las fases downstream. No se negocian de nuevo.
Lo más importante
Esto no es opcional si querés SDD para algo que no sea un script de 20 líneas. Los NFRs son el puente entre "anda" y "anda en producción con 10k usuarios". Sin ellos, el diseño es decorativo.




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