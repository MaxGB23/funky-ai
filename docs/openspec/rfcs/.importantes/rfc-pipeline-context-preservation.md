# RFC: Pipeline Context Preservation — Anti-patrón del Teléfono Descompuesto en Fases SDD

> **🛑 WARNING PARA IA (FASE EXPLORE):**
> Este documento es un RFC / Brain Dump. No es un proposal formal.
> Tu trabajo en la fase de explore es leer esto, extraer la intención y validar viabilidad.
> Este documento alimenta la fase de explore (nunca delegar sin aprobación).

---

## 🧠 El Problema

El pipeline SDD tiene un **anti-patrón estructural** de pérdida de contexto entre fases secuenciales. Se manifiesta así:

```
RFC (documento fuente, 50 páginas)
  → EXPLORE: comprime por "relevancia arquitectónica"
             → omite reglas factuales "aburridas" (nombres, formatos, convenciones)
             → explora riesgos gordos (merge, AST, checksums)
  → PROPOSE: SOLO ve explore.md
             → nunca supo que existían reglas de renombrado
             → proposal ignorante de constraints que el RFC ya definía
  → SPEC / DESIGN: building on top of incomplete context
             → el error se propaga aguas abajo
```

**No es culpa de Explore.** Explore hace su trabajo perfecto según su definición: "explorar riesgos y opciones de **arquitectura**". El LLM lee el RFC, ve "convenciones de nombres", "FULL vs DELTA", y con justa razón lo poda porque **eso no es un riesgo arquitectónico**.

El problema es que **Explore no sabe qué necesita Propose**. Su función objetivo es "encontrar lo complejo/riesgoso", no "preservar contexto factual para la siguiente fase".

Esto es el clásico **anti-patrón de Teléfono Descompuesto (Context Loss)** en pipelines de agentes.

---

## 🗑️ Manifestaciones del Problema

### Scope de Explore vs Scope de Propose

| Explore optimiza por | Propose necesita |
|---|---|
| Riesgos arquitectónicos | Reglas del RFC (incluso las aburridas) |
| Opciones de diseño complejas | Scope no-negociable del RFC |
| Tradeoffs técnicos | Definiciones y terminología exacta |
| Lo que cambia | Lo que NO cambia (pero hay que saberlo) |

### Ejemplo Concreto

RFC 024 define: reglas de renombrado de specs, FULL vs DELTA, estructura de deltas, naming de archives, política de limpieza.

Explore lee el RFC, decide que lo relevante es "merge y detección de conflictos" (lo complejo), y omite convenciones de nombres.

Propose arranca ciego. Nunca supo que existían reglas de renombrado. El proposal termina ignorando constraints que el RFC ya había resuelto.

---

## 🎯 Soluciones Consideradas

### Opción A: Context Preservation en Explore (ELEGIDA)

Agregar una **sección obligatoria de volcado factual** al output de Explore que el LLM NO puede podar:

```markdown
## Context Preservation (para fases siguientes)
Todo lo que el RFC/input fuente define como hecho, regla, o restricción,
incluso si no es arquitectónicamente interesante.

- **Reglas explícitas del RFC**:
  - {regla 1}
  - {regla 2}
- **Definiciones clave**:
  - {término: definición}
- **Scope no-negociable**:
  - {lo que el RFC ya decidió que no se discute}
```

**Por qué funciona:**
- La regla es "siempre llenar esta sección, sin importar si es relevante"
- No es análisis — es volcado factual. ~5-10 líneas.
- Propose recibe todo lo que necesita sin leer el RFC original
- Escala a features gigantes porque el costo es linear con la cantidad de reglas, no con el tamaño del RFC

**Riesgo:** Si Explore es descuidado o tiene un budget muy ajustado, puede omitir cosas aún con la sección. Mitigación: el Fidelity Check.

### Opción B: Propose lee el RFC + Explore (RECHAZADA)

Hacer que Propose lea tanto el RFC original como explore.md.

| Aspecto | Resultado |
|---|---|
| **Costo** | 2x tokens por feature (dos LLMs interpretan el mismo RFC) |
| **Riesgo** | **Alto** — dos LLMs interpretan el mismo RFC pueden discrepar. ¿A quién le cree Propose? |
| **Acoplamiento** | Alto — ahora Propose necesita saber qué fuentes existen |
| **Consistencia** | Baja — si Explore y Propose discrepan, el pipeline tiene dos verdades compitiendo |

**Razón de rechazo:** Rompe la abstracción del pipeline. Cada fase debe poder confiar en que la anterior le pasó todo lo que necesita. Si Propose también lee el RFC, se pierde el beneficio de la exploración como filtro único, y se introduce riesgo de inconsistencia entre fases.

### Opción C: Context Preservation + Fidelity Check Opcional (PLAN DE CONTINGENCIA)

Para features gigantes o cambios de alto riesgo, agregar un paso opcional entre Explore y Propose:

```
RFC → Explore → explore.md → [FIDELITY CHECK?] → Propose
                                  ↓
                            Si salta: un agente rápido
                            compara explore.md vs RFC,
                            solo busca "cosas factuales
                            que Explore omitió"
```

**Cuándo usarlo:**
- Feature forecast > 400 líneas cambiadas
- El RFC tiene más de ~20 páginas
- El orquestador sospecha que Explore pudo haber omitido contexto

**Costo:** Una pasada rápida sobre el RFC comparando contra explore.md. No analiza, solo busca **hechos** del RFC que no aparecen en Explore. Mucho más barato que hacer que Propose lea el RFC entero.

**Comportamiento:**
- Si el check encuentra omisiones → las inyecta en explore.md (sección Context Preservation)
- Si no encuentra nada → el pipeline sigue sin cambios
- El check NO opina, NO analiza. Solo busca hechos perdidos.

---

## ✅ Implementación Propuesta

### 1. Modificar `funky-explore.md`

Agregar al template de output de Explore la sección obligatoria:

```markdown
## Context Preservation
### Reglas del RFC / input fuente
- {lista de reglas explícitas}
### Definiciones clave
- {término: definición}
### Scope no-negociable
- {restricciones que no se discuten en propose}
```

Agregar regla estricta:

| 🔴 | Context Preservation | Siempre llenar esta sección. No es análisis — es volcado factual obligatorio. Aunque el RFC no tenga reglas explícitas, escribir "Ninguna regla explícita identificada." |

### 2. Modificar `funky-propose.md`

Agregar prerequisito de lectura de `Context Preservation`:

> Antes de escribir el proposal, verificar que la sección `Context Preservation` de explore.md esté completa. Si falta información para tomar una decisión de diseño, declararlo como riesgo en el proposal.

### 3. Crear `funky-fidelity-check.md` (opcional, para features grandes)

Un agente mínimo que:
1. Lee el RFC original
2. Lee explore.md
3. Compara: busca hechos/reglas en el RFC que no aparecen en `Context Preservation` de explore.md
4. Si encuentra: devuelve la lista de omisiones para inyectar
5. Si no encuentra: OK, pipeline sigue

---

## 📐 Contrato entre Fases (Actualizado)

```
RFC → EXPLORE → explore.md (con Context Preservation) → FIDELITY CHECK? → PROPOSE → proposal.md
                                                        (opt-in,        ↑
                                                         solo grandes    ahora tiene contexto
                                                         features)       completo sin leer RFC
```

### Responsabilidades

| Fase | Responsabilidad |
|---|---|
| **RFC** | Contiene toda la data original. No tiene responsabilidad de formato. |
| **Explore** | (1) Analizar riesgos y opciones arquitectónicas. (2) Preservar contexto factual en `Context Preservation`. |
| **Fidelity Check** | (Opcional) Verificar que Explore no omitió hechos del RFC. |
| **Propose** | Tomar el análisis de Explore + el contexto factual. No necesita leer el RFC. |
| **Fases siguientes** | Construir sobre el proposal. Si algo falta, es responsabilidad de Propose declararlo. |

---

## 🔮 Próximos Pasos

1. Actualizar `docs/prompts/sdd/funky-explore.md` — agregar sección `Context Preservation` al template y la regla estricta
2. Actualizar `docs/prompts/sdd/funky-propose.md` — agregar verificación de la sección
3. Decidir si crear `funky-fidelity-check.md` como agente opt-in o mantenerlo solo como procedimiento manual
4. Si se implementa el fidelity check, integrarlo en el suborchestrator para features con forecast > 400 líneas
