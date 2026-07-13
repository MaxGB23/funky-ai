# RFC 022: Tasks Template Sharding (Doc-Ops & Workflows)

**Status:** Draft
**Autor:** Orquestador / Humano
**Fecha:** 2026-05-31

---

## 1. Contexto y Problema

Actualmente, el archivo `tasks.md` (generado por `funky phase tasks`) actúa como un **documento monolítico**. Contiene:
1. Las instrucciones de Fases (código puro) para los Workers (`funky-apply`, etc).
2. El bloque `<OPTIONAL_DOC_UPDATE>` con el índice de documentos.
3. El bloque `<MANDATORY_RELEASE_PROTOCOL>` con los pasos de Doc-Ops y Git-Ops.

Este diseño sufre de **Acoplamiento de Responsabilidades** y **Context Pollution**:
- Cuando un Worker ejecuta `/funky-apply`, se le inyectan más de 100 líneas de reglas administrativas (Release Notes, Package.json, Índices de docs) que no necesita. Esto consume tokens (budget del Context Window) y distrae al modelo de su única misión: picar código.
- Leer múltiples archivos grandes durante el Doc-Update es caro en tokens y propenso a alucinaciones.

## 2. Propuesta: Sharding de Procesos

Aprovechando la **Feature 020 (Workflows Especializados)**, se propone extirpar la lógica administrativa del archivo físico `tasks.md` y migrarla a las instrucciones del System Prompt del workflow de cierre (ej. `/funky-archive` o `/funky-release`).

### 2.1 Cambios en `tasks.md`
El template base (`funky-cli/src/templates/sdd/tasks.md` y `.agents/templates/sdd/tasks.md`) se limpiará por completo.
- **Se eliminan:** `<OPTIONAL_DOC_UPDATE>` y `<MANDATORY_RELEASE_PROTOCOL>`.
- **Se mantiene:** Solo el listado de fases (0, 1, 2, 3...) y el `Return Envelope`.
- **Beneficio:** Un `tasks.md` ultra-ligero que los Workers pueden consumir sin overhead.

### 2.2 Cambios en Workflows (Feature 020)
El checklist de Doc-Ops y el índice de documentos vivos pasarán a ser texto hardcodeado en el workflow `.gemini/config/global_workflows/funky-archive.md`.

Cuando el humano termine la fase de Testing, simplemente ejecutará:
`/funky-archive @sdd-report.md`

El agente nacerá con el índice de documentos precargado en su System Prompt y procederá a:
1. Analizar el `report.md`.
2. Ejecutar el Doc-Update (usando `grep_search` masivo + `view_file` quirúrgico para evitar gastar tokens cargando archivos enteros).
3. Escribir las Release Notes y el `package.json`.
4. Imprimir las instrucciones de Git-Ops para el humano.

## 3. Impacto y Beneficios
- **Token Diet:** El Worker de Apply leerá un `tasks.md` 60% más pequeño. Ahorro sustancial de tokens en Features grandes.
- **Role Purity:** El Worker solo piensa en código. El agente de Archive solo piensa en documentación y releases.
- **Seguridad:** El Orquestador de Archive no podrá "accidentalmente" re-escribir código porque sus tools/instrucciones estarán limitadas a docs.

## 4. Riesgos y Mitigaciones
- **Riesgo:** Pérdida de visibilidad para el humano (el índice de docs ya no es visible en el repositorio, está oculto en el workflow global).
- **Mitigación:** La `canvas-planning-guide.md` o el README del CLI pueden documentar que el agente de Archive maneja el Doc-Update de forma automática. Además, el agente siempre imprimirá un resumen de los documentos que modificó.

## 5. Plan de Ejecución
Esta iniciativa debe acoplarse e implementarse como parte de la **Feature 020: Phase Workflows Especializados**, ya que requiere que los workflows como `/funky-archive` existan previamente.
