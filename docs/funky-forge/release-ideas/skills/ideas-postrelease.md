# Ideas post-release — `funky skills` v2

> Estado: **acordado** (2026-08-03). Plan para el siguiente ciclo SDD de `funky skills`.
> Discusión completa en sesión con el orquestador; decisiones aquí registradas.

## Decisiones acordadas

### 1. Selección interactiva de skills
`funky skills` debe preguntar **cuáles** skills se quieren instalar (multiselect con `@clack/prompts`, como `funky feature`).
La primera opción debe ser **"Todas"** para tenerlo a la mano; el resto se eligen una por una.

### 2. Autodetección de skills
La lista de skills NO debe estar hardcodeada en `runSkills`: se escanea el directorio de skills y se descubren automáticamente las disponibles.
Cada skill = un directorio con su `SKILL.md`. Cuando se agregue una skill nueva al CLI, aparece sola en la selección.

### 3. Modelo: cada skill = paquete autocontenido
Cada skill inyecta sus propios recursos, **solo si se elige**. Nunca recursos globales.

| Skill | Recursos que inyecta |
|---|---|
| `sdd-release` | `SKILL.md` + `templates/sdd/release-notes.md` (si falta) |
| `sdd-docs-sync` | `SKILL.md` + `templates/sdd/docs-live-index.md` + `templates/sdd/docs-index/_indice-seccional-template.md` (si faltan) |

Regla transversal: **siempre skip si ya existe** — nunca sobrescribir golden templates ni skills.

> **¿Por qué `sdd-docs-sync` comparte templates de docs con `funky scaffold` (misma ruta `templates/bootstrap/sdd/`)?**
> Porque el usuario puede no querer instalar el framework funky-ai completo (solo quiere usar gentle-ai con su proyecto). En ese caso, solo corre `funky skills` y no `funky scaffold`. Si los docs compartidos (`docs-live-index.md`, `_indice-seccional-template.md`) vivieran solo dentro del scaffold, el usuario de skills no los tendría. Al compartir la misma ruta de origen, ambos comandos generan los mismos archivos — y la regla "skip si existe" evita que sobrescriba si ya los tiene (ya sea de una ejecución previa de skills o de scaffold).

### 4. Renombrado del template del índice seccional
`docs-index/template.md` → **`docs-index/_indice-seccional-template.md`** (autodocumenta que es la plantilla del índice seccional).
De paso, el template debe mostrar los 3 niveles reales con ejemplos (header con `<ruta>`, bullet nivel 1, anidamiento H3), no un esqueleto vacío.

### 5. `sdd-release` inyecta el template de release-notes
Si se elige la skill de release, inyectar `templates/sdd/release-notes.md` **solo si no existe** (hoy el golden lo referencia pero el destino puede no tenerlo).

### 6. `sdd-docs-sync`: regla explícita de "cuándo hay doc nuevo"
No siempre es un "comando nuevo". Debe dejarse claro **tanto en el golden como en la base de `sdd-docs-sync`** cuándo se crea un doc nuevo:
- Comando nuevo → doc dedicado `docs/<dominio>/<comando>.md` + índice seccional + registro en SSOT
- Nueva capability/dominio documentable
- Doc existente que se fracciona o cambia de ámbito
- Estructura de docs nueva (directorio, tipo de documento)
- Regla de matching ampliada en la skill (golden + base)

### 7. Reubicación de las skills fuera de `templates/gentle`
La carpeta `gentle` no debe existir ni vivir dentro de `funky-cli/src/templates` (confunde con templates de scaffold).
Destino propuesto: `funky-cli/src/skills/`. Cautela: toca `skills.js` (rutas), `scaffold.js` (solo docs compartidos se quedan en `templates/bootstrap/sdd/`), `template-flows.md`, tests. Respetar la paridad scaffold ↔ skills en docs compartidos.

### 8. Secciones por categoría → **YAGNI, no ahora**
Con 2 skills es sobreingeniería. La autodetección por directorio ya deja espacio: si algún día se agrupan (`skills/ci`, `skills/release`), es solo organizar directorios, sin rediseño.

## Pendientes inmediatos (fuera del ciclo SDD)

- **Gap de docs v4.1.0:** falta `docs/funky-ai/skills.md` (doc dedicado del comando nuevo) + índice seccional + registro en SSOT. El `sdd-docs-sync` no lo detectó porque la regla de matching no cubría "comando nuevo → doc nuevo".
- Actualizar `AGENTS.md` no es necesario (flujo post-SDD ya registrado).

## Notas abiertas

- El nombre `_indice-seccional-template.md` fue propuesto por el usuario y aceptado como convención.
- La estrategia de registro es **md + memoria**: este archivo es la fuente de la discusión; el contexto operativo va a engram; el SDD formaliza en el proposal.

## Próxima sesión post-funky-skills

Cuando se complete el plan de `funky skills` v2, la siguiente sesión debe ser la **sesión de dependabot**: revisar y merge los PRs pendientes de dependabot. Ya registrado en memoria (engram).
