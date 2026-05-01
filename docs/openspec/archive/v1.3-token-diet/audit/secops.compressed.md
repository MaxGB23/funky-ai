---
trigger: model_decision
description: Aplicar SIEMPRE que se realice scaffolding de proyectos, instalaciÃ³n de dependencias, auditorias de package.json, o cualquier inicializaciÃ³n de ecosistemas NodeJS/Frontend.
---

# ðŸ›¡ï¸ SecOps: Pnpm & Deps

## 1. Gestor de Paquetes
- **OBLIGATORIO:** Usar siempre `pnpm`.
- **PROHIBIDO:** `npm` o `yarn`. Si una herramienta intenta forzar `npm`, abortar e inicializar manual con `pnpm`.

## 2. Hardening (NPM Config)
- **`ignore-scripts` por defecto:** Bloqueo de scripts post-instalaciÃ³n.
- **`pnpm.approveBuilds`:** Solo con aprobaciÃ³n explÃ­cita del usuario para binarios C++.

## 3. Pineo EstÃ¡tico
- **PROHIBIDO:** `^` o `~` en `package.json`.
- **ACCIÃ“N:** Purgar prefijos de versiÃ³n manualmente antes de commit.

## 4. AuditorÃ­a ImplÃ­cita
- **MÃ­nima Superficie:** Evitar dependencias pesadas; usar built-ins de NodeJS siempre que sea posible.
- **Check:** Validar necesidad real antes de inyectar deps.
