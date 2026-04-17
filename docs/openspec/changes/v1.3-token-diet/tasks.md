# [v1.3-token-diet] Token Diet Plan

## Objetivo Ejecutivo
El ecosistema de Funky AI está gastando demasiados tokens. Nuestras reglas en `.agents/rules/` y la documentación teórica en `docs/funky-ai/` tienen textos muy extensos. Necesitamos aplicar una dieta estricta (Token Diet) para comprimir el texto manteniendo el rigor arquitectónico. 
No podemos sacrificar precisión, pero sí cháchara innecesaria. ¡Vamos a ser quirúrgicos!

**Variable Crítica:** Esta feature será ejecutada y evaluada usando **Gemini 3 Flash**. Debemos documentar su performance (velocidad vs precisión) comparado con el 3.1 Pro Low usual.

---

## Fases de Ejecución

### Fase 0: Git-Ops & Infra ✅
- Rama `feature/v1.3-token-diet` creada y activa.

### Fase 1: Auditoría y Medición ✅
- Inventario inicial: ~6,307 tokens estimados.

### Fase 2: Compresión de Reglas Core ✅
- `.agents/rules/` optimizado. Ahorro: ~600 tokens.

### Fase 3: Compresión de Teoría y Guías ✅
- `docs/funky-ai/` optimizado. Ahorro masivo: ~2,200 tokens.
- Reducción del ~50% en peso de archivos core.

### Fase 4: Reporte y Cierre Preliminar (Worker Analista - Gemini 3 Flash)
**Responsable:** Worker Editor
**Acción a delegar:**
1. Consolidar el ahorro total de tokens de todas las fases.
2. Hacer el "Last Review" de Flash: Verificar que todas las referencias cruzadas unificadas en la Fase 3 no estén rotas (Clickable links check).
3. Generar `preliminary-report.md` en `docs/openspec/changes/v1.3-token-diet/`.

### Fase 5: QA Técnico & Model Benchmark (Worker Senior - Gemini 3.1 Pro)
**Responsable:** Worker Senior
**Misión:** Realizar un "Forensic Audit" de lo que hizo Gemini 3 Flash.
1. Evaluar integridad semántica post-compresión.
2. Verificar si la "Dieta" fue demasiado agresiva y se perdió contexto vital.
3. Veredicto final para Merge.

---
> **Atención Router Humano:** Fase 3 impecable. Es un antes y un después en el peso del sistema. Para seguir, decime: `"Ejecutá la Fase 4 (Flash final review)."`
