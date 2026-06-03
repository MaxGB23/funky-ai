---
trigger: model_decision
description: Aplicar SOLAMENTE cuando se esté inicializando un repositorio desde cero, creando archivos de configuración global (.npmrc) o configurando políticas de seguridad base.
---

# 🛡️ SecOps Setup: Hardening (NPM Config)

## 1. Hardening Global (.npmrc)
- **`ignore-scripts` por defecto:** Bloqueo de scripts post-instalación para evitar ejecución de malware.
- **`pnpm.approveBuilds`:** Solo con aprobación explícita del usuario para binarios C++.
- **Supply Chain Quarantine:** Configurar `minimum-release-age` (sugerido 1440-2880) para evitar ataques de "day-zero".
- **Integridad:** `verify-store-integrity=true` obligatorio.
