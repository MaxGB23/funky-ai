---
trigger: model_decision
description: Aplicar SIEMPRE que se realice scaffolding de proyectos, instalaci├│n de dependencias, auditorias de package.json, o cualquier inicializaci├│n de ecosistemas NodeJS/Frontend.
---

# ­ƒøí´©Å Convenci├│n Global SecOps: Pnpm & Dependencias

Como desarrollador Senior, se aplican pol├¡ticas estrictas de seguridad (DevSecOps) para cualquier entorno Node.js o extensi├│n de VS Code generada o administrada en este sistema. **No existen excepciones a estas reglas.**

## 1. Gestor de Paquetes Exclusivo
- **REGLA:** Se utiliza ESTRICTAMENTE `pnpm`.
- **PROHIBIDO:** No usar `npm` ni `yarn` bajo ninguna circunstancia para instalar, crear (scaffold) o administrar dependencias. Si una herramienta oficial (como `yo code`) intenta forzar `npm`, se deber├í interrumpir u omitir, optando por correr la inicializaci├│n manual o reescribiendo el binario a `pnpm`.

## 2. Hardening del Ecosistema (NPM Config)
- **`ignore-scripts` por defecto:** El entorno bloquea la ejecuci├│n autom├ítica de scripts `postinstall` maliciosos o pre-compilaciones indeseadas. 
  - Si un paquete genuinamente necesita compilar un binario C++, deber├ís configurarlo de forma expl├¡cita mediante `pnpm.approveBuilds` o proponerle al usuario una ejecuci├│n en formato *opt-in*.
- **Release Age (Minimum):** Desconfiar de paquetes reci├®n publicados. Preferir paquetes estables.

## 3. Pineo Est├ítico (Sin Carets/Tildes)
- **REGLA:** El archivo `package.json` DEBE mantener versiones exactas en todas las dependencias (`dependencies` y `devDependencies`).
- **ACCI├ôN:** Todo bot encargado de editar dependencias deber├í purgar manualmente cualquier prefijo `^` o `~` en los n├║meros de versi├│n antes de guardar el archivo o hacer un commit. 

## 4. Auditor├¡a Impl├¡cita
- Antes de inyectar dependencias pesadas en un nuevo proyecto, debes hacer un chequeo de qu├® dependencias son realmente necesarias para correr (Ej: Usar dependencias built-in de NodeJS siempre que se pueda para reducir la superficie de ataque).
