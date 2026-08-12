1. Los canvases ya tenían decisiones pre-aprobadas (✅ Aprobado — Validación sesión de diseño) Eso me puso en una posición rara: ¿estoy validando decisiones abiertas o re-debatiendo decisiones ya cerradas? El rol de "segunda validación" lo inferí correctamente, pero el prompt no lo aclara explícitamente. Sugiero una línea en el prompt que diga algo como: "Las correcciones marcadas como ✅ Aprobado en los canvases son decisiones cerradas en sesiones anteriores — no las re-abras salvo que encuentres una incompatibilidad no resuelta con otra decisión."

2. La Fase 3 del assess prompt actualmente dice:
"Incompatibilidades entre decisiones (…, senioridad del equipo + complejidad operativa)"
Eso es una trampa: la IA lo va a buscar en los canvases, no lo va a encontrar, y o lo inventa o lo silencia. 

Delimitación del alcance de la fase `assess` frente a `estimate`
La Fase 3 del prompt de `assess` actualmente menciona evaluar la relación "senioridad del equipo + complejidad operativa". Esto es un error de fase, ya que la composición del equipo y la senioridad se definen en la fase `estimate`.

**Resolución:**
- Se ha creado el documento de referencia [funky-phases.md](./funky-phases.md) que delimita formalmente el alcance de cada fase.
- La fase `assess` se establece estrictamente como un paso intermedio para dar el visto bueno técnico-arquitectónico a los canvases antes de pasar al costeo en `estimate`.
- **Frontera de responsabilidades:**
  - `assess` valida la coherencia arquitectónica y técnica (incompatibilidades estructurales del diseño). No debe involucrar análisis de costos, equipos ni riesgos operativos mitigables por buffers.
  - `estimate` asume las decisiones técnicas como resueltas y evalúa viabilidad financiera, sizing de equipo, TCO y asigna buffers de riesgo usando flags específicas (`--multi-tenant`, `--security`, `--concurrency`, `--integrations`, `--roles`).
- **Fixes necesarios:**
  - En `assess-prompt.md`, remover cualquier referencia a la evaluación de senioridad del equipo o complejidad operativa del equipo.
  - Añadir una instrucción que prohíba a la IA evaluar el **costo, tiempo o esfuerzo extra** de temas cubiertos por las flags de `estimate`. Su trabajo es ÚNICAMENTE validar la **viabilidad técnica y arquitectónica** de esos temas (ej. evaluar si un JWT sin soporte multi-tenant es un error fatal cuando el brief exige multi-org).

### Evolución de assess para no chocar con estimate

estimate cubre via flags (`--multi-tenant`, `--security`, `--concurrency`, `--integrations`, `--roles`) exactamente los mismos riesgos que assess levantaría como subdimensionamiento o incompatibilidad operativa. Si ambas fases los debaten, el humano resuelve el mismo punto dos veces.

**Regla de partición:**
- **assess** detecta incompatibilidades *arquitectónicas* que harían que el sistema esté mal diseñado independientemente del costo — cosas que si no se corrigen producen un bug, un deploy roto o un diseño que no escala. *Además, si detecta una falla crítica, DEBE sugerir parchar el canvas original (con aprobación humana) para mantenerlo como Única Fuente de Verdad (SSOT).*
- **estimate** convierte la *complejidad técnica ya validada* en presupuesto, añadiendo buffers por riesgo operativo.

**Patrones que NO deben salir de risk-patterns (Reclasificación bajo los 4 Ejes):**
Aunque `estimate` cubra el esfuerzo de estos temas con flags, `assess` DEBE seguir auditando su arquitectura (Eje 3: Incompatibilidades). Por ejemplo:
- **Multi-tenancy sin aislamiento:** Bug arquitectónico grave, auditable por `assess`. `--multi-tenant` cobra el esfuerzo.
- **Auth incompleta para roles (RBAC):** Riesgo de seguridad (Eje 3). `--security` cobra el esfuerzo.
- **Caching / concurrencia mal diseñados:** Riesgo de escalabilidad (Eje 1 y 3). `--concurrency` cobra el esfuerzo.
- **ORM N+1 + KPI de latencia:** Bug de rendimiento crítico (Eje 3).
- **Integraciones externas sin strategy:** Falla de resiliencia (Eje 3). `--integrations` cobra el esfuerzo.

**Fix en assess-prompt.md §Fase 3:** agregar una nota explícita: *"No levantes como riesgo el costo o esfuerzo extra de implementar requerimientos complejos (eso lo cubren los flags de estimate). TU ÚNICO TRABAJO es validar si la arquitectura propuesta soporta esos requerimientos técnicos sin romperse."*

3. Cómo evolucionar risk-patterns.md
El problema de fondo es que el archivo hoy es una lista plana de anti-patrones tecnológicos específicos. Eso lo hace frágil: si el proyecto no usa K8s ni SQLite, el archivo no aporta nada.

La propuesta es reorganizarlo alrededor de los ejes de análisis que el prompt ya define en su Fase 3. Algo así:

risk-patterns.md
│
├── Eje 1: Sobreingeniería
│     (K8s sin escala justificable, microservicios prematuros en Fase 1)
│
├── Eje 2: Decisión de datos incorrecta
│     (Blobs/archivos persistidos en DB relacional, métricas históricas calculadas on-the-fly)
│
├── Eje 3: Incompatibilidades estructurales
│     (Edge runtime + APIs de Node nativas, JWT stateless con flujo multi-org sin revocación, 
│      canal de push ausente cuando el brief exige tiempo real)
│
└── Eje 4: Hipótesis de negocio dudosas
      (KPI de activación agresivo sin onboarding en la UX, escala proyectada chocando con infra que escala a cero)

Decisiones sobre el refactor de risk-patterns.md:

- El archivo es inyectado por el CLI como scaffold de proyecto. El equipo puede extenderlo manualmente entre proyectos; la IA NO puede escribir en él durante una sesión (sigue siendo read-only).
- Razón: si la IA lo extiende, el template deja de ser predecible. El CLI sería la fuente de verdad y el archivo dejaría de ser un scaffold estable.
- Placement: se lee ÚLTIMO en la Fase 3 (después de brief + canvases), como barrido de completitud — ¿cubrí los 4 ejes? No primero, para no anclar el análisis en los ejemplos del template antes de entender el proyecto.
- Feedback loop deliberado: al CIERRE de la sesión, la IA propone (en el resumen final) los patrones nuevos que encontró y que no estaban en el archivo, como candidatos para que el equipo incorpore al CLI template. No los escribe ella directamente.
- Fix en assess-prompt.md §Cierre: agregar instrucción explícita de proponer candidatos al template sin modificar el archivo.
- Fix en assess-prompt.md §Reglas: risk-patterns.md sigue siendo read-only, pero el prompt debe aclarar su rol ("checklist de completitud interno, no temario de discusión").

Estructura propuesta en
[risk-patterns-propuesta.md](./risk-patterns-propuesta.md)

4. El solapamiento (Split Brain) entre init y assess
En `funky-phases.md` se establece claramente que la fase `canvas` (donde corre `init`) NO evalúa la coherencia arquitectónica. Sin embargo, el `canvas/init-prompt.md` actual incluye instrucciones para hacer una "Evaluación holística" y buscar "Incompatibilidades", "Sobreingeniería" y "Subdimensionamiento". Esto es exactamente lo que hace `assess-prompt.md`, creando un traslape y un "Split Brain".

**Fixes necesarios en init-prompt.md:**
- Remover toda la instrucción de "Evaluación holística" y búsqueda de incompatibilidades/sobreingeniería.
- Limitar el rol de `init-prompt.md` a ser un asistente de llenado: debe asegurar que no haya secciones vacías y que las descripciones tengan sentido básico, pero NO debe juzgar la arquitectura ni buscar fallas estructurales.
- Reforzar que la validación arquitectónica estricta vive única y exclusivamente en `assess-prompt.md`.

5. Refinamiento de la Inyección de Flags en `estimate` (Prompt Augmentation)
El mecanismo actual inyecta contexto pasivo ("Impacto en costos") para flags como `--concurrency` o `--security`. Aunque el `pricing-guide.md` establece un buffer general del +10% a +25%, el prompt puede fallar en hacer la conexión si la instrucción está muy lejos. Además, asume que todos los riesgos pesan lo mismo en el presupuesto, lo cual rara vez es cierto.

**Sugerencias de mejora para los fragmentos inyectables (topics):**
- **Añadir instrucción activa:** Al final de cada inyectable, incluir un `> **Instrucción para cotizar:** ...` que ancle la atención de la IA y le obligue a proponer el buffer en ese momento exacto.
- **Rangos de buffer específicos por tema:** En lugar de heredar el rango global fijo, cada flag debería sugerir su propio peso. Por ejemplo, `--security` (+10% a +20%), pero `--transactions` o infraestructuras distribuidas como `--concurrency` podrían requerir (+20% a +40%), dando una estimación mucho más apegada al riesgo real del negocio.

### Rangos de Buffer Sugeridos por Flag
Para el refactor de los *topics* inyectables, te propongo estos pesos base para cada bandera, según el riesgo técnico y de negocio que representan:

- **`--roles`**: **N/A (No lleva buffer directo).** Esta flag no es un riesgo técnico, define la calculadora base del presupuesto. Su función es reemplazar las tarifas genéricas por los salarios/bandas reales del equipo. 
- **`--security`**: **+10% a +25%**. Si es meter Clerk o NextAuth básico, es +10%. Si el requerimiento exige RBAC (roles granulares), compliance (HIPAA/GDPR) o hardening de infraestructura, se dispara al +25%.
- **`--integrations`**: **+10% a +30%**. Mandar un webhook a Slack es +10%. Armar una sincronización bidireccional con un SAP o ERP *legacy* sin documentación clara es mínimo un +30% de riesgo por dependencias de terceros.
- **`--multi-tenant`**: **+15% a +30%**. Aislar datos (ej. Row-Level Security), manejar migraciones tenant-aware y asegurar que el tenant A no vea los datos del tenant B cuesta mucho tiempo de QA.
- **`--concurrency`**: **+15% a +35%**. Implementar colas, *workers* distribuidos, manejar *deadlocks* y *backpressure*. El testing y la observabilidad en sistemas distribuidos queman horas como gasolina.
- **`--transactions`**: **+20% a +40%**. El rey del riesgo. Consistencia ACID, conciliación de *ledgers*, integraciones de pago. Si la cagas aquí, el cliente pierde dinero o se come una demanda. Es el buffer más alto por defecto.