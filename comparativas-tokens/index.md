# Comparativas de Tokens — Índice

> Directorio con data cruda y real del consumo de tokens en las herramientas que usamos.
> Cada documento detalla mediciones, overhead de tool calls, y comparativas operación por operación.

---

## Documentos

| Archivo | Descripción |
|---------|-------------|
| [`comparativa-mcp-vs-shardeado.md`](./comparativa-mcp-vs-shardeado.md) | MCP Engram (Gentle AI) vs Falso Engram shardeado (archivos md de Funky-AI). Incluye overhead de tool calls, 6 operaciones específicas, 3 escenarios reales, fórmulas de cálculo, y tabla definitiva. |
| [`context7-consumo.md`](./context7-consumo.md) | Consumo de tokens del MCP Context7 (`resolve-library-id` + `query-docs`). Desglose por llamada, estimaciones de input/output, y overhead de serialización. |
| [`suscripcion-orquestador-big-pickle.md`](./suscripcion-orquestador-big-pickle.md) | Estrategia de suscripción paga: orquestador de pago + big-pickle gratis para subagentes. Datos reales de 7 días desde `opencode.db` (89 sesiones, 2,771 calls, pico 5h de 1,038), comparativa Plus/Pro 5x/Pro 20x, y config objetivo por agente. |

---

## Estado

Ambos docs contienen **datos estimados** basados en regla general (1 token ≈ 4 caracteres) y mediciones de archivos reales del proyecto. Pendiente de validación con herramientas de conteo exacto (tiktoken, tokenizers de cada modelo).
