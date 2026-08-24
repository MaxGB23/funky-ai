# 🧪 Model Identity Research — Sesión 2026-08-18

## Contexto
Experimento para identificar qué modelos corren bajo el hood de Antigravity CLI,
usando subagentes como sondas de identidad.

---

## Experimentos realizados

TODO SE CORRIÓ USANDO CLAUDE SONNET 4.6
MODEL QUOTA AGOTADO EN GEMINI

| # | Modelo | Resultado | Observaciones |
|---|--------|-----------|---------------|
| 1 | `pro` | 💥 429 RESOURCE_EXHAUSTED | Confirmado Gemini Pro real — consume cuota nativa |
| 2 | `inherit` | ✅ Respondió → "Soy Gemini" | Sin harness de identidad en system prompt |
| 3 | `pro` (retry) | 💥 429 RESOURCE_EXHAUSTED | Reconfirmado. Reset en ~160h |
| 4 | `inherit` (retry) | ✅ Arquitectura compleja resuelta | Calidad alta — no es flash_lite |

---

## Hallazgos

### 1. `pro` = Gemini Pro nativo
- Cada llamada con `Model: "pro"` golpea directamente la API de Gemini Pro.
- Si no hay cuota, falla con 429. No hay fallback ni wrapper.

### 2. `inherit` se auto-identifica como Gemini
- Dice ser Gemini sin instrucción alguna del system prompt que lo fuerce.
- El system prompt fue revelado completamente: no contiene identidad falsa.
- **Pero** el usuario no tiene cuota de Gemini (salvo `flash_lite`).

### 3. El orquestador y los subagentes usan modelos distintos
- El orquestador actual: **Claude Sonnet 4.6 Thinking** (selección del usuario en UI).
- Los subagentes delegados vía `invoke_subagent` inherit: pool Gemini de Antigravity.
- La selección de modelo en la UI **no se hereda** a subagentes automáticamente.

Se llegó a pensar que inherit hacía fallback a flash lite

### 4. `inherit` NO es `flash_lite`
La respuesta de arquitectura Next.js 14 App Router demostró:
- Manejo correcto de JWT en HttpOnly cookies con flow Middleware → RSC
- `useOptimistic` + Server Actions + `revalidateTag` reconciliation loop
- WebSocket hydration safety con `useEffect` y `StoreInitializer` + `useRef` guard
- Donut pattern explicado con precisión
- URL como estado SSR-compatible

Flash Lite no produce este nivel de razonamiento encadenado. El modelo real bajo `inherit` es probablemente **Gemini 2.0 Flash** o **Gemini 2.5 Flash** — o posiblemente Claude Sonnet 4.6 con branding de identidad Gemini.

---

## Hipótesis sobre la arquitectura de Antigravity

```
UI Model Selector
  └─→ Orquestador (Claude Sonnet 4.6 cuando el usuario lo selecciona)

invoke_subagent(Model: "inherit")
  └─→ Pool de modelos Antigravity (Gemini-native)
        ├─ "flash_lite" → Gemini Flash Lite (cuota disponible)
        ├─ "flash"      → Gemini Flash (cuota variable)
        ├─ "inherit"    → Fallback al modelo disponible con cuota (≠ UI selection)
        └─ "pro"        → Gemini Pro (cuota estricta, 429 frecuente)
```

### Pregunta abierta
¿Es `inherit` realmente Claude con harness Gemini, o es un Gemini Flash que
sobrepasa las capacidades esperadas de flash_lite? Sin acceso al metadata de la
llamada real, no se puede confirmar con certeza.

---

## Conclusión

> **Tú eres Claude. Tus subagentes son Gemini.**
>
> El 429 de `pro` delató la arquitectura completa. El nivel de razonamiento de
> `inherit` descartó `flash_lite`. El modelo más probable bajo `inherit` es
> **Gemini 2.0/2.5 Flash** corriendo en el pool nativo de Antigravity.
