# Spec: 009 - Base Project Templates & Customization

## Arquitectura de Archivos y Cambios

### 1. Directorio de Backup e Internalización (Aislamiento)
- **Origen:** `funky-cli/src/templates/*`
- **Destino:** `.agents/templates/` (Nuevo directorio en la raíz de funky-ai)
- **Propósito:** Blindar a `funky-ai` de roturas operativas y establecer un directorio de backup con la versión legacy y completa de TODOS los templates acoplados (incluyendo las rules en `bootstrap/`, `sdd/`, etc).

### 2. Modificación de Reglas Locales
- **Archivo a editar:** `.agents/rules/sdd-orchestrator.md`
- **Cambio Estructural:** Reemplazar todas las apariciones de las rutas `funky-cli/src/templates/sdd/` por la nueva ruta de backup interno `.agents/templates/sdd/`. 

### 3. El Artefacto TEMPLATE_GUIDE.md
- **Ubicación:** `funky-cli/src/templates/bootstrap/TEMPLATE_GUIDE.md`
- **Contenido Requerido:**
  - Instrucciones claras sobre el flujo de Customización Post-Inicialización.
  - Reglas de mutación accionables (ej: "Si el Arch-Assessment indica uso de Linter, el Orquestador debe mutar el `tasks.md` inyectando reglas de comprobación de Linting en cada fase").
  - Lógica de Progressive Disclosure.

### 4. Limpieza Estructural de Templates
- `funky-cli/src/templates/sdd/tasks.md`:
  - Se eliminan las secciones específicas del release de `funky-cli` y las restricciones hardcodeadas propias del desarrollo de CLI.
  - Se deben mantener intactos los invariantes: **FASE 0 (Branch Setup)**, la estructura base de bloques para Fases subsiguientes, y el **MANDATORY_RELEASE_PROTOCOL** genérico.
- `funky-cli/src/templates/README.md`:
  - Se eliminan las extensas instrucciones globales de uso del CLI.
  - Se lo convierte en una estructura base y profesional tipo "Architecture Hub" vacía.

### 5. Adaptación de `funky init`
- Asegurar que la lógica en `funky-cli/src/commands/init.js` (o donde se definan las rutinas de inyección) distribuya el nuevo `TEMPLATE_GUIDE.md` y los templates agnósticos al directorio de destino del nuevo proyecto.
