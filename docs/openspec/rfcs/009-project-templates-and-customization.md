# RFC 009: Base Project Templates & Customization Guide

## 1. Contexto y Problema
Actualmente `funky-ai init` genera templates muy acoplados al desarrollo de un CLI (como el README actual de `funky-cli`). En proyectos de otra naturaleza (como un SaaS o un E-commerce), inyectar estos templates ensucia el repositorio con ruido innecesario, guías de uso de comandos inexistentes y estructuras que no aplican.

Asimismo, el template de `tasks.md` actual es rígido. Un MVP pequeño no requiere el mismo rigor (linting estricto, test planning, revisiones de arquitectura pesadas) que un proyecto Enterprise.

## 2. Soluciones Descartadas
- **Presets de Proyecto (`--preset=saas`, `--preset=ecommerce`):** Descartado. Es un antipatrón arquitectónico porque es imposible estandarizar la arquitectura de todos los SaaS al 100%. Generaría una explosión combinatoria de templates difíciles de mantener.

## 3. Propuesta Arquitectónica: Base + Guía de Customización

### 3.1. Limpieza de Templates del CLI
Los templates actuales hiper-específicos de `funky-cli` deben mantenerse **ÚNICAMENTE** dentro del workspace original de `funky-cli`. No deben filtrarse a nuevos proyectos inicializados, por lo que no deben generarse con comandos de cli.

### 3.2. Templates Base Agnósticos
El comando `init`, o en otro escenario con un proyecto completamente limpio sin planeacion previa `init --template`,inyectará "Templates Base de Proyecto". Estos deben ser limpios, profesionales y agnósticos (ej. un `tasks.md` básico con git-ops fundamentales y estructura SDD esencial).

### 3.3. Documentación Optativa (Progressive Disclosure)
La generación de documentación pesada (flujos, guías de comandos) no debe ser el comportamiento por defecto de `init`. Deberá abstraerse detrás de un comando explícito o flag especial.

### 3.4. La Guía de Customización
En lugar de adivinar el rigor del proyecto, el CLI inyectará un documento tipo `TEMPLATE_GUIDE.md` (o `customizing-templates.md`).
Esta guía indicará cómo el equipo (o un Orquestador AI) debe agarrar las decisiones tomadas en los Canvas iniciales (`Project Canvas`, `Arch-Assessment`, etc.) y traducirlas a reglas y checklists en los templates locales.

**Ejemplo de Flujo Propuesto:**
1. Se ejecuta `init --template`. Se llenan el Canvas y el Arch-Assessment.
2. Se inyecta la base limpia (`tasks.md` y `README.md` agnósticos).
3. Usando la Guía de Customización, el Orquestador o el humano lee el Arch-Assessment (ej. "Decidimos usar ESLint y Prettier") y *muta* el `tasks.md` local para agregar el chequeo de linting como obligatorio en cada fase.

De esta forma, los templates crecen y se adaptan orgánicamente según la arquitectura real del proyecto.

Se debe generar una propuesta de template base en un directorio temporal y debe ser aprobado, si no es aprobado no debe implementarse. Esto para evitar que un worker rompa todos los templates de una.
