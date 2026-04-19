---
trigger: model_decision
description: Aplicar SIEMPRE que se realice scaffolding de proyectos, instalación de dependencias, auditorias de package.json, o cualquier inicialización de ecosistemas NodeJS/Frontend.
---

# 🛡️ SecOps: Pnpm & Deps

## 1. Gestor de Paquetes
- **OBLIGATORIO:** Usar siempre `pnpm`.
- **PROHIBIDO:** `npm` o `yarn`. Si una herramienta intenta forzar `npm`, abortar e inicializar manual con `pnpm`.

## 2. Hardening (NPM Config)
- **`ignore-scripts` por defecto:** Bloqueo de scripts post-instalación.
- **`pnpm.approveBuilds`:** Solo con aprobación explícita del usuario para binarios C++.
- **Release Age:** Desconfiar de paquetes recién publicados; preferir paquetes estables y probados.

## 3. Pineo Estático
- **PROHIBIDO:** `^` o `~` en `package.json`.
- **ACCIÓN:** Purgar prefijos de versión manualmente antes de commit.

## 4. Auditoría Implícita
- **Mínima Superficie:** Evitar dependencias pesadas; usar built-ins de NodeJS siempre que sea posible.
- **Check:** Validar necesidad real antes de inyectar deps.
