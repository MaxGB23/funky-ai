---
trigger: model_decision
description: Aplicar SIEMPRE que se realice scaffolding de proyectos, instalación de dependencias, auditorias de package.json, o cualquier inicialización de ecosistemas NodeJS/Frontend.
---

# 🛡️ Convención Global SecOps: Pnpm & Dependencias

Como desarrollador Senior, se aplican políticas estrictas de seguridad (DevSecOps) para cualquier entorno Node.js o extensión de VS Code generada o administrada en este sistema. **No existen excepciones a estas reglas.**

## 1. Gestor de Paquetes Exclusivo
- **REGLA:** Se utiliza ESTRICTAMENTE `pnpm`.
- **PROHIBIDO:** No usar `npm` ni `yarn` bajo ninguna circunstancia para instalar, crear (scaffold) o administrar dependencias. Si una herramienta oficial (como `yo code`) intenta forzar `npm`, se deberá interrumpir u omitir, optando por correr la inicialización manual o reescribiendo el binario a `pnpm`.

## 2. Hardening del Ecosistema (NPM Config)
- **`ignore-scripts` por defecto:** El entorno bloquea la ejecución automática de scripts `postinstall` maliciosos o pre-compilaciones indeseadas. 
  - Si un paquete genuinamente necesita compilar un binario C++, deberás configurarlo de forma explícita mediante `pnpm.approveBuilds` o proponerle al usuario una ejecución en formato *opt-in*.
- **Release Age (Minimum):** Desconfiar de paquetes recién publicados. Preferir paquetes estables.

## 3. Pineo Estático (Sin Carets/Tildes)
- **REGLA:** El archivo `package.json` DEBE mantener versiones exactas en todas las dependencias (`dependencies` y `devDependencies`).
- **ACCIÓN:** Todo bot encargado de editar dependencias deberá purgar manualmente cualquier prefijo `^` o `~` en los números de versión antes de guardar el archivo o hacer un commit. 

## 4. Auditoría Implícita
- Antes de inyectar dependencias pesadas en un nuevo proyecto, debes hacer un chequeo de qué dependencias son realmente necesarias para correr (Ej: Usar dependencias built-in de NodeJS siempre que se pueda para reducir la superficie de ataque).
