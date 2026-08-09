# Índice de Secciones: `docs/funky-ai/engram.md`

- **1. ¿Qué problema resuelve?:** Captura estructurada de conocimiento con indexación automática en `docs/engram/`.
- **2. Requisitos (Automatizados):** La regla `engram-protocol.md` se instala sola (`sdd install` o modo standalone).
- **3. Uso:** Modo interactivo o con flags (`--tag`, `--category`, `--desc`).
- **4. Categorías disponibles:** `architecture`, `pattern`, `discovery`, `decision`, `bugfix`, `session` y `release`.
- **5. Qué genera:** Archivo individual por categoría y el índice central `index.md`.
  - **[{TYPE}][{tag}] {desc}:** Template con `Date`, `What`, `Why`, `Where` y `Learned`.
- **6. Flags:** `-t/--tag`, `-c/--category` y `-d/--desc` con sanitización kebab-case.
- **7. Buenas prácticas:** Cuándo, qué y cómo capturar engramas.
  - **Cuándo capturar un engrama:** En el momento justo para bugfixes, decisiones, descubrimientos, etc.
  - **Qué poner en cada campo:** Contenido esperado para `What`, `Why`, `Where` y `Learned`.
  - **Reglas:** No sobrescribir, sanitizar tags y mantener el índice actualizado.
