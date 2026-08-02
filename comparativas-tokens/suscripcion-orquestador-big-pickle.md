# Estrategia de Suscripción — Orquestador de Pago + Big Pickle Gratis

**Fecha:** 2 de Agosto, 2026
**Fuente de datos:** `opencode.db` local (consulta SQL directa vía `node:sqlite`), ventana de 7 días (28-jul → 02-ago, 2026).
**Contexto:** Semana de trabajo intenso (no habitual, pero posible de repetir). El objetivo es decidir si una suscripción paga tiene sentido y con qué arquitectura de agentes.

---

## 1. Resumen Ejecutivo

- **Hoy no hay ninguna suscripción conectada** (`account` en opencode.db vacío). Todo corre con `opencode/big-pickle` (modelo gratis por diseño en OpenCode Zen).
- **El patrón de uso es spike-driven, no uniforme:** 2 días de ráfaga concentraron el 75% de las llamadas de la semana.
- **La estrategia ganadora: suscripción paga SOLO para el orquestador** (`gentle-orchestrator`), y `big-pickle` para todos los subagentes (sdd-*, review-*, jd-*). Los subagentes se "queman a lo desgraciado" sin costo.
- **Matiz clave:** incluso aislado, el orquestador genera picos de **536 calls en una ventana de 5h**. Eso descarta Plus y deja a Pro 5x en la frontera; **Pro 20x es la única opción cómoda** para semanas intensas.

---

## 2. Medición Real — Semana de Trabajo Intenso (7 días)

| Métrica | Valor |
|---|---|
| Sesiones totales | 89 (17 principales + **72 subagente**) |
| Llamadas al modelo | **2,771** (main 1,793 · sub 978) |
| Promedio diario | ~460 calls |
| Días de ráfaga | 28-jul: 881 · 29-jul: 1,207 |
| Días normales | 36–262 |
| **Pico global en ventana 5h** | **1,038 calls** (28-jul 20:14 → 29-jul 01:14) |
| Tokens (7d) | input 7.5M · output 1.1M · **cache 200M** |
| Horas pico | 22h–00h (593, 416, 371) y 20h–21h (283, 212) |

### Desglose orquestador vs subagentes

| Flujo | Sesiones | Input | Cache | % de calls |
|---|---|---|---|---|
| **Main (orquestador)** | 17 | 4.20M | 151.6M | **65%** |
| Subagentes (sdd-*, review-*, jd-*) | 72 | 3.31M | 48.5M | 35% |

Pico del orquestador SOLO en 5h: **536 calls** (misma ventana del 28-jul). Pico de subagentes SOLO: 516 calls.

> [!NOTE]
> El orquestador quema más cache (151.6M vs 48.5M) porque re-envía el contexto completo de la conversación en cada turno. Los subagentes son sesiones frescas y cortas por diseño.

---

## 3. Comparativa de Planes vs Tu Patrón

Cuotas reportadas para el backend Codex (fuentes de terceros; aproximación, no garantía):
- **Plus ($20/mes):** ~15–80 msgs por ventana rodante de 5h
- **Pro 5x ($100/mes):** ~5x Plus → ~75–400
- **Pro 20x ($200/mes):** ~20x Plus → ~300–1,600

| Plan | ¿Cubre semana normal? | ¿Cubre semana intensa? |
|---|---|---|
| Plus $20 | ❌ No (día normal = ~400 calls) | ❌ No |
| Pro 5x $100 | ✅ Sí (días 91–262) | ⚠️ Frontera (pico 536 > 400) |
| Pro 20x $200 | ✅ Sí | ✅ Sí (pico 1,038 < 1,600) |

**Veredicto simple:** si se paga todo el tráfico con suscripción, solo Pro 20x aguanta una semana intensa. Pero eso NO es lo que conviene hacer (ver sección 4).

### Costo equivalente por API (referencia, mismo volumen de 7d, con descuento de caché 90%)

| Vía | Estimación mensual |
|---|---|
| OpenAI API (modelo Sol, 7d → mensualizado) | ~$200–530/mes |
| Anthropic API (Sonnet, 7d → mensualizado) | ~$150–400/mes |
| Suscripción Pro 20x | $200/mes |
| **Big Pickle (Zen, gratis)** | **$0/mes** |

---

## 4. La Estrategia: Orquestador de Pago + Big Pickle Quemador

### Por qué funciona

1. **El orquestador es el hilo más valioso por calidad:** coordina, decide, sintetiza y delega. Ahí el modelo de pago tiene el mayor retorno de calidad (razonamiento fuerte, mejores decisiones de routing).
2. **Los subagentes son trabajo de volumen:** sesiones frescas y cortas (72 de 89), donde la calidad marginal del modelo paga menos.
3. **opencode soporta modelos por agente** (`agent.<name>.model` en `opencode.json`), así que la estrategia es config, no hack.

### Configuración objetivo en `opencode.json`

```jsonc
{
  "agent": {
    "gentle-orchestrator": {
      // modelo de pago vía suscripción (Codex OAuth)
      "model": "<modelo-de-suscripcion>"
    },
    "sdd-apply":    { "model": "opencode/big-pickle" },
    "sdd-spec":     { "model": "opencode/big-pickle" },
    "sdd-tasks":    { "model": "opencode/big-pickle" },
    "sdd-verify":   { "model": "opencode/big-pickle" },
    "review-risk":  { "model": "opencode/big-pickle" },
    "review-reliability": { "model": "opencode/big-pickle" },
    "review-resilience":  { "model": "opencode/big-pickle" },
    "review-readability": { "model": "opencode/big-pickle" }
    // ... el resto de subagentes, jd-* incluidos
  }
}
```

> [!IMPORTANT]
> El `gentle-ai` SDK ya lee `agent.gentle-orchestrator.model` y `agent.sdd-<fase>.model` como autoritativos si están definidos; si no, usa el modelo por defecto de la sesión. Con esta config, el orquestador corre en el modelo pago y los subagentes en big-pickle, sin tocar prompts.

### Números que validan la estrategia (7d, con orquestador pago)

| Flujo | Calls/7d | Pico 5h | ¿Quién paga? |
|---|---|---|---|
| Orquestador (main) | 1,793 | 536 | Suscripción |
| Subagentes | 978 | 516 | Big Pickle (gratis) |

- La suscripción solo ve el hilo main: la presión se reduce ~35%.
- En **semanas normales** (días de 91–262 calls), hasta **Pro 5x** sirve para el orquestador.
- En **semanas intensas** (pico 536 en 5h), el orquestador solo supera la frontera de Pro 5x → **Pro 20x** es la opción segura.

---

## 5. Incertidumbres y Advertencias

1. **Mapeo calls→cuota no es exacto:** la cuota Codex se mide en mensajes/créditos del plan, y una llamada del modelo en opencode no equivale necesariamente a 1 mensaje de cuota. Los rangos de la sección 3 son estimaciones de terceros.
2. **Descuento de caché en cuota Codex NO confirmado:** en el plan GO de OpenCode, los cache reads drenan cuota a casi tarifa completa (issue #24879 abierto). Si el backend Codex hace lo mismo, el orquestador (151.6M de cache/7d) sería más caro en créditos de lo esperado.
3. **Uso personal:** las suscripciones ChatGPT/Codex no cubren CI ni uso no interactivo.
4. **Big Pickle es gratis "por tiempo limitado"** en Zen a cambio de datos de uso. La estrategia depende de que siga gratis; si lo retiran, los subagentes pasan al plan que corresponda.

---

## 6. Conclusión

1. **Mientras big-pickle sea gratis: la mejor suscripción es ninguna.** Hoy el costo real es $0 con 200M de cache quemados en 7 días.
2. **Si se paga, solo como orquestador** — nunca para subagentes de volumen.
3. **Plan recomendado:** Pro 20x ($200) si puede repetirse una semana intensa; Pro 5x ($100) solo si se acepta el riesgo de frenarse en picos de 500+ calls/5h.
4. La suscripción paga por orquestador **sigue siendo más barata que API** para este volumen, y concentra el gasto donde más impacto tiene en calidad.
