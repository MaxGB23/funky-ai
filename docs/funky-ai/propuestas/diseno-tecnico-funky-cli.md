# Diseño Técnico: Ecosistema funky-cli (V1.2)

| Campo           | Valor                             |
|-----------------|-----------------------------------|
| Estado          | In Progress                       |
| Versión Target  | v1.2                              |
| Backlog IDs     | V1.2-B, V1.2-C, V1.2-D, V1.2-F    |
| Fecha           | 2026-04-16                        |

## Problema / Motivación

Actualmente el ecosistema Funky AI es puramente conceptual: un conjunto de reglas en Markdown copiadas a mano en `.agents/rules` o el global de Gemini. Setear un proyecto nuevo desde cero demora tiempo, es propenso a errores humanos (se nos olvida copiar el `engram-protocol.md`, o no creamos el `ORCHESTRATOR-STATE.md`), y el archivo monolítico `post-mortem.md` sufre de "token bloat" limitando la capacidad del LLM a futuro. A su vez, el proyecto carece de una gobernanza formal de CI/CD para automatizar tests y releases.

## Criterios de Aceptación

- [ ] El CLI puede ejecutarse vía npx o estar instalado globalmente.
- [ ] Ejecutar `funky init` crea correctamente la estructura distribuida de memoria (`docs/engram/`) y copia los rulesets por defecto.
- [ ] Ejecutar `funky phase <name>` inyecta templates SDD vírgenes (explore, proposal, tasks) listos para usar en un Worker.
- [ ] La CI en `.github/workflows` ejecuta tests unitarios con `vitest` y valida labels semánticos (`type:*`) y referencias a Issues (`Closes #XY`).

## Implementación

### Arquitectura de Node.js (funky-cli/)
- → `funky-cli/package.json` — Registrar los binarios `"bin": { "funky": "./bin/funky.js" }` e instalar CLI framework (ej: `commander` o `yargs`).
- → `funky-cli/bin/funky.js` — Entry point del CLI que enruta los subcomandos (`init`, `phase`).
- → `funky-cli/src/commands/init.js` — Lógica que usa `fs` nativo para hacer scaffolding de `.agents/rules/` y transformar el viejo `post-mortem.md` en particiones distribuidas (sharding) bajo `docs/engram/`.
- → `funky-cli/src/commands/phase.js` — Lógica que lee templates locales empaquetados y los escupe en la carpeta del feature actual.

### Prácticas de QA (Basado en Auditoría V1.2-A)
- → `funky-cli/vitest.config.js` — Configuración de testing rápido mockeando el filesystem (ej: `memfs` o mocks nativos) para no destruir la PC del usuario en los tests del CLI.
- → `.github/workflows/ci.yml` — Flujo automatizado usando `actions/setup-node` (con caché `pnpm`) para correr el linting y la suite de Vitest en cada PR y push a main.
- → `.github/workflows/pr-check.yml` — Validación estricta que requiera el keyword `Closes #` y exija exactamente un label `type:*` (`type:feature`, `type:bugfix`, etc) para sentar bases hacia un changelog autónomo.

## Riesgos / Tradeoffs

- **Dependencias pesadas vs Zero-deps:** Construir el CLI con frameworks como `commander` acelera el dev, pero suma tamaño al paquete. Justificable porque no vamos a navegadores, sino a ecosistema dev tools local.
- **Transición de memoria:** El cambio del archivo monolítico `post-mortem.md` al esquema shardeado `docs/engram/` romperá momentáneamente los regex/búsquedas de los Workers legacy si no enseñamos al Orquestador a mirar el nuevo directorio.

## Audit Check (Ejecutar al cierre de sesión)

- [ ] ¿El campo Estado refleja la realidad del repo HOY?
- [ ] ¿Cada punto de Implementación tiene referencia de archivo?
- [ ] ¿Los Criterios de Aceptación son testeables?
- [ ] ¿El BACKLOG.md fue actualizado con los IDs de esta propuesta?
