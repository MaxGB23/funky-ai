Lo que sí arreglaría del propose
Los mismos vicios que ya sacamos del explore:
Antes (propose)                          Después
─────────────────────────────────────────────────
1. view_file ORCHESTRATOR-STATE.md      → SACAR (vos sabés el estado)
2. grep_search docs/engram/index.md     → SACAR (búsqueda genérica)
3. grep_search "[TAG]"                   → SACAR o reemplazar por tags reales
4. view_file explore.md                 → ✅ QUEDA
5. view_file proposal.md (target)       → ✅ QUEDA
Y si querés consistencia total, que el orquestador humano le pase el mismo formato de copy-paste que al explore:
/funky-propose
**Feature:** `023-deprecate-worker-handoff`
**Tags:** worker, cli, deprecation
Sin contexto extra porque el propose ya lee la explore, y la explore ya tiene todo lo que necesita.
Resumen
Leer explore entero no es el problema. El problema es lo que rodea al prompt — el bootstrap con basura. Limpiá eso y tenés un propose sólido.


Cambios acordados — resumen general
1. Copy-paste del orquestador (nuevo formato estándar)
Pasa de ser solo el feature name a incluir contexto explícito:
/funky-{fase}
**Feature:** `023-deprecate-worker-handoff`
**Contexto:** docs/openspec/rfcs/023-deprecate-worker-handoff.md
**Tags:** worker, cli, deprecation
**Target:** docs/openspec/changes/023-deprecate-worker-handoff/explore.md (new)
El (new) / (exists) aclara si el sub-agente debe leer primero o escribir directo. El orquestador humano sabe esto porque él mismo crea el change folder o no.
2. Return.md por fase (nuevo artifact)
En vez de que el orquestador humano tenga que abrir el explore.md o proposal.md entero para saber qué pasó, cada sub-agente genera un archivo return.md liviano al lado del artifact principal:
docs/openspec/changes/023-deprecate-worker-handoff/
├── explore.md      ← artifact completo
├── return.md       ← resumen (status, resumen, riesgos, siguiente paso)
└── proposal.md     ← (después)
El orquestador lee return.md primero. Si necesita profundizar, abre el artifact. Pero el 90% de las veces el return.md basta para decidir "continuo" o "ajusto algo".
Cambio en los prompts: en vez de devolver el envelope solo en chat, también escribirlo a return.md.
3. Tags desde el copy-paste (no más grep al index)
Se elimina del bootstrap:
- grep_search docs/engram/index.md — búsqueda genérica que tira 30 resultados irrelevantes
- grep_search "[TAG]" — código muerto que nunca se ejecuta
En su lugar, el sub-agente recibe tags explícitos desde el copy-paste y busca SOLO esos:
// Si el copy-paste dice Tags: worker, cli
// El sub-agente hace:
grep_search "tag: worker" docs/engram/
grep_search "tag: cli" docs/engram/
Búsqueda chica, precisa, sin ruido. Y si no hay tags, directamente no busca engram.
4. ORCHESTRATOR-STATE.md eliminado del bootstrap
El orquestador humano ya sabe en qué change está y qué pasó. Ese archivo siempre está atrasado respecto a la cabeza del humano. El sub-agente no necesita saber el estado global del pipeline — solo necesita el feature name, el contexto, y los tags que le pasa el orquestador.
Se elimina de TODOS los prompts: explore, propose, y los que sigan.
5. RFC absorbe en explore (ya está)
No se toca el template RFC. El RFC sigue siendo brain dump liviano. La transición RFC → explore funciona porque el orquestador humano pasa el path del RFC en el copy-paste y el sub-agente lo lee directo. El warning del RFC se corrigió para apuntar a explore, no a propose.
6. Leer explore entero en propose (se mantiene)
El propose necesita los detalles concretos del explore (paths exactos, riesgos específicos, justificación de opciones descartadas). No es viable con resumen. Pero como la explore tiene budget de concisión, leerla entera no debería doler.
Checklist por prompt
funky-explore.md
- Sacar view_file ORCHESTRATOR-STATE.md del bootstrap
- Sacar grep_search docs/engram/index.md
- Sacar grep_search "[TAG]" o reemplazar con búsqueda por tags recibidos
- El view_file target condicional se reemplaza por: check si target es new o exists (viene en copy-paste)
- Agregar sección "Contexto del orquestador" con el formato estandarizado de copy-paste
- Agregar "Escribir return.md" como paso final además del envelope en chat
funky-propose.md
- Sacar view_file ORCHESTRATOR-STATE.md
- Sacar grep_search docs/engram/index.md
- Sacar grep_search "[TAG]" o reemplazar
- El view_file explore.md se mantiene (siempre debe leer el explore)
- El view_file proposal.md condicional se reemplaza por check del target
- Agregar formato de copy-paste estandarizado
- Agregar "Escribir return.md"
RFC template
- Warning redirige a explore (ya está corregido)
- Nada más que tocar
Para el futuro (lo que sigue después de propose)
Cuando revisemos funky-spec, funky-design, funky-tasks, etc., se aplican los mismos cambios:
- SACAR: ORCHESTRATOR-STATE.md, grep genérico, [TAG]
- AGREGAR: formato de copy-paste, tags, return.md, target new/exists