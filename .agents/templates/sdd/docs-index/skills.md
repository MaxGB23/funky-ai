# Índice de Secciones: `docs/funky-ai/skills.md`

- **1. ¿Qué problema resuelve?:** Instalación de las skills agénticas (sdd-release, sdd-docs-sync) en `.agents/skills/` y bootstrap de los docs compartidos SDD; manifiesto por skill sin listas hardcodeadas.
- **2. ¿Cuándo usarlo?:** Cuando el proyecto necesite skills SDD o docs compartidos; interactivo e idempotente (skip-if-exists).
- **3. Selección interactiva:** Multiselect con opción **Todas**; selección vacía sin cambios; cancelación sale con código 1; orden determinista (alfabético + orden del manifest).
- **4. Autodetección de skills (R-SK-7):** Directorios bajo `src/skills/` con `SKILL.md`; crear una skill nueva no toca el CLI.
- **5. Manifest por skill (R-SK-8):** Árbol `src/skills/` con `manifest.js` por skill; `src` relativo a `src/`, `dest` relativo al proyecto, `optional` para srcs ausentes (R-SK-3).
- **6. Docs compartidos y paridad byte a byte (R-SK-5):** `templates/bootstrap/sdd/` es el mismo src que `funky scaffold` — sin copias divergentes.
- **7. Regla doc-nuevo en sdd-docs-sync (R-SK-11):** Decision Gates ampliadas: comando/flag nuevo → `docs/<dominio>/<comando>.md` + índice seccional + fila SSOT; capability nueva; fraccionamiento; estructura nueva.
- **8. Diagrama de flujo:** `runSkills()` → intenciones de copia → `executeIntentions()` (skip-if-exists, srcs opcionales, veredicto creados/skipeados).
