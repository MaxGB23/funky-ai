# RFC: Estrategia de Pruebas (Testing Strategy) para Templates de IA

## Contexto
Durante actualizaciones rutinarias de refactorización de texto en los templates (`tasks.md`, `sdd-orchestrator.md`, etc.), se detectó la rotura de tests unitarios/integración en `funky-cli`. La causa raíz fue que los tests validaban la existencia literal de frases (ej. `toContain('FASE 0 — Branch Setup [T1]')`).

## Problema Detectado (Brittle Tests)
Testear strings literales de lenguaje natural dentro de un archivo Markdown es un **anti-patrón**. Los templates de IA son documentos vivos que los humanos y los arquitectos modifican constantemente para ajustar prompts, corregir typos, o mejorar la semántica.
Si un test de integración falla cada vez que se cambia una coma, el test está añadiendo fricción al desarrollo (Developer Experience) en lugar de garantizar la estabilidad del software.

## Directiva de Testing
A partir de ahora, la suite de tests de `funky-cli` debe apegarse a las siguientes reglas:

### ❌ Lo que NO se debe testear:
- **Prosa Humana/IA:** No afirmar (`assert`) textos literales, títulos de markdown, advertencias, o frases dentro de los templates de los agentes.
- **Formateo Estético:** Espacios, saltos de línea o emojis dentro de los templates.

### ✅ Lo que SÍ se debe testear (Valor Real):
1. **Lógica de Generación e Inyección:**
   - Validar que los comandos (`funky init`, `funky feature`) creen los archivos en los paths correctos.
   - Validar que si un archivo ya existe (idempotencia), el CLI no lo destruya (a menos que se use un flag de sobrescritura).
2. **Flags y Condiciones del CLI:**
   - Comprobar que los parámetros dinámicos cambien el flujo (ej. `--skipProjectCanvas` no debe generar el canvas).
3. **Contratos Máquina (Regex/Etiquetas):**
   - Si el Orquestador o el script del CLI depende estructuralmente de encontrar una etiqueta para funcionar (ej. `<MANDATORY_RELEASE_PROTOCOL>`, `<OPTIONAL_DOC_UPDATE>`), esa etiqueta **sí es testeable**, ya que su eliminación rompe la máquina, no solo la legibilidad.

## Próximos Pasos
Auditar la carpeta `funky-cli/tests/` para purgar aserciones literales y mantener únicamente las pruebas que garanticen la integridad estructural y de inyección del CLI.
