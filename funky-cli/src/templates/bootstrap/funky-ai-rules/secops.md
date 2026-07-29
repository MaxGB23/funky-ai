---
trigger: model_decision
description: Aplicar SIEMPRE que se agreguen, modifiquen o auditen dependencias de un proyecto (scaffolding o day-to-day).
---

# 🛡️ SecOps Enforcement: Pnpm & Deps

## 1. Gestor de Paquetes
- **OBLIGATORIO:** Usar siempre `pnpm`.
- **PROHIBIDO:** `npm` o `yarn/bun`. Si una herramienta intenta forzar `npm`, abortar e inicializar manual con `pnpm`.

## 2. Pineo Estático
- **PROHIBIDO:** `^` o `~` en `package.json`.
- **ACCIÓN:** Purgar prefijos de versión manualmente antes de commit.
- LOCKFILE obligatorio (no modificar sin aprobación)

## 3. Auditoría Implícita
- **Mínima Superficie:** Evitar dependencias pesadas; usar built-ins de NodeJS siempre que sea posible.
- **Check:** Validar necesidad real antes de inyectar deps.
- **Protección contra typosquatting:** Validar nombre y reputación del paquete antes de instalar.
- **Release Age:** Desconfiar de paquetes recién publicados; preferir estables.