# Gentle AI — Orchestrator Strategy

Arquitectura de delegación para implementación y verificación con SDD.

## Principio rector

**Contexto fresco = resultados confiables.** Un sub-agente con demasiado contexto se degrada. Preferimos múltiples viajes cortos a uno solo gigante.

---

## Tabla de decisión

| Señal | Acción |
|-------|--------|
| 1-3 archivos, <300 líneas, lógica lineal | **Single apply** — un solo viaje |
| 4+ archivos, 300-600 líneas | **Batches secuenciales** — 2 o 3 viajes |
| 10+ archivos, +600 líneas, múltiples dominios | **Batches secuenciales** — 1 por fase de tasks |
| Refactor que toca archivos existentes | Batch separado solo para el refactor, después features |
| Feature que incluye cambios de schema + lógica + UI | Mínimo 3 batches: schema → lógica → UI |
| Duda sobre si dividir o no | **Dividir.** Siempre. |

## Regla empírica

> Si un solo `sdd-apply` va a crear o modificar más de 5 archivos, partilo en batches.

---

## Flujo de batches

```
Tasks: 24 tareas, 4 fases
         │
         ▼
┌─────────────────────────────────────────────┐
│ Batch 1: Fase 1 (infraestructura)           │
│   apply → sanity check → guardar progreso   │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│ Batch 2: Fase 2 (lógica core)               │
│   apply → sanity check → guardar progreso   │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│ Batch 3: Fase 3 (UI / integración)          │
│   apply → sanity check → guardar progreso   │
└─────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│ sdd-verify (CONTRA EL CAMBIO COMPLETO)      │
│   Lee specs + implementación final          │
│   Verdict: PASS / FAIL / PASS WITH WARNINGS │
└─────────────────────────────────────────────┘
```

### ¿Qué es un sanity check?

No es verify. Es una comprobación rápida post-batch:

- **Compila / arranca?** `npm run dev`, `go build`, etc.
- **No rompe lo anterior?** La funcionalidad previa sigue andando
- **El hook persiste datos?** Si hay persistencia, probar que funciona

Si el sanity check falla → **no seguir al próximo batch**. Corregir primero.

### ¿Por qué el verify no se divide?

Los specs describen **comportamiento completo**, no implementación parcial. Verificar a medias produce falsos positivos:

| Estado | Tiene scaffold | Tiene UI | Verify |
|--------|---------------|----------|--------|
| Batch 1 listo | ✅ | ❌ | ❌ FALLA (no hay UI que probar) |
| Batch 2 listo | ✅ | ✅ | ✅ PASA (comportamiento completo) |

El verify corre una sola vez, contra el cambio terminado.

---

## Apply-Progress

### ¿Qué es?

El `apply-progress` es el archivo de **estado de avance** entre batches de `sdd-apply`. Sin esto, cada batch arrancaría ciego y pisaría o repetiría trabajo de batches anteriores.

### ¿Dónde vive?

```yaml
# Engram (principal)
topic_key: sdd/{change-name}/apply-progress
type: architecture

# OpenSpec (reflejo visible)
openspec/changes/{change-name}/tasks.md  ← tasks con [x] marks
```

### Estructura típica

```
## Apply Progress: {change-name}

### Batch 1 — Fase 1 (Scaffold) — COMPLETED
- [x] 1.1 package.json y vite.config.js
- [x] 1.2 index.html como entry point
- [x] 1.3 src/main.jsx
- [x] 1.4 src/hooks/useLocalStorage.js

### Batch 2 — Fase 2 (Componentes) — IN PROGRESS
- [x] 2.1 CartFooter.jsx
- [x] 2.2 CartItem.jsx
- [ ] 2.3 CartTable.jsx
- [ ] 2.4 CartForm.jsx
- [ ] 2.5 App.jsx

### Batch 3 — Pendiente
- Fase 3: Styles
- Fase 4: Verification
```

### Merge protocol (CRÍTICO)

Cuando el batch N termina, **NO** pisa el progreso anterior. Hace merge:

```
1. Buscar apply-progress existente
2. Leer qué tasks ya están completadas (batch 1, batch 2, ...)
3. Agregar las tasks que completó este batch
4. Guardar el resultado COMBINADO
```

Sin merge protocol:

```
Batch 1: completa 1.1-1.4 → guarda "completadas: 1.1-1.4"
Batch 2: completa 2.1-2.5 → guarda "completadas: 2.1-2.5"
                          → ¡PERDIÓ 1.1-1.4!
```

Con merge protocol:

```
Batch 2: lee "completadas: 1.1-1.4"
         agrega "completadas: 2.1-2.5"
         guarda "completadas: 1.1-1.4, 2.1-2.5"  ✅
```

### Flujo completo entre batches

```
            ┌──────────────┐
            │  Tasks (plan) │
            └──────┬───────┘
                   ▼
┌──────────────────────────────────────┐
│ Batch N: sdd-apply                   │
│                                      │
│  1. Leer apply-progress (si existe)  │
│  2. Saltar tasks ya completadas      │
│  3. Implementar tasks pendientes     │
│  4. Sanity check                     │
│  5. Merge: progreso anterior + nuevo │
│  6. Guardar apply-progress           │
│  7. Actualizar tasks.md con [x]      │
└──────────────────────────────────────┘
                   ▼
       (siguiente batch o verify)
```

### ¿Por qué no alcanza con tasks.md?

`tasks.md` es el plan. `apply-progress` es el **estado de ejecución**. Dos problemas si usás solo tasks.md:

1. **No sabés en qué batch se completó cada cosa** — si algo se rompe, no sabés cuándo se introdujo
2. **Si un batch falla a mitad de camino**, tasks.md muestra tareas sin marcar pero no sabés cuánto avanzó realmente

apply-progress resuelve ambos: sabés exactamente qué pasó en cada batch y podés retomar desde el último checkpoint.

---

## Costo de no dividir

| Escenario | Single apply | Batches |
|-----------|-------------|---------|
| 12 archivos, 700 líneas | Contexto degradado en archivo 8. Errores. Hay que re-delegar. | 3 batches limpios. Cada uno con contexto fresco. |
| Falla a los 30 minutos | Perdiste todo. Tenés que re-delegar el cambio completo. | Perdés solo el batch actual. Los anteriores están firmes. |
| Error lógico en archivo 3 arrastra a archivos 4-12 | Tenés que corregir y re-escribir todo lo que depende de ese error. | Corregís en el próximo batch. No arrastrás. |

---

## Excepciones

**Un solo apply está bien cuando:**

- Feature de 1-3 archivos (<300 líneas)
- Cambio puramente mecánico (rename, mover archivos, cambio de config)
- Fix urgente donde la velocidad importa más que la confiabilidad
- El sub-agente ya tiene el contexto y solo necesita escribir (sin análisis)

**No dividir estas cosas:**

- Hotfixes de una línea
- Cambios de config que tocan un solo archivo
- Renames mecánicos (sed / replace all)

---

## Post-verify: cómo manejar issues

Cuando `sdd-verify` encuentra problemas, la decisión de delegar un nuevo apply depende de la gravedad.

### Tabla de decisión

| Tipo | Qué significa | Acción | ¿Bloquea archive? |
|------|--------------|--------|-------------------|
| 🔴 **CRITICAL** | Spec no cubierto, build roto, data loss, funcionalidad rota | → Nuevo `sdd-apply` con las issues como tareas explícitas → `sdd-verify` de nuevo | ✅ Sí. No archive hasta que pase. |
| 🟡 **WARNING funcional** | Algo anda mal pero no rompe specs (ej: validación incompleta, edge case no manejado) | → Nuevo `sdd-apply` con las issues → `sdd-verify` de nuevo | ✅ Sí. No archive hasta que pase. |
| 🟡 **WARNING cosmético** | Problema visual o de calidad que no afecta comportamiento (ej: `data-label` faltante, CSS roto en un breakpoint) | → Fix inline si es < 5 líneas y 1 archivo → `sdd-apply` si toca múltiples archivos | ❌ No. Se corrige rápido y se archive. |
| 🔵 **SUGGESTION** | Mejora opcional, deuda técnica, refactor futuro | → No se delega. Se anota en el archive report como "mejora futura". | ❌ No. No bloquea nada. |

### Flujo post-verify

```
        ┌──────────┐
        │  verify   │
        └────┬─────┘
             │
      ┌──────┴──────────┐
      ▼                 ▼
  CRITICAL/         PASS /
  WARNING          WARNING cosmético
      │                 │
      ▼                 ▼
  sdd-apply         fix inline
  (issues como         o
   tareas)         anotar y seguir
      │                 │
      ▼                 ▼
  sdd-verify         ARCHIVE
      │
     PASS
      │
      ▼
   ARCHIVE
```

### Ejemplo real (este proyecto)

El verify de `grocery-cart-redesign` retornó:

```
WARNING: data-label attributes missing en CartItem.jsx
         → column labels vacíos en mobile (≤600px)
```

**Decisión**: WARNING cosmético, 1 archivo, 5 atributos. Fix inline, sin delegar apply. Build verify → OK. Archive.

Si el verify hubiera retornado:

```
CRITICAL: clearCart no vacía localStorage
```

**Acción**: delegar `sdd-apply` con tarea "Fix clearCart — falta localStorage.removeItem('cart')", re-verify, recién ahí archive.
