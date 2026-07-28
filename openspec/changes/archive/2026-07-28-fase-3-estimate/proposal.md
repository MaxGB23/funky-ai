# Propuesta: Fase 3 — Estimate (Sesión de Pricing Colaborativa)

> **Change:** `fase-3-estimate` | **Depende de:** Fase 2 (assess)

---

## Intención

`funky estimate` actual (188 líneas) es calculadora hardcodeada con `@inquirer/prompts`, multiplicadores fijos, `process.exit(1)`, sin headless mode, sin validación de placeholders, sin consumir decisiones del assess. **Se transforma a facilitador de sesión de pricing** siguiendo el patrón de Fase 2: CLI inyecta materiales, la discusión real pasa en chat humano+IA.

---

## Alcance

### Incluido

| # | Entregable |
|---|------------|
| 1 | Refactor estimate.js: funciones puras, `exit(0)`, warnings, sin `@inquirer/prompts` |
| 2 | Validación prerequisito: si no existe `docs/architecture-decisions.md`, warning + generación parcial |
| 3 | Canvas discovery: buscar en root y `docs/` (como `findCanvas()` en assess) |
| 4 | Guía de discusión en `.agents/prompts/pricing-guide.md` |
| 5 | Template `pricing-decisions-template.md` para documentar acuerdos |
| 6 | Prompt IA en español neutro para iniciar sesión de pricing |
| 7 | Tests (~200-250 líneas estimadas) |

### Excluido

| Elemento | Razón |
|----------|-------|
| Modo interactivo (`@inquirer/prompts`) | Próximo a deprecarse |
| Pipeline output estructurado | Fase futura de integración |
| Costo de infraestructura como primario | Cliente paga aparte, es secundario |

---

## Capacidades

### Nuevas Capacidades
- `estimate`: Sesión de pricing colaborativa. CLI inyecta guía de discusión + prompt IA basado en decisiones de assess + canvases. Cálculo referencial generado por IA durante la sesión, no por fórmula hardcodeada.

### Capacidades Modificadas
Ninguna.

---

## Enfoque

```
funky estimate
  ├── 1. Validar docs/architecture-decisions.md
  │     └── Sin decisions → warning + generación parcial
  ├── 2. Canvas discovery (root → docs/)
  │     └── Placeholders vacíos → warning
  ├── 3. Leer architecture-decisions.md si existe
  ├── 4. Generar pricing-guide.md (sobrescribe)
  │     └── Contexto: decisions + canvases
  ├── 5. Generar prompt IA (español neutro)
  └── 6. Summary + instrucciones → exit(0)
```

---

## Archivos Afectados

| Archivo | Impacto |
|---------|---------|
| `funky-cli/src/commands/estimate.js` | Modificar |
| `funky-cli/src/templates/sdd/pricing-guide-template.md` | Nuevo |
| `funky-cli/src/templates/sdd/pricing-decisions-template.md` | Nuevo |
| `funky-cli/tests/estimate.test.js` | Nuevo |

## Riesgos

| Riesgo | Prob. | Mitigación |
|--------|-------|------------|
| Assess decisions incompletas | Media | Warning + generación parcial |
| Budget excedido (>400 líneas) | Baja | ~200-300 líneas estimadas |

## Rollback

Revertir `estimate.js`. Eliminar templates nuevos y `estimate.test.js`.

## Dependencias

- Fase 2 (assess) completada

## Criterios de Éxito

- [ ] `funky estimate` sin prompts interactivos produce `.agents/prompts/pricing-guide.md`
- [ ] Sin `architecture-decisions.md`: warning + guía parcial, exit(0)
- [ ] Con canvases incompletos: warning + guía, exit(0)
- [ ] Tests pasan con cobertura funcional
