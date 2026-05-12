# Proposal: Guía de Llenado para Architecture Assessment

**Estado:** 🟡 DRAFT
**Autor:** Orquestador / Humano
**Fecha:** 2026-05-11

## 1. Contexto y Problema
Actualmente, el comando `funky assess` hace scaffold del archivo `architecture-assessment.md`. Sin embargo, los desarrolladores (especialmente los más junior) suelen enfrentarse al síndrome de la hoja en blanco o subestimar la importancia de los valores de NFRs (Non-Functional Requirements). Poner `rps: 100` o `rps: 10000` cambia completamente la arquitectura, pero sin una guía, los números suelen ser inventados al azar.

## 2. Propuesta de Solución
Crear un archivo llamado `architecture-assessment-guide.md` (y opcionalmente, inyectarlo como un comentario HTML dentro del mismo `architecture-assessment.md` generado, o como un archivo hermano en `docs/funky-ai/cli/`).

Este template debe actuar como un **Cheat Sheet Arquitectónico**. 

### A. Estructura Propuesta para la Guía

1. **El Frontmatter Explicado (NFRs)**
   - **`budget`**: Cómo estimarlo. Ejemplos de rangos ($0-$20 VPS chico, $50-$200 PaaS Profesional, +$500 Clusters/Managed). Es crucial entender que clientes más pequeños muchas veces no están dispuestos a superar cierto límite estricto de hosteo, y esto debe guiar todas las decisiones técnicas.
   - **`rps` (Requests per Second)**: Cómo calcularlo. (Ej: "Si esperás 10,000 usuarios al mes, son ~0.003 RPS promedio. No pongas 1000 RPS a menos que seas Ticketek").
   - **`sla`**: La regla de los 9s. (99% = 3 días caídos al año. 99.9% = 8 horas caídas al año. 99.99% = 50 minutos al año). Explicar que más nueves = más dólares.
   - **`redundancy`**: "Single Node" vs "Multi-AZ" vs "Multi-Region".
   - **`compliance`**: Cuándo aplica (HIPAA, PCI, GDPR, SOX) y sus consecuencias en infraestructura. Considerar que en apps críticas (ej. gubernamentales), un PaaS provee una capa extra de seguridad administrada que protege frente a vulnerabilidades zero-day, dando tiempo vital para parchear la aplicación sin estar expuestos a nivel SO.
   - **`team_seniority`**: Ser honesto. Si todos son Junior, ir por PaaS. Si hay DevOps, habilitar IaaS/K8s.

2. **Secciones de Texto Libre**
   - **Descripción General**: Un párrafo de *Elevator Pitch* técnico. ¿Qué hace y para quién?
   - **Componentes Clave**: Cómo dividirlos. (Frontend, Backend, DB, Caché, Workers, Colas).
   - **Restricciones y Supuestos**: La parte más importante. "Se asume que..." o "No podemos usar X porque Y".

### B. Implementación
1. Crear el archivo base en `funky-cli/src/templates/sdd/architecture-assessment-guide.md`.
2. Modificar el comando `funky assess` para que, la primera vez que se ejecuta, copie *ambos* archivos: el assessment para rellenar, y la guía para leer (o bien, embeber la guía en un bloque de markdown al final del assessment).

## 3. Criterios de Éxito (DoD)
- ✅ Creada la guía técnica orientada a forzar el pensamiento y evitar números mágicos.
- ✅ CLI actualizado para facilitar el acceso a la guía durante la fase de assess.

---
*Fin del Proposal.*
