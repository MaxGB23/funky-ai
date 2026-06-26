# Spec: Routing de Tiers, Escalera de Operación y `/funky-tasks`

> **Propósito:** Documento consolidado que define la jerarquía operativa de Tiers (T0–T4), la relación SemVer↔Tier, el ciclo de vida de NFRs y la arquitectura del workflow `/funky-tasks`.
>
> **Origen:** Consolidación de `draft-tasks.md` (§2, §6, §7.1, §7.3, §7.5) y `rules-orchestrator-backup.md` (§Escalation Matrix).

---

## 1. Escalera de Tiers (Jerarquía Operativa)

### 1.1 Escalera Base (§6)

1. **Tier 1 (Fast Track):** Operación directa hacia la ejecución. Se salta las fases de diseño profundo (`explore`, `proposal`, `spec`). El Orquestador puede decidir delegar la creación del `tasks.md` a un workflow dedicado o hacerlo inline. También puede delegar un worker para ejecutar las tasks, o hacerlo él mismo si el cambio es sumamente trivial.
2. **Tier 2 (Orquestador Híbrido "Sandwich"):** El Orquestador funge como Manager de Alto Nivel. Para **proteger su contexto** de código basura o I/O masivo, delega la exploración inicial (`/funky-explore`) y la ejecución final (`/funky-tasks`) a workflows especializados. El Orquestador *únicamente* redacta de forma *inline* las piezas de negocio y diseño (`proposal.md` y `spec.md`), apoyándose en los reportes limpios que le traen los workflows.
3. **Tier 3 (Workflows Aislados por Fase):** Para features complejas donde incluso redactar el spec satura la memoria. Se aísla *CADA* fase SDD en chats dedicados (`/funky-propose`, `/funky-spec`, `/funky-design`, etc.). Los templates no se inyectan masivamente al inicio, y los NFRs bajan en cascada. El Context Window es 100% virgen para cada artefacto.
4. **Tier 4 (Rediseño Mayor):** Rediseño arquitectónico. Operación 100% en workflows aislados sin handoffs directos. Máximo límite de tokens por fase.

### 1.2 Escalera Refinada con T0 (§7.3.1)

- **Tier 0 (Micro-Fix):** Fix trivial de 1 línea (typos, imports). **Excepción por Override Humano:** El Orquestador detecta que es trivial, FRENA y pregunta al humano si quiere que lo edite *inline*. Si el humano aprueba, el Orquestador edita el código directo. Sin workflows, sin workers, sin `tasks.md`.
- **Tier 1 (Fast Track):** Tarea chica (1-2 archivos).
  - **Exploración:** Usa el "Explore Ligero" (Sabueso desechable) para no ensuciar la memoria del Orquestador leyendo código.
  - **Planeación:** El Orquestador redacta el `tasks.md` *inline*. (Regla: Si el tasks es demasiado complejo para redactarse inline, la feature debe escalarse a Tier 2).
  - **Ejecución:** Delegada al Worker básico.
- **Tier 2 (Standard Feature):** Feature normal (2-5 archivos).
  - **Exploración:** Delegada al workflow `/funky-explore`.
  - **Planeación:** Orquestador redacta `proposal.md` y `spec.md` *inline*.
  - **Tasks:** Delegada al workflow `/funky-tasks` (este workflow funge como detector de riesgo mediante su Return Envelope).
  - **Ejecución:** Delegada al Worker básico.
- **Tier 3 (Deep):** Cambios complejos o de alto riesgo. CADA fase se aísla en su propio workflow. La ejecución la toma `/funky-apply` (que lee el `spec.md` y `design.md` directo, eliminando la necesidad de microplanning en el Orquestador).
- **Tier 4 (Rediseño):** 8 Roles aislados, máximo límite de tokens. Frenado de emergencia.

### 1.3 Branch Management (Aplica a Todos los Tiers)

Para cualquier operación de Tier 1 a Tier 4, la creación de rama (branch) y PR es **OBLIGATORIA**, incluso si el SemVer es NONE.
**La única excepción:** Tier 0 (Micro-fix inline directo).

---

## 2. Reglas de Release: SemVer x SDD (§2 y §7.3.3)

### 2.1 Tabla de Correspondencia

| SemVer | Piso Mínimo de Tier | `release.md` | `docs.md` |
|--------|---------------------|--------------|-----------|
| **NONE** (Chores internos) | Tier 0 | ✗ No se sube versión | Condicional |
| **PATCH** (Bugfixes) | Tier 1 | ✗ Sin `release.md`, pero tarea de bump de versión obligatoria en `tasks.md` | Condicional |
| **MINOR** (Nuevas Features) | Tier 2 | ✅ OBLIGATORIO | Condicional |
| **MAJOR** (Breaking Changes) | Tier 3 | ✅ OBLIGATORIO | ✅ OBLIGATORIO |

### 2.2 Ley de Gravedad Inversa (SemVer empuja el Tier)

El tipo de release (SemVer) define un **piso mínimo** para el Tier. Un cambio puede **escalar** de Tier si es muy complejo, pero NUNCA puede **bajar** del piso que le marca el SemVer.

**Ejemplo de aplicación:** Si el humano pide un breaking change de DB y dice "es Tier 1", el Orquestador frena: *"Karnal, romper contratos es MAJOR, a huevo nos vamos a Tier 3 aislando fases"*.

### 2.3 El CLI es el Ejecutor, el Orquestador es el Inteligente

El CLI (`funky feature`) se encarga puramente de la inyección mecánica de plantillas. La **validación e inteligencia** recae completamente en el Orquestador antes de iniciar el comando.

**Regla de la "Trinidad del Setup":** Cuando el humano pide una feature, el Orquestador analiza y dicta explícitamente los 3 parámetros de los Inquirers:
1. **Tier sugerido** (T0–T4)
2. **Impacto en Docs Core** (Sí/No)
3. **Tipo de Release SemVer** (Major/Minor/Patch/None)

---

## 3. Trazabilidad Vertical de NFRs (§7.1)

Para evitar el "Prompt Overfitting" (burocracia inútil en features simples) pero mantener rigor arquitectónico en features críticas (Tier 3/4), se propone un ciclo de vida evolutivo para los NFRs:

1. **Discovery (`explore`):** Primera línea de defensa. El agente actúa como *scout*. Si detecta riesgos reales (ej. "el endpoint ya es muy lento", "este approach pega en la seguridad"), los levanta como *NFR Candidates* no estructurados. Si no hay riesgos evidentes, no inventa nada.
2. **Formalización (`proposal`):** Si el `explore` (o el Orquestador/humano) levantó *NFR Candidates*, el proposal los formaliza como Tradeoffs, definiendo su intención y alcance de manera esbelta.
3. **Bloqueo de Umbrales (`spec`):** Aquí se ponen los fierros. Los NFRs formalizados se bloquean con métricas duras y medibles (ej. P95 < 200ms, 99.9% uptime).
4. **Cascada Downstream (Orquestador):** El Orquestador lee el spec y, a partir de ahí, **inyecta** los NFRs como contexto obligatorio en cada delegación hacia abajo (`design`, `tasks`, `apply`).
5. **Tagging y Verificación (`tasks` → `verify`):** El agente de `tasks` añade tags explícitos (ej. `nfr:latency`) a las tareas. Finalmente, `funky-verify` lee esos tags para verificar que los umbrales de rendimiento/seguridad se cumplieron.

**Beneficio:** Los templates base permanecen 100% limpios y esbeltos para el 90% de las features normales. El rigor de los NFRs solo se detona, crece en cascada y exige validación si la fase inicial de `explore` descubre que es necesario.

---

## 4. Arquitectura del `/funky-tasks` y Deprecaciones (§7.5)

### 4.1 Un Solo Workflow Agnóstico al Tier

No se crearán múltiples versiones del workflow de tasks por Tier. El `/funky-tasks` tendrá comportamiento **adaptativo**: lee lo que exista en el Change Folder y ajusta la profundidad de las tasks en consecuencia.
- Si encuentra `spec.md` y `design.md` → los consume y produce tasks enriquecidas con contexto de diseño.
- Si solo tiene el contexto mínimo del Orquestador (T1) → trabaja con eso y produce tasks directas.
- **Beneficio:** Un solo workflow para todos los Tiers. Sin duplicidad, sin mantenimiento paralelo.

### 4.2 Deprecación del Microplanning

El Microplanning era una capa de "digestión" que el Orquestador hacía para que el Worker estándar pudiera ejecutar sin perderse. Con la migración a `/funky-apply`, este agente ya **lee directamente** el `spec.md` y el `design.md`, por lo que tiene más contexto que cualquier Worker con microplanning. La capa intermedia ya no agrega valor.

**Decisión:** Deprecar el Microplanning y el guardrail G2 (`RIESGO ALTO`) del Orquestador. El `/funky-apply` tiene suficiente contexto para tomar decisiones de ejecución sin necesidad de tasks ultra-digeridas.

### 4.3 Detección de Riesgo: Return Envelope del `/funky-tasks`

El workflow de tasks **no recibe el Tier como parámetro**. En su lugar, detecta el riesgo de forma autónoma al analizar el trabajo a realizar. Si identifica una tarea de alto impacto (ej. modificar auth, una query raíz, un contrato de API), lo reporta en su **Return Envelope**:
> `⚠️ Riesgo detectado en Tarea N: [descripción]. Se recomienda revisar antes de continuar.`

El Orquestador, que sí conoce el Tier y el contexto de negocio, actúa como Puerta de Escalamiento Dinámico al leer este Return Envelope:
- **Riesgo manejable (T2):** El Orquestador añade una instrucción o guardrail extra directo en el prompt del Worker básico.
- **Riesgo crítico (T3):** El Orquestador frena la ejecución y le pide al humano escalar la fase a Tier 3, reemplazando al Worker básico por `/funky-apply`.

Separación limpia: el workflow detecta, el Orquestador evalúa y mitiga.
