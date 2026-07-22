# Implementación: Refactor de Tasks y Returns

> **Propósito:** Índice maestro de la ejecución manual del refactor de Tasks y Returns.
> 
> **Decisión de Enfoque:** Ejecución 100% manual (tú y yo, sin delegación automática a subagentes SDD) para garantizar precisión quirúrgica en configuraciones críticas del CLI y del Orquestador.

---

## ⚠️ Protocolo de Contexto Mínimo (Anti-Saturación)

Esta sesión consumió demasiados tokens por leer docs de referencia que no eran necesarios de golpe. Las siguientes reglas aplican para todos los cortes:

1. **Un archivo por corte.** Cada corte tiene su propio archivo en `implementacion/corte-N.md`. El agente que ejecuta un corte **SÓLO lee su archivo**, no este índice completo ni `estrategia-coordinacion.md`.
2. **Lazy loading de referencias.** Cada `corte-N.md` lista únicamente los archivos que necesita leer para ese corte. No se cargan specs completos de antemano.
3. **No leer `estrategia-coordinacion.md` al arrancar.** Ese archivo es el plan maestro para humanos, no el prompt de trabajo. Es demasiado pesado para abrirlo en cada sesión.
4. **grep antes de view_file.** Si se necesita verificar algo en un spec, primero `grep_search` para encontrar la línea exacta. Nunca leer un archivo entero de 200+ líneas para buscar un dato.
5. **El humano dirige el paso.** Cada cambio se ejecuta, se confirma, y luego se avanza al siguiente. Sin anticipar ni pre-cargar el siguiente corte.

---

## Cortes — Estado

> **¿Quién genera los `corte-N.md`?** El humano junto con el Orquestador coordinador, en la sesión de planificación previa a la ejecución. Los agentes ejecutores NO generan ni modifican estos archivos — solo los leen para saber qué implementar.

| Corte | Archivo | Estado | Descripción |
|-------|---------|--------|-------------|
| **Corte 1** | [corte-1.md](./corte-1.md) | ✅ Completado | Core del Framework: envelope, preflight, cacheo, routing |
| **Corte 2** | [corte-2.md](./corte-2.md) | ✅ Completado | End-to-End Tier 2 en Automático |
| **Corte 3** | [corte-3.md](./corte-3.md) | ✅ Completado | Capa Interactiva |
| **Corte 4** | [corte-4.md](./corte-4.md) | ✅ Completado | Tier 3 |
| **Corte 5** | [corte-5.md](./corte-5.md) | ✅ Completado | Modo Handoff |

---

## Rama activa

`feature/refactor-tasks-sdd`